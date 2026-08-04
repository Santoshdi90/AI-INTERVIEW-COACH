import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/services/api.service';
import { useAuthStore } from '@/store/authStore';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'demo@aiinterviewcoach.com', password: 'Demo@1234' },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.login({ email: data.email, password: data.password });
      if (res.data?.success) {
        setAuth(res.data.data.user, res.data.data.accessToken);
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const res = await authApi.googleLogin();
      if (res.data?.success) {
        setAuth(res.data.data.user, res.data.data.accessToken);
        toast.success('Signed in with Google (Demo)');
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error('Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-100 mb-1">Welcome back</h2>
      <p className="text-xs text-gray-400 mb-6">Sign in to continue your interview prep</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className={`input-field pl-9 ${errors.email ? 'error' : ''}`}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-rose-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-gray-300">Password</label>
            <Link
              to="/forgot-password"
              className="text-[11px] text-purple-400 hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className={`input-field pl-9 ${errors.password ? 'error' : ''}`}
            />
          </div>
          {errors.password && (
            <p className="text-[11px] text-rose-400 mt-1">{errors.password.message}</p>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2">
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Sign In <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px bg-white/10 flex-1" />
        <span className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold">
          Or continue with
        </span>
        <div className="h-px bg-white/10 flex-1" />
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="btn-secondary w-full justify-center py-2.5 text-xs"
      >
        <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        Sign in with Google (Demo)
      </button>

      <p className="text-center text-xs text-gray-400 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-purple-400 font-semibold hover:underline">
          Create one now
        </Link>
      </p>

      <div className="mt-4 p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300">
        💡 <strong>Demo Mode Pre-filled:</strong> Use pre-filled details above or sign in with Google for instant access.
      </div>
    </div>
  );
};
