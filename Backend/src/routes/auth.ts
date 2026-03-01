import { Router } from "express";
import { supabase } from "../lib/supabase";
import { generateOtp, hashOtp, verifyOtp, otpExpiry } from "../lib/otp";
import { sendOtpEmail } from "../lib/mailer";
import jwt from "jsonwebtoken";
import { auth as firebaseAuth } from "../lib/firebase";

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

//verify Google login
router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: "Missing ID token" });
    }

    // Verify token with Firebase
    const decodedToken = await firebaseAuth.verifyIdToken(idToken);
    const email = decodedToken.email;

    if (!email) {
      return res.status(400).json({ error: "Email not found in Google account" });
    }

    // Explicitly copy the exact block from OTP login
    const { data: user, error: userError } = await supabase
      .from("users")
      .upsert({ email }, { onConflict: "email" })
      .select()
      .single();

    if (userError || !user) {
      console.error("User upsert error via Google auth:", userError, "User object:", user);
      return res.status(500).json({ error: "Failed to create user from Google Auth", details: userError });
    }

    // Issue same JWT as OTP flow
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
    console.error("Google verify token error:", err);
    return res.status(401).json({ error: "Invalid Google token" });
  }
});

// debug route for testing upsert from curl
router.get("/test-upsert", async (req, res) => {
  const email = "test-agent-upsert-123@gmail.com";
  const { data: user, error: userError } = await supabase
    .from("users")
    .upsert({ email }, { onConflict: "email" })
    .select()
    .single();

  if (userError || !user) {
    return res.status(500).json({ error: "Failed", details: userError });
  }
  return res.json({ success: true, user });
});

export default router;
