// backend/src/controllers/course.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/courses  — all published courses with student progress
async function getAllCourses(req, res, next) {
  try {
    const isAdmin = req.user?.role === 'ADMIN';
    const courses = await prisma.course.findMany({
      where: isAdmin ? undefined : { isLocked: false },
      orderBy: { order: 'asc' },
      include: {
        sessions: {
          ...(isAdmin ? {} : { where: { isPublished: true } }),
          orderBy: { order: 'asc' },
          select: { id: true, title: true, type: true, order: true, xpReward: true, coinsReward: true, durationMins: true, isPublished: true }
        }
      }
    });

    // Attach this student's progress to each course
    const userId = req.user?.id;
    if (userId) {
      const progressRecords = await prisma.progress.findMany({
        where: { userId, completed: true },
        select: { sessionId: true, stars: true }
      });
      const progressMap = new Map(progressRecords.map(p => [p.sessionId, p]));

      const coursesWithProgress = courses.map(course => ({
        ...course,
        sessions: course.sessions.map(s => ({
          ...s,
          completed: progressMap.has(s.id),
          stars: progressMap.get(s.id)?.stars || 0
        })),
        completedCount: course.sessions.filter(s => progressMap.has(s.id)).length
      }));

      return res.json(coursesWithProgress);
    }

    res.json(courses);
  } catch (err) {
    next(err);
  }
}

// GET /api/courses/:id
async function getCourse(req, res, next) {
  try {
    const isAdmin = req.user?.role === 'ADMIN';
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        sessions: {
          ...(isAdmin ? {} : { where: { isPublished: true } }),
          orderBy: { order: 'asc' }
        }
      }
    });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err) {
    next(err);
  }
}

// ── ADMIN ONLY ──────────────────────────────────────

// POST /api/courses
async function createCourse(req, res, next) {
  try {
    const { title, emoji, description, color, subject, ageGroup, order, unlocksAfter } = req.body;
    const course = await prisma.course.create({
      data: { title, emoji, description, color, subject, ageGroup, order: order || 0, unlocksAfter }
    });
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/courses/:id
async function updateCourse(req, res, next) {
  try {
    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(course);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/courses/:id
async function deleteCourse(req, res, next) {
  try {
    await prisma.course.delete({ where: { id: req.params.id } });
    res.json({ message: 'Course deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllCourses, getCourse, createCourse, updateCourse, deleteCourse };
