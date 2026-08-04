import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '@/services/api.service';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } catch {
      setSubmitted(true); // silent fail for security
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link to="/login" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white mb-4">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to login
      </Link>

      <h2 className="text-xl font-bold text-gray-100 mb-1">Forgot Password</h2>
      <p className="text-xs text-gray-400 mb-6">Enter your email to receive password reset instructions</p>

      {submitted ? (
        <div className="text-center py-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-200">Reset instructions sent</p>
          <p className="text-xs text-gray-400 mt-1">If an account exists for {email}, instructions have been generated.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field pl-9"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      )}
    </div>
  );
};
