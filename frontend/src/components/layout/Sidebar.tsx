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
    <aside className="w-64 border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex flex-col justify-between p-4 sticky top-16 h-[calc(100vh-4rem)] z-20">
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
                    ? 'border-zinc-800 text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10'
                    : ''
                }`
              }
            >
              <Icon className={`w-4 h-4 ${item.highlight ? 'text-indigo-400' : ''}`} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-900/40 text-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="font-semibold text-gray-200">Active Coach Mode</span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Practice mock interviews with AI evaluation and metrics diagnostics.
        </p>
      </div>
    </aside>
  );
};
