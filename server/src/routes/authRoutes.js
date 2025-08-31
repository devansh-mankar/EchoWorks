import { Router } from "express";
import AuthController from "../controllers/auth.controller.js";
import {
  validateSignupRequest,
  validateLoginRequest,
} from "../middlewares/validation.middleware.js";
import protect from "../middlewares/auth.middleware.js";

const router = Router();

// Public
router.post("/signup", validateSignupRequest, AuthController.signup);
router.post("/login", validateLoginRequest, AuthController.login);

router.post("/refresh", AuthController.refreshToken);

// Authed
router.get("/me", protect, AuthController.me);
router.post("/logout", protect, AuthController.logout);

export default router;
