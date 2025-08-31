import Card from "./Card";

export default function InputPanel({
  mode,
  query,
  setQuery,
  url,
  setUrl,
  pasted,
  setPasted,

  setFile,
}) {
  return (
    <Card title="Input">
      {mode === "query" && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Search Wikipedia
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Alan Turing"
            className="w-full rounded-xl border px-3 py-2"
          />
        </div>
      )}

      {mode === "url" && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Wikipedia URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://en.wikipedia.org/wiki/Alan_Turing"
            className="w-full rounded-xl border px-3 py-2"
          />
        </div>
      )}

      {mode === "paste" && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Paste Text or Link
          </label>
          <textarea
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            rows={10}
            placeholder="Paste any text or a web link..."
            className="w-full rounded-xl border px-3 py-2"
          />
        </div>
      )}

      {mode === "upload" && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Upload Document
          </label>
          <input
            type="file"
            accept=".pdf,.txt,.md,.doc,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <p className="text-xs text-gray-500">
            PDF/DOC parsing runs on the server.
          </p>
        </div>
      )}
    </Card>
  );
}
