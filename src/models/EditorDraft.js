// src/models/EditorDraft.js
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  content: { type: String, default: '' },
}, { _id: false });

const editorDraftSchema = new mongoose.Schema(
  {
        sessionId: { type: String, required: true },
    courseId:  { type: String, required: true },
    userId:    { type: String, required: true },
    files:     { type: [fileSchema], default: [] },
  },
  { timestamps: true }
);

editorDraftSchema.index({ userId: 1, sessionId: 1 }, { unique: true });

module.exports = mongoose.model('EditorDraft', editorDraftSchema);