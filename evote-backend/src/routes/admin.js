import express from 'express';
import prisma from '../config/database.js';
import { normalizePosition } from '../utils/position.js';

const router = express.Router();

// ── Simple in-memory cache ────────────────────────────────────────────
const cache = {};
const getCache = (key) => {
  const entry = cache[key];
  if (entry && Date.now() - entry.ts < 30_000) return entry.data; // 30 s TTL
  return null;
};
const setCache = (key, data) => { cache[key] = { data, ts: Date.now() }; };
const clearCache = (...keys) => keys.forEach(k => delete cache[k]);

// ── requireAdmin — trusts session data, skips DB re-fetch on every request ─
const requireAdmin = (req, res, next) => {
  if (!req.session?.admin?.matricNo) {
    return res.status(401).json({ message: 'Admin authentication required.' });
  }
  // Session data is already verified at login; attach it directly
  req.admin = req.session.admin;
  next();
};

router.use(requireAdmin);

// ── GET /api/admin/elections ──────────────────────────────────────────
router.get('/elections', async (req, res) => {
  try {
    // Auto-close any active elections whose end time has passed
    const now = new Date();
    const expired = await prisma.election.findMany({
      where: { status: 'active', endsAt: { lt: now } },
      select: { id: true },
    });
    if (expired.length > 0) {
      await prisma.election.updateMany({
        where: { id: { in: expired.map(e => e.id) } },
        data: { status: 'closed' },
      });
    }

    const elections = await prisma.election.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { candidates: true } } },
    });

    const uniqueVoters = await prisma.vote.groupBy({
      by: ['electionId', 'voterMatricNo'],
    });

    const electionsWithCounts = elections.map(el => {
      const voterCount = uniqueVoters.filter(v => v.electionId === el.id).length;
      return {
        ...el,
        voterCount
      };
    });

    return res.status(200).json({ elections: electionsWithCounts });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── POST /api/admin/elections ─────────────────────────────────────────
