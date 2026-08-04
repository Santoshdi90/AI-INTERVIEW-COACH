import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authApi } from '@/services/api.service';
import { Lock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      toast.success('Password updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-100 mb-1">Set New Password</h2>
      <p className="text-xs text-gray-400 mb-6">Enter your new password below</p>

      {done ? (
        <div className="text-center py-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-200">Password Changed!</p>
          <Link to="/login" className="btn-primary w-full justify-center py-2.5 mt-4 text-xs">
            Sign In Now
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field pl-9"
              />
            </div>
          </div>
          <button type="submit" disabled={loading || !token} className="btn-primary w-full justify-center py-2.5">
            {loading ? 'Updating...' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
};

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (token) {
      setLoading(true);
      authApi
        .verifyEmail(token)
        .then(() => setVerified(true))
        .catch((err) => setError(err.response?.data?.message || 'Verification failed.'))
        .finally(() => setLoading(false));
    }
  }, [token]);

  return (
    <div className="text-center py-4">
      {loading && <p className="text-sm text-gray-300">Verifying your email address...</p>}
      {verified && (
        <>
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-gray-100">Email Verified!</h2>
          <p className="text-xs text-gray-400 mt-1 mb-4">Your account is active. You can now log in.</p>
          <Link to="/login" className="btn-primary w-full justify-center py-2.5 text-xs">
            Sign In
          </Link>
        </>
      )}
      {error && (
        <>
          <p className="text-sm font-semibold text-rose-400 mb-2">{error}</p>
          <Link to="/login" className="btn-secondary w-full justify-center py-2.5 text-xs">
            Go to Login
          </Link>
        </>
      )}
    </div>
  );
};
