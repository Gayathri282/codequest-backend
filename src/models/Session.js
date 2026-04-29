// backend/src/models/Session.js
const mongoose = require('mongoose');

// Image asset stored alongside a session's starter code
const imageAssetSchema = new mongoose.Schema({
  name: { type: String, required: true }, // original filename e.g. "cat.png"
  url:  { type: String, required: true }, // full CDN URL e.g. "https://cdn.b-cdn.net/course-images/123-cat.png"
  size: { type: Number },                 // file size in bytes (for display only)
}, { _id: false });

const sessionSchema = new mongoose.Schema(
  {
    _id:          { type: String },
    courseId:     { type: String, required: true },
    title:        { type: String, required: true },
    slug:         { type: String },
    type:         { type: String, enum: ['VIDEO', 'DOCUMENT', 'QUIZ', 'CODE', 'BOSS', 'LESSON', 'IDE'], default: 'VIDEO' },
    order:        { type: Number, required: true },
    videoUrl:     { type: String },
    videoThumb:   { type: String },
    content:      { type: String },
    durationMins: { type: Number },
    hasIde:       { type: Boolean, default: false },
    isPublished:  { type: Boolean, default: true },
    isPro:        { type: Boolean, default: false },
    missionText:  { type: String },
    docContent:   { type: String },       // ← NEW: for DOCUMENT type sessions

    // Starter code files (pre-loaded for student)
    starterCode:  { type: String },       // HTML
    starterCss:   { type: String },       // ← NEW: CSS tab
    starterJs:    { type: String },       // ← NEW: JS tab

    // Solution files (admin only, never sent to student)
    solutionCode: { type: String },       // HTML
    solutionCss:  { type: String },       // ← NEW: CSS tab
    solutionJs:   { type: String },       // ← NEW: JS tab

    // Image assets available in the student's code editor
    imageAssets:  { type: [imageAssetSchema], default: [] }, // ← NEW

    // Legacy multi-file field (keep so existing data doesn't break)
    starterFiles: { type: [{ name: String, content: String }], default: undefined },

    xpReward:     { type: Number, default: 50 },
    coinsReward:  { type: Number, default: 10 },
  },
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

sessionSchema.virtual('quizQuestions', {
  ref:         'QuizQuestion',
  localField:  '_id',
  foreignField: 'sessionId',
});

module.exports = mongoose.model('Session', sessionSchema);