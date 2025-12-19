import { Router } from 'express';
import { getCourseWithChapters, createCourse, addChapter, getMyCourses } from '../controllers/courseController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

// ==========================================
// 1. SPECIFIC ROUTES (MUST BE AT THE TOP)
// ==========================================

// Mentor: Get "My" Courses 
// (If this is below /:courseId, Express will think "my" is an ID!)
router.get('/my', authenticate, authorize(['mentor']), getMyCourses);

// Mentor: Create Course
router.post('/', authenticate, authorize(['mentor']), createCourse);


// ==========================================
// 2. DYNAMIC ROUTES (MUST BE AT THE BOTTOM)
// ==========================================

// Mentor: Add Chapter to a specific course
router.post('/:courseId/chapters', authenticate, authorize(['mentor']), addChapter);

// Student/Anyone: Get specific course details
router.get('/:courseId', authenticate, getCourseWithChapters);


export default router;