import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { LogOut, User as UserIcon, Sparkles, Shield } from 'lucide-react';
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
    <header className="h-16 border-b border-[var(--border-subtle)] bg-black/40 backdrop-blur-xl sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-0.5 flex items-center justify-center glow-sm">
          <div className="w-full h-full bg-[#0a0a0f] rounded-[10px] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
        </div>
        <span className="font-extrabold text-lg tracking-tight gradient-text">
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
                className="w-8 h-8 rounded-full object-cover border border-purple-500/30 group-hover:border-purple-400 transition-all"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-300 font-semibold text-xs group-hover:border-purple-400 transition-all">
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
