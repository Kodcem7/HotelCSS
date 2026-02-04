import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getDashboardPathForRole } from '../utils/dashboardPath';

const Login = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState({ user: false, pass: false });
  const { login } = useAuth();
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!userName || !password) {
      setError('Please enter both username and password');
      setLoading(false);
      return;
    }

    const result = await login(userName, password);

    if (result.success) {
      navigate(getDashboardPathForRole(result.user?.role));
    } else {
      setError(result.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative px-4">
      {/* Background – soft neutral with slight warmth */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50/95 to-stone-100/80" />

      {/* Card */}
      <div
        className="relative w-full max-w-md login-card"
        style={{ animation: 'fadeInUp 0.6s ease-out' }}
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-200/80 overflow-hidden">
          {/* Header strip – subtle accent */}
          <div className="h-1 bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600" />

          <div className="p-8 sm:p-10">
            {/* Logo / Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-slate-700 text-white shadow-lg mb-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                HotelCSS
              </h1>
              <p className="mt-2 text-sm text-slate-600 font-medium">Sign in to your account</p>
            </div>

            {error && (
              <div
                className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-sm font-medium flex items-start gap-3 shadow-sm"
                role="alert"
              >
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="userName" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Username
                </label>
                <div
                  className={`relative rounded-xl border-2 bg-slate-50/50 transition-all duration-200 ${
                    focused.user ? 'border-slate-400 shadow-md shadow-slate-500/10' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input
                    id="userName"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    onFocus={() => setFocused((f) => ({ ...f, user: true }))}
                    onBlur={() => setFocused((f) => ({ ...f, user: false }))}
                    className="w-full pl-12 pr-4 py-3.5 bg-transparent rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none font-medium transition-colors"
                    placeholder="Enter your username"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div
                  className={`relative rounded-xl border-2 bg-slate-50/50 transition-all duration-200 ${
                    focused.pass ? 'border-slate-400 shadow-md shadow-slate-500/10' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused((f) => ({ ...f, pass: true }))}
                    onBlur={() => setFocused((f) => ({ ...f, pass: false }))}
                    className="w-full pl-12 pr-4 py-3.5 bg-transparent rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none font-medium transition-colors"
                    placeholder="Enter your password"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl font-semibold text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-400/40 shadow-lg shadow-slate-900/20 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 active:scale-[0.99]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-500">
              Demo credentials available in backend documentation
            </p>
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

export default Login;
