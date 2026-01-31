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
