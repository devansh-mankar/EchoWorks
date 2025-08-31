import React, { useEffect } from "react";
import { AnimatedGridPattern } from "@/components/ui/magicui/animated-grid-pattern";

import { LANGS } from "../constants";
import { useKnowledgeBaseState } from "../hooks/useKnowledgeBaseState";
import { useGeneration } from "../hooks/useGeneration";
import { useTTS } from "../hooks/useTTS";
import { useVoiceChanger } from "../hooks/useVoiceChanger";

import Card from "../ui/Card";
import InputType from "../ui/InputType";
import OutputFormat from "../ui/OutputFormat";
import LanguageSelector from "../ui/LanguageSelector";
import VoiceChanger from "../ui/VoiceChanger";
import AnalysisPanel from "../ui/AnalysisPanel";
import InputPanel from "../ui/InputPanel";
import PreviewPanel from "../ui/PreviewPanel";

export default function KnowledgeBaseContainer() {
  // central state (mirrors original)
  const kb = useKnowledgeBaseState();

  // feature hooks (wrap original logic)
  const gen = useGeneration();
  const tts = useTTS();
  const vc = useVoiceChanger({ targetLang: kb.targetLang });

  // keep audio cleared when script/format changes (same behavior)
  useEffect(() => {
    kb.setAudioUrl("");
  }, [kb.script, kb.format]); // eslint-disable-line react-hooks/exhaustive-deps

  // actions
  async function handleFetchAndGenerate() {
    kb.setFetched(null);
    kb.setAnalysis(null);
    kb.setScript("");
    kb.setAudioUrl("");
    kb.setGenerating(true);
    const { base, analysis, script } = await gen.run({
      mode: kb.mode,
      query: kb.query,
      url: kb.url,
      pasted: kb.pasted,
      file: kb.file,
      format: kb.format,
    });
    if (base) kb.setFetched(base);
    if (analysis) kb.setAnalysis(analysis);
    if (script) kb.setScript(script);
    kb.setGenerating(false);
  }

  async function handleTTS() {
    kb.setTtsLoading(true);
    const audio = await tts.run({
      script: kb.script,
      format: kb.format,
      targetLang: kb.targetLang,
      autoTranslate: kb.autoTranslate,
    });
    if (audio) kb.setAudioUrl(audio);
    kb.setTtsLoading(false);
  }

  async function handleVoiceChange() {
    const result = await vc.run({ audioUrl: kb.audioUrl });
    if (result) kb.setAudioUrl(result);
  }

  const canUseGenerated = Boolean(kb.audioUrl && kb.audioUrl.trim());
  const canVoiceChange = vc.canVoiceChange(kb.audioUrl);
  const disableVoiceChangeBtn = vc.vcBusy || !vc.vcVoiceId || !canVoiceChange;

  return (
    <div className="relative bg-white/70 min-h-screen py-10 sm:py-12 overflow-hidden">
      <AnimatedGridPattern
        numSquares={40}
        maxOpacity={0.06}
        duration={3}
        repeatDelay={1}
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(900px_circle_at_center,white,transparent)]
          skew-y-12 h-[150%] -top-[25%] fill-gray-400/30 stroke-gray-400/30"
        width={36}
        height={36}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-5 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Knowledge Base
            </span>
          </h1>
        </header>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {/* Left column */}
          <div className="space-y-4 sm:space-y-6 md:col-span-1 md:sticky md:top-24 self-start">
            <InputType mode={kb.mode} setMode={kb.setMode} />

            <OutputFormat
              format={kb.format}
              setFormat={kb.setFormat}
              disabledGenerate={kb.disabledGenerate}
              disabledTTS={kb.disabledTTS}
              generating={kb.generating}
              ttsLoading={kb.ttsLoading}
              onGenerate={handleFetchAndGenerate}
              onTTS={handleTTS}
            />

            <LanguageSelector
              langs={LANGS}
              targetLang={kb.targetLang}
              setTargetLang={kb.setTargetLang}
              autoTranslate={kb.autoTranslate}
              setAutoTranslate={kb.setAutoTranslate}
            />

            <VoiceChanger
              canUseGenerated={canUseGenerated}
              vcMode={vc.vcMode}
              setVcMode={vc.setVcMode}
              setVcFile={vc.setVcFile}
              vcSourceUrl={vc.vcSourceUrl}
              setVcSourceUrl={vc.setVcSourceUrl}
              vcVoiceId={vc.vcVoiceId}
              setVcVoiceId={vc.setVcVoiceId}
              vcVoices={vc.vcVoices}
              vcStyle={vc.vcStyle}
              setVcStyle={vc.setVcStyle}
              vcStylesForVoice={vc.vcStylesForVoice}
              vcSpeed={vc.vcSpeed}
              setVcSpeed={vc.setVcSpeed}
              vcPitch={vc.vcPitch}
              setVcPitch={vc.setVcPitch}
              disableVoiceChangeBtn={disableVoiceChangeBtn}
              vcBusy={vc.vcBusy}
              canVoiceChange={canVoiceChange}
              onVoiceChange={handleVoiceChange}
            />

            <AnalysisPanel analysis={kb.analysis} />
          </div>

          {/* Right column */}
          <div className="md:col-span-2 space-y-4 sm:space-y-6">
            <InputPanel
              mode={kb.mode}
              query={kb.query}
              setQuery={kb.setQuery}
              url={kb.url}
              setUrl={kb.setUrl}
              pasted={kb.pasted}
              setPasted={kb.setPasted}
              file={kb.file}
              setFile={kb.setFile}
            />

            <PreviewPanel
              fetched={kb.fetched}
              analysis={kb.analysis}
              script={kb.script}
              setScript={kb.setScript}
              audioUrl={kb.audioUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
