// backend/src/services/video.service.js
// Bunny.net Stream API integration
// Docs: https://docs.bunny.net/reference/stream-api

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const BUNNY_API_KEY    = process.env.BUNNY_API_KEY;
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;
const BUNNY_CDN_URL    = process.env.BUNNY_CDN_URL;  // e.g. https://codequest.b-cdn.net

/**
 * Create a new video entry in Bunny Stream and get the upload URL.
 * The frontend (or admin tool) then PUT uploads directly to Bunny.
 *
 * @param {string} title - Video title (shown in Bunny dashboard)
 * @returns {{ videoId, uploadUrl, embedUrl }}
 */
async function createVideoEntry(title) {
  const body = JSON.stringify({ title });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'video.bunnycdn.com',
      path: `/library/${BUNNY_LIBRARY_ID}/videos`,
      method: 'POST',
      headers: {
        'AccessKey':     BUNNY_API_KEY,
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (!json.guid) return reject(new Error('Bunny create video failed: ' + data));
          resolve({
            videoId:   json.guid,
            uploadUrl: `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${json.guid}`,
            embedUrl:  `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${json.guid}`,
          });
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * Upload a video file to Bunny from the server filesystem.
 * For large uploads, Bunny recommends direct browser upload via TUS.
 *
 * @param {string} videoId   - Bunny video GUID
 * @param {string} filePath  - Absolute path to the video file on disk
 */
async function uploadVideoFile(videoId, filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const fileSize   = fs.statSync(filePath).size;

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'video.bunnycdn.com',
      path: `/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
      method: 'PUT',
      headers: {
        'AccessKey':      BUNNY_API_KEY,
        'Content-Type':   'application/octet-stream',
        'Content-Length': fileSize,
      },
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ success: true, videoId });
        } else {
          reject(new Error(`Bunny upload failed (${res.statusCode}): ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(fileBuffer);
    req.end();
  });
}

/**
 * Delete a video from Bunny Stream.
 */
async function deleteVideo(videoId) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'video.bunnycdn.com',
      path: `/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
      method: 'DELETE',
      headers: { 'AccessKey': BUNNY_API_KEY },
    }, res => {
      res.resume();
      res.on('end', () => resolve({ deleted: videoId }));
    });
    req.on('error', reject);
    req.end();
  });
}

/**
 * Get embed URL for a Bunny videoId.
 * Use this when you already have the videoId stored in the DB.
 */
function getEmbedUrl(videoId) {
  return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}`;
}

module.exports = { createVideoEntry, uploadVideoFile, deleteVideo, getEmbedUrl };
