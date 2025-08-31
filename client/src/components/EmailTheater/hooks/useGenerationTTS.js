import { toast } from "sonner";
import { generateSummary, translateText, synthesizeTTS } from "../api/email";
import { LANG_LABEL_BY_CODE } from "../constants";

export function useGenerationTTS(kb) {
  async function handleGenerate(currentEmail) {
    const target = currentEmail;
    if (!target?.text && !target?.html)
      return toast.error("No email selected.");
    try {
      kb.setLoadingGen(true);
      kb.setScript("");
      kb.setAudioUrl("");

      const { res, data } = await generateSummary({
        email: {
          id: target.id,
          from: target.from,
          subject: target.subject,
          text: target.text,
          html: target.html,
          date: target.date,
        },
        settings: {
          voiceMap: kb.voiceMap,
          stylePreset: kb.stylePreset,
          lang: kb.lang,
        },
      });
      if (!res.ok) throw new Error(data?.error || "Generation failed");
      kb.setScript(data.ttsText || data.script || "");
      toast.success("Summary generated!");
      setTimeout(() => {
        document
          .getElementById("audio-box")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
    } catch (e) {
      toast.error(e.message || "Generate error");
    } finally {
      kb.setLoadingGen(false);
    }
  }

  async function handleTTS() {
    if (!kb.script.trim()) return toast.error("Generate summary first.");
    try {
      kb.setLoadingGen(true);
      kb.setLoadingGen2(true);

      let textForTTS = kb.script;
      const isEnglish = kb.lang.toLowerCase().startsWith("en");
      if (!isEnglish) {
        try {
          const { res, data } = await translateText({
            text: kb.script,
            targetLangLabel: LANG_LABEL_BY_CODE[kb.lang] || kb.lang,
          });
          if (!res.ok) throw new Error(data?.error || "Translate failed.");
          textForTTS = data.text;
        } catch {
          toast.error("Translate failed—using the original text.");
        }
      }

      const { res, data } = await synthesizeTTS({
        text: textForTTS,
        lang: kb.lang,
        voiceMap: kb.voiceMap,
        stylePreset: kb.stylePreset,
      });
      if (!res.ok) throw new Error(data?.error || "TTS failed.");
      kb.setAudioUrl(data.audioUrl);
      toast.success(
        `Audio ready${
          isEnglish ? "" : ` in ${LANG_LABEL_BY_CODE[kb.lang] || kb.lang}`
        }!`
      );
    } catch (e) {
      toast.error(e.message || "TTS error");
    } finally {
      kb.setLoadingGen(false);
    }
  }

  return { handleGenerate, handleTTS };
}
