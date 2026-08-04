import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Layouts & Guards
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ProtectedRoute, AdminRoute } from '@/components/layout/ProtectedRoute';

// Auth Pages
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { ResetPassword, VerifyEmail } from '@/pages/auth/ResetPassword';

// Core Pages
import { Dashboard } from '@/pages/Dashboard';
import { Resume } from '@/pages/Resume';
import { InterviewSetup } from '@/pages/InterviewSetup';
import { LiveInterview } from '@/pages/LiveInterview';
import { InterviewFeedback } from '@/pages/InterviewFeedback';
import { Analytics } from '@/pages/Analytics';
import { Profile } from '@/pages/Profile';
import { Admin } from '@/pages/Admin';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#12121f',
            color: '#f1f1f7',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '12px',
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Route>

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/resume" element={<Resume />} />
              <Route path="/interview/new" element={<InterviewSetup />} />
              <Route path="/interview/:id" element={<LiveInterview />} />
              <Route path="/interview/:id/feedback" element={<InterviewFeedback />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/profile" element={<Profile />} />

              {/* Admin Protected */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<Admin />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
