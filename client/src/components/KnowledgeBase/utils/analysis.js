export function analyze(text) {
  const wordCount = text.trim().split(/\s+/).length;
  const sentences = text.split(/[.!?]\s/);
  const avgSentenceLen = wordCount / Math.max(1, sentences.length);

  const stop = new Set(
    "the of and a to in is it for on as with its this that are be or from by at an which have has were was into not can will using use than about over more other their also such may one two new".split(
      " "
    )
  );
  const counts = {};
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .forEach((w) => {
      if (!w || stop.has(w) || w.length < 3) return;
      counts[w] = (counts[w] || 0) + 1;
    });

  const keyConcepts = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([w]) => w);

  const complexity =
    wordCount > 1200 || avgSentenceLen > 22
      ? "high"
      : wordCount > 600 || avgSentenceLen > 18
      ? "medium"
      : "low";

  return { wordCount, avgSentenceLen, keyConcepts, complexity };
}
