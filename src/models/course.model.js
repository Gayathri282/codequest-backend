// src/models/course.model.js
const Course   = require('./Course');
const Session  = require('./Session');

async function getAllPublished() {
  const courses = await Course.find({ isPublished: true }).sort({ order: 1 }).lean();

  // attach sessions to each course
  const courseIds = courses.map(c => c._id);
  const sessions  = await Session.find({
    courseId:    { $in: courseIds },
    isPublished: true,
  })
    .sort({ order: 1 })
    .select('_id title type order xpReward coinsReward durationMins hasIde videoThumb courseId')
    .lean();

  const sessionsByCourse = {};
  for (const s of sessions) {
    const key = s.courseId.toString();
    if (!sessionsByCourse[key]) sessionsByCourse[key] = [];
    sessionsByCourse[key].push(s);
  }

  return courses.map(c => ({
    ...c,
    sessions: sessionsByCourse[c._id.toString()] || [],
  }));
}

async function getById(id) {
  const course = await Course.findById(id).lean();
  if (!course) return null;

  const sessions = await Session.find({ courseId: id, isPublished: true })
    .sort({ order: 1 })
    .lean();

  return { ...course, sessions };
}

module.exports = { getAllPublished, getById };