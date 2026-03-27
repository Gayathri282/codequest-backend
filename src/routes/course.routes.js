// backend/src/routes/course.routes.js
const router = require('express').Router();
const c = require('../controllers/course.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');

router.get('/',        requireAuth, c.getAllCourses);
router.get('/:id',     requireAuth, c.getCourse);
router.post('/',       requireAuth, requireAdmin, c.createCourse);
router.patch('/:id',   requireAuth, requireAdmin, c.updateCourse);
router.delete('/:id',  requireAuth, requireAdmin, c.deleteCourse);

module.exports = router;
