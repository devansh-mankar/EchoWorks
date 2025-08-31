const asString = (v) => (typeof v === "string" ? v.trim() : "");

export function validateSignupRequest(req, res, next) {
  const name = asString(req.body?.name);
  const email = asString(req.body?.email);
  const password = asString(req.body?.password);

  if (!name) return res.status(400).json({ error: "Name is required" });
  if (!email) return res.status(400).json({ error: "Email is required" });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: "Invalid email" });
  if (!password || password.length < 6)
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters" });

  next();
}

export function validateLoginRequest(req, res, next) {
  const email = asString(req.body?.email);
  const password = asString(req.body?.password);

  if (!email) return res.status(400).json({ error: "Email is required" });
  if (!password) return res.status(400).json({ error: "Password is required" });

  next();
}
