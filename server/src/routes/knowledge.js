import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function stripMarkdownSymbols(text) {
  if (!text) return "";
  return String(text)
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^[#>]+\s*/gm, "")
    .replace(/^\s*[-*•]\s+/gm, "")
    .replace(/`{1,3}([^`]+)`{1,3}/g, "$1")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// System prompts: lively storyteller
const SYSTEMS = {
  dialogue: `You write a lively Student–Teacher dialogue as plain text ONLY.

Hard rules:
- DO NOT use Markdown or any formatting symbols (no **, *, -, #, _, >, backticks).
- Names must be exactly "Student:" and "Teacher:" for each speaking line.
- The tone is energetic, playful, and engaging, with a storytelling vibe.
- Use short lines, natural interjections ("Right!", "Exactly.", "Wait—what?") and occasional simple stage cues in [brackets] (e.g., [smiles], [pauses]).
- Build small arcs: a hook, exploration, mini-reveal, quick recap.

Structure the output EXACTLY:

TITLE: <short witty title>

CAST:
- Narrator
- Student
- Teacher

SCRIPT:
Student: <hook or question>
Teacher: <charismatic reply, vivid, concrete>
Student: <follow-up, curious>
Teacher: <storylike explanation, simple analogy>
Student: <aha moment>
Teacher: <punchy recap>
(2–3 minutes total, concise and lively)`,
  pro: `You write a professional voiceover script as plain text ONLY with a dynamic storyteller tone.

Hard rules:
- DO NOT use Markdown or any formatting symbols (no **, *, -, #, _, >, backticks).
- Use vivid verbs, rhetorical hooks, tight pacing, and short paragraphs.
- Keep the voice confident, cinematic, slightly inspirational—not salesy.

Structure:
INTRO:
BODY:
CASE IN POINT:
TAKEAWAY:

Aim for 2–3 minutes. Keep it crisp and energetic.`,
  layman: `You write a friendly, lively layman narration as plain text ONLY.

Hard rules:
- DO NOT use Markdown or any formatting symbols (no **, *, -, #, _, >, backticks).
- Use warm, conversational phrasing with light storytelling.
- Use simple analogies, small reveals, and a cheerful tone.
- End with a snappy TLDR using numbered lines.

Structure:
INTRO:
MAIN IDEA:
HOW IT WORKS:
REAL-LIFE EXAMPLE:
TLDR:
1. <point>
2. <point>
3. <point>`,
};

router.post("/generate", async (req, res) => {
  try {
    const {
      format = "dialogue",
      title,
      sourceUrl,
      content,
      analysis,
    } = req.body || {};

    if (!content) {
      return res.status(400).json({ error: "Missing content" });
    }

    const system = SYSTEMS[format] || SYSTEMS.dialogue;

    const userPrompt = `
You will write a ${format} script based on the following source.

Title: ${title || "Untitled"}
Source: ${sourceUrl || "N/A"}
Key Concepts: ${(analysis?.keyConcepts || []).slice(0, 8).join(", ")}

Source Content:
"""${String(content).slice(0, 15000)}"""

IMPORTANT:
- Output MUST be plain text only (no markdown, no bullets).
- Follow the structure for the selected format exactly.
- Keep it vivid and storyteller-like, with dynamic pacing.
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: format === "pro" ? 0.65 : 0.85,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
    });

    let script = completion.choices?.[0]?.message?.content || "";
    if (!script.trim()) {
      return res.status(500).json({ error: "No script generated" });
    }

    script = stripMarkdownSymbols(script);

    if (format === "dialogue") {
      if (!/^TITLE:/m.test(script)) {
        script = `TITLE: ${title || "Dialogue"}\n\n${script}`;
      }
      if (!/\nCAST:\s*\n/i.test(script)) {
        script = script.replace(
          /^TITLE:[^\n]*\n*/i,
          (m) => `${m}\nCAST:\n- Narrator\n- Student\n- Teacher\n\n`
        );
      }
      if (!/\nSCRIPT:\s*\n/i.test(script)) {
        script = script.replace(/\nCAST:[\s\S]*?\n\n/i, (m) => `${m}SCRIPT:\n`);
      }
      script = script
        .replace(/^\s*(learner|pupil)\s*[:\-–]/gim, "Student: ")
        .replace(/^\s*(professor|instructor|mentor)\s*[:\-–]/gim, "Teacher: ")
        .replace(/^\s*(narration|narrator)\s*[:\-–]/gim, "Narrator: ");
    }

    res.json({ script: script.trim() });
  } catch (e) {
    console.error("[/api/knowledge/generate] error:", e);
    res.status(500).json({ error: e.message || "OpenAI error" });
  }
});

export default router;
