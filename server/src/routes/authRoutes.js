// routes/authRoutes.js
import { Router } from "express";
import AuthController from "../controllers/auth.controller.js";
import {
  validateSignupRequest,
  validateLoginRequest,
} from "../middlewares/validation.middleware.js";

const router = Router();

// keep endpoints consistent with frontend: /auth/signup, /auth/login
router.post("/signup", validateSignupRequest, AuthController.signup);
router.post("/login", validateLoginRequest, AuthController.login);
router.post("/google", AuthController.googleAuth);
router.post("/logout", AuthController.logout);
router.post("/refresh", AuthController.refreshToken);

// If you want /register to also work, uncomment this alias:
// router.post("/register", validateSignupRequest, AuthController.signup);

export default router;
