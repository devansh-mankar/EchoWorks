import express from "express";
const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const r = await fetch("https://api.murf.ai/v1/speech/voices", {
      headers: { "api-key": process.env.MURF_API_KEY },
    });
    if (!r.ok) {
      const err = await r.text();
      return res.status(r.status).json({ error: err });
    }
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message || "Voices fetch error" });
  }
});

export default router;
