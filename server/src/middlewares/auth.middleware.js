import jwt from "jsonwebtoken";

export default function protect(req, res, next) {
  try {
    let token = null;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded.id || decoded.userId;
    if (!id) return res.status(401).json({ error: "Invalid token" });

    req.userId = id;
    req.user = { id };
    return next();
  } catch (err) {
    const error =
      err?.name === "TokenExpiredError"
        ? "Access token expired"
        : "Invalid or expired token";
    return res.status(401).json({ error });
  }
}
