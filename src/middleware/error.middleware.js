// backend/src/middleware/error.middleware.js

function errorHandler(err, req, res, next) {
  const msg = err.message || err?.error?.description || err?.error?.code || 'Unknown error';
  console.error(`[ERROR] ${req.method} ${req.path}:`, msg);

  // Mongoose validation / casting
  if (err?.name === 'ValidationError') {
    const details = Object.fromEntries(
      Object.entries(err.errors || {}).map(([k, v]) => [k, v.message])
    );
    return res.status(400).json({ error: msg, ...(Object.keys(details).length ? { details } : {}) });
  }
  if (err?.name === 'CastError') {
    return res.status(400).json({ error: msg });
  }

  // Mongo duplicate key errors
  if (err?.code === 11000) {
    return res.status(409).json({ error: 'A record with that value already exists.' });
  }

  // Prisma known errors
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'A record with that value already exists.' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found.' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token.' });
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: msg,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = { errorHandler };
