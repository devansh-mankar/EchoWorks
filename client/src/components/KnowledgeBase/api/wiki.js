export async function fetchWikipediaByQuery(title) {
  const safeTitle = String(title || "").trim();
  if (!safeTitle) throw new Error("EMPTY_TITLE");
  const res = await fetch(`/api/wiki/${encodeURIComponent(safeTitle)}`);
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(text || `wiki fetch failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  if (!data?.content || !data.content.trim()) throw new Error("NO_CONTENT");
  return data;
}
