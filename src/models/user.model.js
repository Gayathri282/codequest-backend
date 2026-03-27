// backend/src/models/user.model.js
// Reusable DB query helpers for the User table
const prisma = require('../config/db');

const PUBLIC_FIELDS = {
  id: true, email: true, username: true, displayName: true,
  avatarEmoji: true, age: true, role: true, plan: true,
  xp: true, coins: true, level: true, streakDays: true,
  lastActiveAt: true, createdAt: true,
};

async function findById(id) {
  return prisma.user.findUnique({ where: { id }, select: PUBLIC_FIELDS });
}

async function findByEmail(email) {
  // includes passwordHash — used only in auth controller
  return prisma.user.findUnique({ where: { email } });
}

async function updateStats(id, { xp, coins, level, streakDays, lastActiveAt }) {
  return prisma.user.update({
    where: { id },
    data: { xp, coins, level, streakDays, lastActiveAt },
    select: PUBLIC_FIELDS,
  });
}

async function updatePlan(id, plan) {
  return prisma.user.update({ where: { id }, data: { plan }, select: PUBLIC_FIELDS });
}

async function getLeaderboard(limit = 20) {
  return prisma.user.findMany({
    where: { role: 'STUDENT' },
    orderBy: { xp: 'desc' },
    take: limit,
    select: { id: true, username: true, displayName: true, avatarEmoji: true, xp: true, level: true, streakDays: true },
  });
}

module.exports = { findById, findByEmail, updateStats, updatePlan, getLeaderboard };
