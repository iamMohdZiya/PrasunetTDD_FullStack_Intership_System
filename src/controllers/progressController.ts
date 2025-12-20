import { Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/authMiddleware';

export const completeChapter = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { courseId, chapterId, sequenceOrder } = req.body;

  try {
    const { error } = await supabase
      .from('progress')
      .insert([{ 
        user_id: userId, 
        course_id: courseId, 
        chapter_id: chapterId,
        completed_at: new Date()
      }]);

    if (error) {
       // Ignore duplicate errors (if user clicks twice)
       if (error.code !== '23505') throw error;
    }
    
    res.status(200).json({ message: 'Progress saved' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyProgress = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  try {
    // 1. Get courses assigned to student
    const { data: assignments, error } = await supabase
      .from('assignments')
      .select('course_id, courses(title)')
      .eq('student_id', userId);

    if (error) throw error;

    if (!assignments || assignments.length === 0) {
        return res.json([]);
    }

    // 2. Calculate progress for each course
    const progressReport = await Promise.all(assignments.map(async (a: any) => {
      
      // Count Total Chapters in Course
      const { count: total } = await supabase
        .from('chapters')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', a.course_id);

      // Count Completed Chapters by User
      const { count: completed } = await supabase
        .from('progress')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', a.course_id)
        .eq('user_id', userId);

      const totalCount = total || 0;
      const completedCount = completed || 0;
      // Avoid division by zero
      const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

      return {
        courseId: a.course_id,
        title: a.courses?.title,
        total: totalCount,
        completed: completedCount,
        percentage: percentage
      };
    }));

    res.json(progressReport);
  } catch (err: any) {
    console.error("Progress Error:", err);
    res.status(500).json({ message: err.message });
  }
};