// src/routes/quiz.routes.js
const router = require('express').Router();
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');
const { Session, Progress, QuizQuestion } = require('../config/db');

// GET /api/quiz/:sessionId
router.get('/:sessionId', requireAuth, async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.sessionId).select('order');
    if (session && session.order > 4 && req.user.plan === 'FREE' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Upgrade to Premium to unlock this lesson! 🔒' });
    }

    const existing = await Progress.findOne({
      userId: req.user.id,
      sessionId: req.params.sessionId,
    }).select('completed stars');

    if (existing?.completed) {
      return res.json({ alreadyCompleted: true, stars: existing.stars ?? 0 });
    }

    const questions = await QuizQuestion
      .find({ sessionId: req.params.sessionId })
      .sort({ order: 1 })
      .select('_id question emoji optionA optionB optionC optionD order');

    // Explicitly add id field so frontend can key answers correctly
    res.json(questions.map(q => ({ ...q.toObject(), id: q._id.toString() })));
  } catch (err) { next(err); }
});

// POST /api/quiz/:sessionId/submit
router.post('/:sessionId/submit', requireAuth, async (req, res, next) => {
  try {
    const { answers } = req.body;

    const session = await Session.findById(req.params.sessionId).select('order');
    if (session && session.order > 4 && req.user.plan === 'FREE' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Upgrade to Premium to unlock this lesson! 🔒' });
    }

    const questions = await QuizQuestion.find({ sessionId: req.params.sessionId });

    let correct = 0;
    const results = questions.map(q => {
      const qid = q._id.toString();
      // answers may be keyed by _id string or id string
      const chosen = answers[qid] ?? answers[q.id] ?? null;
      const isCorrect = chosen === q.correctAnswer;
      if (isCorrect) correct++;
      return { questionId: qid, chosen, correct: isCorrect, explanation: q.explanation };
    });

    const total = questions.length;
    const stars = correct === total ? 3 : correct >= total * 0.7 ? 2 : correct > 0 ? 1 : 0;
    res.json({ correct, total, stars, results });
  } catch (err) { next(err); }
});

// POST /api/quiz/question  (admin)
router.post('/question', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const q = await QuizQuestion.create(req.body);
    res.status(201).json(q);
  } catch (err) { next(err); }
});

// PATCH /api/quiz/question/:id  (admin)
router.patch('/question/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const q = await QuizQuestion.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!q) return res.status(404).json({ error: 'Question not found' });
    res.json(q);
  } catch (err) { next(err); }
});

// DELETE /api/quiz/question/:id  (admin)
router.delete('/question/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await QuizQuestion.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

module.exports = router;