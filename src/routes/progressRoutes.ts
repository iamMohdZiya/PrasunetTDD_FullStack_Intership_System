import { Router } from 'express';
import { completeChapter, getMyProgress } from '../controllers/progressController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

// Endpoint: /api/progress/complete
router.post('/complete', authenticate, authorize(['student']), completeChapter);

// Endpoint: /api/progress/my
router.get('/my', authenticate, authorize(['student']), getMyProgress);

export default router;