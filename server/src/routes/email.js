import express from "express";
import multer from "multer";
import { simpleParser } from "mailparser";
import { google } from "googleapis";
import OpenAI from "openai";
import protect from "../middlewares/auth.middleware.js";
import jwt from "jsonwebtoken";

const router = express.Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

//  Gmail OAuth helpers

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT
  );
}

// Memory token store -> replace with DB in production
const gmailTokensByUser = new Map();

function getAppUserId(req) {
  // 1) if protect() has already populated req.user
  if (req.user?.id || req.user?._id) return String(req.user.id || req.user._id);

  // 2) dev fallback
  if (req.headers["x-user-id"]) return String(req.headers["x-user-id"]);

  // 3)  Authorization: Bearer <jwt> (frontend sends this for public routes)
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) {
    try {
      const token = auth.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return String(decoded.id || decoded.userId);
    } catch {}
  }

  // 4) optionally look at an accessToken cookie (if you set one)
  if (req.cookies?.accessToken) {
    try {
      const decoded = jwt.verify(
        req.cookies.accessToken,
        process.env.JWT_SECRET
      );
      return String(decoded.id || decoded.userId);
    } catch {}
  }

  return null;
}

function getGmailForAppUser(appUserId) {
  const tokens = gmailTokensByUser.get(appUserId);
  if (!tokens) return null;
  const oauth2 = getOAuthClient();
  oauth2.setCredentials(tokens);
  return google.gmail({ version: "v1", auth: oauth2 });
}

// email parts

function decodeB64Url(str = "") {
  return Buffer.from(
    String(str).replace(/-/g, "+").replace(/_/g, "/"),
    "base64"
  ).toString("utf8");
}

function collectParts(part, bag = { text: "", html: "", attachments: [] }) {
  if (!part) return bag;
  const mime = part.mimeType || part.mime_type;
  const body = part.body || {};
  const headers = part.headers || [];
  const findH = (name) =>
    headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value;

  if (mime === "text/plain" && body.data) bag.text += decodeB64Url(body.data);
  else if (mime === "text/html" && body.data)
    bag.html += decodeB64Url(body.data);
  else if (body.attachmentId) {
    const contentId =
      findH("Content-ID") || findH("Content-Id") || findH("X-Attachment-Id");
    bag.attachments.push({
      attachmentId: body.attachmentId,
      size: body.size,
      mimeType: mime,
      contentId: contentId ? contentId.replace(/[<>]/g, "") : null,
      filename: part.filename || "",
    });
  }

  (part.parts || []).forEach((p) => collectParts(p, bag));
  return bag;
}

async function inlineCidImages(gmail, messageId, bag) {
  if (!bag.html || !bag.attachments?.length) return bag.html;
  const cidMap = {};
  for (const att of bag.attachments) {
    if (!att.contentId) continue;
    try {
      const resp = await gmail.users.messages.attachments.get({
        userId: "me",
        messageId,
        id: att.attachmentId,
      });
      const dataB64 = resp.data.data || "";
      const bin = Buffer.from(dataB64, "base64");
      cidMap[att.contentId] = `data:${
        att.mimeType || "application/octet-stream"
      };base64,${bin.toString("base64")}`;
    } catch (e) {
      console.warn("cid fetch failed:", e?.message || e);
    }
  }
  if (!Object.keys(cidMap).length) return bag.html;
  return bag.html.replace(/src=["']cid:([^"']+)["']/gi, (m, cid) => {
    const repl = cidMap[cid] || cidMap[cid.replace(/[<>]/g, "")];
    return repl ? `src="${repl}"` : m;
  });
}

//  Gmail OAuth endpoints

router.get("/gmail/oauth2callback", async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code) return res.status(400).send("Missing code");

    let uidFromState = null;
    try {
      if (state) {
        const parsed = JSON.parse(decodeURIComponent(String(state)));
        uidFromState = parsed?.uid || null;
      }
    } catch {
      uidFromState = null;
    }
    if (!uidFromState) return res.status(400).send("Missing user state");

    const oauth2 = getOAuthClient();
    const { tokens } = await oauth2.getToken(code);
    gmailTokensByUser.set(String(uidFromState), tokens);

    const web = process.env.WEB_ORIGIN || "http://localhost:5173";
    return res.redirect(`${web}/email-theater?gmail=connected`);
  } catch (e) {
    console.error("OAuth callback error:", e);
    return res.status(500).send("OAuth error");
  }
});

