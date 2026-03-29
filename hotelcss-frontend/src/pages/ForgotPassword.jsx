import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/auth';
import ConciergeAuthLayout from '../components/ConciergeAuthLayout';

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
        error?.response?.data?.message || 'An error occurred while sending the reset link.';
      setStatus({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <footer className="mt-16 pt-12 border-t border-concierge-outline-variant/10">
      <p className="text-sm text-concierge-on-surface-variant italic font-headline text-center">
        Remembered your credentials?{' '}
        <Link className="text-concierge-primary font-sans font-bold not-italic hover:underline" to="/login">
          Back to login
        </Link>
      </p>
    </footer>
  );

  return (
    <ConciergeAuthLayout
      badge="Account recovery"
      title="Forgot password"
      subtitle="Enter your work email and we will send a secure link to reset your private key."
      backLink={{ to: '/login', label: '← Back to login' }}
      heroHeadline={
        <>
          Security & <br />
          peace of mind.
        </>
      }
      heroParagraph="Password recovery is handled over encrypted email. If you do not see a message within a few minutes, check spam or contact administration."
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
            {status.type === 'success' ? 'mark_email_read' : 'error'}
          </span>
          <span>{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <label
            className="block text-[10px] font-bold tracking-widest uppercase text-concierge-outline ml-6"
            htmlFor="email"
          >
            Work email
          </label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-concierge-outline group-focus-within:text-concierge-primary transition-colors">
              mail
            </span>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-concierge-surface-container-low rounded-full border-none focus:ring-2 focus:ring-concierge-primary/20 focus:bg-concierge-surface-container-lowest transition-all duration-300 placeholder:text-concierge-outline/40 placeholder:font-light text-concierge-on-surface"
              placeholder="you@hotelcss.com"
              required
              disabled={loading}
            />
            <div className="absolute inset-0 rounded-full border border-concierge-primary/0 group-focus-within:border-concierge-primary/20 pointer-events-none transition-all duration-300" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full concierge-hero-gradient text-white py-5 px-8 rounded-full font-medium tracking-wide shadow-xl shadow-concierge-primary/20 hover:shadow-concierge-primary/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
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
              Sending…
            </span>
          ) : (
            <>
              <span className="text-sm font-semibold uppercase tracking-widest">Send reset link</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </>
          )}
        </button>
      </form>
    </ConciergeAuthLayout>
  );
};

export default ForgotPassword;
