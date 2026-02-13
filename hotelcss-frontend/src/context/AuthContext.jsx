import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout } from '../api/auth';
import { 
  decodeToken, 
  getRoleFromToken, 
  getUserIdFromToken, 
  getUsernameFromToken,
  isTokenExpired 
} from '../utils/jwt';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const setAuthFromToken = (jwtToken) => {
    if (!jwtToken) return null;

    const role = getRoleFromToken(jwtToken);
    const userId = getUserIdFromToken(jwtToken);
    const username = getUsernameFromToken(jwtToken);

    if (!role) {
      return null;
    }

    const userData = {
      id: userId,
      username: username,
      role: role,
      token: jwtToken,
    };

    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);

    return userData;
  };

  // Initialize user from token on mount
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('token');
      
      if (!storedToken) {
        setLoading(false);
        return;
      }

      // Check if token is expired
      if (isTokenExpired(storedToken)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setLoading(false);
        return;
      }

      const userData = setAuthFromToken(storedToken);

      if (!userData) {
        // Invalid token, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (userName, password) => {
    try {
      const response = await apiLogin(userName, password);
      
      if (response.success && response.token) {
        const userData = setAuthFromToken(response.token);
        if (!userData) {
          return { success: false, message: 'Invalid token received from server.' };
        }
        return { success: true, user: userData };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error) {
      // Better error handling
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        return { 
          success: false, 
          message: 'Cannot connect to server. Please make sure the backend is running on http://localhost:5237' 
        };
      }
      
      if (error.response?.status === 400) {
        // Bad Request - show validation errors or backend message
        const backendMessage = error.response?.data?.message;
        const validationErrors = error.response?.data?.errors;
        
        if (validationErrors) {
          // Format validation errors
          const errorMessages = Object.values(validationErrors).flat().join(', ');
          return { 
            success: false, 
            message: `Validation error: ${errorMessages}` 
          };
        }
        
        return { 
          success: false, 
          message: backendMessage || 'Invalid request. Please check your input.' 
        };
      }
      
      if (error.response?.status === 401) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Invalid username or password!' 
        };
      }
      
      const message = error.response?.data?.message || error.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    }
  };

  const logout = () => {
    apiLogout();
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    loginWithToken: (jwtToken) => !!setAuthFromToken(jwtToken),
    loading,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