// Public: start OAuth
router.get("/gmail/auth-url", async (req, res) => {
  try {
    const appUserId = getAppUserId(req) || req.query.userId;
    if (!appUserId) return res.status(401).json({ error: "Login required" });

    const oauth2 = getOAuthClient();
    const url = oauth2.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "openid",
      ],
      prompt: "consent",
      state: encodeURIComponent(JSON.stringify({ uid: String(appUserId) })),
    });
    return res.json({ url });
  } catch (e) {
    return res
      .status(500)
      .json({ error: e.message || "Failed to create auth url" });
  }
});

router.use(protect);

router.get("/gmail/status", async (req, res) => {
  try {
    const appUserId = getAppUserId(req);
    if (!appUserId) return res.status(401).json({ error: "Login required" });

    const tokens = gmailTokensByUser.get(String(appUserId));
    if (!tokens) return res.json({ connected: false });

    const oauth2 = getOAuthClient();
    oauth2.setCredentials(tokens);
    const gmail = google.gmail({ version: "v1", auth: oauth2 });

    try {
      const prof = await gmail.users.getProfile({ userId: "me" });
      return res.json({
        connected: true,
        email: prof.data.emailAddress || null,
      });
    } catch {
      gmailTokensByUser.delete(String(appUserId));
      return res.json({ connected: false });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message || "Status error" });
  }
});

// Disconnect
router.post("/gmail/disconnect", async (req, res) => {
  try {
    const appUserId = getAppUserId(req);
    if (!appUserId) return res.status(401).json({ error: "Login required" });
    const tokens = gmailTokensByUser.get(String(appUserId));
    if (tokens) {
      const oauth2 = getOAuthClient();
      oauth2.setCredentials(tokens);
      const toRevoke = tokens.refresh_token || tokens.access_token;
      if (toRevoke) {
        try {
          await oauth2.revokeToken(toRevoke);
        } catch {}
      }
      gmailTokensByUser.delete(String(appUserId));
    }
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Disconnect failed" });
  }
});

//  Fast paged list + hydrate (protected)

function buildQuery(category, days) {
  const since = new Date();
  since.setDate(since.getDate() - (Number(days) || 30));
  const y = since.getFullYear();
  const m = String(since.getMonth() + 1).padStart(2, "0");
  const d = String(since.getDate()).padStart(2, "0");
  const after = `${y}/${m}/${d}`;
  if (category === "spam") return `in:spam after:${after}`;
  const base = `after:${after} -in:trash`;
  switch (category) {
    case "social":
      return `${base} category:social`;
    case "updates":
      return `${base} category:updates`;
    case "promotions":
      return `${base} category:promotions`;
    case "primary":
    default:
      return `${base} -category:social -category:updates -category:promotions -in:spam`;
  }
}

router.get("/list-fast", async (req, res) => {
  try {
    const appUserId = getAppUserId(req);
    if (!appUserId) return res.status(401).json({ error: "Login required" });

    const gmail = getGmailForAppUser(String(appUserId));
    if (!gmail) return res.status(401).json({ error: "Gmail not connected" });

    const limit = Math.min(parseInt(req.query.limit || "50", 10), 100);
    const pageToken = req.query.pageToken || undefined;
    const category = String(req.query.category || "primary");
    const days = parseInt(req.query.days || "30", 10);

    const q = buildQuery(category, days);

    const list = await gmail.users.messages.list({
      userId: "me",
      maxResults: limit,
      pageToken,
      q,
      includeSpamTrash: category === "spam",
    });

    const ids = (list.data.messages || []).map((m) => m.id);
    const emails = [];
    for (const id of ids) {
      try {
        const full = await gmail.users.messages.get({
          userId: "me",
          id,
          format: "metadata",
          metadataHeaders: ["From", "Subject", "Date"],
        });
        const payload = full.data.payload || {};
        const headers = payload.headers || [];
        const getH = (name) =>
          headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())
            ?.value || "";
        emails.push({
          id,
          from: getH("From"),
          subject: getH("Subject"),
          date: getH("Date"),
          labelIds: full.data.labelIds || [],
          snippet: (full.data.snippet || "").trim(),
        });
      } catch (e) {
        console.warn("metadata fetch failed:", id, e?.message || e);
      }
    }

    return res.json({
      emails,
      nextPageToken: list.data.nextPageToken || null,
      estimate:
        typeof list.data.resultSizeEstimate === "number"
          ? list.data.resultSizeEstimate
          : null,
    });
  } catch (e) {
    console.error("list-fast error:", e);
    return res
      .status(500)
      .json({ error: e.message || "Failed to fetch inbox" });
  }
});

