import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const {
  GMAIL_USER,
  GMAIL_APP_PASSWORD,
} = process.env;

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  throw new Error("Missing Gmail environment variables");
}

export const mailer = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
  family: 4, // Force IPv4
  logger: true,
  debug: true,
  // Increase timeouts to handle slow cloud network connections
  connectionTimeout: 60000, // 60s
  greetingTimeout: 30000,   // 30s
  socketTimeout: 60000,     // 60s
} as SMTPTransport.Options);

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
