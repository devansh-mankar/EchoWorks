import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export function stableHash(obj) {
  return crypto.createHash("sha1").update(JSON.stringify(obj)).digest("hex");
}

export async function checkCachedAudio(relName) {
  const full = path.join(process.cwd(), "public", relName.replace(/^\/+/, ""));
  try {
    await fs.promises.access(full, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}
