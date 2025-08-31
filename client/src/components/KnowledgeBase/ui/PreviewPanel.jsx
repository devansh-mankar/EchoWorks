import Card from "./Card";

export default function PreviewPanel({
  fetched,
  analysis,
  script,
  setScript,
  audioUrl,
}) {
  if (!fetched) return null;
  return (
    <Card title="Preview">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-semibold">
            {fetched.title}
          </h3>
          {fetched.url && (
            <a
              className="text-sm text-blue-600 hover:underline break-all"
              href={fetched.url}
              target="_blank"
              rel="noreferrer"
            >
              Source
            </a>
          )}
        </div>
        <span className="text-xs text-gray-500">
          {analysis?.wordCount ?? 0} words fetched
        </span>
      </div>

      <div className="mt-3 sm:mt-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Generated Script
        </label>
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          rows={14}
          className="w-full rounded-xl border px-3 py-2 font-mono text-sm"
        />
      </div>

      {audioUrl && (
        <div className="mt-3 sm:mt-4">
          <audio controls src={audioUrl} className="w-full" />
        </div>
      )}
    </Card>
  );
}
