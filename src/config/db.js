// src/config/db.js
const mongoose = require('mongoose');

const User        = require('../models/User');
const Course      = require('../models/Course');
const Session     = require('../models/Session');
const Progress    = require('../models/Progress');
const Payment     = require('../models/Payment');
const { Badge, UserBadge } = require('../models/Badge');  // both live in Badge.js
const EditorDraft = require('../models/EditorDraft');
const QuizQuestion= require('../models/QuizQuestion');
const Setting     = require('../models/Setting');

async function connectDB() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('✅  MongoDB connected');
  } catch (err) {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  }
}

module.exports = {
  connectDB,
  User,
  Course,
  Session,
  Progress,
  Payment,
  Badge,
  UserBadge,
  EditorDraft,
  QuizQuestion,
  Setting,
};