router.post('/elections', async (req, res) => {
  try {
    const { title, description, electionType, scopeType, scopeValue, startsAt, endsAt } = req.body;
    if (!title || !electionType) {
      return res.status(400).json({ message: 'Title and election type are required.' });
    }
    const election = await prisma.election.create({
      data: {
        title,
        description: description || null,
        electionType,
        scopeType: scopeType || null,
        scopeValue: scopeValue || null,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
        createdBy: req.session.admin.matricNo,
      },
    });
    return res.status(201).json({ election });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/admin/elections/:id/status ────────────────────────────
router.patch('/elections/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['draft', 'active', 'closed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }
    const election = await prisma.election.update({
      where: { id: req.params.id },
      data: { status },
    });
    return res.status(200).json({ election });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── GET /api/admin/elections/:id/candidates ───────────────────────────
router.get('/elections/:id/candidates', async (req, res) => {
  try {
    const candidates = await prisma.candidate.findMany({
      where: { electionId: req.params.id },
      orderBy: { position: 'asc' },
    });
    return res.status(200).json({ candidates });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── POST /api/admin/elections/:id/candidates ──────────────────────────
router.post('/elections/:id/candidates', async (req, res) => {
  try {
    const { studentId, fullName, position, manifesto, manifestoSummary, photoUrl } = req.body;
    if (!studentId || !fullName || !position || !manifesto || !manifestoSummary) {
      return res.status(400).json({ message: 'Student ID, full name, position, summary, and manifesto details are required.' });
    }
    if (manifestoSummary.length > 150) {
      return res.status(400).json({ message: 'Candidate summary must not exceed 150 characters.' });
    }
    const normalizedPosition = normalizePosition(position);
    const candidate = await prisma.candidate.create({
      data: {
        electionId: req.params.id,
        studentId,
        fullName,
        position: normalizedPosition,
        manifesto,
        manifestoSummary,
        photoUrl: photoUrl || '/images.jpg',
      },
    });
    return res.status(201).json({ candidate });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/admin/candidates/:id/disqualify ───────────────────────
router.patch('/candidates/:id/disqualify', async (req, res) => {
  try {
    const candidate = await prisma.candidate.update({
      where: { id: req.params.id },
      data: { isDisqualified: true },
    });
    return res.status(200).json({ candidate });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/admin/candidates/:id/reinstate ────────────────────────
router.patch('/candidates/:id/reinstate', async (req, res) => {
  try {
    const candidate = await prisma.candidate.update({
      where: { id: req.params.id },
      data: { isDisqualified: false },
    });
    return res.status(200).json({ candidate });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/admin/candidates/:id ─────────────────────────────────
router.delete('/candidates/:id', async (req, res) => {
  try {
    await prisma.candidate.delete({ where: { id: req.params.id } });
    return res.status(200).json({ message: 'Candidate removed.' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── GET /api/admin/elections/:id/results ─────────────────────────────
// Uses a single groupBy aggregation instead of N+1 vote.count() calls
router.get('/elections/:id/results', async (req, res) => {
  try {
    const [election, voteCounts] = await Promise.all([
      prisma.election.findUnique({
        where: { id: req.params.id },
        include: { candidates: { orderBy: { position: 'asc' } } },
      }),
      // Single aggregation query — all vote counts in one round trip
      prisma.vote.groupBy({
        by: ['candidateId'],
        where: { electionId: req.params.id },
        _count: { _all: true },
      }),
    ]);

    if (!election) {
      return res.status(404).json({ message: 'Election not found.' });
    }

    // Build a lookup map candidateId → voteCount
    const countMap = {};
    for (const row of voteCounts) {
      countMap[row.candidateId] = row._count._all;
    }

    // Group by position
    const positionMap = {};
    for (const candidate of election.candidates) {
      const normalizedPos = normalizePosition(candidate.position);
      if (!positionMap[normalizedPos]) {
        positionMap[normalizedPos] = { position: normalizedPos, totalVotes: 0, candidates: [] };
      }
      const voteCount = countMap[candidate.id] ?? 0;
      positionMap[normalizedPos].totalVotes += voteCount;
      positionMap[normalizedPos].candidates.push({ ...candidate, position: normalizedPos, voteCount });
    }

    const results = Object.values(positionMap).map(pos => ({
      ...pos,
      candidates: pos.candidates
        .sort((a, b) => b.voteCount - a.voteCount)
        .map(c => ({
          ...c,
          percentage: pos.totalVotes > 0 ? Math.round((c.voteCount / pos.totalVotes) * 1000) / 10 : 0,
        })),
    }));

    return res.status(200).json({ election, results });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── GET /api/admin/voters ─────────────────────────────────────────────
router.get('/voters', async (req, res) => {
  try {
    const { search, level, status, department, faculty } = req.query;
    const where = {};

    if (search) {
      where.OR = [
        { matricNo: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (level) {
      where.level = { contains: level, mode: 'insensitive' };
    }
    if (status) {
      where.status = status;
    }
    if (department) {
      where.department = { contains: department, mode: 'insensitive' };
    }
    if (faculty) {
      where.faculty = { contains: faculty, mode: 'insensitive' };
    }

    const [voters, total] = await Promise.all([
      prisma.eligibleVoter.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 }),
      prisma.eligibleVoter.count({ where }),
    ]);
    return res.status(200).json({ voters, total });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/admin/voters/:matricNo/status ─────────────────────────
router.patch('/voters/:matricNo/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive', 'alumni'].includes(status)) {
      return res.status(400).json({ message: 'Status must be active, inactive, or alumni.' });
    }
    const voter = await prisma.eligibleVoter.update({
      where: { matricNo: req.params.matricNo },
      data: { status },
    });
    return res.status(200).json({ voter });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── POST /api/admin/voters/upload ────────────────────────────────────
// Accepts an array of student objects parsed from CSV on the frontend
router.post('/voters/upload', async (req, res) => {
  try {
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: 'A non-empty students array is required.' });
    }

    // 1. Check for duplicate emails in the uploaded payload itself
    const localEmailMap = {};
    for (const s of students) {
      const email = s.email?.trim().toLowerCase();
      if (email) {
        if (localEmailMap[email]) {
          return res.status(400).json({
            message: `Duplicate email address found in the uploaded list: ${s.email} is shared by Matric Nos ${localEmailMap[email]} and ${s.matricNo}.`
          });
        }
        localEmailMap[email] = s.matricNo;
      }
    }

    // 2. Check for duplicate emails against other students in the database
    const emailsToCheck = students.map(s => s.email?.trim().toLowerCase()).filter(Boolean);
    const existingVoters = await prisma.eligibleVoter.findMany({
      where: {
        email: { in: emailsToCheck, mode: 'insensitive' }
      },
      select: { matricNo: true, email: true }
    });

    const dbEmailMap = {};
    for (const ev of existingVoters) {
      dbEmailMap[ev.email.toLowerCase()] = ev.matricNo;
    }

    for (const s of students) {
      const email = s.email?.trim().toLowerCase();
      if (email) {
        const existingMatric = dbEmailMap[email];
        if (existingMatric && existingMatric !== s.matricNo) {
          return res.status(400).json({
            message: `The email address '${s.email}' is already in use by another student (Matric No: ${existingMatric}).`
          });
        }
      }
    }

    // Helper to split array into chunks
    const chunkArray = (arr, size) => {
      const chunks = [];
      for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
      }
      return chunks;
    };

    const chunks = chunkArray(students, 5);
    const ops = [];

    // Process chunks sequentially to keep connection count low (max 5 parallel queries)
    for (const chunk of chunks) {
      const chunkOps = await Promise.allSettled(
        chunk.map((s) =>
          prisma.eligibleVoter.upsert({
            where: { matricNo: s.matricNo },
            update: { fullName: s.fullName, email: s.email, faculty: s.faculty, department: s.department, level: s.level, status: s.status || 'active' },
            create: { matricNo: s.matricNo, fullName: s.fullName, email: s.email, faculty: s.faculty, department: s.department, level: s.level, status: s.status || 'active' },
          })
        )
      );
      ops.push(...chunkOps);
    }

    const succeeded = ops.filter((r) => r.status === 'fulfilled').length;
    const rejectedOps = ops.filter((r) => r.status === 'rejected');
    const failed = rejectedOps.length;
    if (failed > 0) {
      console.error('[Voters Upload] Errors:', rejectedOps.map(r => r.reason));
    }
    return res.status(200).json({
      message: `${succeeded} students imported, ${failed} failed.`,
      succeeded,
      failed,
      errors: rejectedOps.map(r => r.reason?.message || String(r.reason))
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── GET /api/admin/stats ─────────────────────────────────────────────
// Cached for 30 seconds to avoid 4 DB queries on every dashboard visit
router.get('/stats', async (req, res) => {
  try {
    const cached = getCache('stats');
    if (cached) return res.status(200).json(cached);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [activeElections, totalVoters, votesToday, upcomingElections] = await Promise.all([
      prisma.election.count({ where: { status: 'active' } }),
      prisma.eligibleVoter.count(),
      prisma.vote.count({ where: { votedAt: { gte: today } } }),
      prisma.election.count({ where: { status: 'draft', startsAt: { gt: new Date() } } }),
    ]);
    const data = { activeElections, totalVoters, votesToday, upcomingElections };
    setCache('stats', data);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ── POST /api/admin/academic/advance-session ─────────────────────────
// Complete the current academic session and advance levels
router.post('/academic/advance-session', async (req, res) => {
  try {
    const { finalYearLevels } = req.body;
    
    // Ensure finalYearLevels is an array of strings
    const levelsToGraduate = Array.isArray(finalYearLevels) && finalYearLevels.length > 0
      ? finalYearLevels.map(l => String(l).trim())
      : ['400', '500', '600', '400 Level', '500 Level', '600 Level'];

    // We do this in a single transaction
    await prisma.$transaction(async (tx) => {
      // 1. Mark final year students as alumni status
      for (const lvl of levelsToGraduate) {
        await tx.$executeRaw`
          UPDATE eligible_voters
          SET status = 'alumni', level = 'alumni'
          WHERE status = 'active' AND (LOWER(level) = LOWER(${lvl}) OR regexp_replace(level, '[^0-9]', '', 'g') = ${lvl});
        `;
      }

      // 2. Increment level for remaining active students with numeric levels (e.g. 100 -> 200, 200 Level -> 300 Level)
      await tx.$executeRaw`
        UPDATE eligible_voters
        SET level = regexp_replace(level, '[0-9]+', CAST(CAST(substring(level from '[0-9]+') AS INTEGER) + 100 AS VARCHAR))
        WHERE status = 'active' AND level ~ '[0-9]+';
      `;
    });

    // Invalidate stats cache
    clearCache('stats');

    return res.status(200).json({ message: 'Academic session completed successfully. Student levels advanced.' });
  } catch (err) {
    console.error('[Advance Session] Error:', err);
    return res.status(500).json({ message: err.message || 'Failed to complete session.' });
  }
});

export default router;