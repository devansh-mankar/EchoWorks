import * as React from "react";
import { toast } from "sonner";
import { PUNC } from "../constants";
import { longestCommonPrefix } from "../utils";

export function useSpeechRecognition({
  targetLang,
  wsMode,
  connected,
  connectWS,
  setWsMode,
  sendTextDelta,
  resumeAudio,
  resetAudioState,
  clearRecentSigs,
}) {
  const [recognizing, setRecognizing] = React.useState(false);
  const [interim, setInterim] = React.useState("");
  const [finals, setFinals] = React.useState([]);

  const asrRef = React.useRef(null);
  const pauseTimerRef = React.useRef(null);
  const lastInterimRef = React.useRef("");
  const lastCommittedRef = React.useRef("");
  const wsSentClearedRef = React.useRef(false);

  function clearTranscript() {
    setFinals([]);
    setInterim("");
    lastCommittedRef.current = "";
    wsSentClearedRef.current = false;
    resetAudioState?.();
  }

  async function startRecognition() {
    await resumeAudio?.();

    if (wsMode === "stream" && !connected) {
      const ok = await connectWS?.();
      if (!ok) {
        setWsMode?.("http-fallback");
        toast.message("WS not available → HTTP fallback.");
      }
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return toast.error("SpeechRecognition not supported.");

    let carried = "";
    lastCommittedRef.current = "";
    wsSentClearedRef.current = false;
    clearRecentSigs?.();

    const rec = new SR();
    rec.lang = targetLang === "auto" ? "en-US" : targetLang;
    rec.interimResults = true;
    rec.continuous = true;

    const schedulePauseCommit = () => {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = setTimeout(() => {
        const pending = (carried || "").trim();
        if (!pending) return;
        if (wsMode === "stream" && connected) sendTextDelta?.(pending, true);
        setFinals((f) => [...f, pending]);
        setInterim("");
        carried = "";
      }, 360);
    };

    rec.onresult = (e) => {
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          const finalText = (carried + " " + r[0].transcript).trim();
          carried = "";
          if (finalText) {
            setFinals((f) => [...f, finalText]);
            lastCommittedRef.current = finalText;
            if (wsMode === "stream" && connected)
              sendTextDelta?.(finalText, true);
          } else if (wsMode === "stream" && connected) {
            sendTextDelta?.("", true);
          }
        } else {
          interimText += r[0].transcript;
        }
      }

      const merged = (carried + " " + interimText).trim();
      const punctIdx = merged.search(PUNC);
      if (punctIdx !== -1) {
        const upto = merged.slice(0, punctIdx + 1).trim();
        const rest = merged.slice(punctIdx + 1).trim();
        if (upto && wsMode === "stream" && connected)
          sendTextDelta?.(upto, false);
        if (upto) setFinals((f) => [...f, upto]);
        carried = rest;
        setInterim(rest);
      } else {
        const prev = lastInterimRef.current;
        const p = longestCommonPrefix(prev, merged);
        const stable = merged.slice(p);
        setInterim(stable.slice(-160));
        lastInterimRef.current = merged;
      }

      schedulePauseCommit();
    };

    rec.onerror = (e) => toast.error("Mic error: " + (e.error || "unknown"));
    rec.onend = () => {
      clearTimeout(pauseTimerRef.current);
      setRecognizing(false);
    };

    try {
      setRecognizing(true);
      rec.start();
      asrRef.current = rec;
    } catch {
      setRecognizing(false);
      toast.error("Failed to start mic.");
    }
  }

  function stopRecognition() {
    try {
      asrRef.current?.stop();
    } catch {}
    asrRef.current = null;
    clearTimeout(pauseTimerRef.current);
    setRecognizing(false);
    setInterim("");
  }

  return {
    recognizing,
    interim,
    finals,
    startRecognition,
    stopRecognition,
    clearTranscript,
  };
}
