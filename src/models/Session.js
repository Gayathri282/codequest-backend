// src/models/Session.js  — a lesson/quiz session inside a Course
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    courseId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title:       { type: String, required: true },
    slug:        { type: String, required: true, unique: true }, // e.g. "bfw-s1"
    type:        { type: String, enum: ['LESSON', 'QUIZ', 'IDE'], default: 'LESSON' },
    order:       { type: Number, required: true },

    // content
    videoUrl:    { type: String },   // Bunny embed URL
    videoThumb:  { type: String },   // thumbnail image URL
    content:     { type: String },   // markdown body
    durationMins:{ type: Number },

    // features
    hasIde:      { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    isPro:       { type: Boolean, default: false },

    // rewards
    xpReward:    { type: Number, default: 50 },
    coinsReward: { type: Number, default: 10 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);