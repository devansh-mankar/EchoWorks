import Panel from "./Panel";
import {
  CATEGORY_TABS,
  STYLE_PRESETS,
  LANG_OPTIONS,
  VOICE_OPTIONS,
} from "../constants";

export default function Sidebar({
  mode,
  setMode,
  gmailConnected,
  connectGmail,
  disconnectGmail,
  loadingList,
  fetchPage,
  pageTokens,
  pasted,
  setPasted,
  handleUsePasted,
  setFile,
  handleUploadEML,

  stylePreset,
  setStylePreset,
  lang,
  setLang,
  currentEmail,
  voiceMap,
  updateVoice,
}) {
  return (
    <div className="sticky top-24 space-y-4">
      <Panel title="Email Input">
        <div className="space-y-2">
          {[
            { id: "gmail", label: "Connect Gmail (Free)" },
            { id: "outlook", label: "Connect Outlook (Pro)" },
            { id: "paste", label: "Paste Email" },
            { id: "upload", label: "Upload .eml" },
          ].map((opt) => (
            <label key={opt.id} className="flex items-center gap-3">
              <input
                type="radio"
                name="mode"
                value={opt.id}
                checked={mode === opt.id}
                onChange={(e) => setMode(e.target.value)}
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {mode === "gmail" && (
            <div className="flex flex-col items-center gap-3">
              {gmailConnected && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Connected to Gmail
                </span>
              )}

              {!gmailConnected ? (
                <button
                  onClick={connectGmail}
                  className="px-4 py-2 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:shadow-xl whitespace-nowrap"
                >
                  Connect
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchPage(1, pageTokens[1])}
                    className="px-3 py-2 rounded-xl font-semibold border border-gray-300 bg-white shadow-lg hover:shadow-2xl disabled:opacity-50 whitespace-nowrap min-w-[94px]"
                    disabled={loadingList}
                  >
                    {loadingList ? "Loading…" : "Fetch"}
                  </button>
                  <button
                    onClick={disconnectGmail}
                    className="px-3 py-2 rounded-xl font-semibold border border-gray-300 bg-white shadow-lg hover:shadow-2xl whitespace-nowrap"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          )}

          {mode === "outlook" && (
            <div className="p-3 rounded-xl border text-xs text-gray-600 bg-gray-50">
              Outlook integration is Pro/Max (coming soon).
            </div>
          )}

          {mode === "paste" && (
            <div className="space-y-2">
              <textarea
                rows={8}
                placeholder={`Paste a raw email...\nFrom: alice@example.com\nSubject: Update\n\nBody...`}
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
                className="w-full rounded-xl border px-3 py-2"
              />
              <button
                onClick={handleUsePasted}
                className="px-3 py-2 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:shadow-xl"
              >
                Use Pasted Email
              </button>
            </div>
          )}

          {mode === "upload" && (
            <div className="space-y-2">
              <input
                type="file"
                accept=".eml"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <button
                onClick={handleUploadEML}
                className="px-3 py-2 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:shadow-xl"
              >
                Parse .eml
              </button>
            </div>
          )}
        </div>
      </Panel>

      <Panel title="Customization">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Recording Style
            </label>
            <select
              value={stylePreset}
              onChange={(e) => setStylePreset(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 mt-1"
            >
              {STYLE_PRESETS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Audio Language
            </label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 mt-1"
            >
              {LANG_OPTIONS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Panel>

      {currentEmail && (
        <Panel title="Voice per Sender">
          <div className="space-y-2">
            <div className="text-xs text-gray-600">
              Set a voice for <b>{currentEmail.from}</b>
            </div>
            <select
              value={voiceMap[currentEmail.from] || ""}
              onChange={(e) => updateVoice(currentEmail.from, e.target.value)}
              className="w-full rounded-xl border px-3 py-2"
            >
              <option value="">Auto (recommended)</option>
              {VOICE_OPTIONS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        </Panel>
      )}
    </div>
  );
}
