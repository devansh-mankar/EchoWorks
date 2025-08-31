import React from "react";
import { Link } from "react-router-dom";
import { AnimatedGridPattern } from "@/components/ui/magicui/animated-grid-pattern";
import {
  BookOpenText,
  FileText,
  Languages,
  AudioLines,
  Wand2,
  Mic2,
  Volume2,
  Mail,
  Inbox,
  Sparkles,
  Paperclip,
  Share2,
  Zap,
  Shield,
  Cpu,
} from "lucide-react";

const Pill = ({ children }) => (
  <span className="inline-flex items-center text-[10px] sm:text-[11px] font-semibold px-2.5 sm:px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
    {children}
  </span>
);

const Chip = ({ icon: Icon, title, caption }) => (
  <div className="flex flex-col items-center text-center gap-2">
    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm">
      <Icon className="h-4 w-4 text-indigo-600" />
    </div>
    <div className="text-[12.5px] sm:text-[13px] font-semibold text-gray-900">
      {title}
    </div>
    <div className="text-[11.5px] sm:text-[12px] text-gray-500 max-w-[180px]">
      {caption}
    </div>
  </div>
);

export default function Features() {
  return (
    <div className="relative bg-white/70 min-h-screen py-12 sm:py-16 overflow-hidden">
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
        <section className="mx-auto rounded-[24px] sm:rounded-[32px] bg-white/90 backdrop-blur border border-gray-200 shadow-[0_16px_48px_rgba(0,0,0,0.08)] px-4 sm:px-8 lg:px-10 py-8 sm:py-10">
          <div className="flex justify-center">
            <Pill>Our Main Features</Pill>
          </div>

          <h1 className="text-center mt-3 sm:mt-4 text-2xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Our Breakthrough Features
          </h1>
          <p className="text-center mt-2 sm:mt-3 text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Built for <b>Knowledge Base</b> creation and <b>Email Theater</b>{" "}
            workflow—turn research into audio and keep your inbox sane.
          </p>

          {/* Two pillars */}
          <div className="mt-8 sm:mt-10 grid gap-5 sm:gap-8 lg:grid-cols-2">
            {/* Knowledge Base */}
            <div className="rounded-2xl sm:rounded-3xl bg-white border border-gray-200 shadow-2xl p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <BookOpenText className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  Knowledge Base
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                <Chip
                  icon={FileText}
                  title="Auto Script"
                  caption="Fetch Wikipedia or upload docs → clean scripts."
                />
                <Chip
                  icon={Languages}
                  title="Translate"
                  caption="Translate before TTS; locale-aware voices."
                />
                <Chip
                  icon={AudioLines}
                  title="TTS Output"
                  caption="Dialogue / Pro / Layman narration styles."
                />
                <Chip
                  icon={Mic2}
                  title="Voice Change"
                  caption="Revoice any clip; safe rate & pitch."
                />
                <Chip
                  icon={Volume2}
                  title="Audio Library"
                  caption="Stable /audio URLs for reuse."
                />
                <Chip
                  icon={Wand2}
                  title="Smart Styles"
                  caption="Only sends valid styles per voice."
                />
              </div>
            </div>

            {/* Email Theater */}
            <div className="rounded-2xl sm:rounded-3xl bg-white border border-gray-200 shadow-2xl p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  Email Theater
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                <Chip
                  icon={Inbox}
                  title="Thread Timeline"
                  caption="Story-like view for fast context."
                />
                <Chip
                  icon={Sparkles}
                  title="AI Summaries"
                  caption="Decisions & tasks pulled out."
                />
                <Chip
                  icon={Paperclip}
                  title="Attachment OCR"
                  caption="Reliable previews & parsing."
                />
                <Chip
                  icon={Share2}
                  title="Share & Export"
                  caption="Hand off highlights to teammates."
                />
                <Chip
                  icon={Zap}
                  title="Priority Triage"
                  caption="Rule-based urgency routing."
                />
                <Chip
                  icon={Shield}
                  title="Privacy-First"
                  caption="Scoped, non-destructive actions."
                />
              </div>
            </div>
          </div>

          {/* Tech row */}
          <div className="mt-8 sm:mt-10 rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-200 p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Cpu className="h-4 w-4 text-gray-700" />
              <div className="text-sm font-semibold text-gray-800">
                Under the Hood
              </div>
            </div>
            <ul className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 text-[12.5px] sm:text-[13px] text-gray-700">
              <li>OpenAI for script generation & translation</li>
              <li>Murf Voice Changer with normalized rate/pitch</li>
              <li>Native FormData/Blob for reliable multipart</li>
              <li>Local audio persistence with stable /audio URLs</li>
              <li>Duration guard (≤ 180s) & error surfacing</li>
              <li>Clean Tailwind UI with subtle motion</li>
            </ul>
          </div>

          {/* CTAs */}
          <div className="mt-6 sm:mt-8 flex flex-wrap gap-3 justify-center">
            <Link
              to="/subscriptions"
              className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700"
            >
              View Plans
            </Link>
            <Link
              to="/knowledge-base"
              className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm font-semibold bg-white border border-gray-300 text-gray-800 shadow-md hover:bg-gray-50"
            >
              Try Knowledge Base
            </Link>
            <Link
              to="/email-theater"
              className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm font-semibold bg-white border border-gray-300 text-gray-800 shadow-md hover:bg-gray-50"
            >
              Explore Email Theater
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
