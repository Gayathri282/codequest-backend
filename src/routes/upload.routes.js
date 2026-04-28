const router = require('express').Router();
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');
const { uploadImage, uploadDoc } = require('../middleware/upload.middleware');
const { uploadThumbnail, uploadDocument, deleteFile, streamFile } = require('../controllers/upload.controller');

// Public file delivery for uploaded assets
router.get('/files/:id', streamFile);

// Admin-only upload management
router.post('/thumbnail', requireAuth, requireAdmin, uploadImage.single('file'), uploadThumbnail);
router.post('/document', requireAuth, requireAdmin, uploadDoc.single('file'), uploadDocument);
router.delete('/', requireAuth, requireAdmin, deleteFile);

module.exports = router;
