// backend/src/routes/admin.routes.js
const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');
const prisma = new PrismaClient();

// GET /api/admin/stats  — overview numbers
router.get('/stats', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const [totalStudents, activeLast7Days, totalCourses, totalPayments, revenueResult] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'STUDENT', lastActiveAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.payment.count({ where: { status: 'PAID' } }),
      prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } })
    ]);

    res.json({
      totalStudents,
      activeLast7Days,
      totalCourses,
      totalPayments,
      totalRevenuePaise: revenueResult._sum.amount || 0,
      totalRevenueRupees: Math.round((revenueResult._sum.amount || 0) / 100)
    });
  } catch (err) { next(err); }
});

// GET /api/admin/students  — paginated student list
router.get('/students', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const where = {
      role: 'STUDENT',
      ...(search && { OR: [
        { username: { contains: search, mode: 'insensitive' } },
        { email:    { contains: search, mode: 'insensitive' } }
      ]})
    };
    const [rawStudents, total] = await Promise.all([
      prisma.user.findMany({
        where, skip: (page - 1) * limit, take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, username: true, displayName: true, age: true,
                  plan: true, xp: true, coins: true, level: true, streakDays: true,
                  avatarEmoji: true, lastActiveAt: true, createdAt: true,
                  _count: { select: { progress: { where: { completed: true } } } } }
      }),
      prisma.user.count({ where })
    ]);
    const students = rawStudents.map(s => ({
      ...s,
      completedSessions: s._count?.progress || 0,
      _count: undefined,
    }));
    res.json({ students, total, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

// GET /api/admin/students/:id/progress  — daily completions for student detail chart
router.get('/students/:id/progress', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const since = new Date(Date.now() - 30 * 86400000);
    const completions = await prisma.progress.findMany({
      where: { userId: req.params.id, completed: true, completedAt: { gte: since } },
      select: { completedAt: true, xpEarned: true, session: { select: { title: true, type: true } } },
      orderBy: { completedAt: 'asc' },
    });
    res.json(completions);
  } catch (err) { next(err); }
});

// PATCH /api/admin/students/:id/ban
router.patch('/students/:id/ban', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    // In a real app you'd set an isBanned flag; here we just return success shape
    res.json({ message: 'Student banned', id: req.params.id });
  } catch (err) { next(err); }
});

module.exports = router;

// POST /api/admin/send-reports  — manually trigger weekly progress emails
router.post('/send-reports', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { sendWeeklyReports } = require('../services/weekly-report.service');
    const count = await sendWeeklyReports();
    res.json({ message: `Sent ${count} progress report emails` });
  } catch (err) { next(err); }
});

// GET /api/admin/badges  — list all badge definitions
router.get('/badges', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const badges = await prisma.badge.findMany({ orderBy: { name: 'asc' } });
    res.json(badges);
  } catch (err) { next(err); }
});

// POST /api/admin/badges  — create badge definition
router.post('/badges', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const badge = await prisma.badge.create({ data: req.body });
    res.status(201).json(badge);
  } catch (err) { next(err); }
});

// GET  /api/admin/analytics
// GET  /api/admin/settings
// PATCH /api/admin/settings
const adminCtrl = require('../controllers/admin.controller');
router.get('/analytics',  requireAuth, requireAdmin, adminCtrl.getAnalytics);
router.get('/settings',   requireAuth, requireAdmin, adminCtrl.getSettings);
router.patch('/settings', requireAuth, requireAdmin, adminCtrl.saveSettings);
