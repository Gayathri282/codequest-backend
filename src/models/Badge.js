// src/models/Badge.js
const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true },
    emoji:     { type: String, required: true },
    condition: { type: String, required: true, unique: true }, // e.g. "7_day_streak"
    description: { type: String },
  },
  { timestamps: true }
);

const userBadgeSchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
    badgeId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Badge', required: true },
    earnedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

const Badge     = mongoose.model('Badge',     badgeSchema);
const UserBadge = mongoose.model('UserBadge', userBadgeSchema);

module.exports = { Badge, UserBadge };