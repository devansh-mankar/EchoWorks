import * as React from "react";
import { toast } from "sonner";
import { isJwtExpired } from "../utils";

function wsBase() {
  const explicit = import.meta.env?.VITE_WS_URL;
  if (explicit)
    return explicit.replace(/^http:/, "ws:").replace(/^https:/, "wss:");
  const p = window.location.protocol === "https:" ? "wss" : "ws";
  return `${p}://${window.location.host}`;
}

async function getFreshAccessToken() {
  let t = localStorage.getItem("accessToken");
  if (t && !isJwtExpired(t)) return t;
  try {
    const r = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok && j?.accessToken) {
      localStorage.setItem("accessToken", j.accessToken);
      return j.accessToken;
    }
  } catch {}
  return null;
}

export function useEchoDubWS({
  voice,
  targetLang,
  onAudioChunk,
  onDisconnect,
  clearRecentSigs,
}) {
  const [connected, setConnected] = React.useState(false);
  const [wsMode, setWsMode] = React.useState("stream");
  const wsRef = React.useRef(null);
  const wsSentRef = React.useRef("");

  async function connectWS() {
    if (connected) return true;

    const token = await getFreshAccessToken();
    if (!token) {
      toast.error("Login required");
      return false;
    }

    return await new Promise((resolve) => {
      let settled = false;
      try {
        const ws = new WebSocket(
          `${wsBase()}/ws/echodub?token=${encodeURIComponent(token)}`
        );
        wsRef.current = ws;

        const to = setTimeout(() => {
          if (!settled) {
            settled = true;
            try {
              ws.close();
            } catch {}
            resolve(false);
          }
        }, 5000);

        ws.onopen = () => {
          clearTimeout(to);
          settled = true;
          setConnected(true);
          ws.send(
            JSON.stringify({ type: "hello", voiceId: voice, lang: targetLang })
          );
          toast.success("Connected");
          resolve(true);
        };

        ws.onmessage = (evt) => {
          if (typeof evt.data !== "string") return;
          let msg;
          try {
            msg = JSON.parse(evt.data);
          } catch {
            return;
          }

          if (msg?.type === "hello" && msg?.mode) {
            setWsMode(msg.mode);
            return;
          }
          if (msg?.type === "error") {
            toast.error(msg.error || "WS error");
            return;
          }

          const b64 =
            msg.audio || msg.audioChunk || msg.audioContent || msg.data;
          if (b64 && typeof b64 === "string")
            onAudioChunk?.(b64, (msg.format || "mp3").toString().toLowerCase());
        };

        ws.onclose = () => {
          setConnected(false);
          if (!settled) {
            clearTimeout(to);
            settled = true;
            resolve(false);
          }
          onDisconnect?.();
        };
        ws.onerror = () => {
          setConnected(false);
          if (!settled) {
            clearTimeout(to);
            settled = true;
            resolve(false);
          }
          onDisconnect?.();
        };
      } catch {
        if (!settled) {
          settled = true;
          resolve(false);
        }
      }
    });
  }

  function disconnectWS() {
    try {
      wsRef.current?.close();
    } catch {}
    wsRef.current = null;
    setConnected(false);
    wsSentRef.current = "";
    onDisconnect?.();
  }

  function sendTextDelta(fullText, isFinal) {
    if (!connected || !wsRef.current) return;

    let delta = fullText;
    const already = wsSentRef.current;

    if (fullText.startsWith(already))
      delta = fullText.slice(already.length).trim();
    else {
      wsSentRef.current = "";
      delta = fullText.trim();
    }

    try {
      wsRef.current.send(
        JSON.stringify({
          type: "input_text",
          text: delta,
          commit: !!isFinal,
          voiceId: voice,
          lang: targetLang,
        })
      );
    } catch {}

    if (delta) wsSentRef.current = (wsSentRef.current + " " + delta).trim();
    if (isFinal) {
      wsSentRef.current = "";
      clearRecentSigs?.();
    }
  }

  return {
    connected,
    wsMode,
    setWsMode,
    connectWS,
    disconnectWS,
    sendTextDelta,
  };
}
