// backend/src/controllers/course.controller.js
const { Course, Progress } = require('../config/db');

function withId(doc) {
  if (!doc) return doc;
  const obj = typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true }) : { ...doc };
  if (!obj.id && obj._id !== undefined) obj.id = String(obj._id);
  return obj;
}

// GET /api/courses
async function getAllCourses(req, res, next) {
  try {
    const isAdmin = req.user?.role === 'ADMIN';
    const courseQuery   = isAdmin ? {} : { isLocked: false };
    const sessionFilter = isAdmin ? {} : { isPublished: true };

    const courses = await Course
      .find(courseQuery)
      .sort({ order: 1 })
      .populate({
        path: 'sessions',
        match: sessionFilter,
        select: '_id id title type order xpReward coinsReward durationMins isPublished',
        options: { sort: { order: 1 } },
      });

    // Debug log
    if (courses.length > 0) {
      const obj = courses[0].toObject({ virtuals: true });
      console.log('[courses] _id:', obj._id, '| id:', obj.id);
    }

    const userId = req.user?.id;
    if (userId) {
      const progressRecords = await Progress.find({ userId, completed: true }).select('sessionId stars');
      const progressMap = new Map(progressRecords.map(p => [p.sessionId.toString(), p]));

      const coursesWithProgress = courses.map(course => {
        const courseObj = withId(course);
        const sessions = (course.sessions || []).map(s => {
          const so = typeof s.toObject === 'function' ? s.toObject({ virtuals: true }) : { ...s };
          if (!so.id && so._id !== undefined) so.id = String(so._id);
          return {
            ...so,
            completed: progressMap.has(String(so._id)),
            stars: progressMap.get(String(so._id))?.stars || 0,
          };
        });
        return { ...courseObj, sessions, completedCount: sessions.filter(s => s.completed).length };
      });

      console.log('[courses] response[0] id:', coursesWithProgress[0]?.id);
      return res.json(coursesWithProgress);
    }

    const result = courses.map(withId);
    console.log('[courses] no-auth response[0] id:', result[0]?.id);
    res.json(result);
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
      .populate({ path: 'sessions', match: sessionFilter, options: { sort: { order: 1 } } });

    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(withId(course));
  } catch (err) {
    next(err);
  }
}

// POST /api/courses
async function createCourse(req, res, next) {
  try {
    const { title, emoji, description, color, subject, ageGroup, order, unlocksAfter, slug: inputSlug } = req.body;
    if (!title || !String(title).trim()) return res.status(400).json({ error: 'title is required' });

    const base = String(inputSlug || title).toLowerCase().trim()
      .replace(/['"]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'course';

    let slug = base, n = 1;
    while (await Course.exists({ _id: slug })) slug = `${base}-${n++}`;

    const course = await Course.create({
      _id: slug, title, emoji, description, color, subject, ageGroup,
      order: order || 0, unlocksAfter,
    });
    res.status(201).json(withId(course));
  } catch (err) {
    next(err);
  }
}

// PATCH /api/courses/:id
async function updateCourse(req, res, next) {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(withId(course));
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