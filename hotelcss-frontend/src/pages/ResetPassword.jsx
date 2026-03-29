import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../api/auth';
import ConciergeAuthLayout from '../components/ConciergeAuthLayout';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const ResetPassword = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const email = query.get('email');
  const token = query.get('token');

  useEffect(() => {
    if (!email || !token) {
      setStatus({
        type: 'error',
        message: 'Invalid or expired password reset link.',
      });
    }
  }, [email, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await resetPassword({ email, token, password });
      setStatus({
        type: 'success',
        message: res.message || 'Password has been reset successfully.',
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      const apiErrors = error?.response?.data?.Errors;
      const message =
        (Array.isArray(apiErrors) && apiErrors.join(' ')) ||
        error?.response?.data?.message ||
        'Failed to reset password.';
      setStatus({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <footer className="mt-16 pt-12 border-t border-concierge-outline-variant/10">
      <p className="text-sm text-concierge-on-surface-variant italic font-headline text-center">
        Prefer to start over?{' '}
        <Link className="text-concierge-primary font-sans font-bold not-italic hover:underline" to="/login">
          Back to login
        </Link>
      </p>
    </footer>
  );

  return (
    <ConciergeAuthLayout
      badge="Secure reset"
      title="New private key"
      subtitle="Choose a strong password you have not used elsewhere. You will be redirected to the concierge login."
      backLink={{ to: '/login', label: '← Back to login' }}
      heroHeadline={
        <>
          Fresh credentials, <br />
          same standards.
        </>
      }
      heroParagraph="Your reset link is single-use. After updating, sign in with the usual concierge portal."
      footer={footer}
    >
      {status && (
        <div
          className={`mb-8 p-4 rounded-2xl text-sm font-medium flex items-start gap-3 border ${
            status.type === 'success'
              ? 'bg-emerald-50/90 border-emerald-200/80 text-emerald-900'
              : 'bg-concierge-error-container/90 border-concierge-outline-variant/30 text-concierge-on-error-container'
          }`}
          role="alert"
        >
          <span className="material-symbols-outlined text-lg shrink-0">
            {status.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label
              className="block text-[10px] font-bold tracking-widest uppercase text-concierge-outline ml-6"
              htmlFor="password"
            >
              New password
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-concierge-outline group-focus-within:text-concierge-primary transition-colors">
                lock
              </span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-concierge-surface-container-low rounded-full border-none focus:ring-2 focus:ring-concierge-primary/20 focus:bg-concierge-surface-container-lowest transition-all duration-300 placeholder:text-concierge-outline/40 text-concierge-on-surface"
                placeholder="••••••••"
                required
                minLength={6}
                disabled={loading || !email || !token}
              />
              <div className="absolute inset-0 rounded-full border border-concierge-primary/0 group-focus-within:border-concierge-primary/20 pointer-events-none transition-all duration-300" />
            </div>
          </div>

          <div className="space-y-2">
            <label
              className="block text-[10px] font-bold tracking-widest uppercase text-concierge-outline ml-6"
              htmlFor="confirm"
            >
              Confirm new password
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-concierge-outline group-focus-within:text-concierge-primary transition-colors">
                verified_user
              </span>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-concierge-surface-container-low rounded-full border-none focus:ring-2 focus:ring-concierge-primary/20 focus:bg-concierge-surface-container-lowest transition-all duration-300 placeholder:text-concierge-outline/40 text-concierge-on-surface"
                placeholder="••••••••"
                required
                minLength={6}
                disabled={loading || !email || !token}
              />
              <div className="absolute inset-0 rounded-full border border-concierge-primary/0 group-focus-within:border-concierge-primary/20 pointer-events-none transition-all duration-300" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !email || !token}
          className="w-full concierge-hero-gradient text-white py-5 px-8 rounded-full font-medium tracking-wide shadow-xl shadow-concierge-primary/20 hover:shadow-concierge-primary/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {loading ? (
            <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Resetting…
            </span>
          ) : (
            <>
              <span className="text-sm font-semibold uppercase tracking-widest">Save new password</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </>
          )}
        </button>
      </form>
    </ConciergeAuthLayout>
  );
};

export default ResetPassword;
