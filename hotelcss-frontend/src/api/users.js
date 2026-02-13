import api from './axios';

/**
 * Get all staff/users
 * @returns {Promise} List of users
 */
export const getStaffList = async () => {
  const response = await api.get('/User/GetStaffList');
  return response.data;
};

/**
 * Create a new user/staff member
 * @param {Object} userData - User data
 * @param {string} userData.UserName - Username
 * @param {string} userData.Password - Password
 * @param {string} userData.Name - Full name
 * @param {number} userData.DepartmentId - Department ID (0 for Admin)
 * @returns {Promise} Creation result
 */
export const createUser = async (userData) => {
  const response = await api.post('/User/CreatingNewUser', userData);
  return response.data;
};

/**
 * Update a user/staff member
 * @param {string} id - User ID
 * @param {Object} userData - Updated user data
 * @returns {Promise} Update result
 */
export const updateUser = async (id, userData) => {
  const response = await api.put(`/User/${id}`, userData);
  return response.data;
};

/**
 * Delete a user/staff member
 * @param {string} id - User ID
 * @returns {Promise} Deletion result
 */
export const deleteUser = async (id) => {
  const response = await api.delete(`/User/${id}`);
  return response.data;
};

/**
 * Change password for the currently logged-in user
 * @param {string} oldPassword
 * @param {string} newPassword
 */
export const changePassword = async (oldPassword, newPassword) => {
  const response = await api.post('/User/Change Password', {
    OldPassword: oldPassword,
    NewPassword: newPassword,
  });
  return response.data;
};

/**
 * Update profile for the currently logged-in user
 * @param {{ Name: string, UserName: string }} payload
 */
export const updateProfile = async ({ Name, UserName }) => {
  const response = await api.put('/User/UpdateMyProfile', {
    Name,
    UserName,
  });
  return response.data;
};
