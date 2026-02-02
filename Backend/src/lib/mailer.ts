import { Resend } from "resend";

const { RESEND_API_KEY } = process.env;

if (!RESEND_API_KEY) {
  // Warn but don't crash dev environment if missing, but throw in prod if needed
  console.warn("Missing RESEND_API_KEY environment variable");
}

export const resend = new Resend(RESEND_API_KEY);

export async function sendOtpEmail(to: string, otp: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Edyx Verification Code</h2>
      <p>Your one-time verification code is:</p>
      <h1 style="letter-spacing: 4px;">${otp}</h1>
      <p>This code will expire in 5 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
      <hr />
      <p style="font-size: 12px; color: #777;">
        © ${new Date().getFullYear()} Edyx. All rights reserved.
      </p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev", // Default test domain allowed for sending to the account owner's email
      to: [to],
      subject: "Your Edyx Login Code",
      html: html,
    });

    if (error) {
      console.error("Resend API Error:", error);
      throw new Error("Failed to send email via Resend");
    }

    console.log("Email sent successfully via Resend:", data?.id);
  } catch (err) {
    console.error("Send Email Exceptions:", err);
    throw err;
  }
}
