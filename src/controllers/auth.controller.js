// backend/src/controllers/auth.controller.js
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const crypto     = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { User } = require('../config/db');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/email.service');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { email, password, username, displayName, age } = req.body;

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      email,
      passwordHash,
      username,
      displayName,
      age: age ? parseInt(age) : null,
      role: 'STUDENT',
      plan: 'FREE',
    });

    await sendWelcomeEmail({ to: email, name: displayName || username });

    const token = signToken(user._id);
    res.status(201).json({
      token,
      isNew: true,
      user: {
        id: user._id, email: user.email, username: user.username,
        displayName: user.displayName, avatarEmoji: user.avatarEmoji,
        role: user.role, plan: user.plan
      }
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'No account found with that email.' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Incorrect password.' });

    await User.findByIdAndUpdate(user._id, { lastActiveAt: new Date() });

    const token = signToken(user._id);
    res.json({
      token,
      user: {
        id: user._id, email: user.email, username: user.username,
        displayName: user.displayName, avatarEmoji: user.avatarEmoji,
        role: user.role, plan: user.plan, xp: user.xp,
        coins: user.coins, level: user.level, streakDays: user.streakDays
      }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function me(req, res, next) {
  try {
    const user = await User
      .findById(req.user.id)
      .select('id email username displayName avatarEmoji age role plan xp coins level streakDays lastActiveAt createdAt')
      .populate({ path: 'earnedBadges', populate: { path: 'badge' } });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/forgot-password
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: 'No account found with that email.' });

    const token  = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await User.findByIdAndUpdate(user._id, { resetToken: token, resetTokenExpiry: expiry });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendPasswordResetEmail({ to: email, name: user.displayName || user.username, resetUrl });

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/reset-password
async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ error: 'Reset link is invalid or has expired.' });

    const passwordHash = await bcrypt.hash(password, 12);

    await User.findByIdAndUpdate(user._id, {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    });

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/google
async function googleAuth(req, res, next) {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Google credential required' });

    const ticket = await googleClient.verifyIdToken({
      idToken:  credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let isNew = false;
    let user = await User.findOne({ email });

    if (!user) {
      isNew = true;
      const base = email.split('@')[0].replace(/[^a-z0-9]/gi, '').slice(0, 16).toLowerCase();
      let username = base;
      let suffix = 1;
      while (await User.findOne({ username })) {
        username = `${base}${suffix++}`;
      }

      user = await User.create({
        email,
        passwordHash: await bcrypt.hash(googleId + process.env.JWT_SECRET, 10),
        username,
        displayName: name || username,
        role: 'STUDENT',
        plan: 'FREE',
      });
      await sendWelcomeEmail({ to: email, name: name || username }).catch(() => {});
    }

    await User.findByIdAndUpdate(user._id, { lastActiveAt: new Date() });

    const token = signToken(user._id);
    res.json({
      token,
      isNew,
      user: {
        id: user._id, email: user.email, username: user.username,
        displayName: user.displayName, avatarEmoji: user.avatarEmoji,
        role: user.role, plan: user.plan, xp: user.xp,
        coins: user.coins, level: user.level, streakDays: user.streakDays
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me, forgotPassword, resetPassword, googleAuth };