router.get("/message/:id", async (req, res) => {
  try {
    const appUserId = getAppUserId(req);
    if (!appUserId) return res.status(401).json({ error: "Login required" });

    const gmail = getGmailForAppUser(String(appUserId));
    if (!gmail) return res.status(401).json({ error: "Gmail not connected" });

    const id = req.params.id;
    const full = await gmail.users.messages.get({
      userId: "me",
      id,
      format: "full",
    });

    const payload = full.data.payload || {};
    const bag = collectParts(payload, { text: "", html: "", attachments: [] });
    const htmlPatched = await inlineCidImages(gmail, id, bag);

    return res.json({
      id,
      text: (bag.text || "").trim(),
      html: (htmlPatched || "").trim(),
    });
  } catch (e) {
    console.error("message hydrate error:", e);
    return res
      .status(500)
      .json({ error: e.message || "Failed to load message" });
  }
});

//  .eml upload passthrough

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Missing file" });
    const parsed = await simpleParser(req.file.buffer);
    const email = {
      id: "eml-" + Date.now(),
      from: parsed.from?.text || "unknown@sender",
      subject: parsed.subject || "(no subject)",
      text: parsed.text || "",
      html: parsed.html || "",
      date: parsed.date?.toISOString?.() || new Date().toISOString(),
      labelIds: [],
    };
    return res.json({ email });
  } catch (e) {
    console.error("Upload error:", e);
    return res.status(500).json({ error: e.message || "Failed to parse .eml" });
  }
});

//  Summarization (protected)

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const EMAIL_SUMMARY_SYSTEM = `You summarize emails for audio. Keep it concise but not too short (120–220 words), neutral and clear.
Return ONLY this structure:

TITLE: <short, factual title>
SUMMARY:
- What it's about (one or two sentences)
- Who it's from (sender or organization)
- Key details (3–5 bullets)
ACTIONS:
- What I need to do next (if anything)
DEADLINES:
- Dates / times / windows (if present; else "None mentioned")
LINKS:
- Up to 2 important links with labels, from the email (omit if none)
TONE: <1-3 words>
`;

router.post("/generate", async (req, res) => {
  try {
    const { email, settings } = req.body;
    if (!email?.text && !email?.html)
      return res.status(400).json({ error: "Missing email text/html" });

    const baseText =
      email.text && email.text.trim()
        ? email.text
        : String(email.html || "")
            .replace(/<style[\s\S]*?<\/style>/gi, "")
            .replace(/<script[\s\S]*?<\/script>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();

    const userPrompt = `
From: ${email.from}
Subject: ${email.subject}

Body (truncated if very long):
"""${baseText.slice(0, 12000)}"""

Preferences:
- Recording style: ${settings?.stylePreset || "focused"}
- Drama level (1–10): ${settings?.drama ?? 6}
- Per-sender voices map present: ${settings?.voiceMap ? "Yes" : "No"}
- Target language: ${settings?.lang || "en-US"}
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: EMAIL_SUMMARY_SYSTEM },
        { role: "user", content: userPrompt },
      ],
    });

    const script = completion.choices?.[0]?.message?.content?.trim();
    if (!script) return res.status(500).json({ error: "No summary generated" });

    return res.json({ script });
  } catch (e) {
    console.error("OpenAI error:", e);
    return res.status(500).json({ error: e.message || "OpenAI error" });
  }
});

export default router;
