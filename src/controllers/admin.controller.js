// backend/src/controllers/admin.controller.js
// Platform-wide admin actions: settings save, bulk operations, analytics
const { User, Progress, Payment, Session, Setting } = require('../config/db');

// GET /api/admin/analytics  — richer analytics beyond basic stats
async function getAnalytics(req, res, next) {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - Number(days) * 86400000);

    // New students per day (last N days)
    const newStudents = await User.aggregate([
      { $match: { role: 'STUDENT', createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Completions per day
    const completions = await Progress.aggregate([
      { $match: { completed: true, completedAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Revenue by plan
    const revenueData = await Payment.aggregate([
      { $match: { status: 'PAID' } },
      {
        $group: {
          _id:     '$plan',
          revenue: { $sum: '$amount' },
          count:   { $sum: 1 },
        },
      },
    ]);

    // Top 5 most-completed sessions
    const popularSessions = await Progress.aggregate([
      { $match: { completed: true } },
      { $group: { _id: '$sessionId', completions: { $sum: 1 } } },
      { $sort: { completions: -1 } },
      { $limit: 5 },
    ]);

    // Enrich with session titles
    const sessionIds = popularSessions.map(s => s._id);
    const sessions   = await Session.find({ _id: { $in: sessionIds } }).select('_id title type');
    const sessionMap = Object.fromEntries(sessions.map(s => [s._id.toString(), s]));

    res.json({
      newStudents,
      completions,
      revenueByPlan: revenueData.map(r => ({
        plan:    r._id,
        revenue: r.revenue || 0,
        count:   r.count,
      })),
      popularSessions: popularSessions.map(s => ({
        ...sessionMap[s._id.toString()]?.toObject(),
        completions: s.completions,
      })),
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/settings
async function getSettings(req, res, next) {
  try {
    const rows     = await Setting.find();
    const settings = Object.fromEntries(rows.map(r => [r.key, r.value]));
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/settings  — upsert key-value pairs into the settings collection
async function saveSettings(req, res, next) {
  try {
    const entries = Object.entries(req.body);
    await Promise.all(
      entries.map(([key, value]) =>
        Setting.findOneAndUpdate(
          { key },
          { key, value: String(value) },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
      )
    );
    res.json({ message: 'Settings saved', updatedKeys: entries.map(([k]) => k) });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAnalytics, getSettings, saveSettings };