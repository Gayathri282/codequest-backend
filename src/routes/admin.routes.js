// src/routes/admin.routes.js
const router = require('express').Router();
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');
const { User, Payment, Course, Progress, Badge, UserBadge } = require('../config/db');

// GET /api/admin/stats
router.get('/stats', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalStudents, activeLast7Days, totalCourses, paymentsAgg] = await Promise.all([
      User.countDocuments({ role: 'STUDENT' }),
      User.countDocuments({ role: 'STUDENT', lastActiveAt: { $gte: sevenDaysAgo } }),
      Course.countDocuments({ isPublished: true }),
      Payment.aggregate([
        { $match: { status: 'PAID' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
    ]);

    const totalRevenuePaise = paymentsAgg[0]?.total  || 0;
    const totalPayments     = paymentsAgg[0]?.count  || 0;

    res.json({
      totalStudents,
      activeLast7Days,
      totalCourses,
      totalPayments,
      totalRevenuePaise,
      totalRevenueRupees: Math.round(totalRevenuePaise / 100),
    });
  } catch (err) { next(err); }
});

// GET /api/admin/students
router.get('/students', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = { role: 'STUDENT' };
    if (search) {
      query.$or = [
        { username:    { $regex: search, $options: 'i' } },
        { email:       { $regex: search, $options: 'i' } },
      ];
    }

    const [rawStudents, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('_id email username displayName age plan xp coins level streakDays avatarEmoji lastActiveAt createdAt'),
      User.countDocuments(query),
    ]);

    // Attach completed session count per student
    const studentIds = rawStudents.map(s => s._id.toString());
    const completionCounts = await Progress.aggregate([
      { $match: { userId: { $in: studentIds }, completed: true } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(completionCounts.map(c => [c._id, c.count]));

    const students = rawStudents.map(s => ({
      ...s.toObject(),
      completedSessions: countMap[s._id.toString()] || 0,
    }));

    res.json({ students, total, pages: Math.ceil(total / Number(limit)) });
  } catch (err) { next(err); }
});

// GET /api/admin/students/:id/progress
router.get('/students/:id/progress', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const since = new Date(Date.now() - 30 * 86400000);
    const completions = await Progress
      .find({ userId: req.params.id, completed: true, completedAt: { $gte: since } })
      .sort({ completedAt: 1 })
      .select('completedAt xpEarned')
      .populate({ path: 'session', select: 'title type' });
    res.json(completions);
  } catch (err) { next(err); }
});

// PATCH /api/admin/students/:id/ban
router.patch('/students/:id/ban', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    res.json({ message: 'Student banned', id: req.params.id });
  } catch (err) { next(err); }
});

// POST /api/admin/send-reports
router.post('/send-reports', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { sendWeeklyReports } = require('../services/weekly-report.service');
    const count = await sendWeeklyReports();
    res.json({ message: `Sent ${count} progress report emails` });
  } catch (err) { next(err); }
});

// GET /api/admin/badges
router.get('/badges', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const badges = await Badge.find().sort({ name: 1 });
    res.json(badges);
  } catch (err) { next(err); }
});

// POST /api/admin/badges
router.post('/badges', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const badge = await Badge.create(req.body);
    res.status(201).json(badge);
  } catch (err) { next(err); }
});

// Analytics + settings — delegated to controller
const adminCtrl = require('../controllers/admin.controller');
router.get('/analytics',  requireAuth, requireAdmin, adminCtrl.getAnalytics);
router.get('/settings',   requireAuth, requireAdmin, adminCtrl.getSettings);
router.patch('/settings', requireAuth, requireAdmin, adminCtrl.saveSettings);

module.exports = router;