import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// ── Create a reusable transporter ─────────────────────────────
// Reads SMTP credentials from environment variables.
// Works with Gmail, Outlook, Yahoo, your own SMTP server, or any provider.
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 5000, // 5 seconds connection timeout
  greetingTimeout: 5000,   // 5 seconds greeting timeout
  socketTimeout: 5000,     // 5 seconds socket inactivity timeout
});

/**
 * Sends an OTP email to a student.
 * @param {string} to          - Student's email address
 * @param {string} studentName - Student's full name for personalisation
 * @param {string} otp         - The 6-digit code
 */
export const sendOtpEmail = async (to, studentName, otp) => {
  await transporter.sendMail({
    from: `"${process.env.SCHOOL_NAME}" <${process.env.SMTP_USER}>`,
    to,
    subject: `Your ${process.env.SCHOOL_NAME} Voting Verification Code`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Voting Verification Code</h2>
        <p>Hello ${studentName},</p>
        <p>Your verification code for the <strong>${process.env.SCHOOL_NAME}</strong> student election portal is:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4f46e5; padding: 24px; background: #f5f3ff; border-radius: 8px; text-align: center; margin: 24px 0;">
          ${otp}
        </div>
        <p>This code expires in <strong>10 minutes</strong>.</p>
        <p>If you did not request this, ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #6b7280; font-size: 12px;">${process.env.SCHOOL_NAME} — Secure Electronic Voting Platform</p>
      </div>
    `,
  });
};