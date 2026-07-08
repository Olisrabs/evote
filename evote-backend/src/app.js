import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import electionRoutes from './routes/elections.js';
import adminRoutes from './routes/admin.js';
import prisma from './config/database.js';

dotenv.config();

const app = express();

// ── CORS ─────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  // Hardcoded production Netlify URL (most reliable)
  'https://bouesti-evote.netlify.app',
  // Also read from env var in case URL ever changes
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    // Allow any *.netlify.app subdomain (covers preview deploys too)
    if (origin.endsWith('.netlify.app')) return callback(null, true);
    // Allow any explicitly listed origin
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Block everything else
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true,
}));

// ── Body Parser ───────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ── Session ───────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === 'production';
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  proxy: isProduction,        // trust reverse proxy (Render, Railway, etc.)
  cookie: {
    httpOnly: true,
    secure: isProduction,     // HTTPS only in production
    sameSite: isProduction ? 'none' : 'lax', // cross-origin cookies from Netlify
    maxAge: 1000 * 60 * 20,  // 20 minutes
  },
}));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/admin', adminRoutes);

// ── Health Check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', school: process.env.SCHOOL_NAME });
});

// ── Global error handler — ensures ALL errors return JSON, never empty body ──
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error.' });
});

// ── Start — pre-warm DB connection asynchronously without crashing the server ──
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`E-Vote backend running on http://localhost:${PORT}`);
  console.log(`School: ${process.env.SCHOOL_NAME}`);

  // Warm up connection in the background so it doesn't crash on temporary DNS/network blips
  prisma.$connect()
    .then(() => {
      console.log('[DB] Connection pool ready.');
    })
    .catch((err) => {
      console.warn('[DB] Warning: Could not pre-warm database connection. It will retry on request. Error:', err.message);
    });
});

export default app;