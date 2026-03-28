// backend/src/routes/auth.routes.js
const router = require('express').Router();
const { register, login, me, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/register',        register);
router.post('/login',           login);
router.get('/me',               requireAuth, me);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password',  resetPassword);

module.exports = router;
