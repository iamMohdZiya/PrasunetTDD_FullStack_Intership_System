import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';

// Helper to generate a Student Token
const getStudentToken = () => {
  return jwt.sign(
    { userId: 'student-123', role: 'student' }, 
    process.env.JWT_SECRET || 'super_secret_internship_key_123', 
    { expiresIn: '1h' }
  );
};

describe('Sequential Progress Logic', () => {
  const token = getStudentToken();

  // Scenario 1: User tries to skip to Chapter 2 (ID: 2) without doing Chapter 1 (ID: 1)
  it('should return 400 if prerequisites are not met', async () => {
    const res = await request(app)
      .post('/api/progress/complete')
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        courseId: 'course-101', 
        chapterId: 2, // Trying to complete Ch 2
        sequenceOrder: 2 
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toMatch(/Prerequisite not met/);
  });

  // Scenario 2: User completes Chapter 1 (ID: 1) - First step
  it('should return 200 when completing the first chapter', async () => {
    const res = await request(app)
      .post('/api/progress/complete')
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        courseId: 'course-101', 
        chapterId: 1, 
        sequenceOrder: 1 // First chapter
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toMatch(/Chapter completed/);
  });

});