import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  listEmails,
  getMessage,
  gmailAuthUrl,
  gmailDisconnect,
  uploadEML,
} from "../api/email";
import { parsePastedEmail } from "../utils/emailParse";
import { filterByCategory } from "../utils/filterByCategory";

export function useInbox(kb) {
  useEffect(() => {
    const connected = localStorage.getItem(kb.storageKey) === "1";
    kb.setGmailConnected(connected);
    if (kb.prevUserIdRef.current !== kb.prevUserIdRef) {
      kb.prevUserIdRef.current = kb.prevUserIdRef ?? null;
      kb.resetInboxUI();
    }
  }, [kb.storageKey]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const q = url.searchParams.get("gmail");
    if (q === "connected") {
      kb.setGmailConnected(true);
      localStorage.setItem(kb.storageKey, "1");
      url.searchParams.delete("gmail");
      window.history.replaceState({}, "", url.pathname + url.search);
      toast.success("Gmail connected!");
    }
  }, [kb.storageKey]);

  async function fetchPage(pageNumber, pageTokenForPage) {
    try {
      kb.setLoadingList(true);
      const { res, data } = await listEmails({
        category: kb.category,
        days: kb.days,
        pageToken: pageTokenForPage,
      });

      if (res.status === 401) {
        kb.setGmailConnected(false);
        localStorage.removeItem(kb.storageKey);
      }
      if (!res.ok) throw new Error(data?.error || "Failed to list inbox");

      if (!kb.gmailConnected) {
        kb.setGmailConnected(true);
        localStorage.setItem(kb.storageKey, "1");
      }

      kb.setAllEmails(data.emails || []);
      kb.setEstimate(data.estimate ?? null);
      kb.setNextPageToken(data.nextPageToken || null);
      kb.setSelectedIdx(0);
      kb.setScript("");
      kb.setAudioUrl("");

      kb.setPageTokens((prev) => {
        const copy = { ...prev };
        if (data.nextPageToken) copy[pageNumber + 1] = data.nextPageToken;
        else delete copy[pageNumber + 1];
        copy[pageNumber] = pageTokenForPage || undefined;
        return copy;
      });

      kb.setCurrentPage(pageNumber);
    } catch (e) {
      toast.error(e.message || "Inbox error");
    } finally {
      kb.setLoadingList(false);
    }
  }

  useEffect(() => {
    kb.resetInboxUI();
    fetchPage(1, undefined);
  }, [kb.category, kb.days]);

  async function hydrateSelectedIfNeeded(idx, filteredEmails) {
    const msg = filteredEmails[idx];
    if (!msg || msg.html || msg.text) return;
    try {
      kb.setLoadingHydrate(true);
      const { res, data } = await getMessage(msg.id);
      if (!res.ok) throw new Error(data?.error || "Failed to load message");
      kb.setAllEmails((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, ...data } : m))
      );
    } catch (e) {
      toast.error(e.message || "Message error");
    } finally {
      kb.setLoadingHydrate(false);
    }
  }

  const filteredEmails = useMemo(
    () => filterByCategory(kb.allEmails, kb.category),
    [kb.allEmails, kb.category]
  );
  const currentEmail = filteredEmails[kb.selectedIdx] || null;

  async function handleUploadEML() {
    if (!kb.file) return toast.error("Upload a .eml file");
    try {
      kb.setLoadingList(true);
      const { res, data } = await uploadEML(kb.file);
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      kb.setAllEmails([data.email]);
      kb.setSelectedIdx(0);
      kb.setPageTokens({ 1: undefined });
      kb.setCurrentPage(1);
      kb.setNextPageToken(null);
      kb.setEstimate(1);
      toast.success("EML parsed.");
    } catch (e) {
      toast.error(e.message || "Upload error");
    } finally {
      kb.setLoadingList(false);
    }
  }

  function handleUsePasted() {
    if (!kb.pasted.trim()) return toast.error("Paste an email first");
    const parsed = parsePastedEmail(kb.pasted);
    kb.setAllEmails([parsed]);
    kb.setSelectedIdx(0);
    kb.setPageTokens({ 1: undefined });
    kb.setCurrentPage(1);
    kb.setNextPageToken(null);
    kb.setEstimate(1);
    toast.success("Email ready!");
  }

  async function connectGmail() {
    try {
      if (kb.gmailConnected) return;
      const { res, data } = await gmailAuthUrl();
      if (!res.ok || !data?.url)
        throw new Error(data?.error || "Failed to start Gmail auth");
      window.location.href = data.url;
    } catch (e) {
      toast.error(e.message || "Gmail auth error");
    }
  }

  async function disconnectGmail() {
    try {
      const { res, data } = await gmailDisconnect();
      if (!res.ok) throw new Error(data?.error || "Failed to disconnect");
      kb.setGmailConnected(false);
      localStorage.removeItem(kb.storageKey);
      kb.resetInboxUI();
      toast.success("Disconnected from Gmail.");
    } catch (e) {
      toast.error(e.message || "Disconnect error");
    }
  }

  return {
    // data + paging
    fetchPage,
    hydrateSelectedIfNeeded,
    filteredEmails,
    currentEmail,
    // legacy modes
    handleUploadEML,
    handleUsePasted,
    // gmail
    connectGmail,
    disconnectGmail,
  };
}
