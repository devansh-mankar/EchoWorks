export function b64ToU8(b64) {
  const fixed = b64.replace(/-/g, "+").replace(/_/g, "/");
  const pad = "=".repeat((4 - (fixed.length % 4)) % 4);
  const str = atob(fixed + pad);
  const out = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) out[i] = str.charCodeAt(i);
  return out;
}
export function longestCommonPrefix(a, b) {
  const len = Math.min(a.length, b.length);
  let i = 0;
  while (i < len && a[i] === b[i]) i++;
  return i;
}
export function decodeJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}
export function isJwtExpired(token, skew = 30) {
  const p = decodeJwt(token);
  if (!p?.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return now >= p.exp - skew;
}
