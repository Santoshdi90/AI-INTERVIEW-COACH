import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { LogOut, User as UserIcon, UserCheck, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/services/api.service';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (
    <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center">
          <UserCheck className="w-4 h-4 text-indigo-400" />
        </div>
        <span className="font-semibold text-sm tracking-tight text-[#fafafa]">
          AI Interview Coach
        </span>
      </div>

      <div className="flex items-center gap-4">
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold hover:bg-amber-500/20 transition-all"
          >
            <Shield className="w-3.5 h-3.5" /> Admin Panel
          </button>
        )}

        <div className="flex items-center gap-3 pl-3 border-l border-[var(--border-subtle)]">
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-zinc-700 group-hover:border-zinc-500 transition-all"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-semibold text-xs group-hover:border-zinc-500 transition-all">
                {user?.name?.[0]?.toUpperCase() || <UserIcon className="w-4 h-4" />}
              </div>
            )}
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-gray-200 group-hover:text-white transition-colors">
                {user?.name}
              </p>
              <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
