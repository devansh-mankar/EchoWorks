import express from "express";
import fileUpload from "express-fileupload";
import pdfParse from "pdf-parse-fixed";

import mammoth from "mammoth";

const router = express.Router();
router.use(fileUpload());

router.post("/upload", async (req, res) => {
  try {
    const f = req.files?.file;
    if (!f) return res.status(400).json({ error: "No file" });

    if (f.mimetype === "application/pdf") {
      const data = await pdfParse(f.data);
      return res.json({ title: f.name, url: "", content: data.text });
    }

    if (
      f.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      f.name?.toLowerCase().endsWith(".docx")
    ) {
      const r = await mammoth.extractRawText({ buffer: f.data });
      return res.json({ title: f.name, url: "", content: r.value });
    }

    if (f.mimetype.startsWith("text/")) {
      const txt = f.data.toString("utf8");
      return res.json({ title: f.name, url: "", content: txt });
    }

    return res.status(415).json({ error: "Unsupported file type" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "Upload parse error" });
  }
});

export default router;
