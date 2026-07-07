import dotenv from 'dotenv';
dotenv.config();

/**
 * Sends an OTP email to a student using Brevo's HTTP API.
 * @param {string} to          - Student's email address
 * @param {string} studentName - Student's full name for personalisation
 * @param {string} otp         - The 6-digit code
 */
export const sendOtpEmail = async (to, studentName, otp) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'olisrab@gmail.com';
  const schoolName = process.env.SCHOOL_NAME || 'University Portal';

  if (!apiKey) {
    throw new Error('BREVO_API_KEY environment variable is not defined.');
  }

  // Safe check to see what Render is actually loading
  console.log(`[Brevo Debug] API Key length: ${apiKey.length}, Prefix: ${apiKey.substring(0, 10)}...`);

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: {
        name: schoolName,
        email: senderEmail
      },
      to: [
        {
          email: to,
          name: studentName
        }
      ],
      subject: `Your ${schoolName} Voting Verification Code`,
      htmlContent: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #1a1a1a;">Voting Verification Code</h2>
          <p>Hello ${studentName},</p>
          <p>Your verification code for the <strong>${schoolName}</strong> student election portal is:</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4f46e5; padding: 24px; background: #f5f3ff; border-radius: 8px; text-align: center; margin: 24px 0;">
            ${otp}
          </div>
          <p>This code expires in <strong>10 minutes</strong>.</p>
          <p>If you did not request this, ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 12px;">${schoolName} — Secure Electronic Voting Platform</p>
        </div>
      `
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Brevo API returned status ${response.status}`);
  }
};