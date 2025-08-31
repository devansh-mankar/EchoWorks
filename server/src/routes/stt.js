import express from "express";
import fileUpload from "express-fileupload";
import OpenAI from "openai";
import { toFile } from "openai/uploads";

const router = express.Router();
router.use(fileUpload());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/transcribe", async (req, res) => {
  try {
    const f = req.files?.file;
    if (!f) return res.status(400).json({ error: "No audio file" });

    const fileObj = await toFile(Buffer.from(f.data), f.name, {
      type: f.mimetype,
    });

    const transcript = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: fileObj,
    });

    res.json({ text: transcript.text });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "STT error" });
  }
});

export default router;
