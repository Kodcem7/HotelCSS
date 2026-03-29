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
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative px-4">
      <div className="absolute inset-0 bg-[#FDFBF7]" />
      <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_15%_10%,rgba(211,84,0,0.10),transparent_55%),radial-gradient(800px_circle_at_85%_20%,rgba(74,55,40,0.10),transparent_60%)]" />

      <div className="relative w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-xl rounded-[28px] shadow-2xl shadow-black/10 border border-[#E3DCD2]/50 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#4A3728] via-[#8E735B] to-[#D35400]" />

          <div className="p-8 sm:p-10">
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={() => (window.location.href = '/login')}
                className="text-xs font-semibold text-[#8E735B] hover:text-[#4A3728]"
              >
                ← Back to login
              </button>
              <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-[#4A3728] tracking-tight font-headline">
                Forgot Password
              </h1>
              <p className="mt-2 text-sm text-[#5D534A]">
                Enter your email address and we&apos;ll send you a link to reset
                your password.
              </p>
              </div>
            </div>

            {status && (
              <div
                className={`mb-5 p-4 rounded-xl text-sm font-medium flex items-start gap-3 shadow-sm ${
                  status.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200/80 text-emerald-700 rounded-2xl'
                    : 'bg-[#FADBD8] border border-[#E3DCD2]/80 text-[#B22222] rounded-2xl'
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
                  className="w-full px-4 py-3.5 bg-[#F2EBE1]/55 rounded-2xl border-2 border-[#E3DCD2]/70 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E] placeholder:text-[#8E735B] text-sm font-medium transition-colors"
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 py-3.5 px-4 rounded-2xl font-semibold text-white bg-[#4A3728] hover:bg-[#3a2b20] focus:outline-none focus:ring-4 focus:ring-[#D35400]/20 shadow-lg shadow-black/15 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 active:scale-[0.99]"
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

