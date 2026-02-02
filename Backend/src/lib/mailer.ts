import nodemailer from "nodemailer";

const {
  GMAIL_USER,
  GMAIL_APP_PASSWORD,
} = process.env;

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  throw new Error("Missing Gmail environment variables");
}

export const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

export async function sendOtpEmail(
  to: string,
  otp: string
) {
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

  await mailer.sendMail({
    from: `"Edyx" <${GMAIL_USER}>`,
    to,
    subject: "Your Edyx Login Code",
    html,
  });
}
