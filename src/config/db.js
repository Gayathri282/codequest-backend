// backend/src/config/db.js
// Prisma client singleton — import this everywhere instead of new PrismaClient()
const { PrismaClient } = require('@prisma/client');
const { withAccelerate } = require('@prisma/extension-accelerate');

const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
}).$extends(withAccelerate());

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

module.exports = prisma;
