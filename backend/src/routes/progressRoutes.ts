// src/routes/progressRoutes.ts
import { Router } from 'express';
import { completeChapter } from '../controllers/progressController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Only logged-in students can save progress
router.post('/complete', authenticate, completeChapter);

export default router;