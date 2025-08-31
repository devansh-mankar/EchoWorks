import express from "express";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import * as mm from "music-metadata";
import mime from "mime";
import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";

const router = express.Router();
const upload = multer({ limits: { fileSize: 32 * 1024 * 1024 } });
const MURF_KEY = process.env.MURF_API_KEY;
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || "";

const MAX_SECONDS = 180;

const pick = (obj, keys) =>
  keys.map((k) => obj?.[k]).find((v) => v !== undefined);
function stableHash(obj) {
  return crypto.createHash("sha1").update(JSON.stringify(obj)).digest("hex");
}
async function ensureDir(p) {
  await fs.promises.mkdir(p, { recursive: true });
}

async function murfFetch(pathname, { headers = {}, ...init } = {}) {
  if (!MURF_KEY) throw new Error("Missing MURF_API_KEY");
  const base = "https://api.murf.ai/v1";
  const res = await fetch(base + pathname, {
    ...init,
    headers: {
      "api-key": MURF_KEY,
      Accept: "application/json",
      ...headers,
    },
  });
  if (!res.ok) {
    let text = await res.text();
    try {
      text = JSON.stringify(JSON.parse(text));
    } catch {}
    throw new Error(`Murf HTTP ${res.status}: ${text}`);
  }
  return res;
}

//helpers
function toMurfRate(speed) {
  if (speed === undefined || speed === "") return undefined;
  const n = Number(speed);
  if (!Number.isFinite(n)) return undefined;
  if (n >= -50 && n <= 50) return Math.round(n);
  if (n > 0 && n < 2)
    return Math.max(-50, Math.min(50, Math.round((n - 1) * 100)));
  return Math.max(-50, Math.min(50, Math.round(n)));
}
function toMurfPitch(pitch) {
  if (pitch === undefined || pitch === "") return undefined;
  const n = Number(pitch);
  if (!Number.isFinite(n)) return undefined;
  return Math.max(-50, Math.min(50, Math.round(n)));
}
function toMurfFormat(fmt) {
  if (!fmt) return undefined; // default WAV
  const up = String(fmt).trim().toUpperCase();
  const allowed = new Set(["WAV", "MP3", "FLAC", "ALAW", "ULAW"]);
  return allowed.has(up) ? up : undefined;
}
async function getDurationSecondsSafe(buf, filename) {
  try {
    const type = mime.getType(filename) || undefined;
    const meta = await mm.parseBuffer(
      buf,
      { mimeType: type },
      { duration: true }
    );
    return meta.format?.duration || 0;
  } catch {
    return 0;
  }
}
const guessContentType = (filename) =>
  mime.getType(filename) || "application/octet-stream";

//voice resolver
async function resolveVoiceIdToMurf(voiceIdRaw) {
  const inStr = String(voiceIdRaw || "").trim();
  if (!inStr) throw new Error("Missing voiceId");
  if (/^[a-z]{2}-[A-Z]{2}-/.test(inStr)) return inStr;

  const resp = await murfFetch("/speech/voices", { method: "GET" });
  const data = await resp.json();
  const arr = Array.isArray(data?.voices)
    ? data.voices
    : Array.isArray(data)
    ? data
    : [];

  let match = arr.find(
    (v) => String(pick(v, ["voice_id", "voiceId", "id"]) || "").trim() === inStr
  );
  if (!match) {
    const lower = inStr.toLowerCase();
    match = arr.find(
      (v) =>
        String(
          pick(v, ["displayName", "name", "title"]) || ""
        ).toLowerCase() === lower
    );
  }
  if (!match) {
    const lower = inStr.toLowerCase();
    match = arr.find((v) =>
      String(pick(v, ["displayName", "name", "title"]) || "")
        .toLowerCase()
        .includes(lower)
    );
  }

  const murfVoiceId = pick(match, ["voice_id", "voiceId", "id"]);
  if (!murfVoiceId)
    throw new Error(`Unable to resolve voiceId '${inStr}' to a Murf voice_id`);
  return String(murfVoiceId).trim();
}

