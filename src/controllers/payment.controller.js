// backend/src/controllers/payment.controller.js
const Razorpay = require('razorpay');
const crypto   = require('crypto');
const prisma = require('../config/db');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const DEFAULT_PRICES = {
  PREMIUM: 149900,  // ₹1,499 in paise
};

async function getPlanPrice(plan) {
  try {
    const row = await prisma.setting.findUnique({ where: { key: `PRICE_${plan}` } });
    if (row) return parseInt(row.value, 10);
  } catch (_) {}
  return DEFAULT_PRICES[plan] ?? null;
}

// POST /api/payments/create-order
// Frontend calls this → get order id → open Razorpay modal
async function createOrder(req, res, next) {
  try {
    const { plan } = req.body;  // "PREMIUM"
    const amount = await getPlanPrice(plan);
    if (!amount) return res.status(400).json({ error: 'Invalid plan' });

    let order;
    try {
      order = await razorpay.orders.create({
        amount,
        currency: 'INR',
        receipt: `cq_${req.user.id.replace(/-/g,'').slice(0,20)}_${Date.now().toString().slice(-8)}`,
        notes: { userId: req.user.id, plan }
      });
    } catch (rzErr) {
      // Razorpay SDK throws { statusCode, error: { description } } — not a standard Error
      const msg = rzErr?.error?.description || rzErr?.error?.code || 'Payment gateway error';
      return res.status(rzErr?.statusCode || 502).json({ error: msg });
    }

    // Save pending payment
    await prisma.payment.create({
      data: {
        userId: req.user.id,
        razorpayOrderId: order.id,
        plan,
        amount,
        currency: 'INR',
        status: 'PENDING'
      }
    });

    res.json({ orderId: order.id, amount, currency: 'INR', keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    next(err);
  }
}

// POST /api/payments/verify
// Called after Razorpay checkout succeeds on frontend
async function verifyPayment(req, res, next) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify HMAC signature
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment signature mismatch' });
    }

    // Fetch payment record
    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: razorpay_order_id }
    });
    if (!payment) return res.status(404).json({ error: 'Payment record not found' });

    // Update payment + user plan
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, status: 'PAID' }
      }),
      prisma.user.update({
        where: { id: payment.userId },
        data: { plan: payment.plan }
      })
    ]);

    res.json({ success: true, plan: payment.plan });
  } catch (err) {
    next(err);
  }
}

// POST /api/payments/webhook  — Razorpay server-to-server events
async function webhook(req, res, next) {
  try {
    const sig = req.headers['x-razorpay-signature'];
    const body = req.body; // raw buffer

    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (sig !== expectedSig) return res.status(400).json({ error: 'Invalid webhook signature' });

    const event = JSON.parse(body.toString());

    if (event.event === 'payment.captured') {
      const orderId = event.payload.payment.entity.order_id;
      const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: orderId } });
      if (payment && payment.status !== 'PAID') {
        await prisma.$transaction([
          prisma.payment.update({ where: { id: payment.id }, data: { status: 'PAID' } }),
          prisma.user.update({ where: { id: payment.userId }, data: { plan: payment.plan } })
        ]);
      }
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
}

// GET /api/payments/history  (admin)
async function getHistory(req, res, next) {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, username: true } } },
      take: 50
    });
    res.json(payments);
  } catch (err) {
    next(err);
  }
}

// GET /api/payments/pricing  — public endpoint to fetch current plan prices
async function getPricing(req, res, next) {
  try {
    const premiumPaise = await getPlanPrice('PREMIUM');
    res.json({
      PREMIUM: premiumPaise,
      PREMIUM_RUPEES: Math.round(premiumPaise / 100),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder, verifyPayment, webhook, getHistory, getPricing };

