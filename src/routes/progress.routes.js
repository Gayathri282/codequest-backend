// src/routes/progress.routes.js
const router = require('express').Router();
const c      = require('../controllers/progress.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { Progress } = require('../config/db');

router.post('/complete',      requireAuth, c.completeSession);
router.get('/report/:userId', requireAuth, c.getProgressReport);

// PATCH /api/progress/video-watch
router.patch('/video-watch', requireAuth, async (req, res, next) => {
  try {
    const { sessionId, courseId, exitSeconds, maxSeconds, duration } = req.body;
    if (!sessionId || !courseId) {
      return res.status(400).json({ error: 'sessionId and courseId required' });
    }

    const userId = req.user.id;

    const existing = await Progress
      .findOne({ userId, sessionId })
      .select('videoMaxSeconds');

    const newMax = Math.max(existing?.videoMaxSeconds ?? 0, maxSeconds ?? 0);

    await Progress.findOneAndUpdate(
      { userId, sessionId },
      {
        userId, sessionId, courseId,
        completed:        false,
        videoExitSeconds: exitSeconds ?? null,
        videoMaxSeconds:  newMax || null,
        videoDuration:    duration  ?? null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ ok: true, videoMaxSeconds: newMax });
  } catch (err) { next(err); }
});

module.exports = router;