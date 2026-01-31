import api from './axios';

/**
 * Get all departments
 * @returns {Promise} List of departments
 */
export const getDepartments = async () => {
  const response = await api.get('/Department/GetDepartments');
  return response.data;
};

/**
 * Create a department
 * @param {FormData} formData - Form data with department info and optional image
 * @returns {Promise} Created department
 */
export const createDepartment = async (formData) => {
  const response = await api.post('/Department', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Update a department
 * @param {number} id - Department ID
 * @param {FormData} formData - Updated department data
 * @returns {Promise} Updated department
 */
export const updateDepartment = async (id, formData) => {
  const response = await api.put(`/Department/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Delete a department
 * @param {number} id - Department ID
 * @returns {Promise} Deletion result
 */
export const deleteDepartment = async (id) => {
  const response = await api.delete(`/Department/${id}`);
  return response.data;
};
