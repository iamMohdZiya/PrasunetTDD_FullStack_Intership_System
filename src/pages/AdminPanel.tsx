import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const { logout, user } = useAuth(); // Get user to verify role
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log("Fetching users...");
      const res = await api.get('/users'); 
      console.log("Data received:", res.data);
      setUsers(res.data);
      setError('');
    } catch (err: any) {
      console.error("Fetch error:", err);
      // Show the exact error message from backend or browser
      setError(err.response?.data?.message || err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const approveMentor = async (userId: string) => {
    try {
      await api.put(`/users/${userId}/approve-mentor`);
      alert('Mentor Approved');
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error approving');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-red-700">Admin Control Panel</h1>
          <p className="text-sm text-gray-500">Logged in as: {user?.role} ({user?.userId})</p>
        </div>
        <button onClick={logout} className="text-gray-600 underline">Logout</button>
      </div>

      {/* ERROR MESSAGE DISPLAY */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="bg-white rounded shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading data...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No users found in database. (Check Supabase table!)
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t">
                  <td className="p-4">{u.email}</td>
                  <td className="p-4 uppercase text-sm font-bold">{u.role}</td>
                  <td className="p-4">
                    {u.role === 'mentor' ? (
                      u.is_approved ? <span className="text-green-600">Active</span> : <span className="text-orange-500">Pending</span>
                    ) : '-'}
                  </td>
                  <td className="p-4">
                    {u.role === 'mentor' && !u.is_approved && (
                      <button 
                        onClick={() => approveMentor(u.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;