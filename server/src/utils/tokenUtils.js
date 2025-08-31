import jwt from "jsonwebtoken";

// Short-lived access token
export function signAccess(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });
}

// Long-lived refresh token
export function signRefresh(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });
}

// Legacy helper kept for compatibility
export function generateTokens(userId) {
  return {
    accessToken: signAccess({ id: userId }),
    refreshToken: signRefresh({ id: userId }),
  };
}

// Set httpOnly refresh cookie
export function setRefreshCookie(res, refreshToken) {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30d
    path: "/",
  });
}

export function clearRefreshCookie(res) {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}
