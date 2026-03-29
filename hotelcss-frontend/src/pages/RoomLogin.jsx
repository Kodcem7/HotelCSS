import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomLogin } from '../api/auth';
import { useAuth } from '../context/AuthContext';

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
                    // Send them explicitly to the dashboard path, bypassing the root '/room' route
                    navigate('/room/dashboard');
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
      <div className="absolute inset-0 bg-[#FDFBF7]" />
      <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_15%_10%,rgba(211,84,0,0.10),transparent_55%),radial-gradient(800px_circle_at_85%_20%,rgba(74,55,40,0.10),transparent_60%)]" />

      <div
        className="relative w-full max-w-md login-card"
        style={{ animation: 'fadeInUp 0.6s ease-out' }}
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-[28px] shadow-2xl shadow-black/10 border border-[#E3DCD2]/50 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#4A3728] via-[#8E735B] to-[#D35400]" />

          <div className="p-8 sm:p-10">
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-xs font-semibold text-[#8E735B] hover:text-[#4A3728]"
              >
                ← Back to login
              </button>
              <div className="flex-1 text-center">
                <h1 className="text-2xl font-bold text-[#4A3728] tracking-tight font-headline">
                  Room Login
                </h1>
                <p className="mt-2 text-sm text-[#5D534A] font-medium">
                  Enter your room number, QR code string and email address.
                </p>
              </div>
            </div>

            {error && (
              <div
                className="mb-5 p-4 rounded-2xl bg-[#FADBD8] border border-[#E3DCD2]/80 text-[#B22222] text-sm font-medium flex items-start gap-3 shadow-sm"
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
                  className="w-full px-4 py-3 bg-[#F2EBE1]/55 rounded-2xl border-2 border-[#E3DCD2]/70 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E] placeholder:text-[#8E735B] text-sm font-medium transition-colors"
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
                  className="w-full px-4 py-3 bg-[#F2EBE1]/55 rounded-2xl border-2 border-[#E3DCD2]/70 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E] placeholder:text-[#8E735B] text-sm font-medium transition-colors"
                  placeholder="Paste QR token here"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F2EBE1]/55 rounded-2xl border-2 border-[#E3DCD2]/70 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E] placeholder:text-[#8E735B] text-sm font-medium transition-colors"
                  placeholder="e.g. guest@example.com"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 rounded-2xl font-semibold text-white bg-[#4A3728] hover:bg-[#3a2b20] focus:outline-none focus:ring-4 focus:ring-[#D35400]/20 shadow-lg shadow-black/15 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 active:scale-[0.99]"
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

