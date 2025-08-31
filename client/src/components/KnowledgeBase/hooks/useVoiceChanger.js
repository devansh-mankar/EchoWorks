import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { listVoicesRaw, voiceChangeForm, voiceChangeJSON } from "../api/tts";
import { toPitch, toRate } from "../utils/normalizers";

export function useVoiceChanger({ targetLang }) {
  const [vcMode, setVcMode] = useState("file");
  const [vcFile, setVcFile] = useState(null);
  const [vcSourceUrl, setVcSourceUrl] = useState("");
  const [vcVoiceId, setVcVoiceId] = useState("");
  const [vcStyle, setVcStyle] = useState("");
  const [vcSpeed, setVcSpeed] = useState("");
  const [vcPitch, setVcPitch] = useState("");
  const [vcBusy, setVcBusy] = useState(false);
  const [vcVoices, setVcVoices] = useState([]);
  const [vcStylesForVoice, setVcStylesForVoice] = useState([]);

  // load voices once
  useEffect(() => {
    (async () => {
      try {
        const list = await listVoicesRaw();
        const voices = Array.isArray(list) ? list : [];
        setVcVoices(voices);
        if (!vcVoiceId && voices.length)
          setVcVoiceId(String(voices[0].voiceId));
      } catch (e) {
        console.warn("[voices] failed:", e);
      }
    })();
  }, []);

  // styles follow voice
  useEffect(() => {
    const v = vcVoices.find((x) => x.voiceId === vcVoiceId);
    const styles = Array.isArray(v?.availableStyles) ? v.availableStyles : [];
    setVcStylesForVoice(styles);
    if (styles.length && !styles.includes(vcStyle)) setVcStyle("");
  }, [vcVoiceId, vcVoices, vcStyle]);

  // auto-match to language
  useEffect(() => {
    if (!vcVoices.length) return;
    const norm = (s) => (s || "").replace("_", "-").toLowerCase();
    const code = norm(targetLang.code);
    const match =
      vcVoices.find((v) => norm(v.locale) === code) ||
      vcVoices.find((v) =>
        Object.keys(v.supportedLocales || {}).some((k) => norm(k) === code)
      ) ||
      vcVoices[0];
    if (match) setVcVoiceId(String(match.voiceId));
  }, [targetLang, vcVoices]);

  const apiRate = useMemo(() => toRate(vcSpeed), [vcSpeed]);
  const apiPitch = useMemo(() => toPitch(vcPitch), [vcPitch]);

  async function run({ audioUrl }) {
    try {
      if (!vcVoiceId?.trim())
        return toast.error("Please select a Murf target voice.");
      const canUseGenerated = Boolean(audioUrl && audioUrl.trim());
      const canUseFile = vcMode === "file" && !!vcFile;
      const canUseUrl = vcMode === "url" && !!vcSourceUrl.trim();
      if (!(canUseGenerated || canUseFile || canUseUrl))
        return toast.error("No audio source available for voice change.");

      if (vcMode === "url" && vcSourceUrl.trim()) {
        const u = vcSourceUrl.trim();
        if (!/^https?:\/\//i.test(u))
          return toast.error("URL must start with http(s)://");
      }

      setVcBusy(true);
      let resultUrl = null;

      if (canUseGenerated) {
        const data = await voiceChangeJSON({
          sourceUrl: audioUrl,
          voiceId: vcVoiceId.trim(),
          style: vcStyle || undefined,
          speed: apiRate,
          pitch: apiPitch,
        });
        resultUrl = data.audioUrl;
      } else if (vcMode === "file" && vcFile) {
        const data = await voiceChangeForm({
          file: vcFile,
          voiceId: vcVoiceId.trim(),
          style: vcStyle || undefined,
          speed: apiRate,
          pitch: apiPitch,
        });
        resultUrl = data.audioUrl;
      } else if (vcMode === "url" && vcSourceUrl.trim()) {
        const data = await voiceChangeJSON({
          sourceUrl: vcSourceUrl.trim(),
          voiceId: vcVoiceId.trim(),
          style: vcStyle || undefined,
          speed: apiRate,
          pitch: apiPitch,
        });
        resultUrl = data.audioUrl;
      }

      if (!resultUrl) throw new Error("Murf did not return an audio URL.");
      toast.success("Voice-changed audio ready!");
      return resultUrl;
    } catch (e) {
      console.error("[handleVoiceChange] error:", e);
      toast.error("Couldn't change voice. Please try again.");
      return "";
    } finally {
      setVcBusy(false);
    }
  }

  const canVoiceChange = (audioUrl) =>
    Boolean(audioUrl?.trim()) ||
    (vcMode === "file" && !!vcFile) ||
    (vcMode === "url" && !!vcSourceUrl.trim());

  return {
    // state
    vcMode,
    setVcMode,
    vcFile,
    setVcFile,
    vcSourceUrl,
    setVcSourceUrl,
    vcVoiceId,
    setVcVoiceId,
    vcStyle,
    setVcStyle,
    vcSpeed,
    setVcSpeed,
    vcPitch,
    setVcPitch,
    vcBusy,
    vcVoices,
    vcStylesForVoice,
    // derived helpers
    canVoiceChange,
    // action
    run,
  };
}
