import RailCard from "./RailCard";
import DOMPurify from "dompurify";

export default function PreviewPane({
  currentEmail,
  loadingHydrate,
  script,
  setScript,
}) {
  return (
    <RailCard className="h-[calc(100vh-180px)] min-h-[560px] overflow-hidden shadow-2xl flex flex-col">
      {!currentEmail ? (
        <div className="h-full grid place-items-center text-md text-gray-600 px-6">
          Select an email to preview.
        </div>
      ) : (
        <>
          <div className="px-5 pt-5 pb-3 border-b bg-gray-50 rounded-t-2xl shadow-sm">
            <div className="text-xs text-gray-500">
              {new Date(currentEmail.date || Date.now()).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {currentEmail.from}
            </div>
            <div className="text-xl font-semibold mt-1">
              {currentEmail.subject}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-auto">
            {loadingHydrate && !(currentEmail.html || currentEmail.text) ? (
              <div className="px-5 py-5 text-sm text-gray-600">
                Loading full content…
              </div>
            ) : currentEmail.html ? (
              <div
                className="email-html prose prose-sm max-w-none px-5 py-5"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(currentEmail.html, {
                    ADD_ATTR: ["target", "rel", "referrerpolicy"],
                    ADD_TAGS: ["iframe", "picture", "source"],
                  }),
                }}
              />
            ) : (
              <div className="px-5 py-5">
                <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {currentEmail.text || ""}
                </pre>
              </div>
            )}

            {script && (
              <div className="px-5 pb-5">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Generated Summary (editable)
                </label>
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  rows={10}
                  className="w-full rounded-xl border px-3 py-2 font-mono shadow-inner"
                />
              </div>
            )}
          </div>
        </>
      )}
    </RailCard>
  );
}
