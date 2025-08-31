import * as React from "react";
import { b64ToU8 } from "../utils";

export function useAudioEngine() {
  const audioCtxRef = React.useRef(null);
  const outGainRef = React.useRef(null);
  const tapGainRef = React.useRef(null);
  const recordDestRef = React.useRef(null);
  const playHeadRef = React.useRef(0);
  const recentSigRef = React.useRef(new Set());

  const MAX_SIGS = 200;
  const BUFFER_LEAD = 0.08;
  const FADE_MS = 0.02;

  React.useEffect(() => {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx({ sampleRate: 48000 });

    const out = ctx.createGain();
    const tapGain = ctx.createGain();
    const tapDest = ctx.createMediaStreamDestination();

    out.connect(ctx.destination);
    tapGain.connect(tapDest);

    audioCtxRef.current = ctx;
    outGainRef.current = out;
    tapGainRef.current = tapGain;
    recordDestRef.current = tapDest;

    return () => {
      try {
        out.disconnect();
      } catch {}
      try {
        tapGain.disconnect();
      } catch {}
      try {
        ctx.close();
      } catch {}
    };
  }, []);

  async function resumeAudio() {
    try {
      if (audioCtxRef.current?.state === "suspended") {
        await audioCtxRef.current.resume();
      }
    } catch {}
  }

  function resetAudioState() {
    playHeadRef.current = 0;
    recentSigRef.current.clear();
  }

  function clearRecentSigs() {
    recentSigRef.current.clear();
  }

  function scheduleBuffer(buf) {
    const ctx = audioCtxRef.current;
    if (!ctx || !buf) return;

    const now = ctx.currentTime;
    const startAt = Math.max(now + BUFFER_LEAD, playHeadRef.current || 0);
    const endAt = startAt + buf.duration;
    const fade = Math.min(FADE_MS, Math.max(0, buf.duration / 8));

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const gOut = ctx.createGain();
    const gTap = ctx.createGain();

    src.connect(gOut);
    src.connect(gTap);
    gOut.connect(outGainRef.current);
    gTap.connect(tapGainRef.current);

    for (const g of [gOut, gTap]) {
      g.gain.setValueAtTime(0, startAt);
      g.gain.linearRampToValueAtTime(1, startAt + fade);
      g.gain.setValueAtTime(1, Math.max(startAt + fade, endAt - fade));
      g.gain.linearRampToValueAtTime(0, endAt);
    }

    try {
      src.start(startAt);
    } catch {}
    playHeadRef.current = endAt;
  }

  async function handleMurfChunk(b64) {
    await resumeAudio();

    const sig = `${b64.length}:${b64.slice(0, 24)}:${b64.slice(-24)}`;
    if (recentSigRef.current.has(sig)) return;
    recentSigRef.current.add(sig);
    if (recentSigRef.current.size > MAX_SIGS) {
      const it = recentSigRef.current.values();
      recentSigRef.current.delete(it.next().value);
    }

    try {
      const u8 = b64ToU8(b64);
      const buf = await audioCtxRef.current.decodeAudioData(u8.buffer.slice(0));
      scheduleBuffer(buf);
    } catch {}
  }

  const getRecordTap = React.useCallback(() => {
    return recordDestRef.current?.stream?.getAudioTracks?.()[0] || null;
  }, []);

  const getTailMs = React.useCallback(() => {
    const ctx = audioCtxRef.current;
    return Math.max(
      0,
      (playHeadRef.current - (ctx?.currentTime || 0) + 0.12) * 1000
    );
  }, []);

  return {
    resumeAudio,
    resetAudioState,
    clearRecentSigs,
    // chunk scheduling
    scheduleBuffer,
    handleMurfChunk,
    // recording tap helpers
    getRecordTap,
    getTailMs,
  };
}
