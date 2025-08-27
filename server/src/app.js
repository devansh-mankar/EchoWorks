import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import dotenv from "dotenv";
import errorMiddleware from "./middlewares/error.middleware.js";

dotenv.config();
const app = express();

// CORS MUST COME BEFORE HELMET
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
// Express 5: use (.*), not '*'

// Configure Helmet AFTER CORS with cross-origin settings
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/auth", (req, res, next) => {
  console.log("AUTH DEBUG →", req.method, req.originalUrl);
  console.log("  content-type:", req.headers["content-type"]);
  // body will be {} here unless express.json() already ran (it does in your code)
  console.log("  body:", req.body);
  next();
});

app.use("/api/auth", authRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

app.use(errorMiddleware);
export default app;
