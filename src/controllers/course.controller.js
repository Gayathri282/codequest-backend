// backend/src/controllers/course.controller.js
const { Course, Progress } = require('../config/db');

// GET /api/courses  — all published courses with student progress
async function getAllCourses(req, res, next) {
  try {
    const isAdmin = req.user?.role === 'ADMIN';

    const courseQuery = isAdmin ? {} : { isLocked: false };
    const sessionFilter = isAdmin ? {} : { isPublished: true };

    const courses = await Course
      .find(courseQuery)
      .sort({ order: 1 })
      .populate({
        path: 'sessions',
        match: sessionFilter,
        select: 'id title type order xpReward coinsReward durationMins isPublished',
        options: { sort: { order: 1 } },
      });

    const userId = req.user?.id;
    if (userId) {
      const progressRecords = await Progress.find({ userId, completed: true }).select('sessionId stars');
      const progressMap = new Map(progressRecords.map(p => [p.sessionId.toString(), p]));

      const coursesWithProgress = courses.map(course => {
        const sessions = (course.sessions || []).map(s => ({
          ...s.toObject(),
          completed: progressMap.has(s._id.toString()),
          stars: progressMap.get(s._id.toString())?.stars || 0,
        }));
        return {
          ...course.toObject(),
          sessions,
          completedCount: sessions.filter(s => s.completed).length,
        };
      });

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
    const sessionFilter = isAdmin ? {} : { isPublished: true };

    const course = await Course
      .findById(req.params.id)
      .populate({
        path: 'sessions',
        match: sessionFilter,
        options: { sort: { order: 1 } },
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
    const course = await Course.create({
      title, emoji, description, color, subject, ageGroup,
      order: order || 0, unlocksAfter,
    });
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/courses/:id
async function updateCourse(req, res, next) {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/courses/:id
async function deleteCourse(req, res, next) {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllCourses, getCourse, createCourse, updateCourse, deleteCourse };