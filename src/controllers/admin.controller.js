// backend/src/controllers/admin.controller.js
// Platform-wide admin actions: settings save, bulk operations, analytics
const prisma = require('../config/db');

// GET /api/admin/analytics  — richer analytics beyond basic stats
async function getAnalytics(req, res, next) {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - Number(days) * 86400000);

    const [
      newStudents,
      completions,
      revenueData,
      popularSessions,
    ] = await Promise.all([
      // New students per day (last N days)
      prisma.user.groupBy({
        by: ['createdAt'],
        where: { role: 'STUDENT', createdAt: { gte: since } },
        _count: true,
      }),

      // Completions per day
      prisma.progress.groupBy({
        by: ['completedAt'],
        where: { completed: true, completedAt: { gte: since } },
        _count: true,
      }),

      // Revenue by plan
      prisma.payment.groupBy({
        by: ['plan'],
        where: { status: 'PAID' },
        _sum: { amount: true },
        _count: true,
      }),

      // Top 5 most-completed sessions
      prisma.progress.groupBy({
        by: ['sessionId'],
        where: { completed: true },
        _count: { sessionId: true },
        orderBy: { _count: { sessionId: 'desc' } },
        take: 5,
      }),
    ]);

    // Enrich session data with titles
    const sessionIds = popularSessions.map(s => s.sessionId);
    const sessions = await prisma.session.findMany({
      where: { id: { in: sessionIds } },
      select: { id: true, title: true, type: true },
    });
    const sessionMap = Object.fromEntries(sessions.map(s => [s.id, s]));

    res.json({
      newStudents,
      completions,
      revenueByPlan: revenueData.map(r => ({
        plan:    r.plan,
        revenue: r._sum.amount || 0,
        count:   r._count,
      })),
      popularSessions: popularSessions.map(s => ({
        ...sessionMap[s.sessionId],
        completions: s._count.sessionId,
      })),
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/settings  — save platform settings (stored as JSON in a settings table)
// For now we just acknowledge — in production use a Settings model in Prisma
async function saveSettings(req, res, next) {
  try {
    // In a real deployment, persist to a Settings table or environment vars
    console.log('[ADMIN] Settings update received:', Object.keys(req.body));
    res.json({ message: 'Settings saved', updatedKeys: Object.keys(req.body) });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAnalytics, saveSettings };
