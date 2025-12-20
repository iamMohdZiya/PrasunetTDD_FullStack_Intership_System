// src/controllers/authController.ts
import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
  // 1. Get fullName from body
  const { email, password, role, fullName } = req.body;

  try {
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Insert User (Include full_name)
    const { data, error } = await supabase
      .from('users')
      .insert([
        { 
          email, 
          password_hash: hashedPassword, 
          role, 
          full_name: fullName, // <--- Saving the name
          is_approved: role === 'student' ? true : false 
        }
      ])
      .select();

    if (error) throw error;

    res.status(201).json({ message: 'User registered successfully', user: data[0] });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check Approval for Mentors
    if (user.role === 'mentor' && !user.is_approved) {
      return res.status(403).json({ message: 'Account pending Admin approval.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate Token (Include full_name in token if you want, or just fetch it later)
    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    // Return Name to Frontend
    res.json({ token, user: { 
      id: user.id, 
      role: user.role, 
      email: user.email,
      fullName: user.full_name // <--- Send name back to UI
    }});
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};