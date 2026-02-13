import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomLogin } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const RoomLogin = () => {
  const [roomId, setRoomId] = useState('');
  const [qrToken, setQrToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!roomId || !qrToken) {
      setError('Please enter both room number and QR token.');
      return;
    }

    setLoading(true);
    try {
      const res = await roomLogin(Number(roomId), qrToken);

      if (res.success && res.token) {
        const ok = loginWithToken(res.token);
        if (!ok) {
          setError('Invalid token returned from server.');
        } else {
          navigate('/room');
        }
      } else {
        setError(res.message || 'Room login failed.');
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Room login failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50/95 to-stone-100/80" />

      <div
        className="relative w-full max-w-md login-card"
        style={{ animation: 'fadeInUp 0.6s ease-out' }}
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-200/80 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600" />

          <div className="p-8 sm:p-10">
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                ← Back to login
              </button>
              <div className="flex-1 text-center">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                  Room Login
                </h1>
                <p className="mt-2 text-sm text-slate-600 font-medium">
                  Enter your room number and QR code string.
                </p>
              </div>
            </div>

            {error && (
              <div
                className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-sm font-medium flex items-start gap-3 shadow-sm"
                role="alert"
              >
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Room number
                </label>
                <input
                  type="number"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50/60 rounded-xl border-2 border-slate-200 focus:border-slate-400 focus:outline-none text-slate-800 placeholder-slate-400 text-sm font-medium transition-colors"
                  placeholder="e.g. 101"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  QR code string
                </label>
                <input
                  type="text"
                  value={qrToken}
                  onChange={(e) => setQrToken(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50/60 rounded-xl border-2 border-slate-200 focus:border-slate-400 focus:outline-none text-slate-800 placeholder-slate-400 text-sm font-medium transition-colors"
                  placeholder="Paste QR token here"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl font-semibold text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-400/40 shadow-lg shadow-slate-900/20 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 active:scale-[0.99]"
              >
                {loading ? 'Signing in...' : 'Sign in as room'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .login-card {
          animation: fadeInUp 0.6s ease-out;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default RoomLogin;

