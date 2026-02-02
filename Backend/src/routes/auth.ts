import { Router } from "express";
import { supabase } from "../lib/supabase";
import { generateOtp, hashOtp, verifyOtp, otpExpiry } from "../lib/otp";
import { sendOtpEmail } from "../lib/mailer";
import jwt from "jsonwebtoken";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET missing");
}

function now(): number {
  return Math.floor(Date.now() / 1000);
}

//request otp
router.post("/request-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Invalid email" });
    }

    const { data: existing, error: fetchError } = await supabase
      .from("otp_codes")
      .select("expires_at")
      .eq("email", email)
      .limit(1);

    if (fetchError) {
      console.error("OTP fetch error:", fetchError);
      return res.status(500).json({ error: "Database error" });
    }

    if (
      existing &&
      existing.length > 0 &&
      existing[0].expires_at - now() > 240
    ) {
      return res.status(429).json({
        error: "Please wait before requesting another OTP",
      });
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);

    const { error: insertError } = await supabase
      .from("otp_codes")
      .upsert(
        {
          email,
          otp_hash: otpHash,
          expires_at: otpExpiry(),
        },
        { onConflict: "email" }
      );

    if (insertError) {
      console.error("OTP insert failed:", insertError);
      return res.status(500).json({ error: "Failed to store OTP" });
    }

    await sendOtpEmail(email, otp);

    return res.json({ success: true });
  } catch (err) {
    console.error("Request OTP error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//verify otp
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const { data: records, error } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("email", email)
      .limit(1);

    if (error) {
      console.error("OTP fetch error:", error);
      return res.status(500).json({ error: "Database error" });
    }

    if (!records || records.length === 0) {
      return res.status(400).json({ error: "OTP not found" });
    }

    const record = records[0];

    if (record.expires_at < now()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    if (!verifyOtp(otp, record.otp_hash)) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .upsert({ email }, { onConflict: "email" })
      .select()
      .single();

    if (userError || !user) {
      console.error("User upsert error:", userError);
      return res.status(500).json({ error: "Failed to create user" });
    }

    await supabase.from("otp_codes").delete().eq("email", email);

    const token = jwt.sign(
      { user_id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
