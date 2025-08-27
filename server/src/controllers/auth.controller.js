// controllers/auth.controller.js
import authService from "../services/auth.service.js";
import User from "../models/user.model.js";
import { generateTokens } from "../utils/tokenUtils.js";

class AuthController {
  // POST /api/auth/signup
  async signup(req, res, next) {
    try {
      const { name, email, password, phone } = req.body;

      const user = await authService.createUser({
        name,
        email,
        password,
        phone,
      });
      const { accessToken, refreshToken } = generateTokens(user._id);

      // store refresh token in DB
      await User.findByIdAndUpdate(
        user._id,
        { refreshToken },
        { new: false, validateBeforeSave: false }
      );

      // set refresh cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const safeUser = await User.findById(user._id).select("-password");

      res.status(201).json({
        success: true,
        message: "Account created",
        user: {
          id: safeUser._id,
          name: safeUser.name,
          email: safeUser.email,
          phone: safeUser.phone,
          murfApiUsage: safeUser.murfApiUsage,
        },
        accessToken,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/auth/login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await authService.authenticateUser(email, password);
      const { accessToken, refreshToken } = generateTokens(user._id);

      await User.findByIdAndUpdate(
        user._id,
        { refreshToken },
        { new: false, validateBeforeSave: false }
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const safeUser = await User.findById(user._id).select("-password");

      res.json({
        success: true,
        message: "Logged in",
        user: {
          id: safeUser._id,
          name: safeUser.name,
          email: safeUser.email,
          phone: safeUser.phone,
          murfApiUsage: safeUser.murfApiUsage,
        },
        accessToken,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/auth/google
  async googleAuth(req, res, next) {
    try {
      const { googleToken } = req.body;
      const user = await authService.googleAuth(googleToken);

      const { accessToken, refreshToken } = generateTokens(user._id);

      await User.findByIdAndUpdate(
        user._id,
        { refreshToken },
        { new: false, validateBeforeSave: false }
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const safeUser = await User.findById(user._id).select("-password");

      res.json({
        success: true,
        message: "Google auth successful",
        user: {
          id: safeUser._id,
          name: safeUser.name,
          email: safeUser.email,
          phone: safeUser.phone,
          murfApiUsage: safeUser.murfApiUsage,
        },
        accessToken,
      });
    } catch (err) {
      next(err);
    }
  }

  // ✅ POST /api/auth/logout  (SERVER-SIDE — NO localStorage / setUser HERE)
  async logout(req, res, next) {
    try {
      const token = req.cookies?.refreshToken;

      if (token) {
        // find user with this refresh token and clear it
        await User.findOneAndUpdate(
          { refreshToken: token },
          { $unset: { refreshToken: 1 } },
          { new: false }
        );
      }

      // always clear cookie
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res.json({ success: true, message: "Logged out" });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/auth/refresh
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        return res.status(401).json({ error: "Refresh token not provided" });
      }

      const { accessToken, newRefreshToken } = await authService.refreshTokens(
        refreshToken
      );

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ success: true, accessToken });
    } catch (err) {
      next(err);
    }
  }
}

export default new AuthController();
