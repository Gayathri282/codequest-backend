// src/models/User.js
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
    username:    { type: String, required: true, unique: true, trim: true },
    displayName: { type: String, trim: true },
    passwordHash:{ type: String, select: false },   // null for Google OAuth users
    googleId:    { type: String, sparse: true },
    avatarEmoji: { type: String, default: '🐉' },
    age:         { type: Number },
    role:        { type: String, enum: ['STUDENT', 'PARENT', 'ADMIN'], default: 'STUDENT' },
    plan:        { type: String, enum: ['FREE', 'PRO'], default: 'FREE' },
    planExpiresAt: { type: Date },

    // gamification
    xp:          { type: Number, default: 0 },
    coins:       { type: Number, default: 0 },
    level:       { type: Number, default: 1 },
    streakDays:  { type: Number, default: 0 },
    lastActiveAt:{ type: Date },

    // parent–child link
    parentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // password reset
    resetToken:       { type: String, select: false },
    resetTokenExpiry: { type: Date,   select: false },
  },
  { timestamps: true }
);

// Hash before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.resetToken;
  delete obj.resetTokenExpiry;
  return obj;
};

module.exports = mongoose.model('User', userSchema);