import express from "express";

const router = express.Router();

const WIKI_REST = "https://en.wikipedia.org/api/rest_v1";

//  strip tags
function stripHtml(html = "") {
  return html.replace(/<[^>]+>/g, "");
}

// GET /api/wiki/:title
router.get("/:title", async (req, res) => {
  try {
    const titleRaw = req.params.title || "";
    const title = titleRaw.trim().replace(/\s+/g, "_");
    if (!title) return res.status(400).json({ error: "Missing title" });

    const s = await fetch(
      `${WIKI_REST}/page/summary/${encodeURIComponent(title)}`,
      {
        headers: {
          "User-Agent": "EchoWorks/1.0 (contact@example.com)",
        },
      }
    );
    if (!s.ok) {
      const err = await s.text();
      return res.status(s.status).json({ error: `Summary error: ${err}` });
    }
    const summary = await s.json();

    const m = await fetch(
      `${WIKI_REST}/page/mobile-sections/${encodeURIComponent(title)}`,
      {
        headers: {
          "User-Agent": "EchoWorks/1.0 (contact@example.com)",
        },
      }
    );

    let content = summary.extract || "";
    if (m.ok) {
      const sections = await m.json();
      const merged = [
        ...(sections.lead?.sections?.map((sec) => sec.text) || []),
        ...(sections.remaining?.sections?.map((sec) => sec.text) || []),
      ]
        .filter(Boolean)
        .join("\n\n");
      if (merged) content = stripHtml(merged);
    }

    return res.json({
      title: summary.title || titleRaw,
      url:
        summary.content_urls?.desktop?.page ||
        `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      content,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "Wiki proxy error" });
  }
});

export default router;
