import Card from "./Card";

export default function OutputFormat({
  format,
  setFormat,
  disabledGenerate,
  disabledTTS,
  generating,
  ttsLoading,
  onGenerate,
  onTTS,
}) {
  const formats = [
    ["dialogue", "Student–Teacher Dialogue"],
    ["pro", "Professional Narration"],
    ["layman", "Layman Summary"],
  ];

  return (
    <Card title="Output Format">
      <div className="space-y-2">
        {formats.map(([val, label]) => (
          <label key={val} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="format"
              value={val}
              checked={format === val}
              onChange={(e) => setFormat(e.target.value)}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          disabled={disabledGenerate}
          onClick={onGenerate}
          className="px-3 py-2 rounded-lg text-sm text-white font-medium bg-gradient-to-r from-blue-600 to-purple-600 shadow-md hover:shadow-lg transition-transform active:scale-95 disabled:opacity-60 w-full"
          aria-busy={generating ? "true" : "false"}
        >
          {generating ? "Processing…" : "Generate Script"}
        </button>

        <button
          disabled={disabledTTS}
          onClick={onTTS}
          className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white shadow-md hover:shadow-lg transition-transform active:scale-95 disabled:opacity-60 w-full"
          aria-busy={ttsLoading ? "true" : "false"}
        >
          {ttsLoading ? "Converting…" : "Convert to Audio"}
        </button>
      </div>
    </Card>
  );
}
