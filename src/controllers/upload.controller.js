// backend/src/controllers/upload.controller.js
// Handles file uploads to Supabase Storage (thumbnails, documents)
// Videos go directly to Bunny.net via video.service.js

const { v4: uuidv4 } = require('uuid');
const path           = require('path');
const supabase       = require('../config/supabase');
const prisma         = require('../config/db');

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'codequest-assets';

// POST /api/upload/thumbnail  — session thumbnail image
// Body: multipart form with field 'file'
async function uploadThumbnail(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    const ext      = path.extname(req.file.originalname).toLowerCase();
    const fileName = `thumbnails/${uuidv4()}${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) throw new Error(error.message);

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    res.json({ url: publicUrl, path: fileName });
  } catch (err) {
    next(err);
  }
}

// POST /api/upload/document  — lesson reading material (PDF/MD)
async function uploadDocument(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    const ext      = path.extname(req.file.originalname).toLowerCase();
    const fileName = `documents/${uuidv4()}${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) throw new Error(error.message);

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    res.json({ url: publicUrl, path: fileName });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/upload  — remove a file from Supabase Storage
async function deleteFile(req, res, next) {
  try {
    const { filePath } = req.body;
    if (!filePath) return res.status(400).json({ error: 'filePath required' });

    const { error } = await supabase.storage.from(BUCKET).remove([filePath]);
    if (error) throw new Error(error.message);

    res.json({ message: 'File deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadThumbnail, uploadDocument, deleteFile };
