const router = require('express').Router();
const c = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/register',        c.register);
router.post('/login',           c.login);
router.get('/me',               requireAuth, c.me);
router.post('/forgot-password', c.forgotPassword);
router.post('/reset-password',  c.resetPassword);
router.post('/google',          c.googleAuth);

module.exports = router;