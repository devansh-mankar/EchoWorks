export async function generateScript({
  format,
  title,
  sourceUrl,
  content,
  analysis,
}) {
  const res = await fetch("/api/knowledge/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ format, title, sourceUrl, content, analysis }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Generation failed.");
  return data;
}
