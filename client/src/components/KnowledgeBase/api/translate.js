export async function translate({ text, targetLangLabel }) {
  const tr = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, targetLangLabel }),
  });
  const trData = await tr.json();
  if (!tr.ok) throw new Error(trData?.error || "Translate failed.");
  return trData;
}
