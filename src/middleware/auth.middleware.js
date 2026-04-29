// src/middleware/auth.middleware.js
const jwt  = require('jsonwebtoken');
const { User } = require('../config/db');

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token   = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User
      .findById(decoded.userId)
      .select('_id email role plan username');

    if (!user) return res.status(401).json({ error: 'User not found' });

    // Normalise _id → id so the rest of the app can use req.user.id
    req.user = {
      id:       user._id.toString(),
      email:    user.email,
      role:     user.role,
      plan:     user.plan,
      username: user.username,
    };
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    return res.status(503).json({ error: 'Service temporarily unavailable' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

function requirePlan(...plans) {
  return (req, res, next) => {
    if (!plans.includes(req.user?.plan)) {
      return res.status(403).json({
        error: 'Upgrade your plan to access this content',
        requiredPlans: plans,
      });
    }
    next();
  };
}

module.exports = { requireAuth, requireAdmin, requirePlan };