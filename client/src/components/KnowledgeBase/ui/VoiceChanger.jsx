import Card from "./Card";

export default function VoiceChanger({
  canUseGenerated,
  vcMode,
  setVcMode,
  setVcFile,
  vcSourceUrl,
  setVcSourceUrl,
  vcVoiceId,
  setVcVoiceId,
  vcVoices,
  vcStyle,
  setVcStyle,
  vcStylesForVoice,
  vcSpeed,
  setVcSpeed,
  vcPitch,
  setVcPitch,
  disableVoiceChangeBtn,
  vcBusy,
  canVoiceChange,
  onVoiceChange,
}) {
  return (
    <Card title="Voice Changer (beta)">
      <div className="space-y-3">
        {canUseGenerated ? (
          <div className="text-xs rounded-md bg-green-50 border border-green-200 text-green-700 px-2 py-1">
            Using generated audio above as source.
          </div>
        ) : (
          <div className="text-xs text-gray-500">
            No generated audio yet — pick a file or paste a URL.
          </div>
        )}

        <div className="flex gap-4 text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="vc-mode"
              checked={vcMode === "file"}
              onChange={() => setVcMode("file")}
            />
            File
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="vc-mode"
              checked={vcMode === "url"}
              onChange={() => setVcMode("url")}
            />
            URL
          </label>
        </div>

        {vcMode === "file" ? (
          <input
            type="file"
            accept="audio/*,.wav,.mp3,.flac,.m4a"
            onChange={(e) => setVcFile(e.target.files?.[0] || null)}
          />
        ) : (
          <input
            type="url"
            value={vcSourceUrl}
            onChange={(e) => setVcSourceUrl(e.target.value)}
            placeholder="https://example.com/your-audio.mp3"
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        )}

        <select
          value={vcVoiceId}
          onChange={(e) => setVcVoiceId(e.target.value)}
          className="w-full rounded-xl border px-3 py-2 text-sm"
        >
          <option value="">Select target voice</option>
          {vcVoices.map((v) => (
            <option key={v.voiceId} value={v.voiceId}>
              {v.displayName || v.voiceId} {v.locale ? `(${v.locale})` : ""}
            </option>
          ))}
        </select>

        <select
          value={vcStyle}
          onChange={(e) => setVcStyle(e.target.value)}
          className="w-full rounded-xl border px-3 py-2 text-sm"
          disabled={!vcStylesForVoice.length}
        >
          <option value="">
            {vcStylesForVoice.length
              ? "Select style (optional)"
              : "No styles for this voice"}
          </option>
          {vcStylesForVoice.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="number"
            step="1"
            min={-50}
            max={50}
            value={vcSpeed}
            onChange={(e) => setVcSpeed(e.target.value)}
            placeholder="Rate -50..50 (opt)"
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
          <input
            type="number"
            step="1"
            min={-50}
            max={50}
            value={vcPitch}
            onChange={(e) => setVcPitch(e.target.value)}
            placeholder="Pitch -50..50 (opt)"
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        <button
          disabled={disableVoiceChangeBtn}
          onClick={onVoiceChange}
          className="px-3 py-2 rounded-lg text-sm text-white font-medium bg-gradient-to-r from-amber-600 to-pink-600 shadow-md hover:shadow-lg transition-transform active:scale-95 disabled:opacity-60 w-full"
        >
          {vcBusy
            ? "Converting…"
            : canUseGenerated
            ? "Revoice Generated Audio"
            : "Convert Existing Audio"}
        </button>
      </div>
    </Card>
  );
}
