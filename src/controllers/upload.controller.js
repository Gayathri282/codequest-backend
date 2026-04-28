const path = require('path');
const { finished } = require('stream/promises');
const { v4: uuidv4 } = require('uuid');
const { getMongoDb, getUploadBucket, toObjectId, uploadBucketName } = require('../config/mongodb');

function buildPublicFileUrl(req, fileId) {
  const configured = process.env.BACKEND_URL;
  const baseUrl = configured ? configured.replace(/\/$/, '') : `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/api/upload/files/${fileId}`;
}

async function uploadToGridFs(req, folder) {
  if (!req.file) {
    const err = new Error('No file provided');
    err.status = 400;
    throw err;
  }

  const ext = path.extname(req.file.originalname).toLowerCase();
  const fileName = `${folder}/${uuidv4()}${ext}`;
  const bucket = await getUploadBucket();

  const uploadStream = bucket.openUploadStream(fileName, {
    contentType: req.file.mimetype,
    metadata: {
      folder,
      originalName: req.file.originalname,
      uploadedAt: new Date(),
    },
  });

  uploadStream.end(req.file.buffer);
  await finished(uploadStream);

  const fileId = uploadStream.id.toString();
  return {
    fileId,
    fileName,
  };
}

async function uploadThumbnail(req, res, next) {
  try {
    const { fileId, fileName } = await uploadToGridFs(req, 'thumbnails');
    res.json({
      url: buildPublicFileUrl(req, fileId),
      path: fileId,
      fileId,
      fileName,
    });
  } catch (err) {
    next(err);
  }
}

async function uploadDocument(req, res, next) {
  try {
    const { fileId, fileName } = await uploadToGridFs(req, 'documents');
    res.json({
      url: buildPublicFileUrl(req, fileId),
      path: fileId,
      fileId,
      fileName,
    });
  } catch (err) {
    next(err);
  }
}

function parseIncomingFileId(value) {
  if (!value) return null;

  const text = String(value).trim();
  if (!text) return null;

  if (text.includes('/api/upload/files/')) {
    return text.split('/api/upload/files/')[1].split('?')[0].trim();
  }

  return text;
}

async function deleteFile(req, res, next) {
  try {
    const rawFileId = req.body.fileId || req.body.filePath || req.body.path || req.body.id;
    const fileId = parseIncomingFileId(rawFileId);

    if (!fileId) {
      return res.status(400).json({ error: 'fileId or filePath required' });
    }

    const objectId = toObjectId(fileId);
    if (!objectId) {
      return res.status(400).json({ error: 'Invalid file id' });
    }

    const db = await getMongoDb();
    const filesCollection = db.collection(`${uploadBucketName}.files`);
    const existing = await filesCollection.findOne({ _id: objectId });

    if (!existing) {
      return res.status(404).json({ error: 'File not found' });
    }

    const bucket = await getUploadBucket();
    await bucket.delete(objectId);

    res.json({ message: 'File deleted' });
  } catch (err) {
    next(err);
  }
}

async function streamFile(req, res, next) {
  try {
    const objectId = toObjectId(req.params.id);
    if (!objectId) {
      return res.status(400).json({ error: 'Invalid file id' });
    }

    const db = await getMongoDb();
    const fileDoc = await db.collection(`${uploadBucketName}.files`).findOne({ _id: objectId });
    if (!fileDoc) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.setHeader('Content-Type', fileDoc.contentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileDoc.filename)}"`);

    const bucket = await getUploadBucket();
    const readStream = bucket.openDownloadStream(objectId);
    readStream.on('error', next);
    readStream.pipe(res);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadThumbnail,
  uploadDocument,
  deleteFile,
  streamFile,
};
