// src/routes/userRoutes.ts
import { Router } from 'express';
import { getAllUsers } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

// PROTECTED ROUTE: Only Admins can see all users
// 1. authenticate (Check Token)
// 2. authorize(['admin']) (Check Permission)
router.get('/', authenticate, authorize(['admin']), getAllUsers);

export default router;