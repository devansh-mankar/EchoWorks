import Card from "./Card";

export default function LanguageSelector({
  langs,
  targetLang,
  setTargetLang,
  autoTranslate,
  setAutoTranslate,
}) {
  return (
    <Card title="Language">
      <div className="space-y-3">
        <select
          value={targetLang.code}
          onChange={(e) =>
            setTargetLang(
              langs.find((l) => l.code === e.target.value) || langs[0]
            )
          }
          className="w-full rounded-xl border px-3 py-2"
        >
          {langs.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={autoTranslate}
            onChange={(e) => setAutoTranslate(e.target.checked)}
          />
          <span>Translate before TTS (recommended)</span>
        </label>
      </div>
    </Card>
  );
}
