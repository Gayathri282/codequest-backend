// backend/src/controllers/editor.controller.js
const { Session, EditorDraft } = require('../config/db');

function isFilesArray(files) {
  return Array.isArray(files) && 
    files.length > 0 &&
    files.every(f =>
      f &&
      typeof f === 'object' &&
      typeof f.name === 'string' &&
      (typeof f.content === 'string' || f.content === null || f.content === undefined)
    );
}

async function assertSessionAccess({ sessionId, user }) {
  // editor_controller.js — assertSessionAccess
const session = await Session
  .findById(sessionId)    // ← _id is the string "bfw-s1"
  .select('_id courseId order');

  if (!session) return { error: { status: 404, body: { error: 'Session not found' } } };

  if (session.order > 4 && user.plan === 'FREE' && user.role !== 'ADMIN') {
    return { error: { status: 403, body: { error: 'Upgrade to Premium to unlock this lesson! 🔒' } } };
  }

  return { session };
}

// GET /api/editor/draft/:sessionId?inherit=1
async function getDraft(req, res, next) {
  try {
    const sessionId = req.params.sessionId;
    const inherit   = req.query.inherit === '1' || req.query.inherit === 'true';

    const { session, error } = await assertSessionAccess({ sessionId, user: req.user });
    if (error) return res.status(error.status).json(error.body);

    const userId = req.user.id;

    const own = await EditorDraft
      .findOne({ userId, sessionId })
      .select('files updatedAt sessionId');

    if (own) {
      return res.json({
        files: own.files,
        updatedAt: own.updatedAt,
        sourceSessionId: own.sessionId,
        inheritedFromSessionId: null,
      });
    }

    if (!inherit) return res.json({ files: null, inheritedFromSessionId: null });

    // Inherit from the most recent prior session in the same course where this user has a draft
    const prevSessions = await Session
      .find({ courseId: session.courseId, order: { $lt: session.order } })
      .select('_id order')
      .sort({ order: -1 })
      .limit(30);

    if (!prevSessions.length) return res.json({ files: null, inheritedFromSessionId: null });

    const prevIds = prevSessions.map(s => s._id);
    const drafts  = await EditorDraft
      .find({ userId, sessionId: { $in: prevIds } })
      .select('files updatedAt sessionId');

    if (!drafts.length) return res.json({ files: null, inheritedFromSessionId: null });

    const orderById = new Map(prevSessions.map(s => [s._id.toString(), s.order]));
    drafts.sort(
      (a, b) =>
        (orderById.get(b.sessionId.toString()) || 0) -
        (orderById.get(a.sessionId.toString()) || 0)
    );
    const best = drafts[0];

    return res.json({
      files: best.files,
      updatedAt: best.updatedAt,
      sourceSessionId: best.sessionId,
      inheritedFromSessionId: best.sessionId,
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/editor/draft/:sessionId  { files: [{name,content}, ...] }
async function putDraft(req, res, next) {
  try {
    const sessionId   = req.params.sessionId;
    const { files }   = req.body || {};

    if (!isFilesArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'files must be a non-empty array of { name, content }' });
    }

    const { session, error } = await assertSessionAccess({ sessionId, user: req.user });
    if (error) return res.status(error.status).json(error.body);

    const userId = req.user.id;
      const normalized = files.map(f => ({
      name: f.name,
      content: f.content ?? '',
    }));

    const draft = await EditorDraft.findOneAndUpdate(
      { userId, sessionId },
      { userId, sessionId, courseId: session.courseId, files: normalized },
      { upsert: true, new: true, setDefaultsOnInsert: true }
).select('sessionId updatedAt');

    res.json({ ok: true, sessionId: draft.sessionId, updatedAt: draft.updatedAt });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/editor/draft/:sessionId
async function deleteDraft(req, res, next) {
  try {
    const sessionId = req.params.sessionId;
    const userId    = req.user.id;

    await EditorDraft.findOneAndDelete({ userId, sessionId });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDraft, putDraft, deleteDraft };