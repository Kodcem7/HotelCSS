import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { roomLogin } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import ConciergeAuthLayout from '../components/ConciergeAuthLayout';

const RoomLogin = () => {
  const [roomId, setRoomId] = useState('');
  const [qrToken, setQrToken] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!roomId || !qrToken || !email) {
      setError('Please enter room number, QR token and email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await roomLogin(Number(roomId), qrToken, email);

      if (res.success && res.token) {
        const ok = loginWithToken(res.token);
        if (!ok) {
          setError('Invalid token returned from server.');
        } else {
          navigate('/room/dashboard');
        }
      } else {
        setError(res.message || 'Room login failed.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Room login failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <footer className="mt-16 pt-12 border-t border-concierge-outline-variant/10">
      <p className="text-sm text-concierge-on-surface-variant italic font-headline text-center">
        Staff account?{' '}
        <Link className="text-concierge-primary font-sans font-bold not-italic hover:underline" to="/login">
          Concierge login
        </Link>
      </p>
    </footer>
  );

  return (
    <ConciergeAuthLayout
      badge="Guest Portal"
      title="Room login"
      subtitle="Enter your room number, QR token from your welcome card, and the email on file."
      backLink={{ to: '/login', label: '← Back to concierge login' }}
      heroHeadline={
        <>
          Your stay, <br />
          elevated.
        </>
      }
      heroParagraph="Access your in-room concierge, services, and preferences with the credentials provided at check-in."
      footer={footer}
    >
      {error && (
        <div
          className="mb-8 p-4 rounded-2xl bg-concierge-error-container/90 border border-concierge-outline-variant/30 text-concierge-on-error-container text-sm font-medium flex items-start gap-3"
          role="alert"
        >
          <span className="material-symbols-outlined text-lg shrink-0">error</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label
              className="block text-[10px] font-bold tracking-widest uppercase text-concierge-outline ml-6"
              htmlFor="roomId"
            >
              Room number
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-concierge-outline group-focus-within:text-concierge-primary transition-colors">
                hotel
              </span>
              <input
                id="roomId"
                type="number"
                min="1"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-concierge-surface-container-low rounded-full border-none focus:ring-2 focus:ring-concierge-primary/20 focus:bg-concierge-surface-container-lowest transition-all duration-300 placeholder:text-concierge-outline/40 text-concierge-on-surface"
                placeholder="e.g. 101"
                disabled={loading}
                required
              />
              <div className="absolute inset-0 rounded-full border border-concierge-primary/0 group-focus-within:border-concierge-primary/20 pointer-events-none transition-all duration-300" />
            </div>
          </div>

          <div className="space-y-2">
            <label
              className="block text-[10px] font-bold tracking-widest uppercase text-concierge-outline ml-6"
              htmlFor="qrToken"
            >
              QR code string
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-concierge-outline group-focus-within:text-concierge-primary transition-colors">
                qr_code_2
              </span>
              <input
                id="qrToken"
                type="text"
                value={qrToken}
                onChange={(e) => setQrToken(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-concierge-surface-container-low rounded-full border-none focus:ring-2 focus:ring-concierge-primary/20 focus:bg-concierge-surface-container-lowest transition-all duration-300 placeholder:text-concierge-outline/40 text-concierge-on-surface"
                placeholder="Paste QR token here"
                disabled={loading}
                required
              />
              <div className="absolute inset-0 rounded-full border border-concierge-primary/0 group-focus-within:border-concierge-primary/20 pointer-events-none transition-all duration-300" />
            </div>
          </div>

          <div className="space-y-2">
            <label
              className="block text-[10px] font-bold tracking-widest uppercase text-concierge-outline ml-6"
              htmlFor="email"
            >
              Guest email
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
                className="w-full pl-14 pr-6 py-4 bg-concierge-surface-container-low rounded-full border-none focus:ring-2 focus:ring-concierge-primary/20 focus:bg-concierge-surface-container-lowest transition-all duration-300 placeholder:text-concierge-outline/40 text-concierge-on-surface"
                placeholder="guest@example.com"
                disabled={loading}
                required
              />
              <div className="absolute inset-0 rounded-full border border-concierge-primary/0 group-focus-within:border-concierge-primary/20 pointer-events-none transition-all duration-300" />
            </div>
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
              Signing in…
            </span>
          ) : (
            <>
              <span className="text-sm font-semibold uppercase tracking-widest">Enter your suite</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </>
          )}
        </button>
      </form>
    </ConciergeAuthLayout>
  );
};

export default RoomLogin;
