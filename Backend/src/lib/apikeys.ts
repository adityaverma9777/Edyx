import crypto from "crypto";

export function generateApiKey(): string {
  return "edyx_live_" + crypto.randomUUID().replace(/-/g, "");
}

export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}