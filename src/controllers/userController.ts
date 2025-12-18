// src/controllers/userController.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  // Mock response for now
  res.status(200).json([
    { id: 1, name: 'Student One', role: 'student' },
    { id: 2, name: 'Mentor Two', role: 'mentor' }
  ]);
};