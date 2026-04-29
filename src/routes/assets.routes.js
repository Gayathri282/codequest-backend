// backend/src/routes/assets.routes.js
// Handles image uploads for course sessions (starter code image assets)
// Uploads to Bunny.net Storage — same account you use for videos

const router  = require('express').Router();
const multer  = require('multer');
const axios   = require('axios');
const path    = require('path');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');

// ── Multer: keep file in memory (same approach as thumbnail upload) ──
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max per image
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed (jpg, png, gif, svg, webp)'));
    }
  },
});

/**
 * POST /api/assets/upload-image
 * Admin only. Uploads one image to Bunny.net Storage, returns { url, name }.
 *
 * Frontend sends:   FormData with field "image"
 * Frontend expects: { url: "https://...", name: "original-filename.jpg" }
 */
router.post('/upload-image', requireAuth, requireAdmin, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { originalname, buffer, mimetype } = req.file;

    // Sanitize filename — no spaces or special chars
    const timestamp = Date.now();
    const safeName  = `${timestamp}-${originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const folder    = 'course-images';

    // ── Bunny.net Storage credentials (from your .env) ──
    const storageZone   = process.env.BUNNY_STORAGE_ZONE;       // e.g. "codequest-assets"
    const storageApiKey = process.env.BUNNY_STORAGE_API_KEY;    // Storage Zone password
    const storageRegion = process.env.BUNNY_STORAGE_REGION || 'storage'; // 'storage' or 'ny.storage' etc.
    const cdnHostname   = process.env.BUNNY_CDN_HOSTNAME;       // e.g. "codequest-assets.b-cdn.net"

    if (!storageZone || !storageApiKey || !cdnHostname) {
      return res.status(500).json({ error: 'Bunny.net storage not configured — check BUNNY_STORAGE_ZONE, BUNNY_STORAGE_API_KEY, BUNNY_CDN_HOSTNAME in .env' });
    }

    // Upload to Bunny Storage
    await axios.put(
      `https://${storageRegion}.bunnycdn.com/${storageZone}/${folder}/${safeName}`,
      buffer,
      {
        headers: {
          'AccessKey':      storageApiKey,
          'Content-Type':   mimetype,
          'Content-Length': buffer.length,
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );

    // CDN delivery URL
    const url = `https://${cdnHostname}/${folder}/${safeName}`;

    return res.json({
      url,                      // full CDN URL  →  stored in session.imageAssets[].url
      name: originalname,       // original filename  →  used as <img src="filename.jpg"> in student editor
    });

  } catch (err) {
    // Bunny returns error details in err.response.data
    console.error('Image upload error:', err.response?.data || err.message);
    next(err);
  }
});

module.exports = router;