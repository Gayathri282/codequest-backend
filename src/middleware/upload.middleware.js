// backend/src/middleware/upload.middleware.js
// Multer config for thumbnail / document uploads (stored in MongoDB GridFS)
const multer  = require('multer');
const path    = require('path');

const IMAGE_TYPES = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const DOC_TYPES   = ['.pdf', '.md', '.txt'];
const VIDEO_TYPES = ['.mp4', '.mov', '.webm', '.avi', '.mkv'];

function makeUploader(allowed, maxMB = 10) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxMB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowed.includes(ext)) cb(null, true);
      else cb(new Error(`File type not allowed. Allowed: ${allowed.join(', ')}`));
    },
  });
}

const uploadImage = makeUploader(IMAGE_TYPES, 5);   // 5 MB
const uploadDoc   = makeUploader(DOC_TYPES,   20);  // 20 MB
const uploadVideo = makeUploader(VIDEO_TYPES, 2048); // 2 GB

module.exports = { uploadImage, uploadDoc, uploadVideo };
