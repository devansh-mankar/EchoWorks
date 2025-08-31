export function parsePastedEmail(raw) {
  const lines = raw.split(/\r?\n/);
  const from = (lines.find((l) => /^from:/i.test(l)) || "")
    .split(":")
    .slice(1)
    .join(":")
    .trim();
  const subject = (lines.find((l) => /^subject:/i.test(l)) || "")
    .split(":")
    .slice(1)
    .join(":")
    .trim();
  const idxBlank = lines.findIndex((l) => l.trim() === "");
  const text = idxBlank >= 0 ? lines.slice(idxBlank + 1).join("\n") : raw;

  return {
    id: "pasted-" + Date.now(),
    from: from || "unknown@sender",
    subject: subject || "Pasted Email",
    text: text || raw,
    html: "",
    date: new Date().toISOString(),
    labelIds: [],
    snippet: (text || raw).slice(0, 160),
  };
}
