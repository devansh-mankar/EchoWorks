import { useState } from "react";
import { toast } from "sonner";
import { translate } from "../api/translate";
import { synthesize } from "../api/tts";

export function useTTS() {
  const [ttsLoading, setTtsLoading] = useState(false);

  async function run({ script, format, targetLang, autoTranslate }) {
    try {
      if (!script.trim()) return toast.error("Generate script first.");
      setTtsLoading(true);

      let textForTTS = script;
      if (!targetLang.code.startsWith("en") && autoTranslate) {
        const trData = await translate({
          text: script,
          targetLangLabel: targetLang.label,
        });
        textForTTS = trData.text;
      }

      const data = await synthesize({
        text: textForTTS,
        style: format,
        targetLangCode: targetLang.code,
      });

      toast.success(`Audio ready in ${targetLang.label}!`);
      return data.audioUrl;
    } catch (e) {
      console.error(e);
      toast.error("Couldn't convert to audio. Please try again.");
      return "";
    } finally {
      setTtsLoading(false);
    }
  }

  return { ttsLoading, run };
}
