import { refreshAccessToken } from "./auth";

export async function fetchJSON(url, opts = {}, tried = false) {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(url, {
    credentials: "include",
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });

  if (res.status === 401 && !tried) {
    const newTok = await refreshAccessToken().catch(() => null);
    if (newTok) {
      const retry = await fetch(url, {
        credentials: "include",
        ...opts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newTok}`,
          ...(opts.headers || {}),
        },
      });
      let retryData = null;
      try {
        retryData = await retry.json();
      } catch {}
      return { res: retry, data: retryData };
    }
  }

  let data = null;
  try {
    data = await res.json();
  } catch {}
  return { res, data };
}

export async function listEmails({ category, days, pageToken }) {
  const qs = new URLSearchParams({ limit: "50", category, days: String(days) });
  if (pageToken) qs.set("pageToken", pageToken);
  return fetchJSON(`/api/email/list-fast?${qs}`);
}

export async function getMessage(id) {
  return fetchJSON(`/api/email/message/${id}`);
}

export async function gmailAuthUrl() {
  return fetchJSON("/api/email/gmail/auth-url");
}

export async function gmailDisconnect() {
  return fetchJSON("/api/email/gmail/disconnect", { method: "POST" });
}

export async function uploadEML(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/email/upload", {
    method: "POST",
    body: form,
    credentials: "include",
  });
  const data = await res.json();
  return { res, data };
}

export async function generateSummary(payload) {
  return fetchJSON("/api/email/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function translateText({ text, targetLangLabel }) {
  return fetchJSON("/api/translate", {
    method: "POST",
    body: JSON.stringify({ text, targetLangLabel }),
  });
}

export async function synthesizeTTS({ text, lang, voiceMap, stylePreset }) {
  return fetchJSON("/api/tts/murf", {
    method: "POST",
    body: JSON.stringify({
      text,
      style: "email_theater",
      targetLangCode: lang,
      extra: { voiceMap, stylePreset },
    }),
  });
}
