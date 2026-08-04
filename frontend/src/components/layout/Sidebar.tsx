import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Video,
  BarChart3,
  User,
  Shield,
  PlusCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Start Interview', icon: PlusCircle, path: '/interview/new', highlight: true },
    { label: 'Resume Analyzer', icon: FileText, path: '/resume' },
    { label: 'Analytics', icon: BarChart3, path: '/analytics' },
    { label: 'Profile', icon: User, path: '/profile' },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ label: 'Admin Panel', icon: Shield, path: '/admin' });
  }

  return (
    <aside className="w-64 border-r border-[var(--border-subtle)] bg-[#0b0b12]/80 backdrop-blur-xl flex flex-col justify-between p-4 sticky top-16 h-[calc(100vh-4rem)] z-20">
      <div className="space-y-1.5">
        <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
          Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''} ${
                  item.highlight
                    ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-purple-300 border-purple-500/30 hover:from-purple-600/30'
                    : ''
                }`
              }
            >
              <Icon className={`w-4 h-4 ${item.highlight ? 'text-purple-400' : ''}`} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="glass-card p-3 rounded-xl border border-purple-500/20 bg-gradient-to-b from-purple-900/10 to-indigo-900/10">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-purple-300">AI Coach Active</span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Practice mock interviews with real-time AI evaluation & feedback.
        </p>
      </div>
    </aside>
  );
};
