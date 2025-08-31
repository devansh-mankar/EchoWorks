import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import bodyParser from "body-parser";

import authRoutes from "./routes/authRoutes.js";
import wiki from "./routes/wiki.js";

import errorMiddleware from "./middlewares/error.middleware.js";
import knowledge from "./routes/knowledge.js";
import tts from "./routes/tts.js";
import ingest from "./routes/ingest.js";
import stt from "./routes/stt.js";
import voices from "./routes/voices.js";
import translateRoutes from "./routes/translate.js";
import emailRoutes from "./routes/email.js";
import path from "node:path";
import voiceChanger from "./routes/voiceChanger.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
console.log("OPENAI_API_KEY present:", !!process.env.OPENAI_API_KEY);

app.use(
  cors({
    origin(origin, cb) {
      const allow = ["http://localhost:5173", "http://127.0.0.1:5173"];
      if (!origin) return cb(null, true);
      return allow.includes(origin) ? cb(null, true) : cb(null, false);
    },
    credentials: true,
  })
);

app.use(
  "/audio",
  express.static(path.join(process.cwd(), "public", "audio"), {
    fallthrough: false,
    setHeaders(res) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("Access-Control-Allow-Origin", "*");
    },
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
  })
);

app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ extended: true, limit: "8mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/auth", (req, res, next) => {
  console.log("AUTH DEBUG →", req.method, req.originalUrl);
  console.log("  content-type:", req.headers["content-type"]);

  console.log("  body:", req.body);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/wiki", wiki);
app.use("/api/knowledge", knowledge);
app.use("/api/email", emailRoutes);

app.use("/api/tts", tts);
app.use("/api/ingest", ingest);
app.use("/api/translate", translateRoutes);
app.use("/api/stt", stt);
app.use("/api/voices", voices);
app.use("/api/tts/murf", voiceChanger);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

app.use(errorMiddleware);
export default app;
