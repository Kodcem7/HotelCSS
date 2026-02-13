import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/auth';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const clientUri = `${window.location.origin}/reset-password`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const res = await forgotPassword(email, clientUri);
      setStatus({
        type: res.success ? 'success' : 'error',
        message:
          res.message ||
          'If an account exists with this email, a reset link has been sent.',
      });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        'An error occurred while sending the reset link.';
      setStatus({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative px-4 bg-slate-50">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50/95 to-stone-100/80" />

      <div className="relative w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-200/80 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600" />

          <div className="p-8 sm:p-10">
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={() => (window.location.href = '/login')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                ← Back to login
              </button>
              <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                Forgot Password
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Enter your email address and we&apos;ll send you a link to reset
                your password.
              </p>
              </div>
            </div>

            {status && (
              <div
                className={`mb-5 p-4 rounded-xl text-sm font-medium flex items-start gap-3 shadow-sm ${
                  status.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200/80 text-emerald-700'
                    : 'bg-red-50 border border-red-200/80 text-red-700'
                }`}
                role="alert"
              >
                <span>{status.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50/60 rounded-xl border-2 border-slate-200 focus:border-slate-400 focus:outline-none text-slate-800 placeholder-slate-400 text-sm font-medium transition-colors"
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 py-3.5 px-4 rounded-xl font-semibold text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-400/40 shadow-lg shadow-slate-900/20 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 active:scale-[0.99]"
              >
                {loading ? 'Sending reset link...' : 'Send reset link'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

