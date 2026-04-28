// src/models/Progress.js
const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    sessionId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    completed:   { type: Boolean, default: false },
    completedAt: { type: Date },
    xpEarned:    { type: Number, default: 0 },
    coinsEarned: { type: Number, default: 0 },
    stars:       { type: Number, default: 0, min: 0, max: 3 },
    courseId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },

    // video watch tracking
    videoExitSeconds: { type: Number, default: null },
    videoMaxSeconds:  { type: Number, default: null },
    videoDuration:    { type: Number, default: null },
  },
  { timestamps: true }
);

// one record per user per session
progressSchema.index({ userId: 1, sessionId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);