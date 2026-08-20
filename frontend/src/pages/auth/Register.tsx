import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/services/api.service';
import { User, Mail, Lock, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain uppercase, lowercase & number'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.register({ name: data.name, email: data.email, password: data.password });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-100 mb-1">Registration Successful!</h2>
        <p className="text-xs text-gray-300 mb-4 leading-relaxed">
          We've logged a verification link to our system logs (Demo Mode).
        </p>
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-[11px] text-zinc-300 text-left mb-6">
          📌 In this environment, you can directly sign in using the login page or click Google Sign-In.
        </div>
        <Link to="/login" className="btn-primary w-full justify-center py-2.5 text-xs">
          Go to Login <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-100 mb-1">Create Account</h2>
      <p className="text-xs text-gray-400 mb-6">Join AI Interview Coach today</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              {...register('name')}
              placeholder="John Doe"
              className={`input-field pl-9 ${errors.name ? 'error' : ''}`}
            />
          </div>
          {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name.message}</p>}
        </div>

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
          {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">Password</label>
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
              Create Account <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-gray-400 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
};
