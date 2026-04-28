// backend/src/controllers/editor.controller.js
const prisma = require('../config/db');

function isFilesArray(files) {
  return Array.isArray(files) && files.every(f =>
    f &&
    typeof f === 'object' &&
    typeof f.name === 'string' &&
    typeof f.content === 'string'
  );
}

async function assertSessionAccess({ sessionId, user }) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { id: true, courseId: true, order: true }
  });
  if (!session) return { error: { status: 404, body: { error: 'Session not found' } } };

  // Match the same FREE gating rule as GET /api/sessions/:id
  if (session.order > 4 && user.plan === 'FREE' && user.role !== 'ADMIN') {
    return { error: { status: 403, body: { error: 'Upgrade to Premium to unlock this lesson! 🔒' } } };
  }

  return { session };
}

// GET /api/editor/draft/:sessionId?inherit=1
async function getDraft(req, res, next) {
  try {
    const sessionId = req.params.sessionId;
    const inherit = req.query.inherit === '1' || req.query.inherit === 'true';

    const { session, error } = await assertSessionAccess({ sessionId, user: req.user });
    if (error) return res.status(error.status).json(error.body);

    const userId = req.user.id;

    const own = await prisma.editorDraft.findUnique({
      where: { userId_sessionId: { userId, sessionId } },
      select: { files: true, updatedAt: true, sessionId: true }
    });
    if (own) {
      return res.json({
        files: own.files,
        updatedAt: own.updatedAt,
        sourceSessionId: own.sessionId,
        inheritedFromSessionId: null
      });
    }

    if (!inherit) return res.json({ files: null, inheritedFromSessionId: null });

    // Inherit from the most recent prior session in the same course where this user has a draft.
    const prevSessions = await prisma.session.findMany({
      where: { courseId: session.courseId, order: { lt: session.order } },
      select: { id: true, order: true },
      orderBy: { order: 'desc' },
      take: 30
    });
    if (!prevSessions.length) return res.json({ files: null, inheritedFromSessionId: null });

    const prevIds = prevSessions.map(s => s.id);
    const drafts = await prisma.editorDraft.findMany({
      where: { userId, sessionId: { in: prevIds } },
      select: { files: true, updatedAt: true, sessionId: true }
    });
    if (!drafts.length) return res.json({ files: null, inheritedFromSessionId: null });

    const orderById = new Map(prevSessions.map(s => [s.id, s.order]));
    drafts.sort((a, b) => (orderById.get(b.sessionId) || 0) - (orderById.get(a.sessionId) || 0));
    const best = drafts[0];

    return res.json({
      files: best.files,
      updatedAt: best.updatedAt,
      sourceSessionId: best.sessionId,
      inheritedFromSessionId: best.sessionId
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/editor/draft/:sessionId  { files: [{name,content}, ...] }
async function putDraft(req, res, next) {
  try {
    const sessionId = req.params.sessionId;
    const { files } = req.body || {};

    if (!isFilesArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'files must be a non-empty array of { name, content }' });
    }

    const { session, error } = await assertSessionAccess({ sessionId, user: req.user });
    if (error) return res.status(error.status).json(error.body);

    const userId = req.user.id;

    const draft = await prisma.editorDraft.upsert({
      where: { userId_sessionId: { userId, sessionId } },
      create: { userId, sessionId, courseId: session.courseId, files },
      update: { courseId: session.courseId, files },
      select: { sessionId: true, updatedAt: true }
    });

    res.json({ ok: true, ...draft });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/editor/draft/:sessionId
async function deleteDraft(req, res, next) {
  try {
    const sessionId = req.params.sessionId;
    const userId = req.user.id;

    await prisma.editorDraft.delete({
      where: { userId_sessionId: { userId, sessionId } }
    });

    res.json({ ok: true });
  } catch (err) {
    // Prisma throws if record not found; treat as ok for idempotency
    if (err.code === 'P2025') return res.json({ ok: true });
    next(err);
  }
}

module.exports = { getDraft, putDraft, deleteDraft };
