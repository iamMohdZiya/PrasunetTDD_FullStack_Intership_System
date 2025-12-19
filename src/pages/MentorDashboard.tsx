import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const MentorDashboard = () => {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Chapter Form State
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [chapterTitle, setChapterTitle] = useState('');
  const [sequence, setSequence] = useState(1);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      // We need to add this endpoint to the backend logic below
      const res = await api.get('/courses/my'); 
      setCourses(res.data);
    } catch (err) {
      console.error("Failed to fetch courses");
    }
  };

  const createCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/courses', { title, description });
      setTitle(''); setDescription('');
      fetchMyCourses(); // Refresh list
      alert('Course Created!');
    } catch (err) {
      alert('Failed to create course');
    }
  };

  const addChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    try {
      await api.post(`/courses/${selectedCourseId}/chapters`, {
        title: chapterTitle,
        sequenceOrder: sequence,
        contentUrl: 'https://example.com/demo-video' // Placeholder for PDF req
      });
      alert('Chapter Added!');
      setChapterTitle('');
      setSequence(sequence + 1);
    } catch (err) {
      alert('Failed to add chapter');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Mentor Dashboard</h1>
        <div className="space-x-4">
            <span className="text-gray-600">Mentor: {user?.userId}</span>
            <button onClick={logout} className="text-red-500">Logout</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Create Course */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">1. Create New Course</h2>
          <form onSubmit={createCourse} className="space-y-4">
            <input 
              placeholder="Course Title" 
              className="w-full border p-2 rounded"
              value={title} onChange={e => setTitle(e.target.value)} required 
            />
            <textarea 
              placeholder="Description" 
              className="w-full border p-2 rounded"
              value={description} onChange={e => setDescription(e.target.value)} required 
            />
            <button className="w-full bg-blue-600 text-white p-2 rounded">Create Course</button>
          </form>
        </div>

        {/* Right: Add Chapters */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">2. Add Chapters</h2>
          <select 
            className="w-full border p-2 rounded mb-4"
            onChange={(e) => setSelectedCourseId(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>Select a Course</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>

          {selectedCourseId && (
            <form onSubmit={addChapter} className="space-y-4">
              <input 
                placeholder="Chapter Title" 
                className="w-full border p-2 rounded"
                value={chapterTitle} onChange={e => setChapterTitle(e.target.value)} required 
              />
              <div className="flex items-center gap-2">
                <label>Order:</label>
                <input 
                  type="number" 
                  className="border p-2 rounded w-20"
                  value={sequence} onChange={e => setSequence(Number(e.target.value))} required 
                />
              </div>
              <button className="w-full bg-green-600 text-white p-2 rounded">Add Chapter</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;