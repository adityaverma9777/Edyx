import crypto from "crypto";

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export function verifyOtp(otp: string, hash: string): boolean {
  return hashOtp(otp) === hash;
}

export function otpExpiry(): number {
  return Math.floor(Date.now() / 1000) + 5 * 60; // 5 minutes
}
