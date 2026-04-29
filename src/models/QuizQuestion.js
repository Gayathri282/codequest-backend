// src/models/QuizQuestion.js
const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema(
  {
    sessionId:     { type: String, required: true },
    question:      { type: String, required: true },
    emoji:         { type: String },
    optionA:       { type: String, required: true },
    optionB:       { type: String, required: true },
    optionC:       { type: String },
    optionD:       { type: String },
    correctAnswer: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
    explanation:   { type: String },
    order:         { type: Number, default: 0 },
  },
  { timestamps: true }
);

quizQuestionSchema.index({ sessionId: 1, order: 1 });

module.exports = mongoose.model('QuizQuestion', quizQuestionSchema);