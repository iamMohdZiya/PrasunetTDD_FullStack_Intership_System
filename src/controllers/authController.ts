import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
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

    const hashedPassword = await bcrypt.hash(password, 10);

    // FIX 1: Use 'password_hash' to match your database column
    const { data, error } = await supabase
      .from('users')
      .insert([
        { 
          email, 
          password_hash: hashedPassword, // <--- CHANGED FROM 'password'
          role, 
          full_name: fullName,
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

    if (user.role === 'mentor' && !user.is_approved) {
      return res.status(403).json({ message: 'Account pending Admin approval.' });
    }

    // FIX 2: Compare against 'user.password_hash'
    // The error "Illegal arguments: string, undefined" happened here 
    // because user.password was undefined.
    const isMatch = await bcrypt.compare(password, user.password_hash); 
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    res.json({ token, user: { 
      id: user.id, 
      role: user.role, 
      email: user.email,
      fullName: user.full_name 
    }});
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};