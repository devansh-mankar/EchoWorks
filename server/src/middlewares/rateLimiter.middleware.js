// src/middlewares/rateLimiter.middleware.js
import rateLimit from "express-rate-limit";
import { AppError } from "./error.middleware.js";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  handler: (req, res) => {
    throw new AppError("Too many requests, please try again later.", 429);
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: "Too many authentication attempts, please try again later.",
  handler: (req, res) => {
    throw new AppError(
      "Too many authentication attempts, please try again later.",
      429
    );
  },
});

// COMPLETELY REMOVE keyGenerator from murfLimiter
const murfLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  // NO keyGenerator property at all
  message: "Too many voice generation requests, please slow down.",
  handler: (req, res) => {
    throw new AppError(
      "Too many voice generation requests, please try again in a minute.",
      429
    );
  },
});

export { apiLimiter, authLimiter, murfLimiter };
