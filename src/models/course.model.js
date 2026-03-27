// backend/src/models/course.model.js
const prisma = require('../config/db');

async function getAllPublished() {
  return prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { order: 'asc' },
    include: {
      sessions: {
        where: { isPublished: true },
        orderBy: { order: 'asc' },
        select: {
          id: true, title: true, type: true, order: true,
          xpReward: true, coinsReward: true, durationMins: true,
          hasIde: true, videoThumb: true,
        },
      },
    },
  });
}

async function getById(id) {
  return prisma.course.findUnique({
    where: { id },
    include: { sessions: { where: { isPublished: true }, orderBy: { order: 'asc' } } },
  });
}

module.exports = { getAllPublished, getById };
