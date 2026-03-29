// backend/src/routes/progress.routes.js
const router = require('express').Router();
const c = require('../controllers/progress.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/complete',       requireAuth, c.completeSession);
router.get('/report/:userId',  requireAuth, c.getProgressReport);

// PATCH /api/progress/video-watch  — save how far student watched a video
// Only ever increases videoMaxSeconds (never decreases best record)
router.patch('/video-watch', requireAuth, async (req, res, next) => {
  try {
    const { sessionId, courseId, exitSeconds, maxSeconds, duration } = req.body;
    if (!sessionId || !courseId) return res.status(400).json({ error: 'sessionId and courseId required' });

    const userId = req.user.id;

    const existing = await prisma.progress.findUnique({
      where: { userId_sessionId: { userId, sessionId } },
      select: { videoMaxSeconds: true },
    });

    const newMax = Math.max(existing?.videoMaxSeconds ?? 0, maxSeconds ?? 0);

    await prisma.progress.upsert({
      where: { userId_sessionId: { userId, sessionId } },
      update: {
        videoExitSeconds: exitSeconds ?? null,
        videoMaxSeconds:  newMax || null,
        videoDuration:    duration  ?? null,
      },
      create: {
        userId, sessionId, courseId,
        completed:        false,
        videoExitSeconds: exitSeconds ?? null,
        videoMaxSeconds:  newMax || null,
        videoDuration:    duration  ?? null,
      },
    });

    res.json({ ok: true, videoMaxSeconds: newMax });
  } catch (err) { next(err); }
});

module.exports = router;
