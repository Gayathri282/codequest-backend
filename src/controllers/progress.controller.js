// backend/src/controllers/progress.controller.js
const { Session, Progress, User } = require('../config/db');
const { checkAndAwardBadges }                        = require('../services/badge.service');
const { calculateStreak, clampDailyXp, computeLevel } = require('../services/streak.service');

// POST /api/progress/complete
async function completeSession(req, res, next) {
  try {
    const { sessionId, stars = 3 } = req.body;
    const userId = req.user.id;

   const session = await Session.findById(sessionId);
console.log('[complete] session:', session?._id, 'courseId:', session?.courseId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Idempotent — don't award XP twice for the same session
    const existing = await Progress.findOne({ userId, sessionId });
    if (existing?.completed) {
      return res.json({ alreadyDone: true, message: 'Already completed — no extra XP awarded' });
    }

    // Daily XP cap
    const clampedXp    = await clampDailyXp(userId, session.xpReward);
    const clampedCoins = clampedXp === 0 ? 0 : session.coinsReward;

    // Upsert progress row
    await Progress.findOneAndUpdate(
      { userId, sessionId },
      {
        userId, sessionId, courseId: session.courseId,
        completed: true, stars,
        xpEarned: clampedXp, coinsEarned: clampedCoins,
        completedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Update user totals
    const user = await User.findById(userId);
    const newXp    = user.xp    + clampedXp;
    const newCoins = user.coins + clampedCoins;
    const newLevel = computeLevel(newXp);
    const { newStreak, isNewDay } = calculateStreak(user.streakDays, user.lastActiveAt);

    await User.findByIdAndUpdate(userId, {
      xp: newXp, coins: newCoins, level: newLevel,
      streakDays: newStreak, lastActiveAt: new Date(),
    });

    // Badge checks
    const newBadges = await checkAndAwardBadges(userId, { newXp, newStreak, newLevel });

    res.json({
      xpEarned:     clampedXp,
      coinsEarned:  clampedCoins,
      cappedByDaily: clampedXp < session.xpReward,
      newTotalXp:   newXp,
      newTotalCoins: newCoins,
      newLevel,
      leveledUp:    newLevel > user.level,
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

    // Auth check: own report, or parent of user, or admin
    if (req.user.id !== targetId && req.user.role !== 'ADMIN') {
      const target = await User.findById(targetId).select('parentId');
      if (!target || target.parentId?.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Not authorised to view this report' });
      }
    }

    const user = await User
      .findById(targetId)
      .populate({
        path: 'progress',
        match: { completed: true },
        options: { sort: { completedAt: -1 } },
        populate: [
          { path: 'session', select: 'title type xpReward coinsReward' },
          { path: 'course',  select: 'title emoji color' },
        ],
      })
      .populate({
        path: 'earnedBadges',
        options: { sort: { earnedAt: -1 } },
        populate: { path: 'badge' },
      });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Group by course
    const courseMap = {};
    for (const p of user.progress) {
      const cid = p.courseId.toString();
      if (!courseMap[cid]) {
        courseMap[cid] = { course: p.course, sessions: [] };
      }
      courseMap[cid].sessions.push({
        title:       p.session.title,
        type:        p.session.type,
        xpEarned:    p.xpEarned,
        coinsEarned: p.coinsEarned,
        stars:       p.stars,
        completedAt: p.completedAt,
      });
    }

    // Weekly XP (last 7 days)
    const weekAgo  = new Date(Date.now() - 7 * 86400000);
    const weeklyXp = user.progress
      .filter(p => p.completedAt && p.completedAt >= weekAgo)
      .reduce((sum, p) => sum + p.xpEarned, 0);

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
      badges:         user.earnedBadges.map(ub => ub.badge),
      totalCompleted: user.progress.length,
      weeklyXp,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { completeSession, getProgressReport };