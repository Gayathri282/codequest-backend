// backend/src/routes/session.routes.js
const router = require('express').Router();
const c = require('../controllers/session.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');

router.get('/:id',           requireAuth, c.getSession);
router.post('/',             requireAuth, requireAdmin, c.createSession);
router.patch('/:id',         requireAuth, requireAdmin, c.updateSession);
router.delete('/:id',        requireAuth, requireAdmin, c.deleteSession);
router.patch('/reorder/bulk',requireAuth, requireAdmin, c.reorderSessions);

module.exports = router;
