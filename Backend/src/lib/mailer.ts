import Mailjet from "node-mailjet";

const {
  MJ_APIKEY_PUBLIC,
  MJ_APIKEY_PRIVATE,
  MJ_SENDER_EMAIL,
} = process.env;

if (!MJ_APIKEY_PUBLIC || !MJ_APIKEY_PRIVATE || !MJ_SENDER_EMAIL) {
  console.warn("Missing Mailjet environment variables");
}

const mailjet = new Mailjet({
  apiKey: MJ_APIKEY_PUBLIC,
  apiSecret: MJ_APIKEY_PRIVATE
});

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
    const request = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: MJ_SENDER_EMAIL,
            Name: "Edyx Auth",
          },
          To: [
            {
              Email: to,
            },
          ],
          Subject: "Your Edyx Login Code",
          HTMLPart: html,
        },
      ],
    });

    console.log("Email sent successfully via Mailjet:", request.body);
  } catch (err: any) {
    console.error("Mailjet API Error:", err.statusCode, err.toString());
    throw new Error("Failed to send email via Mailjet");
  }
}
