import React from 'react';
import { Outlet } from 'react-router-dom';

import { UserCheck } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)]">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-3">
            <UserCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-white">
            AI Interview Coach
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Master your technical & behavioral interview skills with AI
          </p>
        </div>

        <div className="border border-zinc-800 p-6 md:p-8 rounded-xl bg-zinc-900/30 shadow-xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
