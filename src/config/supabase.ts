// src/config/supabase.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config(); // Load variables

// DEBUG: Print to console to verify (Remove these later!)
console.log('Supabase URL:', process.env.SUPABASE_URL ? 'Loaded ✅' : 'Missing ❌');
console.log('Supabase Key:', process.env.SUPABASE_KEY ? 'Loaded ✅' : 'Missing ❌');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);