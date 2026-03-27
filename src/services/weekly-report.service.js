// backend/src/services/weekly-report.service.js
// Send weekly progress emails to parents every Sunday at 8am IST
// Wire this up with a cron job or Railway's cron service

const prisma = require('../config/db');
const { sendProgressReport } = require('./email.service');

async function sendWeeklyReports() {
  console.log('[WEEKLY REPORT] Starting weekly report job...');

  const weekAgo = new Date(Date.now() - 7 * 86400000);

  // Get all students who have a parent email set
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT', parentId: { not: null } },
    include: {
      parent: { select: { email: true } },
      progress: {
        where: { completedAt: { gte: weekAgo }, completed: true },
        select: { xpEarned: true },
      },
      earnedBadges: {
        where: { earnedAt: { gte: weekAgo } },
        include: { badge: { select: { name: true, emoji: true } } },
      },
    },
  });

  let sent = 0;
  for (const student of students) {
    if (!student.parent?.email) continue;

    const weeklyXp = student.progress.reduce((s, p) => s + p.xpEarned, 0);
    const newBadges = student.earnedBadges.map(ub => `${ub.badge.emoji} ${ub.badge.name}`);

    await sendProgressReport({
      to:          student.parent.email,
      studentName: student.displayName || student.username,
      report: {
        weeklyXp,
        level:       student.level,
        streakDays:  student.streakDays,
        completed:   student.progress.length,
        newBadges,
      },
    });
    sent++;
  }

  console.log(`[WEEKLY REPORT] Sent ${sent} reports`);
  return sent;
}

// POST /api/admin/send-reports  (manual trigger from admin panel)
module.exports = { sendWeeklyReports };
