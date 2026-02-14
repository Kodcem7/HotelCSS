import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import ChatWidget from './ChatWidget';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      Admin: 'Administrator',
      Manager: 'Manager',
      Reception: 'Reception',
      Staff: 'Staff',
      Housekeeping: 'Housekeeping',
      Restaurant: 'Restaurant',
      Room: 'Room',
    };
    return roleMap[role] || role;
  };

  const getDashboardTitle = () => {
    const path = location.pathname;
    if (path.includes('/admin')) return 'Admin Dashboard';
    if (path.includes('/manager')) return 'Manager Dashboard';
    if (path.includes('/reception')) return 'Reception Dashboard';
    if (path.includes('/staff')) return 'Staff Dashboard';
    if (path.includes('/room')) return 'Room Dashboard';
    return 'Dashboard';
  };

  // Dashboard root path for "Back" (e.g. /admin, /manager)
  const getDashboardRoot = () => {
    const path = location.pathname;
    if (path.startsWith('/admin')) return '/admin';
    if (path.startsWith('/manager')) return '/manager';
    if (path.startsWith('/reception')) return '/reception';
    if (path.startsWith('/staff')) return '/staff';
    if (path.startsWith('/room')) return '/room';
    return '/';
  };

  const isMainDashboard = () => {
    const path = location.pathname;
    const root = getDashboardRoot();
    return path === root || path === root + '/';
  };

  const showBackButton = !isMainDashboard();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50/90 via-white to-stone-50/70">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm shadow-slate-900/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              {showBackButton && (
                <button
                  onClick={() => navigate(getDashboardRoot())}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 bg-slate-100/80 border border-slate-200/80 hover:bg-slate-200/80 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300/50 transition-all"
                  aria-label="Back to dashboard"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </button>
              )}
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-700 text-white shadow-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                  {getDashboardTitle()}
                </h1>
                <p className="text-sm text-slate-600">
                  Welcome, <span className="font-semibold text-slate-800">{user?.username}</span>
                  <span className="text-slate-400 mx-1">•</span>
                  <span className="font-medium text-slate-600">{getRoleDisplayName(user?.role)}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-red-700 bg-red-50 border border-red-200/80 hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-300/50 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Chat widget for Room users */}
      {user?.role === 'Room' && <ChatWidget />}
    </div>
  );
};

export default Layout;
