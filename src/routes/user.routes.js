// src/routes/user.routes.js
const router = require('express').Router();
const { requireAuth } = require('../middleware/auth.middleware');
const { User } = require('../config/db');

// PATCH /api/users/me
router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const { displayName, avatarEmoji } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { displayName, avatarEmoji },
      { new: true, runValidators: true }
    ).select('_id displayName avatarEmoji');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
});

// GET /api/users/leaderboard
router.get('/leaderboard', requireAuth, async (req, res, next) => {
  try {
    const top = await User
      .find({ role: 'STUDENT' })
      .sort({ xp: -1 })
      .limit(20)
      .select('_id username displayName avatarEmoji xp level streakDays');
    res.json(top);
  } catch (err) { next(err); }
});

// GET /api/users/children
router.get('/children', requireAuth, async (req, res, next) => {
  try {
    const children = await User
      .find({ parentId: req.user.id })
      .select('_id username displayName avatarEmoji age level xp streakDays');
    res.json(children);
  } catch (err) { next(err); }
});

module.exports = router;