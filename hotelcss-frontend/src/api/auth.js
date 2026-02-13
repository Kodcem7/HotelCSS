import api from './axios';

/**
 * Login API call
 * @param {string} userName - Username
 * @param {string} password - Password
 * @returns {Promise} API response with token
 */
export const login = async (userName, password) => {
  const response = await api.post('/User/Login', {
    UserName: userName,
    Password: password,
  });
  return response.data;
};

/**
 * Logout - clears local storage
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Forgot password - sends reset link to user's email
 * @param {string} email - User email
 * @param {string} clientUri - Frontend reset password URL
 */
export const forgotPassword = async (email, clientUri) => {
  const response = await api.post('/User/ForgotPassword', {
    Email: email,
    ClientUri: clientUri,
  });
  return response.data;
};

/**
 * Reset password - uses token from email link
 * @param {Object} payload
 * @param {string} payload.email
 * @param {string} payload.token
 * @param {string} payload.password
 */
export const resetPassword = async ({ email, token, password }) => {
  const response = await api.post('/User/ResetPassword', {
    Email: email,
    Token: token,
    Password: password,
  });
  return response.data;
};

/**
 * Room login with room number and QR token
 * @param {number} roomId
 * @param {string} token
 */
export const roomLogin = async (roomId, token) => {
  const response = await api.get('/User/Room Login', {
    params: { roomId, token },
  });
  return response.data;
};
