import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface Chapter {
  id: number;
  title: string;
  sequence_order: number;
  content_url?: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
}

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  
  // Views: "list" = All Courses, "view" = Single Course Player
  const [view, setView] = useState<'list' | 'view'>('list');
  
  // Data
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([]);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [completedOrders, setCompletedOrders] = useState<number[]>([]); // Track completed sequence numbers

  useEffect(() => {
    fetchAssignedCourses();
  }, []);

  const fetchAssignedCourses = async () => {
    try {
      const res = await api.get('/courses/assigned');
      setAssignedCourses(res.data);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  const openCourse = async (course: Course) => {
    try {
      const res = await api.get(`/courses/${course.id}`);
      setActiveCourse(res.data.course);
      setChapters(res.data.chapters);
      
      // Ideally, backend should return "last_completed_sequence". 
      // For this Kata, we'll assume user starts at 0 or we fetch progress separately.
      // We will allow users to click "Complete" to build this local array for the session.
      setCompletedOrders([0]); // 0 allows Chapter 1 to unlock (if logic checks > max)
      
      setView('view');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cannot access course');
    }
  };

  const handleComplete = async (chapter: Chapter) => {
    if (!activeCourse) return;
    try {
      await api.post('/progress/complete', {
        courseId: activeCourse.id,
        chapterId: chapter.id,
        sequenceOrder: chapter.sequence_order
      });
      alert(`🎉 Chapter ${chapter.sequence_order} Completed!`);
      
      // Update local lock state
      setCompletedOrders((prev) => [...prev, chapter.sequence_order]);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error completing chapter');
    }
  };

  const downloadCertificate = async () => {
    if (!activeCourse) return;
    try {
      const res = await api.get(`/certificates/${activeCourse.id}`, { responseType: 'blob' });
      // Create a blob link to download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate-${activeCourse.title}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err: any) {
      alert('Certificate not ready! Have you completed all chapters?');
    }
  };

  // --- VIEW 1: COURSE LIST ---
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🎓 My Learning</h1>
          <button onClick={logout} className="text-gray-600 underline">Logout</button>
        </div>

        {assignedCourses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded shadow">
            <h2 className="text-xl text-gray-500">No courses assigned yet.</h2>
            <p className="text-gray-400">Ask your mentor to assign you to a course!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedCourses.map(course => (
              <div key={course.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <h2 className="text-xl font-bold mb-2 text-blue-600">{course.title}</h2>
                <p className="text-gray-600 mb-4 h-12 overflow-hidden">{course.description}</p>
                <button 
                  onClick={() => openCourse(course)}
                  className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700"
                >
                  Start Learning
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- VIEW 2: COURSE PLAYER ---
  const maxCompleted = Math.max(0, ...completedOrders); // Highest chapter finished

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow p-4 flex justify-between items-center px-8">
        <div>
          <button onClick={() => setView('list')} className="text-sm text-gray-500 hover:text-black mb-1">
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{activeCourse?.title}</h1>
        </div>
        <button 
          onClick={downloadCertificate}
          className="bg-yellow-500 text-white px-6 py-2 rounded shadow hover:bg-yellow-600 font-bold flex items-center gap-2"
        >
          🏆 Download Certificate
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-8">
        <div className="space-y-6">
          {chapters.map((chapter) => {
            // LOGIC: Is this chapter unlocked?
            // Unlocked if it is Chapter 1 OR if previous chapter (order-1) is in completed list
            const isUnlocked = chapter.sequence_order === 1 || completedOrders.includes(chapter.sequence_order - 1);
            const isCompleted = completedOrders.includes(chapter.sequence_order);

            return (
              <div 
                key={chapter.id} 
                className={`border rounded-lg p-6 transition ${
                  isUnlocked ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-200 opacity-75'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-sm font-bold px-2 py-1 rounded ${isUnlocked ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>
                        Chapter {chapter.sequence_order}
                      </span>
                      {!isUnlocked && <span className="text-xs text-red-500 font-bold">🔒 LOCKED</span>}
                      {isCompleted && <span className="text-xs text-green-600 font-bold">✅ COMPLETED</span>}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{chapter.title}</h3>
                  </div>
                  
                  {isUnlocked && !isCompleted && (
                    <button 
                      onClick={() => handleComplete(chapter)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 shadow-sm"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>

                {isUnlocked && chapter.content_url && (
                  <div className="mt-4 p-4 bg-gray-50 rounded border text-blue-600 underline">
                     <a href={chapter.content_url} target="_blank" rel="noreferrer">
                       Watch Video / View Content
                     </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;