router.post("/voice-change", upload.single("file"), async (req, res) => {
  try {
    const isMultipart = !!req.file;
    const { sourceUrl, voiceId, style, speed, pitch, audioFormat } = isMultipart
      ? req.body
      : req.body || {};

    if (!voiceId) return res.status(400).json({ error: "Missing voiceId" });

    const form = new FormData();

    let srcFilename = "input.wav";
    let srcBuffer = null;
    let usedFileUrl = false;

    if (isMultipart) {
      srcFilename = req.file.originalname || srcFilename;
      srcBuffer = req.file.buffer;
    } else if (
      typeof sourceUrl === "string" &&
      sourceUrl.startsWith("/audio/")
    ) {
      if (PUBLIC_BASE_URL) {
        usedFileUrl = true;
        form.append("file_url", `${PUBLIC_BASE_URL}${sourceUrl}`);
      } else {
        const localPath = path.join(
          process.cwd(),
          "public",
          sourceUrl.replace(/^\/+/, "")
        );
        srcFilename = path.basename(localPath);
        srcBuffer = await fs.promises.readFile(localPath);
      }
    } else if (
      typeof sourceUrl === "string" &&
      /^https?:\/\//i.test(sourceUrl)
    ) {
      usedFileUrl = true;
      form.append("file_url", sourceUrl);
    } else {
      return res.status(400).json({
        error:
          "Provide a valid audio source: upload a file, use /audio/... (local), or a public https URL.",
      });
    }

    if (!usedFileUrl && srcBuffer) {
      const seconds = await getDurationSecondsSafe(srcBuffer, srcFilename);
      if (seconds && seconds > MAX_SECONDS) {
        return res.status(400).json({
          error: `Input audio is ${Math.round(seconds)}s; Murf limit is 180s.`,
        });
      }
      const contentType = guessContentType(srcFilename);
      const blob = new Blob([srcBuffer], { type: contentType });
      form.append("file", blob, srcFilename);
    }

    const resolvedVoiceId = await resolveVoiceIdToMurf(voiceId);
    const rate = toMurfRate(speed);
    const murfPitch = toMurfPitch(pitch);
    const format = toMurfFormat(audioFormat);

    form.append("voice_id", resolvedVoiceId);
    if (rate !== undefined) form.append("rate", String(rate));
    if (murfPitch !== undefined) form.append("pitch", String(murfPitch));
    if (format) form.append("format", format);
    if (style && String(style).trim())
      form.append("style", String(style).trim());

    const cacheKey = stableHash({
      src: usedFileUrl
        ? form.get("file_url") || "url"
        : crypto
            .createHash("sha1")
            .update(srcBuffer || "")
            .digest("hex"),
      voiceId: resolvedVoiceId,
      rate,
      pitch: murfPitch,
      format: format || "MP3",
      style: style || "",
    });
    const outDir = path.join(process.cwd(), "public", "audio");
    await ensureDir(outDir);
    const outExt = format === "WAV" ? "wav" : "mp3";
    const outPath = path.join(outDir, `${cacheKey}.${outExt}`);
    const relOut = `/audio/${cacheKey}.${outExt}`;
    try {
      await fs.promises.access(outPath, fs.constants.R_OK);
      return res.json({ audioUrl: relOut });
    } catch {}

    const resp = await murfFetch("/voice-changer/convert", {
      method: "POST",
      body: form,
    });
    const result = await resp.json();
    const remoteUrl = result.audio_file;
    if (!remoteUrl) {
      return res.status(502).json({
        error: "Murf did not return 'audio_file' URL",
        details: result,
      });
    }

    const r = await fetch(remoteUrl);
    if (!r.ok)
      return res
        .status(502)
        .json({ error: `Failed to fetch processed audio (${r.status})` });

    await pipeline(r.body, createWriteStream(outPath));

    res.json({ audioUrl: relOut });
  } catch (e) {
    console.error("[/api/tts/murf/voice-change] error:", e);
    res.status(500).json({ error: e.message || "Voice change error" });
  }
});

export default router;
