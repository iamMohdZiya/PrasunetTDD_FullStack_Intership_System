import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';

const getStudentToken = () => {
  return jwt.sign(
    { userId: 'student-123', role: 'student' }, 
    process.env.JWT_SECRET || 'super_secret_internship_key_123', 
    { expiresIn: '1h' }
  );
};

describe('Certificate Generation', () => {
  const token = getStudentToken();

  // Scenario 1: User tries to get certificate with only partial progress
  it('should return 403 if course is not 100% complete', async () => {
    // 1. Setup: Complete Chapter 1 only
    await request(app)
      .post('/api/progress/complete')
      .set('Authorization', `Bearer ${token}`)
      .send({ courseId: 'course-101', chapterId: 1, sequenceOrder: 1 });

    // 2. Action: Try to get certificate
    const res = await request(app)
      .get('/api/certificates/course-101')
      .set('Authorization', `Bearer ${token}`);

    // 3. Assert
    expect(res.statusCode).toEqual(403);
    expect(res.body.message).toMatch(/Course not completed/);
  });

  // Scenario 2: User completes ALL chapters
  it('should return 200 and certificate if course is 100% complete', async () => {
    // 1. Setup: Complete Chapter 2 (assuming course-101 has 2 chapters)
    await request(app)
      .post('/api/progress/complete')
      .set('Authorization', `Bearer ${token}`)
      .send({ courseId: 'course-101', chapterId: 2, sequenceOrder: 2 });

    // 2. Action: Try to get certificate
    const res = await request(app)
      .get('/api/certificates/course-101')
      .set('Authorization', `Bearer ${token}`);

    // 3. Assert
    expect(res.statusCode).toEqual(200);
    expect(res.headers['content-type']).toMatch(/application\/json|application\/pdf/); 
    // Note: In a real app this is PDF, here we might return JSON for the mock
  });

});