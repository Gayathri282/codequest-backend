// backend/src/index.js
require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes     = require('./routes/auth.routes');
const courseRoutes   = require('./routes/course.routes');
const sessionRoutes  = require('./routes/session.routes');
const progressRoutes = require('./routes/progress.routes');
const quizRoutes     = require('./routes/quiz.routes');
const paymentRoutes  = require('./routes/payment.routes');
const adminRoutes    = require('./routes/admin.routes');
const uploadRoutes   = require('./routes/upload.routes');
const videoRoutes    = require('./routes/video.routes');
const userRoutes     = require('./routes/user.routes');
const editorRoutes   = require('./routes/editor.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security ──────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const FRONTEND = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
app.use(cors({
  origin: [FRONTEND, 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));

// ── Rate limiting ─────────────────────────────────────────────────
app.use('/api/',              rateLimit({ windowMs: 15*60*1000, max: 500, message: { error: 'Too many requests' } }));
// Only restrict brute-force targets (login/register), NOT /auth/me
app.use('/api/auth/login',    rateLimit({ windowMs: 15*60*1000, max: 20,  message: { error: 'Too many login attempts' } }));
app.use('/api/auth/register', rateLimit({ windowMs: 60*60*1000, max: 10,  message: { error: 'Too many registrations' } }));
app.use('/api/video/',        rateLimit({ windowMs: 60*60*1000, max: 20  })); // video uploads are expensive

// ── Body parsing ──────────────────────────────────────────────────
// Raw body MUST come before json() for webhook signature verification
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/courses',  courseRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/quiz',     quizRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/upload',   uploadRoutes);
app.use('/api/video',    videoRoutes);
app.use('/api/editor',   editorRoutes);

// ── Health check ──────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date(), env: process.env.NODE_ENV }));

// ── 404 handler ───────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` }));

// ── Global error handler ──────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 CodeQuest API  →  http://localhost:${PORT}  [${process.env.NODE_ENV || 'development'}]\n`);
  console.log('   Routes:');
  console.log('   POST /api/auth/register  POST /api/auth/login  GET /api/auth/me');
  console.log('   GET  /api/courses        POST /api/progress/complete');
  console.log('   POST /api/payments/create-order  POST /api/payments/verify');
  console.log('   POST /api/upload/thumbnail       POST /api/video/upload');
  console.log('   GET  /api/admin/stats    GET  /api/admin/students\n');
});
