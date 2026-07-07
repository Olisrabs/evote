import prisma from '../config/database.js';

// Protects any route that requires a logged-in student.
// If the session doesn't have a verified student or if session is active elsewhere, return 401.
export const requireAuth = async (req, res, next) => {
  if (!req.session?.student) {
    return res.status(401).json({ message: 'You must be logged in to access this.' });
  }

  try {
    const student = await prisma.eligibleVoter.findUnique({
      where: { matricNo: req.session.student.matricNo },
      select: { activeSessionId: true, status: true },
    });

    if (!student || student.status !== 'active') {
      req.session.destroy();
      return res.status(401).json({ message: 'Your student account is no longer active.' });
    }

    if (student.activeSessionId !== req.sessionID) {
      req.session.destroy();
      return res.status(401).json({ message: 'Your session has been terminated because you logged in from another device.' });
    }

    next();
  } catch (err) {
    console.error('[requireAuth] Error checking session:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};