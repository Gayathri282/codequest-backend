// backend/src/routes/upload.routes.js
const router  = require('express').Router();
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');
const { uploadImage, uploadDoc }    = require('../middleware/upload.middleware');
const { uploadThumbnail, uploadDocument, deleteFile } = require('../controllers/upload.controller');

// All upload routes are admin-only
router.post('/thumbnail', requireAuth, requireAdmin, uploadImage.single('file'), uploadThumbnail);
router.post('/document',  requireAuth, requireAdmin, uploadDoc.single('file'),   uploadDocument);
router.delete('/',        requireAuth, requireAdmin, deleteFile);

module.exports = router;
