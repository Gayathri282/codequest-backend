// src/models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId:             { type: String, required: true },
    razorpayOrderId:    { type: String, required: true, unique: true },
    razorpayPaymentId:  { type: String },
    razorpaySignature:  { type: String },
    plan:               { type: String, required: true },
    amount:             { type: Number, required: true },
    currency:           { type: String, default: 'INR' },
    status:             { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);