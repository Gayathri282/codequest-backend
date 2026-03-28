// backend/src/controllers/session.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/sessions/:id  — single session with quiz questions
async function getSession(req, res, next) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: req.params.id },
      include: {
        quizQuestions: { orderBy: { order: 'asc' } }
      }
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // FREE plan can only access the first 4 sessions
    if (session.order > 4 && req.user.plan === 'FREE' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Upgrade to Premium to unlock this lesson! 🔒' });
    }

    res.json(session);
  } catch (err) {
    next(err);
  }
}

// POST /api/sessions  (admin)
async function createSession(req, res, next) {
  try {
    const {
      courseId, title, type, order, xpReward, coinsReward,
      durationMins, videoUrl, videoThumb, hasIde, missionText,
      docContent, starterCode, solutionCode
    } = req.body;

    const session = await prisma.session.create({
      data: {
        courseId, title, type, order: order || 0,
        xpReward: xpReward || 50, coinsReward: coinsReward || 5,
        durationMins: durationMins || 5,
        videoUrl, videoThumb, hasIde: hasIde || false, missionText,
        docContent, starterCode, solutionCode
      }
    });
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/sessions/:id  (admin)
async function updateSession(req, res, next) {
  try {
    const session = await prisma.session.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(session);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/sessions/:id  (admin)
async function deleteSession(req, res, next) {
  try {
    await prisma.session.delete({ where: { id: req.params.id } });
    res.json({ message: 'Session deleted' });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/sessions/reorder  (admin) — bulk reorder
async function reorderSessions(req, res, next) {
  try {
    // body: [{ id, order }, ...]
    const updates = req.body;
    await Promise.all(
      updates.map(({ id, order }) =>
        prisma.session.update({ where: { id }, data: { order } })
      )
    );
    res.json({ message: 'Reordered' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSession, createSession, updateSession, deleteSession, reorderSessions };
