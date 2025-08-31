import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { generateTokens } from "../utils/tokenUtils.js";
import { AppError } from "../middlewares/error.middleware.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {
  async createUser(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) throw new AppError("Email already registered", 400);

    const user = await User.create(userData);
    return user;
  }

  async authenticateUser(email, password) {
    if (!email || !password)
      throw new AppError("Email and password are required", 400);

    const user = await User.findOne({ email }).select("+password");
    if (!user) throw new AppError("Invalid email or password", 401);

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect)
      throw new AppError("Invalid email or password", 401);

    return user;
  }

  async googleAuth(googleToken) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const { sub: googleId, email, name, picture } = payload;

      let user = await User.findOne({ $or: [{ googleId }, { email }] });

      if (!user) {
        user = await User.create({
          googleId,
          email,
          name,
          avatar: picture,
          isEmailVerified: true,
        });
      } else if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = user.avatar || picture;
        user.isEmailVerified = true;
        await user.save();
      }

      return user;
    } catch {
      throw new AppError("Google authentication failed", 401);
    }
  }

  async refreshTokens(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const userId = decoded.id || decoded.userId;
      const user = await User.findOne({ _id: userId, refreshToken });
      if (!user) throw new AppError("Invalid refresh token", 401);

      const { accessToken, refreshToken: newRefreshToken } = generateTokens(
        user._id
      );

      user.refreshToken = newRefreshToken;
      await user.save();

      return { accessToken, newRefreshToken };
    } catch {
      throw new AppError("Invalid refresh token", 401);
    }
  }
}

export default new AuthService();
