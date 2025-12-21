import { Router } from 'express';
import { completeChapter, getMyProgress, getCourseProgress } from '../controllers/progressController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

// Endpoint: /api/progress/complete
router.post('/complete', authenticate, authorize(['student']), completeChapter);

// Endpoint: /api/progress/my
router.get('/my', authenticate, authorize(['student']), getMyProgress);

// Endpoint: /api/progress/course/:courseId
router.get('/course/:courseId', authenticate, authorize(['student']), getCourseProgress);

export default router;