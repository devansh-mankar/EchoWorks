import express from "express";
import OpenAI from "openai";

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", async (req, res) => {
  try {
    const { text, targetLangLabel } = req.body || {};
    if (!text?.trim()) return res.status(400).json({ error: "Missing text" });
    if (!targetLangLabel)
      return res.status(400).json({ error: "Missing targetLangLabel" });

    const MAX = 8000;
    const safeText = text.slice(0, MAX);

    const system = `You are a precise translator.
- Keep formatting, headings, Q/A labels, bullet lists, and TL;DR sections.
- Preserve "Student:" and "Teacher:" role labels if present.
- Do NOT add explanations, notes, or commentary.
- Output ONLY the translated text, nothing else.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: `Translate the following into ${targetLangLabel}:\n\n${safeText}`,
        },
      ],
    });

    const translated = completion.choices?.[0]?.message?.content?.trim();
    if (!translated)
      return res.status(500).json({ error: "No translation produced" });

    res.json({ text: translated });
  } catch (e) {
    console.error("[translate] error:", e);
    res.status(500).json({ error: e.message || "Translate error" });
  }
});

export default router;
