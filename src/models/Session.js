const mongoose = require('mongoose');
const sessionSchema = new mongoose.Schema(
  {
    _id:         { type: String },
    courseId:    { type: String, required: true },
    title:       { type: String, required: true },
    slug:        { type: String },          // ← remove required:true
    type:        { type: String, enum: ['VIDEO', 'DOCUMENT', 'QUIZ', 'CODE', 'BOSS', 'LESSON', 'IDE'], default: 'VIDEO' },
    order:       { type: Number, required: true },
    videoUrl:    { type: String },
    videoThumb:  { type: String },
    content:     { type: String },
    durationMins:{ type: Number },
    hasIde:      { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    isPro:       { type: Boolean, default: false },
    missionText: { type: String },
    starterCode: { type: String },
    solutionCode:{ type: String },
    xpReward:    { type: Number, default: 50 },
    coinsReward: { type: Number, default: 10 },
  },
  // In src/models/Session.js — replace schema options:
{
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = String(doc._id);
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = String(doc._id);
      return ret;
    }
  }
}
);
// Add this before module.exports in Session.js
sessionSchema.virtual('quizQuestions', {
  ref:          'QuizQuestion',
  localField:   '_id',
  foreignField: 'sessionId',
});

module.exports = mongoose.model('Session', sessionSchema);