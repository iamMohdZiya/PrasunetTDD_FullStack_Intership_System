import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

// Types for our data
interface Chapter {
  id: number;
  title: string;
  sequence_order: number;
}

interface Course {
  id: string;
  title: string;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [completedChapters, setCompletedChapters] = useState<number[]>([]); // Store IDs of done chapters
  const [loading, setLoading] = useState(true);

  // HARDCODED COURSE ID (From your SQL Seed)
  const COURSE_ID = 'b1111111-1111-1111-1111-111111111111';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get Course Content
        const courseRes = await api.get(`/courses/${COURSE_ID}`);
        setCourse(courseRes.data.course);
        setChapters(courseRes.data.chapters);

        // 2. Get User's Progress (We need a new endpoint for this really, but let's assume empty for now or add it later)
        // For the Kata, we will just track local state or simple completion
      } catch (err) {
        console.error("Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleComplete = async (chapter: Chapter) => {
    try {
      await api.post('/progress/complete', {
        courseId: COURSE_ID,
        chapterId: chapter.id,
        sequenceOrder: chapter.sequence_order
      });
      alert(`Chapter "${chapter.title}" marked as complete!`);
      setCompletedChapters([...completedChapters, chapter.id]);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error completing chapter');
    }
  };

  const handleDownloadCert = async () => {
    try {
      const res = await api.get(`/certificates/${COURSE_ID}`);
      window.open(res.data.url, '_blank');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Certificate not ready yet!');
    }
  };

  if (loading) return <div className="p-10">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">LMS Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Welcome, {user?.role}</span>
          <button onClick={logout} className="text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
        {course ? (
          <>
            <h2 className="text-3xl font-bold mb-2">{course.title}</h2>
            <p className="text-gray-500 mb-8">Internship Track</p>

            <div className="space-y-4">
              {chapters.map((chapter) => (
                <div key={chapter.id} className="border p-4 rounded flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <span className="font-bold text-gray-400 mr-4">#{chapter.sequence_order}</span>
                    <span className="font-medium text-lg">{chapter.title}</span>
                  </div>
                  
                  <button 
                    onClick={() => handleComplete(chapter)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                  >
                    Mark Complete
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-10 border-t pt-6 text-center">
              <button 
                onClick={handleDownloadCert}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-purple-700 shadow-lg"
              >
                🏆 Download Certificate
              </button>
            </div>
          </>
        ) : (
          <p>No course found. Did you seed the database?</p>
        )}
      </main>
    </div>
  );
};

export default Dashboard;