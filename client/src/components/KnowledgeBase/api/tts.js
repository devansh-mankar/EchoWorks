export async function synthesize({ text, style, targetLangCode }) {
  const res = await fetch("/api/tts/murf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, style, targetLangCode }),
  });
  if (!res.ok) throw new Error((await res.text()) || "TTS failed.");
  return res.json();
}

export async function listVoicesRaw() {
  const r = await fetch("/api/tts/murf/voices/raw");
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function voiceChangeJSON({
  sourceUrl,
  voiceId,
  style,
  speed,
  pitch,
}) {
  const r = await fetch("/api/tts/murf/voice-change", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sourceUrl, voiceId, style, speed, pitch }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error || "Voice change failed.");
  return data;
}

export async function voiceChangeForm({ file, voiceId, style, speed, pitch }) {
  const form = new FormData();
  form.append("file", file);
  form.append("voiceId", voiceId);
  if (style) form.append("style", style);
  if (speed !== undefined) form.append("speed", String(speed));
  if (pitch !== undefined) form.append("pitch", String(pitch));
  const r = await fetch("/api/tts/murf/voice-change", {
    method: "POST",
    body: form,
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error || "Voice change failed.");
  return data;
}
