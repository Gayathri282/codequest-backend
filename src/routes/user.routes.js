// backend/src/routes/user.routes.js
const router = require('express').Router();
const prisma = require('../config/db');
const { requireAuth } = require('../middleware/auth.middleware');


// PATCH /api/users/me  — update avatar, displayName
router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const { displayName, avatarEmoji } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { displayName, avatarEmoji },
      select: { id: true, displayName: true, avatarEmoji: true }
    });
    res.json(user);
  } catch (err) { next(err); }
});

// GET /api/users/leaderboard
router.get('/leaderboard', requireAuth, async (req, res, next) => {
  try {
    const top = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      orderBy: { xp: 'desc' },
      take: 20,
      select: { id: true, username: true, displayName: true, avatarEmoji: true, xp: true, level: true, streakDays: true }
    });
    res.json(top);
  } catch (err) { next(err); }
});

module.exports = router;

// GET /api/users/children  — parent fetches their linked children
router.get('/children', requireAuth, async (req, res, next) => {
  try {
    const children = await prisma.user.findMany({
      where: { parentId: req.user.id },
      select: { id: true, username: true, displayName: true, avatarEmoji: true, age: true, level: true, xp: true, streakDays: true }
    });
    res.json(children);
  } catch (err) { next(err); }
});

