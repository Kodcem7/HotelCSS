import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component for role-based access control
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string|string[]} props.allowedRoles - Role(s) allowed to access this route
 * @param {string} props.redirectTo - Path to redirect if unauthorized (default: '/login')
 */
const ProtectedRoute = ({ children, allowedRoles, redirectTo = '/login' }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check if user's role is allowed
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const hasAccess = roles.includes(user?.role);

    // Redirect if user doesn't have required role
  if (!hasAccess) {
    const roleRedirects = {
      Admin: '/admin',
      Manager: '/manager',
      Reception: '/reception',
      Staff: '/staff',
      Room: '/room',
      Housekeeping: '/staff',
      HouseKeeping: '/staff', // from DbInitializer
      Restaurant: '/staff',
      Kitchen: '/staff',
      Technic: '/staff',
    };
    const defaultRoute = roleRedirects[user?.role] || '/staff';
    return <Navigate to={defaultRoute} replace />;
  }

  // User is authenticated and has required role
  return children;
};

export default ProtectedRoute;
