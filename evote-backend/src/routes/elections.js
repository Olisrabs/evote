import express from 'express';
import prisma from '../config/database.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { normalizePosition } from '../utils/position.js';

const router = express.Router();

// All election routes require a logged-in student session
router.use(requireAuth);

// ── GET /api/elections ───────────────────────────────────────
// Returns all active elections the student is eligible to vote in.
// Any 'active' election whose endsAt has passed is automatically closed first.
router.get('/', async (req, res) => {
  const { matricNo, faculty, department, level } = req.session.student;
  const now = new Date();

  // Auto-close any active elections whose end time has passed
  const expiredElections = await prisma.election.findMany({
    where: { status: 'active', endsAt: { lt: now } },
    select: { id: true },
  });

  if (expiredElections.length > 0) {
    const expiredIds = expiredElections.map(e => e.id);
    await prisma.election.updateMany({
      where: { id: { in: expiredIds } },
      data: { status: 'closed' },
    });
  }

  // Now fetch only genuinely active (and not yet expired) elections
  const elections = await prisma.election.findMany({
    where: {
      status: 'active',
      OR: [
        { endsAt: null },
        { endsAt: { gte: now } },
      ],
    },
    include: {
      candidates: {
        where: { isDisqualified: false },
        orderBy: { fullName: 'asc' },
      },
    },
    orderBy: { startsAt: 'asc' },
  });

  const votedElections = await prisma.vote.findMany({
    where: { voterMatricNo: matricNo },
    select: { electionId: true },
  });
  const votedElectionIds = new Set(votedElections.map(v => v.electionId));

  // Filter by election scope — school-wide, faculty, or department level
  const eligible = elections.filter((election) => {
    if (election.electionType === 'school') return true;
    if (election.electionType === 'faculty' && election.scopeValue === faculty) return true;
    if (election.electionType === 'department' && election.scopeValue === department) return true;
    if (election.electionType === 'level' && election.scopeValue === level) return true;
    return false;
  }).map(election => ({
    ...election,
    hasVoted: votedElectionIds.has(election.id)
  }));

  return res.status(200).json({ elections: eligible });
});

// ── GET /api/elections/past/all ──────────────────────────────
// Returns all closed/past elections the student was eligible to vote in.
router.get('/past/all', async (req, res) => {
  const { faculty, department, level } = req.session.student;

  const elections = await prisma.election.findMany({
    where: { status: 'closed' },
    orderBy: { endsAt: 'desc' },
  });

  // Filter by election scope — school-wide, faculty, or department level
  const eligible = elections.filter((election) => {
    if (election.electionType === 'school') return true;
    if (election.electionType === 'faculty' && election.scopeValue === faculty) return true;
    if (election.electionType === 'department' && election.scopeValue === department) return true;
    if (election.electionType === 'level' && election.scopeValue === level) return true;
    return false;
  });

  return res.status(200).json({ elections: eligible });
});

// ── GET /api/elections/:id ───────────────────────────────────
// Returns a single election with candidates and the student's voting status.
router.get('/:id', async (req, res) => {
  const { matricNo } = req.session.student;

  const election = await prisma.election.findUnique({
    where: { id: req.params.id },
    include: {
      candidates: {
        where: { isDisqualified: false },
        orderBy: { position: 'asc' },
      },
    },
  });

  if (!election) {
    return res.status(404).json({ message: 'Election not found.' });
  }

  // Fetch all positions this student has already voted in for this election
  const castVotes = await prisma.vote.findMany({
    where: { electionId: req.params.id, voterMatricNo: matricNo },
    select: { position: true, candidateId: true },
  });

  return res.status(200).json({ election, castVotes });
});

// ── POST /api/elections/:id/vote ─────────────────────────────
// Student submits their votes. Accepts an array of { position, candidateId }.
router.post('/:id/vote', async (req, res) => {
  const { matricNo } = req.session.student;
  const { votes } = req.body; // [{ position: 'President', candidateId: 'uuid' }, ...]

  if (!Array.isArray(votes) || votes.length === 0) {
    return res.status(400).json({ message: 'A non-empty votes array is required.' });
  }

  // Confirm the election is still active
  const election = await prisma.election.findUnique({
    where: { id: req.params.id },
  });

  if (!election) {
    return res.status(404).json({ message: 'Election not found.' });
  }

  if (election.status !== 'active') {
    return res.status(403).json({ message: 'This election is not currently active.' });
  }

  if (election.endsAt && new Date() > new Date(election.endsAt)) {
    return res.status(403).json({ message: 'This election is closed. Voting time has passed.' });
  }

  const normalizedVotes = votes.map((v) => ({
    position: normalizePosition(v.position),
    candidateId: v.candidateId,
  }));

  // Check for already-voted positions to prevent double-voting
  const alreadyVoted = await prisma.vote.findMany({
    where: {
      electionId: req.params.id,
      voterMatricNo: matricNo,
      position: { in: normalizedVotes.map((v) => v.position) },
    },
  });

  if (alreadyVoted.length > 0) {
    const positions = alreadyVoted.map((v) => v.position).join(', ');
    return res.status(409).json({
      message: `You have already voted for: ${positions}.`,
    });
  }

  // Record each vote
  await prisma.vote.createMany({
    data: normalizedVotes.map((v) => ({
      electionId: req.params.id,
      candidateId: v.candidateId,
      voterMatricNo: matricNo,
      position: v.position,
    })),
  });

  return res.status(201).json({ message: 'Your vote has been recorded. Thank you!' });
});

// ── GET /api/elections/:id/results ──────────────────────────
// Returns results for active or closed elections.
router.get('/:id/results', async (req, res) => {
  const election = await prisma.election.findUnique({
    where: { id: req.params.id },
    include: { candidates: true },
  });

  if (!election) {
    return res.status(404).json({ message: 'Election not found.' });
  }

  if (election.status !== 'closed' && election.status !== 'active') {
    return res.status(403).json({ message: 'Results are only available for active or closed elections.' });
  }

  const results = await Promise.all(
    election.candidates.map(async (candidate) => {
      const voteCount = await prisma.vote.count({
        where: { candidateId: candidate.id },
      });
      return { ...candidate, position: normalizePosition(candidate.position), voteCount };
    })
  );

  // Sort by position then by vote count descending
  results.sort((a, b) => {
    if (a.position < b.position) return -1;
    if (a.position > b.position) return 1;
    return b.voteCount - a.voteCount;
  });

  return res.status(200).json({ election, results });
});

export default router;
