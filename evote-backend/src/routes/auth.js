import express from 'express';
import prisma from '../config/database.js';
import { sendOtpEmail } from '../config/email.js';

const router = express.Router();

// Generates a random 6-digit OTP
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

// ── POST /api/auth/request-otp ───────────────────────────────
// Step 1 of login. Student submits matric number + email.
// System checks eligible_voters, then sends OTP if valid.
router.post('/request-otp', async (req, res) => {
  const { matricNo, email } = req.body;

  if (!matricNo || !email) {
    return res.status(400).json({ message: 'Matric number and email are required.' });
  }

  // Check if student exists in the uploaded eligible voters list
  const student = await prisma.eligibleVoter.findUnique({
    where: { matricNo },
  });

  if (!student) {
    return res.status(404).json({ message: 'Student not found. Contact the electoral commission.' });
  }

  // Check if email matches what the commission uploaded
  if (student.email.toLowerCase() !== email.toLowerCase()) {
    return res.status(401).json({ message: 'Email does not match our records.' });
  }

  // Check if student account is active
  if (student.status !== 'active') {
    return res.status(403).json({ message: 'Your student account is not active.' });
  }

  // Invalidate any previous unused OTPs for this student
  await prisma.otpToken.updateMany({
    where: { matricNo, used: false },
    data: { used: true },
  });

  // Generate new OTP and store it — expires in 10 minutes
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otpToken.create({
    data: { matricNo, token: otp, expiresAt },
  });

  // Send OTP email
  await sendOtpEmail(student.email, student.fullName, otp);

  return res.status(200).json({ message: 'Verification code sent to your email.' });
});

// ── POST /api/auth/verify-otp ────────────────────────────────
// Step 2 of login. Student submits the OTP they received.
// System verifies it, creates a session, returns student profile.
router.post('/verify-otp', async (req, res) => {
  const { matricNo, otp } = req.body;

  if (!matricNo || !otp) {
    return res.status(400).json({ message: 'Matric number and OTP are required.' });
  }

  // Find the most recent unused OTP for this student
  const otpRecord = await prisma.otpToken.findFirst({
    where: {
      matricNo,
      used: false,
      expiresAt: { gt: new Date() }, // not expired
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!otpRecord) {
    return res.status(401).json({ message: 'No valid verification code found. Please request a new one.' });
  }

  if (otpRecord.token !== otp) {
    return res.status(401).json({ message: 'Incorrect verification code.' });
  }

  // Mark OTP as used so it cannot be reused
  await prisma.otpToken.update({
    where: { id: otpRecord.id },
    data: { used: true },
  });

  // Fetch full student profile
  const student = await prisma.eligibleVoter.findUnique({
    where: { matricNo },
  });

  // Store verified student in session
  req.session.student = {
    matricNo: student.matricNo,
    fullName: student.fullName,
    email: student.email,
    faculty: student.faculty,
    department: student.department,
    level: student.level,
  };

  // Update activeSessionId in database to prevent multiple concurrent logins
  await prisma.eligibleVoter.update({
    where: { matricNo },
    data: { activeSessionId: req.sessionID },
  });

  return res.status(200).json({
    message: 'Login successful.',
    student: req.session.student,
  });
});

// ── POST /api/auth/logout ────────────────────────────────────
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Logged out successfully.' });
  });
});

// ── POST /api/auth/admin-logout ───────────────────────────────
// Destroys the admin session cookie on the server
router.post('/admin-logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Admin session ended.' });
  });
});

// ── POST /api/auth/admin-login ───────────────────────────────
// Commissioner / Admin login using matric number and access code
router.post('/admin-login', async (req, res) => {
  const { matricNo, accessCode } = req.body;

  if (!matricNo || !accessCode) {
    return res.status(400).json({ message: 'Admin ID and Access Code are required.' });
  }

  const validCode = process.env.COMMISSION_CODE || 'COMMISSION2024';
  if (accessCode !== validCode) {
    return res.status(401).json({ message: 'Invalid administrative access code.' });
  }

  try {
    // Single query: find admin. If the whole table is empty, auto-seed the first one.
    let admin = await prisma.admin.findUnique({ where: { matricNo } });

    if (!admin) {
      // Use a raw count to avoid a second round trip for the common case
      const count = await prisma.admin.count();
      if (count === 0) {
        admin = await prisma.admin.create({
          data: { matricNo, fullName: 'Chief Commissioner', role: 'chief_commissioner', isActive: true },
        });
        console.log(`[admin-login] Auto-created first admin: ${matricNo}`);
      } else {
        return res.status(404).json({ message: 'Admin record not found in the database.' });
      }
    }

    if (!admin.isActive) {
      return res.status(403).json({ message: 'This admin account is currently disabled.' });
    }

    req.session.admin = { matricNo: admin.matricNo, fullName: admin.fullName, role: admin.role };

    // Explicitly save session before responding so cookie is flushed
    req.session.save((err) => {
      if (err) return res.status(500).json({ message: 'Session error.' });
      return res.status(200).json({ message: 'Commissioner login successful.', admin: req.session.admin });
    });
  } catch (err) {
    console.error('[admin-login]', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────
// Returns the currently logged-in student's or admin's profile.
router.get('/me', async (req, res) => {
  if (req.session?.student) {
    try {
      const student = await prisma.eligibleVoter.findUnique({
        where: { matricNo: req.session.student.matricNo },
        select: { activeSessionId: true, status: true },
      });
      if (!student || student.status !== 'active' || student.activeSessionId !== req.sessionID) {
        req.session.destroy();
        res.clearCookie('connect.sid');
        return res.status(401).json({ message: 'Session expired or logged in from another device.' });
      }
      return res.status(200).json({ role: 'student', user: req.session.student });
    } catch (err) {
      console.error('[auth/me] Error checking session:', err);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  }
  if (req.session?.admin) {
    return res.status(200).json({ role: 'admin', user: req.session.admin });
  }
  return res.status(401).json({ message: 'Not logged in.' });
});

export default router;