// backend/src/controllers/progress.controller.js
const { Session, Progress, User, UserBadge, Badge } = require('../config/db');
const { checkAndAwardBadges }                         = require('../services/badge.service');
const { calculateStreak, clampDailyXp, computeLevel } = require('../services/streak.service');

// POST /api/progress/complete
async function completeSession(req, res, next) {
  try {
    const { sessionId, stars = 3 } = req.body;
    const userId = req.user.id;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const existing = await Progress.findOne({ userId, sessionId });
    if (existing?.completed) {
      return res.json({ alreadyDone: true, message: 'Already completed — no extra XP awarded' });
    }

    const clampedXp    = await clampDailyXp(userId, session.xpReward);
    const clampedCoins = clampedXp === 0 ? 0 : session.coinsReward;

    await Progress.findOneAndUpdate(
      { userId, sessionId },
      {
        userId, sessionId,
        courseId:    session.courseId || '',
        completed:   true, stars,
        xpEarned:    clampedXp,
        coinsEarned: clampedCoins,
        completedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newXp    = (user.xp    || 0) + clampedXp;
    const newCoins = (user.coins || 0) + clampedCoins;
    const newLevel = computeLevel(newXp);
    const { newStreak, isNewDay } = calculateStreak(user.streakDays, user.lastActiveAt);

    await User.findByIdAndUpdate(userId, {
      xp: newXp, coins: newCoins, level: newLevel,
      streakDays: newStreak, lastActiveAt: new Date(),
    });

    const newBadges = await checkAndAwardBadges(userId, { newXp, newStreak, newLevel });

    res.json({
      xpEarned:      clampedXp,
      coinsEarned:   clampedCoins,
      cappedByDaily: clampedXp < session.xpReward,
      newTotalXp:    newXp,
      newTotalCoins: newCoins,
      newLevel,
      leveledUp:     newLevel > user.level,
      newStreak,
      isNewDay,
      newBadges,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/progress/report/:userId
async function getProgressReport(req, res, next) {
  try {
    const targetId = req.params.userId;

    if (req.user.id !== targetId && req.user.role !== 'ADMIN') {
      const target = await User.findById(targetId).select('parentId');
      if (!target || String(target.parentId) !== req.user.id) {
        return res.status(403).json({ error: 'Not authorised to view this report' });
      }
    }

    const user = await User.findById(targetId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Fetch progress separately
    const progressRecords = await Progress.find({ userId: targetId, completed: true })
      .sort({ completedAt: -1 });

    // Fetch badges separately
    const userBadges = await UserBadge.find({ userId: targetId })
      .sort({ earnedAt: -1 })
      .populate('badgeId');

    // Group by course
    const courseMap = {};
    for (const p of progressRecords) {
      const cid = String(p.courseId || 'unknown');
      if (!courseMap[cid]) courseMap[cid] = { courseId: cid, sessions: [] };
      courseMap[cid].sessions.push({
        sessionId:   p.sessionId,
        xpEarned:    p.xpEarned,
        coinsEarned: p.coinsEarned,
        stars:       p.stars,
        completedAt: p.completedAt,
      });
    }

    const weekAgo  = new Date(Date.now() - 7 * 86400000);
    const weeklyXp = progressRecords
      .filter(p => p.completedAt && p.completedAt >= weekAgo)
      .reduce((sum, p) => sum + (p.xpEarned || 0), 0);

    res.json({
      student: {
        id:          user._id,
        username:    user.username,
        displayName: user.displayName,
        avatarEmoji: user.avatarEmoji,
        level:       user.level,
        xp:          user.xp,
        coins:       user.coins,
        streakDays:  user.streakDays,
      },
      courses:        Object.values(courseMap),
      badges:         userBadges.map(ub => ub.badgeId).filter(Boolean),
      totalCompleted: progressRecords.length,
      weeklyXp,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { completeSession, getProgressReport };