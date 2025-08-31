import { useMemo, useRef, useState } from "react";

export function useEmailTheaterState(userId) {
  // sidebar
  const [mode, setMode] = useState("gmail");
  const [pasted, setPasted] = useState("");
  const [file, setFile] = useState(null);

  // per-user gmail connect
  const storageKey = userId
    ? `gmailConnected:${userId}`
    : "gmailConnected:anon";
  const prevUserIdRef = useRef(userId ?? null);
  const [gmailConnected, setGmailConnected] = useState(false);

  // mailbox
  const [category, setCategory] = useState("primary");
  const [days, setDays] = useState(30);

  const [allEmails, setAllEmails] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const [pageTokens, setPageTokens] = useState({ 1: undefined });
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [estimate, setEstimate] = useState(null);

  const [loadingList, setLoadingList] = useState(false);
  const [loadingHydrate, setLoadingHydrate] = useState(false);

  // customization
  const [stylePreset, setStylePreset] = useState("focused");
  const [lang, setLang] = useState("en-US");
  const [voiceMap, setVoiceMap] = useState({});

  // generation
  const [loadingGen, setLoadingGen] = useState(false);
  const [loadingGen2, setLoadingGen2] = useState(false);
  const [script, setScript] = useState("");
  const [audioUrl, setAudioUrl] = useState("");

  const disabledGen = useMemo(() => loadingGen, [loadingGen]);

  function resetInboxUI() {
    setAllEmails([]);
    setSelectedIdx(0);
    setPageTokens({ 1: undefined });
    setCurrentPage(1);
    setNextPageToken(null);
    setEstimate(null);
    setScript("");
    setAudioUrl("");
  }

  function updateVoice(sender, val) {
    setVoiceMap((m) => ({ ...m, [sender || "unknown@sender"]: val }));
  }

  return {
    mode,
    setMode,
    pasted,
    setPasted,
    file,
    setFile,

    storageKey,
    prevUserIdRef,
    gmailConnected,
    setGmailConnected,

    category,
    setCategory,
    days,
    setDays,
    allEmails,
    setAllEmails,
    selectedIdx,
    setSelectedIdx,
    pageTokens,
    setPageTokens,
    currentPage,
    setCurrentPage,
    nextPageToken,
    setNextPageToken,
    estimate,
    setEstimate,
    loadingList,
    setLoadingList,
    loadingHydrate,
    setLoadingHydrate,

    stylePreset,
    setStylePreset,
    lang,
    setLang,
    voiceMap,
    setVoiceMap,
    updateVoice,

    loadingGen,
    setLoadingGen,
    loadingGen2,
    setLoadingGen2,
    script,
    setScript,
    audioUrl,
    setAudioUrl,
    disabledGen,

    resetInboxUI,
  };
}
