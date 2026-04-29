// src/services/badge.service.js
const { Progress, Badge, UserBadge } = require('../config/db');

const CONDITIONS = {
  complete_first_lesson: async (userId) => {
    const count = await Progress.countDocuments({ userId, completed: true });
    return count >= 1;
  },
  '7_day_streak':  async (userId, stats) => stats.newStreak >= 7,
  '30_day_streak': async (userId, stats) => stats.newStreak >= 30,
  reach_level_5:   async (userId, stats) => stats.newLevel >= 5,
  reach_level_10:  async (userId, stats) => stats.newLevel >= 10,
  earn_1000_xp:    async (userId, stats) => stats.newXp >= 1000,
  earn_5000_xp:    async (userId, stats) => stats.newXp >= 5000,
  complete_quiz_perfect: async (userId) => {
    const quizProgress = await Progress
      .findOne({ userId, stars: 3 })
      .populate({ path: 'session', select: 'type' });
    return !!(quizProgress?.session?.type === 'QUIZ');
  },
};

async function checkAndAwardBadges(userId, stats) {
  const allBadges    = await Badge.find();
  const alreadyEarned = await UserBadge.find({ userId }).select('badgeId');
  const earnedIds    = new Set(alreadyEarned.map(b => b.badgeId.toString()));

  const newlyEarned = [];

  for (const badge of allBadges) {
    if (earnedIds.has(badge._id.toString())) continue;
    const condFn = CONDITIONS[badge.condition];
    if (!condFn) continue;

    const earned = await condFn(userId, stats);
    if (earned) {
      await UserBadge.create({ userId, badgeId: badge._id });
      newlyEarned.push(badge);
    }
  }

  return newlyEarned;
}

module.exports = { checkAndAwardBadges };