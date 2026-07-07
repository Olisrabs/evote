import prisma from '../config/database.js';

// Protects admin routes.
// Checks that the logged-in student exists in voting_admins and is active.
export const requireAdmin = async (req, res, next) => {
  if (!req.session?.student) {
    return res.status(401).json({ message: 'You must be logged in.' });
  }

  const admin = await prisma.admin.findUnique({
    where: { matricNo: req.session.student.matricNo },
  });

  if (!admin || !admin.isActive) {
    return res.status(403).json({ message: 'You do not have admin access.' });
  }

  // Attach admin role to request so routes can check permissions
  req.admin = admin;
  next();
};