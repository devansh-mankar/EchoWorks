import authService from "../services/auth.service.js";
import User from "../models/user.model.js";
import {
  signAccess,
  signRefresh,
  setRefreshCookie,
  clearRefreshCookie,
} from "../utils/tokenUtils.js";

class AuthController {
  // POST signup
  async signup(req, res, next) {
    try {
      const { name, email, password, phone } = req.body;

      const user = await authService.createUser({
        name,
        email,
        password,
        phone,
      });

      const accessToken = signAccess({ id: user._id.toString() });
      const refreshToken = signRefresh({ id: user._id.toString() });
      setRefreshCookie(res, refreshToken);

      res.status(201).json({
        success: true,
        accessToken,
        user: { id: user._id, name: user.name, email: user.email, phone },
      });
    } catch (err) {
      next(err);
    }
  }

  // POST login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await authService.authenticateUser(email, password);
      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      const accessToken = signAccess({ id: user._id.toString() });
      const refreshToken = signRefresh({ id: user._id.toString() });
      setRefreshCookie(res, refreshToken);

      res.json({
        success: true,
        accessToken,
        user: { id: user._id, name: user.name, email: user.email },
      });
    } catch (err) {
      next(err);
    }
  }

  // POST refresh
  async refreshToken(req, res) {
    try {
      const rt = req.cookies?.refreshToken;
      if (!rt) return res.status(401).json({ error: "No refresh token" });

      const jwt = await import("jsonwebtoken");
      const decoded = jwt.default.verify(rt, process.env.JWT_REFRESH_SECRET);
      const userId = decoded.id || decoded.userId;
      if (!userId) return res.status(401).json({ error: "Invalid refresh" });

      const accessToken = signAccess({ id: userId });
      return res.json({ accessToken });
    } catch (err) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }
  }

  // POST logout
  async logout(req, res, next) {
    try {
      clearRefreshCookie(res);
      return res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  }

  // GET me
  async me(req, res, next) {
    try {
      const user = await User.findById(req.userId).lean();
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({ id: user._id, name: user.name, email: user.email });
    } catch (err) {
      next(err);
    }
  }
}

export default new AuthController();
