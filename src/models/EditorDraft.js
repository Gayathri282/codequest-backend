// src/models/EditorDraft.js
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  content: { type: String, default: '' },
}, { _id: false });

const editorDraftSchema = new mongoose.Schema(
  {
    userId:    { type: String, required: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    courseId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    files:     { type: [fileSchema], default: [] },
  },
  { timestamps: true }
);

editorDraftSchema.index({ userId: 1, sessionId: 1 }, { unique: true });

module.exports = mongoose.model('EditorDraft', editorDraftSchema);