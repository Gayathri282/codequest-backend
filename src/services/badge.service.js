// backend/src/services/badge.service.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Badge condition checks
const CONDITIONS = {
  complete_first_lesson: async (userId) => {
    const count = await prisma.progress.count({ where: { userId, completed: true } });
    return count >= 1;
  },
  '7_day_streak': async (userId, stats) => stats.newStreak >= 7,
  '30_day_streak': async (userId, stats) => stats.newStreak >= 30,
  reach_level_5: async (userId, stats) => stats.newLevel >= 5,
  reach_level_10: async (userId, stats) => stats.newLevel >= 10,
  earn_1000_xp: async (userId, stats) => stats.newXp >= 1000,
  earn_5000_xp: async (userId, stats) => stats.newXp >= 5000,
  complete_quiz_perfect: async (userId) => {
    // Check if any quiz session has stars = 3 and correct answers = 100%
    const quizProgress = await prisma.progress.findFirst({
      where: { userId, stars: 3, session: { type: 'QUIZ' } },
      include: { session: { select: { type: true } } }
    });
    return !!quizProgress;
  },
};

async function checkAndAwardBadges(userId, stats) {
  const allBadges = await prisma.badge.findMany();
  const alreadyEarned = await prisma.userBadge.findMany({
    where: { userId },
    select: { badgeId: true }
  });
  const earnedIds = new Set(alreadyEarned.map(b => b.badgeId));

  const newlyEarned = [];

  for (const badge of allBadges) {
    if (earnedIds.has(badge.id)) continue;
    const condFn = CONDITIONS[badge.condition];
    if (!condFn) continue;

    const earned = await condFn(userId, stats);
    if (earned) {
      await prisma.userBadge.create({ data: { userId, badgeId: badge.id } });
      newlyEarned.push(badge);
    }
  }

  return newlyEarned;
}

module.exports = { checkAndAwardBadges };
