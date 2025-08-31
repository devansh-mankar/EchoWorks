import express from "express";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

const router = express.Router();
const MURF_KEY = process.env.MURF_API_KEY;
if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);

function stableHash(obj) {
  return crypto.createHash("sha1").update(JSON.stringify(obj)).digest("hex");
}
async function ensureDir(p) {
  await fs.promises.mkdir(p, { recursive: true });
}
async function fileExists(absPath) {
  try {
    await fs.promises.access(absPath, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

async function murfUpload(pathname, formData) {
  if (!MURF_KEY) throw new Error("Missing MURF_API_KEY");
  const base = "https://api.murf.ai/v1";
  const res = await fetch(base + pathname, {
    method: "POST",
    headers: { "api-key": MURF_KEY },
    body: formData,
  });
  if (!res.ok) throw new Error(`Murf HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

async function murfFetch(pathname, init = {}) {
  if (!MURF_KEY) throw new Error("Missing MURF_API_KEY");
  const base = "https://api.murf.ai/v1";
  const res = await fetch(base + pathname, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "api-key": MURF_KEY,
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`Murf HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

let VOICE_CACHE = { at: 0, items: [] };
async function getVoicesRaw() {
  const now = Date.now();
  if (VOICE_CACHE.items.length && now - VOICE_CACHE.at < 10 * 60 * 1000) {
    return VOICE_CACHE.items;
  }
  const data = await murfFetch("/speech/voices");
  const arr = Array.isArray(data) ? data : data?.voices || [];
  VOICE_CACHE = { at: now, items: arr };
  return arr;
}

const normCode = (c = "") => (c || "").replace("_", "-");
function voiceMatchesLocale(v, targetCode) {
  const lc = normCode(v.locale || "");
  const tc = normCode(targetCode || "");
  if (!tc) return true;
  if (lc === tc) return true;
  const sup = v.supportedLocales || v.supported_locales || {};
  return Object.keys(sup || {}).some((k) => normCode(k) === tc);
}

function pickByStyles(voices, targetLangCode, preferredStyles = []) {
  const active = voices.filter(
    (v) => v && voiceMatchesLocale(v, targetLangCode)
  );
  for (const style of preferredStyles) {
    const v = active.find((vv) =>
      (Array.isArray(vv.availableStyles) ? vv.availableStyles : []).some(
        (s) => String(s).toLowerCase() === String(style).toLowerCase()
      )
    );
    if (v) return { voice: v, style };
  }
  return { voice: active[0], style: undefined };
}

function pickDialogueVoicesExpressive(voices, lang = "en-US") {
  const studentPref = [
    "Conversational",
    "Promo",
    "Inspirational",
    "Storytelling",
  ];
  const teacherPref = [
    "Storytelling",
    "Narration",
    "Inspirational",
    "Newscast",
    "Conversational",
  ];
  const studentPick = pickByStyles(voices, lang, studentPref);
  const alt = voices.filter((v) => v !== studentPick.voice);
  const teacherPick = pickByStyles(
    alt.length ? alt : voices,
    lang,
    teacherPref
  );
  return { student: studentPick, teacher: teacherPick };
}

function pickNarratorExpressive(voices, lang = "en-US", mode = "pro") {
  const table = {
    pro: ["Inspirational", "Newscast", "Promo", "Narration", "Conversational"],
    layman: ["Storytelling", "Conversational", "Narration", "Inspirational"],
    default: ["Storytelling", "Inspirational", "Conversational", "Narration"],
  };
  return pickByStyles(voices, lang, table[mode] || table.default);
}

function stripMarkdownForTTS(text) {
  return String(text)
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^[*-]\s+/gm, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function extractTTSOnlyOrScript(text) {
  const src = String(text || "");
  const tts = /TTS_ONLY:\s*([\s\S]*)$/i.exec(src);
  if (tts && tts[1]) return tts[1].trim();
  const script = /SCRIPT:\s*([\s\S]*)/i.exec(src);
  if (script && script[1]) return script[1].trim();
  return src.trim();
}

function stripStageAndLabels(text) {
  let s = String(text || "");

  s = s.replace(/\[[^\]]*\]/g, " … ");
  s = s.replace(/\([^)]*\)/g, " … ");

  s = s.replace(
    /^(?:[A-Z][A-Z ]{2,}|Narrator|Sender|Teacher|Student|You|Me|Voice|Host|Guest|Actor|Actress|Reader|Speaker)\s*:\s*/gim,
    ""
  );

  s = s
    .replace(/\s{2,}/g, " ")
    .replace(/(?:\s*…\s*){2,}/g, " … ")
    .replace(/([.!?])\s*(?=[.!?])/g, "$1 ");

  s = s
    .split(/\r?\n+/)
    .map((ln) => ln.trim())
    .filter(Boolean)
    .join("\n");
  return s.trim();
}

function extractScriptSection(text) {
  const m = /SCRIPT:\s*([\s\S]*)/i.exec(text);
  return m ? m[1].trim() : text;
}

function chunkBySentences(text, maxChars = 1400) {
  const clean = String(text).trim();
  if (clean.length <= maxChars) return [clean];
  const sentences = clean.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let buf = "";
  for (const s of sentences) {
    if ((buf + " " + s).trim().length > maxChars) {
      if (buf) chunks.push(buf.trim());
      buf = s;
    } else {
      buf = (buf ? buf + " " : "") + s;
    }
  }
  if (buf.trim()) chunks.push(buf.trim());
  return chunks;
}

async function withPool(items, worker, concurrency = 3) {
  const ret = new Array(items.length);
  let i = 0;
  const run = async () => {
    while (i < items.length) {
      const idx = i++;
      ret[idx] = await worker(items[idx], idx);
    }
  };
  const runners = Array(Math.min(concurrency, items.length)).fill(0).map(run);
  await Promise.all(runners);
  return ret;
}

async function downloadToTmp(url, ext = ".wav") {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Download failed ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  const tmpFile = path.join(os.tmpdir(), `${crypto.randomUUID()}${ext}`);
  await fs.promises.writeFile(tmpFile, buf);
  return tmpFile;
}

async function concatAudio(files, outPath) {
  if (files.length === 1) {
    await new Promise((resolve, reject) => {
      ffmpeg(files[0])
        .audioCodec("libmp3lame")
        .outputOptions(["-q:a 2"])
        .on("error", reject)
        .on("end", resolve)
        .save(outPath);
    });
    return;
  }
  const listFile = path.join(os.tmpdir(), `${crypto.randomUUID()}.txt`);
  const listContent = files
    .map((f) => `file '${f.replace(/'/g, "'\\''")}'`)
    .join("\n");
  await fs.promises.writeFile(listFile, listContent, "utf8");

  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(listFile)
      .inputOptions(["-f", "concat", "-safe", "0"])
      .audioCodec("libmp3lame")
      .outputOptions(["-q:a 2"])
      .on("error", reject)
      .on("end", resolve)
      .save(outPath);
  });

  try {
    await fs.promises.unlink(listFile);
  } catch {}
}

async function generateClipWithFallback({ text, voiceId, style, fmt = "wav" }) {
  const tryOnce = async (payload) => {
    const job = await murfFetch("/speech/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const url =
      job.audioFile || job.audio_url || job.url || job.output?.[0]?.url;
    if (!url) throw new Error("Murf did not return audio url");
    return url;
  };

  const basePayload = { voice_id: voiceId, audio_format: fmt, text };
  if (style) {
    try {
      return await tryOnce({ ...basePayload, style });
    } catch (e) {
      console.warn("[MURF] style failed; retrying w/o style:", e.message);
    }
  }
  try {
    return await tryOnce(basePayload);
  } catch (e) {
    console.warn("[MURF] base attempt failed, chunking:", e.message);
    const pieces = chunkBySentences(text, 700);
    const tmpFiles = [];
    try {
      for (const p of pieces) {
        const u = await tryOnce({ ...basePayload, text: p });
        const t = await downloadToTmp(u, ".wav");
        tmpFiles.push(t);
      }
      const outDir = path.join(process.cwd(), "public", "audio");
      await ensureDir(outDir);
      const outName = `${crypto.randomUUID()}.mp3`;
      const outPath = path.join(outDir, outName);
      await concatAudio(tmpFiles, outPath);
      return `/audio/${outName}`;
    } finally {
      for (const f of tmpFiles) {
        try {
          await fs.promises.unlink(f);
        } catch {}
      }
    }
  }
}

router.get("/murf/voices/raw", async (_req, res) => {
  try {
    res.json(await getVoicesRaw());
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed to fetch voices" });
  }
});
router.get("/murf/voices", async (_req, res) => {
  try {
    const raw = await getVoicesRaw();
    const sample = raw.slice(0, 8).map((v) => ({
      id: v.voiceId,
      displayName: v.displayName,
      locale: v.locale,
      gender: v.gender,
      description: v.description,
      availableStyles: v.availableStyles || [],
      isActive: true,
      raw: v,
    }));
    res.json({ count: raw.length, sample });
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed to fetch voices" });
  }
});

router.post("/murf", async (req, res) => {
  try {
    const { text, style, targetLangCode } = req.body || {};
    if (!text) return res.status(400).json({ error: "Missing text" });

    const voices = await getVoicesRaw();
    if (!voices.length)
      return res.status(500).json({ error: "No Murf voices available" });

    const mode = String(style || "").toLowerCase();

    const baseForTTS = extractTTSOnlyOrScript(text);
    const cleaned = stripMarkdownForTTS(stripStageAndLabels(baseForTTS));
    const lang = targetLangCode || "en-US";

    const cacheKey = stableHash({ cleaned, mode, lang });
    const outDir = path.join(process.cwd(), "public", "audio");
    await ensureDir(outDir);
    const cachedRel = `/audio/${cacheKey}.mp3`;
    const cachedAbs = path.join(outDir, `${cacheKey}.mp3`);
    if (await fileExists(cachedAbs)) {
      return res.json({ audioUrl: cachedRel });
    }

    if (mode === "dialogue") {
    }

    const pick = pickNarratorExpressive(
      voices,
      lang,
      mode === "layman" ? "layman" : "pro"
    );
    const pieces = chunkBySentences(cleaned, 1400);

    const tmpFiles = await withPool(
      pieces,
      async (p) => {
        const url = await generateClipWithFallback({
          text: p,
          voiceId: pick.voice.voiceId,
          style: pick.style,
          fmt: "wav",
        });
        if (/^https?:\/\//i.test(url)) return await downloadToTmp(url, ".wav");
        return path.join(process.cwd(), "public", url.replace(/^\/+/, ""));
      },
      3
    );

    const outPath = cachedAbs;
    await concatAudio(tmpFiles, outPath);

    for (const f of tmpFiles) {
      try {
        await fs.promises.unlink(f);
      } catch {}
    }

    return res.json({ audioUrl: cachedRel });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "Murf error" });
  }
});

export default router;
