import { Router } from 'express';
import { completeChapter } from '../controllers/progressController'; // Assuming you have this from before
import { getMyProgress } from '../controllers/progressController'; // Import the new one
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.post('/complete', authenticate, authorize(['student']), completeChapter);
router.get('/my', authenticate, authorize(['student']), getMyProgress); // <--- NEW ENDPOINT

export default router;