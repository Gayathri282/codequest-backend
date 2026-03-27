// backend/src/routes/progress.routes.js
const router = require('express').Router();
const c = require('../controllers/progress.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/complete',       requireAuth, c.completeSession);
router.get('/report/:userId',  requireAuth, c.getProgressReport);

module.exports = router;
