// src/services/streak.service.js
const { Progress } = require('../config/db');

const MAX_DAILY_XP = parseInt(process.env.MAX_DAILY_XP || '500', 10);

/**
 * Calculate new streak given last active date.
 *   Same calendar day → no change
 *   Next calendar day → +1
 *   Gap > 1 day       → reset to 1
 */
function calculateStreak(currentStreak, lastActiveAt) {
  const now   = new Date();
  const today = toDateStr(now);

  if (!lastActiveAt) return { newStreak: 1, isNewDay: true };

  const lastDate = toDateStr(new Date(lastActiveAt));
  if (lastDate === today) return { newStreak: currentStreak, isNewDay: false };

  const yesterday = toDateStr(new Date(now.getTime() - 86400000));
  if (lastDate === yesterday) return { newStreak: currentStreak + 1, isNewDay: true };

  return { newStreak: 1, isNewDay: true };
}

function toDateStr(d) {
  return d.toISOString().slice(0, 10);
}

/**
 * How much XP the student can still earn today (daily cap).
 * NOTE: prisma param removed — uses Mongoose model directly.
 */
async function clampDailyXp(userId, earnedXp) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const agg = await Progress.aggregate([
    { $match: { userId, completedAt: { $gte: startOfDay } } },
    { $group: { _id: null, total: { $sum: '$xpEarned' } } },
  ]);

  const soFarToday = agg[0]?.total || 0;
  const remaining  = Math.max(0, MAX_DAILY_XP - soFarToday);
  return Math.min(earnedXp, remaining);
}

/**
 * Every 500 XP = 1 level, starting at level 1.
 */
function computeLevel(totalXp) {
  return Math.floor(totalXp / 500) + 1;
}

module.exports = { calculateStreak, clampDailyXp, computeLevel };