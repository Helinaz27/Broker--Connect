import nodemailer from "nodemailer";
import env from "./env.js";

let transporter;

function getTransporter() {
  if (!env.emailUser || !env.emailPassword) {
    throw new Error("EMAIL_USER and EMAIL_PASSWORD must be set in .env");
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
    from:    `"Digital Broker" <${env.emailUser}>`,
    to,
    subject: "Your password reset code",
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

export async function sendKYCApprovedEmail(to, firstName) {
  const mailer = getTransporter();
  await mailer.sendMail({
    from:    `"Digital Broker" <${env.emailUser}>`,
    to,
    subject: "Your KYC Verification is Approved!",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: #16a34a; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0;">Congratulations!</h1>
        </div>
        <div style="background: #f0fdf4; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #bbf7d0;">
          <p style="font-size: 16px; color: #111827;">Hi <strong>${firstName}</strong>,</p>
          <p style="color: #374151;">
            Your KYC verification has been <strong style="color: #16a34a;">approved</strong> successfully!
            You now have full access to all features on Digital Broker.
          </p>
          <ul style="color: #374151; line-height: 2;">
            <li>Post house, car and service listings</li>
            <li>Access contact information</li>
            <li>Send and receive messages</li>
            <li>Full platform access</li>
          </ul>
          <div style="text-align: center; margin-top: 24px;">
            <a href="${env.frontendUrl}"
               style="background: #16a34a; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              Go to Platform
            </a>
          </div>
          <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">
            Thank you for verifying your identity. This helps keep our platform safe and trusted.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendKYCRejectedEmail(to, firstName, reviewNote) {
  const mailer = getTransporter();
  await mailer.sendMail({
    from:    `"Digital Broker" <${env.emailUser}>`,
    to,
    subject: "Your KYC Verification was Rejected",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: #dc2626; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0;">KYC Verification Update</h1>
        </div>
        <div style="background: #fef2f2; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #fecaca;">
          <p style="font-size: 16px; color: #111827;">Hi <strong>${firstName}</strong>,</p>
          <p style="color: #374151;">
            Unfortunately, your KYC verification was <strong style="color: #dc2626;">rejected</strong>.
          </p>
          ${reviewNote ? `
          <div style="background: #fff; border-left: 4px solid #dc2626; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
            <p style="margin: 0; color: #374151; font-size: 14px;">
              <strong>Reason:</strong> ${reviewNote}
            </p>
          </div>
          ` : ''}
          <p style="color: #374151;">You can re-submit your KYC documents after addressing the issue above.</p>
          <div style="text-align: center; margin-top: 24px;">
            <a href="${env.frontendUrl}"
               style="background: #dc2626; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              Re-submit KYC
            </a>
          </div>
          <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">
            If you believe this is a mistake, please contact our support team.
          </p>
        </div>
      </div>
    `,
  });
}