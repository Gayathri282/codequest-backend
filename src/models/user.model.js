// src/models/user.model.js
const User = require('./User');

const PUBLIC_FIELDS = '_id email username displayName avatarEmoji age role plan xp coins level streakDays lastActiveAt createdAt';

async function findById(id) {
  return User.findById(id).select(PUBLIC_FIELDS).lean();
}

async function findByEmail(email) {
  // includes passwordHash — used only in auth controller
  return User.findOne({ email }).select('+passwordHash').lean();
}

async function updateStats(id, { xp, coins, level, streakDays, lastActiveAt }) {
  return User.findByIdAndUpdate(
    id,
    { xp, coins, level, streakDays, lastActiveAt },
    { new: true }
  ).select(PUBLIC_FIELDS).lean();
}

async function updatePlan(id, plan) {
  return User.findByIdAndUpdate(id, { plan }, { new: true }).select(PUBLIC_FIELDS).lean();
}

async function getLeaderboard(limit = 20) {
  return User.find({ role: 'STUDENT' })
    .sort({ xp: -1 })
    .limit(limit)
    .select('_id username displayName avatarEmoji xp level streakDays')
    .lean();
}

module.exports = { findById, findByEmail, updateStats, updatePlan, getLeaderboard };