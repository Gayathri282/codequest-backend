// backend/src/routes/payment.routes.js
const router = require('express').Router();
const c = require('../controllers/payment.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');

// Raw body already set in index.js for this path
router.post('/webhook',        c.webhook);
router.post('/create-order',   requireAuth, c.createOrder);
router.post('/verify',         requireAuth, c.verifyPayment);
router.get('/history',         requireAuth, requireAdmin, c.getHistory);

module.exports = router;
