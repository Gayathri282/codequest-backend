// src/models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title:           { type: String, required: true },
    slug:            { type: String, required: true, unique: true },
    emoji:           { type: String },
    description:     { type: String },
    color:           { type: String, default: '#00C8E8' },
    subject:         { type: String },
    ageGroup:        { type: String, default: '5-13' },
    order:           { type: Number, default: 0 },
    isPublished:     { type: Boolean, default: false },
    isLocked:        { type: Boolean, default: true },
    unlocksAfter:    { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    totalXp:         { type: Number, default: 0 },
    freeSessionCount:{ type: Number, default: 4 },
    coverImage:      { type: String },
    isPro:           { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual populate — lets .populate('sessions') work in the controller
courseSchema.virtual('sessions', {
  ref:         'Session',
  localField:  '_id',
  foreignField: 'courseId',
});

module.exports = mongoose.model('Course', courseSchema);