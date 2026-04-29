// src/services/weekly-report.service.js
const { User, Progress, UserBadge, Badge } = require('../config/db');
const { sendProgressReport } = require('./email.service');

async function sendWeeklyReports() {
  console.log('[WEEKLY REPORT] Starting weekly report job...');

  const weekAgo = new Date(Date.now() - 7 * 86400000);

  // Students who have a parentId set
  const students = await User
    .find({ role: 'STUDENT', parentId: { $ne: null } })
    .select('_id displayName username level streakDays parentId');

  let sent = 0;

  for (const student of students) {
    // Fetch parent email
    const parent = await User.findById(student.parentId).select('email');
    if (!parent?.email) continue;

    // XP earned this week
    const weeklyProgressAgg = await Progress.aggregate([
      {
        $match: {
          userId:      student._id.toString(),
          completed:   true,
          completedAt: { $gte: weekAgo },
        },
      },
      { $group: { _id: null, weeklyXp: { $sum: '$xpEarned' }, count: { $sum: 1 } } },
    ]);
    const weeklyXp = weeklyProgressAgg[0]?.weeklyXp || 0;
    const completed = weeklyProgressAgg[0]?.count   || 0;

    // Badges earned this week
    const recentBadges = await UserBadge
      .find({ userId: student._id.toString(), earnedAt: { $gte: weekAgo } })
      .populate({ path: 'badgeId', select: 'name emoji' });

    const newBadges = recentBadges.map(ub => `${ub.badgeId?.emoji || ''} ${ub.badgeId?.name || ''}`);

    await sendProgressReport({
      to:          parent.email,
      studentName: student.displayName || student.username,
      report: {
        weeklyXp,
        level:      student.level,
        streakDays: student.streakDays,
        completed,
        newBadges,
      },
    });

    sent++;
  }

  console.log(`[WEEKLY REPORT] Sent ${sent} reports`);
  return sent;
}

module.exports = { sendWeeklyReports };