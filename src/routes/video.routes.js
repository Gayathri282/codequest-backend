// backend/src/routes/video.routes.js
// Admin-only routes for managing video uploads via Bunny.net

const router  = require('express').Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');
const { createVideoEntry, uploadVideoFile, deleteVideo, getEmbedUrl } = require('../services/video.service');

// Store uploads in /tmp — we stream to Bunny then delete locally
const upload = multer({
  dest: '/tmp/codequest-uploads/',
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2 GB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp4', '.mov', '.webm', '.avi', '.mkv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only video files allowed (.mp4, .mov, .webm, .avi, .mkv)'));
  },
});

/**
 * POST /api/video/create
 * Step 1: Create an empty video entry in Bunny, get back upload URL + embed URL.
 * Use this when the admin wants to upload directly from their browser via TUS/PUT.
 */
router.post('/create', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const entry = await createVideoEntry(title);
    // entry = { videoId, uploadUrl, embedUrl }
    res.json(entry);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/video/upload
 * Upload a video file directly from the admin panel (multipart form).
 * The file is temporarily saved, streamed to Bunny, then deleted.
 */
router.post('/upload', requireAuth, requireAdmin, upload.single('video'), async (req, res, next) => {
  const tmpPath = req.file?.path;
  try {
    if (!req.file) return res.status(400).json({ error: 'No video file provided' });
    const title = req.body.title || req.file.originalname;

    // 1. Create Bunny video entry
    const entry = await createVideoEntry(title);

    // 2. Upload file to Bunny
    await uploadVideoFile(entry.videoId, tmpPath);

    // 3. Clean up temp file
    fs.unlinkSync(tmpPath);

    res.json({
      videoId:  entry.videoId,
      embedUrl: entry.embedUrl,
      message:  'Video uploaded to Bunny.net successfully',
    });
  } catch (err) {
    // Clean up temp file on error
    if (tmpPath && fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    next(err);
  }
});

/**
 * DELETE /api/video/:videoId
 * Remove a video from Bunny Stream.
 */
router.delete('/:videoId', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const result = await deleteVideo(req.params.videoId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/video/embed/:videoId
 * Get the embed URL for a stored Bunny videoId.
 */
router.get('/embed/:videoId', requireAuth, (req, res) => {
  res.json({ embedUrl: getEmbedUrl(req.params.videoId) });
});

module.exports = router;
