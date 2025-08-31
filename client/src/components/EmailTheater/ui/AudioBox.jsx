import RailCard from "./RailCard";

export default function AudioBox({
  script,
  audioUrl,
  handleTTS,
  disabledGen,
  loadingGen2,
  loadingGen,
  lang,
  LANG_LABEL_BY_CODE,
}) {
  if (!script) return null;
  return (
    <RailCard id="audio-box" className="mt-4 p-6 shadow-2xl">
      {!audioUrl ? (
        <div className="w-full flex flex-col items-center gap-3">
          <div className="text-sm text-gray-600">
            Convert the summary to audio
            {lang ? ` (${LANG_LABEL_BY_CODE[lang] || lang})` : ""}.
          </div>
          <button
            onClick={handleTTS}
            disabled={disabledGen}
            className="px-5 py-2.5 rounded-xl font-semibold border border-gray-300 bg-white shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {loadingGen2 ? "Converting…" : "Convert to Audio"}
          </button>
        </div>
      ) : (
        <>
          <div className="text-sm font-medium text-gray-800 mb-2">
            Audio Summary {lang ? `• ${LANG_LABEL_BY_CODE[lang] || lang}` : ""}
          </div>
          <audio controls src={audioUrl} className="w-full" />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <a
              href={audioUrl}
              download="email-summary.mp3"
              className="px-3 py-2 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:shadow-xl"
            >
              Download
            </a>
            <button
              onClick={handleTTS}
              disabled={disabledGen}
              className="px-3 py-2 rounded-xl font-semibold border border-gray-300 bg-white shadow-lg hover:shadow-xl disabled:opacity-50"
              title="Re-convert (useful if you change language)"
            >
              {loadingGen ? "Converting…" : "Re-convert"}
            </button>
          </div>
        </>
      )}
    </RailCard>
  );
}
