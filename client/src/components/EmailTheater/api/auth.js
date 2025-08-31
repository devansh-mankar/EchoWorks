export async function refreshAccessToken() {
  const r = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  let payload = null;
  try {
    payload = await r.json();
  } catch {}
  if (!r.ok || !payload?.accessToken) {
    throw new Error(payload?.error || "Refresh failed");
  }
  localStorage.setItem("accessToken", payload.accessToken);
  return payload.accessToken;
}
