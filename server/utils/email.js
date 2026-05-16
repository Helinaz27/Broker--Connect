import nodemailer from "nodemailer";
import env from "./env.js";

let transporter;

function getTransporter() {
  if (!env.emailUser || !env.emailPassword) {
    throw new Error(
      "EMAIL and EMAIL_PASSWORD must be set in .env to send reset codes",
    );
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.emailUser,
        pass: env.emailPassword,
      },
    });
  }
  return transporter;
}

export async function sendPasswordResetOtpEmail(to, firstName, otp) {
  const mailer = getTransporter();

  await mailer.sendMail({
    from: `"Digital Broker" <${env.emailUser}>`,
    to,
    subject: "Your password reset code",
    text: `Hi ${firstName},\n\nYour password reset code is: ${otp}\n\nThis code expires in 15 minutes. If you did not request this, ignore this email.\n`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Password reset</h2>
        <p>Hi ${firstName},</p>
        <p>Use this verification code to reset your password:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">${otp}</p>
        <p style="color: #6b7280; font-size: 14px;">This code expires in 15 minutes.</p>
        <p style="color: #6b7280; font-size: 14px;">If you did not request a reset, you can safely ignore this email.</p>
      </div>
    `,
  });
}
