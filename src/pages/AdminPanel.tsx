import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const { logout } = useAuth();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await api.get('/users'); // Admin only endpoint
    setUsers(res.data);
  };

  const approveMentor = async (userId: string) => {
    try {
      await api.put(`/users/${userId}/approve-mentor`);
      alert('Mentor Approved');
      fetchUsers();
    } catch (err) {
      alert('Error approving');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-red-700">Admin Control Panel</h1>
        <button onClick={logout} className="text-gray-600 underline">Logout</button>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
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
      </div>
    </div>
  );
};

export default AdminPanel;