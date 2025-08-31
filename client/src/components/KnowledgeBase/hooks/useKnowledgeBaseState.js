import { useMemo, useState } from "react";
import { LANGS } from "../constants";

export function useKnowledgeBaseState() {
  // input
  const [mode, setMode] = useState("query");
  const [query, setQuery] = useState("");
  const [url, setUrl] = useState("");
  const [pasted, setPasted] = useState("");
  const [file, setFile] = useState(null);

  // output / content
  const [fetched, setFetched] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [script, setScript] = useState("");
  const [audioUrl, setAudioUrl] = useState("");

  // format + language
  const [format, setFormat] = useState("dialogue");
  const [targetLang, setTargetLang] = useState(LANGS[0]);
  const [autoTranslate, setAutoTranslate] = useState(true);

  // spinners
  const [generating, setGenerating] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);

  // derived disabled states (same logic)
  const disabledGenerate = useMemo(
    () => generating || ttsLoading,
    [generating, ttsLoading]
  );
  const disabledTTS = useMemo(
    () => ttsLoading || generating || !script,
    [ttsLoading, generating, script]
  );

  return {
    // input
    mode,
    setMode,
    query,
    setQuery,
    url,
    setUrl,
    pasted,
    setPasted,
    file,
    setFile,
    // content
    fetched,
    setFetched,
    analysis,
    setAnalysis,
    script,
    setScript,
    audioUrl,
    setAudioUrl,
    // format/lang
    format,
    setFormat,
    targetLang,
    setTargetLang,
    autoTranslate,
    setAutoTranslate,
    // spinners
    generating,
    setGenerating,
    ttsLoading,
    setTtsLoading,
    // derived
    disabledGenerate,
    disabledTTS,
  };
}
