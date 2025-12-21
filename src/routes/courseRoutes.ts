import express from 'express';
import { 
  createCourse, 
  addChapter, 
  getMyCourses, 
  assignStudentToCourse, 
  getStudentAssignedCourses, 
  getCourseWithChapters
} from '../controllers/courseController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// --- STUDENT ROUTES (Must come BEFORE /:courseId to prevent route collision) ---
router.get('/assigned', authenticate, authorize(['student']), getStudentAssignedCourses);

// --- MENTOR ROUTES (Must come BEFORE /:courseId to prevent route collision) ---
router.get('/my', authenticate, authorize(['mentor']), getMyCourses);

// --- PUBLIC / SHARED (Generic route at the end) ---
router.get('/:courseId', authenticate, getCourseWithChapters);
router.post('/', authenticate, authorize(['mentor']), createCourse);
router.post('/:courseId/chapters', authenticate, authorize(['mentor']), addChapter);
router.post('/:courseId/assign', authenticate, authorize(['mentor']), assignStudentToCourse);

export default router;