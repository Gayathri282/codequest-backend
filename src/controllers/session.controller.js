// backend/src/controllers/session.controller.js
const { Session } = require('../config/db');

// GET /api/sessions/:id  — single session with quiz questions
async function getSession(req, res, next) {
  try {
    // session_controller.js — getSession
const session = await Session
  .findById(req.params.id)
  .populate({ path: 'quizQuestions', options: { sort: { order: 1 } } });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // FREE plan can only access the first 4 sessions
    if (session.order > 4 && req.user.plan === 'FREE' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Upgrade to Premium to unlock this lesson! 🔒' });
    }

    const sessionObj = session.toObject();

    // Never send admin-only solution code to students
    if (req.user.role !== 'ADMIN') delete sessionObj.solutionCode;

    res.json(sessionObj);
  } catch (err) {
    next(err);
  }
}

// POST /api/sessions  (admin)
const { v4: uuidv4 } = require('uuid'); // npm install uuid if not already installed

async function createSession(req, res, next) {
  try {
    const {
      courseId, title, type, order, xpReward, coinsReward,
      durationMins, videoUrl, videoThumb, hasIde, missionText,
      docContent, starterCode, solutionCode
    } = req.body;

    // Auto-generate a slug-style _id from courseId + order
    const _id = `${courseId}-s${order || Date.now()}`;

    const session = await Session.create({
      _id,
      courseId, title, type, order: order || 0,
      xpReward: xpReward || 50, coinsReward: coinsReward || 5,
      durationMins: durationMins || 5,
      videoUrl, videoThumb, hasIde: hasIde || false, missionText,
      docContent, starterCode, solutionCode,
    });
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/sessions/:id  (admin)
async function updateSession(req, res, next) {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/sessions/:id  (admin)
async function deleteSession(req, res, next) {
  try {
    await Session.findByIdAndDelete(req.params.id);
    res.json({ message: 'Session deleted' });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/sessions/reorder  (admin) — bulk reorder
async function reorderSessions(req, res, next) {
  try {
    // body: [{ id, order }, ...]
    const updates = req.body;
    await Promise.all(
      updates.map(({ id, order }) =>
        Session.findByIdAndUpdate(id, { order })
      )
    );
    res.json({ message: 'Reordered' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSession, createSession, updateSession, deleteSession, reorderSessions };