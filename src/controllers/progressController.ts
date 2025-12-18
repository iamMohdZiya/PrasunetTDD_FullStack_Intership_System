// src/controllers/progressController.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';

// MOCK DATABASE: Stores completed chapters
// Format: "userId-courseId-sequenceOrder"
const MOCK_PROGRESS_DB: string[] = [];

export const completeChapter = async (req: AuthRequest, res: Response) => {
  const { courseId, chapterId, sequenceOrder } = req.body;
  const userId = req.user?.userId;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  // 1. THE LOGIC: Check Prerequisites
  if (sequenceOrder > 1) {
    const previousChapterKey = `${userId}-${courseId}-${sequenceOrder - 1}`;
    
    // Check if the previous chapter exists in our "DB"
    if (!MOCK_PROGRESS_DB.includes(previousChapterKey)) {
      return res.status(400).json({ 
        message: 'Prerequisite not met: You must complete the previous chapter first.' 
      });
    }
  }

  // 2. Save Progress (Simulate DB Insert)
  const currentChapterKey = `${userId}-${courseId}-${sequenceOrder}`;
  if (!MOCK_PROGRESS_DB.includes(currentChapterKey)) {
    MOCK_PROGRESS_DB.push(currentChapterKey);
  }

  res.status(200).json({ 
    message: 'Chapter completed successfully',
    progress: MOCK_PROGRESS_DB 
  });
};