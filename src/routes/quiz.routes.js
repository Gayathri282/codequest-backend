// backend/src/routes/quiz.routes.js
const router = require('express').Router();
const prisma = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');


// GET /api/quiz/:sessionId  — fetch questions (locked if already completed)
router.get('/:sessionId', requireAuth, async (req, res, next) => {
  try {
    // Plan gate — check session order
    const session = await prisma.session.findUnique({ where: { id: req.params.sessionId }, select: { order: true } });
    if (session && session.order > 4 && req.user.plan === 'FREE' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Upgrade to Premium to unlock this lesson! 🔒' });
    }

    // Lock quiz after first attempt — check progress record
    const existing = await prisma.progress.findUnique({
      where: { userId_sessionId: { userId: req.user.id, sessionId: req.params.sessionId } }
    });
    if (existing?.completed) {
      return res.json({ alreadyCompleted: true, stars: existing.stars ?? 0 });
    }

    const questions = await prisma.quizQuestion.findMany({
      where: { sessionId: req.params.sessionId },
      orderBy: { order: 'asc' },
      // Never expose correctAnswer to frontend before submission
      select: { id: true, question: true, emoji: true, optionA: true, optionB: true, optionC: true, optionD: true, order: true }
    });
    res.json(questions);
  } catch (err) { next(err); }
});

// POST /api/quiz/:sessionId/submit  — evaluate answers
router.post('/:sessionId/submit', requireAuth, async (req, res, next) => {
  try {
    const { answers } = req.body; // { questionId: "A"|"B"|"C"|"D" }
    const sessionMeta = await prisma.session.findUnique({ where: { id: req.params.sessionId }, select: { order: true } });
    if (sessionMeta && sessionMeta.order > 4 && req.user.plan === 'FREE' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Upgrade to Premium to unlock this lesson! 🔒' });
    }
    const questions = await prisma.quizQuestion.findMany({
      where: { sessionId: req.params.sessionId }
    });

    let correct = 0;
    const results = questions.map(q => {
      const chosen = answers[q.id];
      const isCorrect = chosen === q.correctAnswer;
      if (isCorrect) correct++;
      return { questionId: q.id, chosen, correct: isCorrect, explanation: q.explanation };
    });

    const stars = correct === questions.length ? 3 : correct >= questions.length * 0.7 ? 2 : correct > 0 ? 1 : 0;
    res.json({ correct, total: questions.length, stars, results });
  } catch (err) { next(err); }
});

// POST /api/quiz/question  — add question (admin)
router.post('/question', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const q = await prisma.quizQuestion.create({ data: req.body });
    res.status(201).json(q);
  } catch (err) { next(err); }
});

// PATCH /api/quiz/question/:id  (admin)
router.patch('/question/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const q = await prisma.quizQuestion.update({ where: { id: req.params.id }, data: req.body });
    res.json(q);
  } catch (err) { next(err); }
});

// DELETE /api/quiz/question/:id  (admin)
router.delete('/question/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await prisma.quizQuestion.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

module.exports = router;

