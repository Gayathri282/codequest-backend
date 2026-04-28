// backend/src/routes/editor.routes.js
const router = require('express').Router();
const c = require('../controllers/editor.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/draft/:sessionId', requireAuth, c.getDraft);
router.put('/draft/:sessionId', requireAuth, c.putDraft);
router.delete('/draft/:sessionId', requireAuth, c.deleteDraft);

module.exports = router;

