// src/models/Progress.js
const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    userId:      { type: String, required: true },
    sessionId:   { type: String, required: true },
    courseId:    { type: String },
    completed:   { type: Boolean, default: false },
    completedAt: { type: Date },
    xpEarned:    { type: Number, default: 0 },
    coinsEarned: { type: Number, default: 0 },
    stars:       { type: Number, default: 0, min: 0, max: 3 },
    videoExitSeconds: { type: Number, default: null },
    videoMaxSeconds:  { type: Number, default: null },
    videoDuration:    { type: Number, default: null },
  },
  { timestamps: true }
);

progressSchema.index({ userId: 1, sessionId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
