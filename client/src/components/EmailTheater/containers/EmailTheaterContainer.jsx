import React, { useEffect } from "react";
import { AnimatedGridPattern } from "@/components/ui/magicui/animated-grid-pattern";
import useAuth from "@/hooks/useAuth";

import { LANG_LABEL_BY_CODE } from "../constants.js";
import Sidebar from "../ui/Sidebar";
import InboxPanel from "../ui/InboxPanel.jsx";
import PreviewPane from "../ui/PreviewPane.jsx";
import AudioBox from "../ui/AudioBox.jsx";

import { useEmailTheaterState } from "../hooks/useEmailTheaterState.js";
import { useInbox } from "../hooks/useInbox.js";
import { useGenerationTTS } from "../hooks/useGenerationTTS.js";

export default function EmailTheaterContainer() {
  const { user } = useAuth();
  const kb = useEmailTheaterState(user?.id);

  useEffect(() => {
    if (!user?.id) {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith("gmailConnected:")) localStorage.removeItem(k);
      }
      kb.setGmailConnected(false);
      kb.resetInboxUI();
    }
  }, [!!user?.id]);

  const inbox = useInbox(kb);
  const genTts = useGenerationTTS(kb);

  useEffect(() => {
    kb.setScript("");
    kb.setAudioUrl("");
    if (inbox.filteredEmails.length > 0) {
      inbox.hydrateSelectedIfNeeded(kb.selectedIdx, inbox.filteredEmails);
    }
  }, [kb.selectedIdx, inbox.filteredEmails.map((m) => m.id).join("|")]);

  return (
    <div className="relative min-h-[100vh] overflow-hidden bg-white">
      <style>{`
        .email-html img { max-width: 100% !important; height: auto !important; }
        .email-html table { width: 100% !important; }
        .email-html iframe { width: 100% !important; max-width: 100% !important; }
        .email-html p { margin: 0.5rem 0; }
      `}</style>

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

      <div className="relative z-10 w-full px-3 sm:px-4 lg:px-6 py-6">
        {/* header */}
        <div className="mb-4 px-1 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Email Theater
              </span>
            </h1>
            <p className="text-gray-600 mt-1">
              Turn emails into medium-length audio summaries.
            </p>
          </div>

          {/* range filter */}
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <span className="text-gray-600">Range:</span>
            <select
              value={kb.days}
              onChange={(e) => kb.setDays(Number(e.target.value))}
              className="rounded-lg border px-2 py-1"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3 sm:gap-4 lg:gap-6 min-h-0">
          {/* LEFT */}
          <div className="col-span-12 md:col-span-3 lg:col-span-2 xl:col-span-2 min-h-0">
            <Sidebar
              mode={kb.mode}
              setMode={kb.setMode}
              gmailConnected={kb.gmailConnected}
              connectGmail={inbox.connectGmail}
              disconnectGmail={inbox.disconnectGmail}
              loadingList={kb.loadingList}
              fetchPage={inbox.fetchPage}
              pageTokens={kb.pageTokens}
              pasted={kb.pasted}
              setPasted={kb.setPasted}
              handleUsePasted={inbox.handleUsePasted}
              file={kb.file}
              setFile={kb.setFile}
              handleUploadEML={inbox.handleUploadEML}
              days={kb.days}
              setDays={kb.setDays}
              stylePreset={kb.stylePreset}
              setStylePreset={kb.setStylePreset}
              lang={kb.lang}
              setLang={kb.setLang}
              currentEmail={inbox.currentEmail}
              voiceMap={kb.voiceMap}
              updateVoice={kb.updateVoice}
            />
          </div>

          {/* MIDDLE */}
          <div className="col-span-12 md:col-span-4 lg:col-span-4 xl:col-span-4 min-h-0">
            <InboxPanel
              category={kb.category}
              setCategory={kb.setCategory}
              loadingList={kb.loadingList}
              allEmails={kb.allEmails}
              filteredEmails={inbox.filteredEmails}
              selectedIdx={kb.selectedIdx}
              setSelectedIdx={kb.setSelectedIdx}
              currentPage={kb.currentPage}
              estimate={kb.estimate}
              nextPageToken={kb.nextPageToken}
              pageTokens={kb.pageTokens}
              fetchPage={inbox.fetchPage}
            />
          </div>

          {/* RIGHT */}
          <div className="col-span-12 md:col-span-5 lg:col-span-6 xl:col-span-6 min-h-0">
            <PreviewPane
              currentEmail={inbox.currentEmail}
              loadingHydrate={kb.loadingHydrate}
              script={kb.script}
              setScript={kb.setScript}
              LANG_LABEL_BY_CODE={LANG_LABEL_BY_CODE}
              lang={kb.lang}
            />

            <div className="shrink-0 border-t bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 rounded-b-2xl px-5 py-3">
              <div className="w-full flex justify-center">
                <button
                  disabled={!inbox.currentEmail || kb.disabledGen}
                  onClick={() => genTts.handleGenerate(inbox.currentEmail)}
                  className="px-5 py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {kb.loadingGen ? "Processing…" : "Generate Summary"}
                </button>
              </div>
              <div className="mt-2 text-center text-xs text-gray-500">
                Language: <b>{LANG_LABEL_BY_CODE[kb.lang] || kb.lang}</b>
              </div>
            </div>

            <AudioBox
              script={kb.script}
              audioUrl={kb.audioUrl}
              handleTTS={genTts.handleTTS}
              disabledGen={kb.disabledGen}
              loadingGen2={kb.loadingGen2}
              loadingGen={kb.loadingGen}
              lang={kb.lang}
              LANG_LABEL_BY_CODE={LANG_LABEL_BY_CODE}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
