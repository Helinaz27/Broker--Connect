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

// NEW: Send KYC Approval Email
export async function sendKycApprovalEmail(to, firstName) {
  const mailer = getTransporter();

  await mailer.sendMail({
    from: `"Digital Broker" <${env.emailUser}>`,
    to,
    subject: "🎉 Congratulations! Your KYC Verification is Approved",
    text: `Hi ${firstName},\n\nCongratulations! Your KYC (Know Your Customer) verification has been successfully approved! 🎉\n\nWhat you can do now:\n- Access all premium features\n- Increase your transaction limits\n- Enjoy full platform benefits\n- Withdraw and deposit with higher limits\n\nThank you for completing your verification.\n\nBest regards,\nDigital Broker Team`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✅ KYC Verified!</h1>
        </div>
        
        <div style="background: white; padding: 30px 25px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Dear <strong>${firstName}</strong>,
          </p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            We are delighted to inform you that your KYC (Know Your Customer) verification has been 
            <strong style="color: #10b981;">successfully approved</strong>! 🎉
          </p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
            <p style="margin: 0 0 10px 0; color: #065f46; font-weight: bold; font-size: 16px;">
              ✨ What you can do now:
            </p>
            <ul style="margin: 0; padding-left: 20px; color: #065f46;">
              <li style="margin: 8px 0;">Access all premium features</li>
              <li style="margin: 8px 0;">Increase your transaction limits</li>
              <li style="margin: 8px 0;">Enjoy full platform benefits</li>
              <li style="margin: 8px 0;">Withdraw and deposit with higher limits</li>
            </ul>
          </div>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Thank you for completing your verification and being a valued member of the Digital Broker community.
          </p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${process.env.APP_URL || 'https://digitalbroker.com'}/dashboard" 
               style="background-color: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0 20px 0;">
          
          <p style="font-size: 13px; color: #6b7280; text-align: center; margin: 0;">
            If you have any questions, please contact our support team.<br>
            © ${new Date().getFullYear()} Digital Broker. All rights reserved.
          </p>
        </div>
      </div>
    `,
  });
}

// NEW: Send KYC Rejection Email (Optional)
export async function sendKycRejectionEmail(to, firstName, reason = null) {
  const mailer = getTransporter();

  await mailer.sendMail({
    from: `"Digital Broker" <${env.emailUser}>`,
    to,
    subject: "KYC Verification Update - Action Required",
    text: `Hi ${firstName},\n\nWe regret to inform you that your KYC verification could not be approved at this time.\n${reason ? `\nReason: ${reason}\n` : ''}\nPlease review your information and resubmit your KYC documents. Our support team is available to assist you.\n\nBest regards,\nDigital Broker Team`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">KYC Update</h1>
        </div>
        
        <div style="background: white; padding: 30px 25px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Dear <strong>${firstName}</strong>,
          </p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            We regret to inform you that your KYC verification could not be approved at this time.
          </p>
          
          ${reason ? `
          <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p style="margin: 0; color: #991b1b;"><strong>Reason:</strong> ${reason}</p>
          </div>
          ` : ''}
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Please review the information provided and resubmit your KYC documents. Our support team is available to assist you.
          </p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${process.env.APP_URL || 'https://digitalbroker.com'}/kyc" 
               style="background-color: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Resubmit KYC
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0 20px 0;">
          
          <p style="font-size: 13px; color: #6b7280; text-align: center; margin: 0;">
            Need help? Contact our support team.<br>
            © ${new Date().getFullYear()} Digital Broker. All rights reserved.
          </p>
        </div>
      </div>
    `,
  });
}