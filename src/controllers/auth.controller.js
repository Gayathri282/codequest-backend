// backend/src/controllers/auth.controller.js
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { sendWelcomeEmail } = require('../services/email.service');

const prisma = new PrismaClient();

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { email, password, username, displayName, age, parentEmail } = req.body;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        username,
        displayName,
        age: age ? parseInt(age) : null,
        role: 'STUDENT',
        plan: 'FREE',
      }
    });

    // Send welcome email
    await sendWelcomeEmail({ to: email, name: displayName || username });

    const token = signToken(user.id);
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, username: user.username, role: user.role, plan: user.plan }
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() }
    });

    const token = signToken(user.id);
    res.json({
      token,
      user: { id: user.id, email: user.email, username: user.username,
              role: user.role, plan: user.plan, xp: user.xp,
              coins: user.coins, level: user.level, streakDays: user.streakDays }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, email: true, username: true, displayName: true,
        avatarEmoji: true, age: true, role: true, plan: true,
        xp: true, coins: true, level: true, streakDays: true,
        lastActiveAt: true, createdAt: true,
        earnedBadges: { include: { badge: true } }
      }
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
