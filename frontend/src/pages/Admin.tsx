import React, { useEffect, useState } from 'react';
import { adminApi } from '@/services/api.service';
import { Shield, Users, Video, Trash2, Search, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const Admin: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers({ search }),
      ]);
      setStats(statsRes.data?.data);
      setUsers(usersRes.data?.data?.users || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [search]);

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminApi.deleteUser(id);
      toast.success('User deleted.');
      fetchAdminData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  if (loading) {
    return <div className="h-96 skeleton rounded-2xl w-full" />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Shield className="w-6 h-6 text-amber-400" /> Admin Command Center
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Monitor system-wide application usage, user management, and statistics.
        </p>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between border border-amber-500/20">
          <div>
            <span className="text-xs font-semibold text-gray-400">Total System Users</span>
            <p className="text-3xl font-extrabold text-white mt-1">{stats?.totalUsers || 0}</p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center justify-between border border-purple-500/20">
          <div>
            <span className="text-xs font-semibold text-gray-400">Total Practice Sessions</span>
            <p className="text-3xl font-extrabold text-white mt-1">{stats?.totalInterviews || 0}</p>
          </div>
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400">
            <Video className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-base font-bold text-gray-100">User Management</h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by name or email..."
              className="input-field pl-9 text-xs py-2"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="font-semibold text-gray-200">{u.name}</div>
                    <div className="text-[11px] text-gray-400">{u.email}</div>
                  </td>
                  <td>
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-amber' : 'badge-purple'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.isVerified ? 'badge-emerald' : 'badge-rose'}`}>
                      {u.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="text-xs text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    {u.role !== 'ADMIN' && (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
