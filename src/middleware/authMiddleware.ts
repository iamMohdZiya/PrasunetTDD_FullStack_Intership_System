// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 1. Define a Custom Request Interface to hold User Data
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

// 2. Authentication Middleware (Verify Token)
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'super_secret_internship_key_123'
    );
    (req as AuthRequest).user = decoded as { userId: string; role: string };
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};

// 3. Authorization Middleware (Check Role)
// This is a "Factory Function" - it returns the actual middleware function
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;

    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Access Forbidden: Insufficient Permissions' });
    }

    next();
  };
};