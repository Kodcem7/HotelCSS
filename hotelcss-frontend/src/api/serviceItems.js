import api from './axios';

/**
 * Get all service items
 * @returns {Promise} List of service items
 */
export const getServiceItems = async () => {
  const response = await api.get('/ServiceItem/GetServiceItems');
  return response.data;
};

/**
 * Create a service item
 * @param {FormData} formData - Form data with service item info and optional image
 * @returns {Promise} Created service item
 */
export const createServiceItem = async (formData) => {
  const response = await api.post('/ServiceItem', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Update a service item
 * @param {number} id - Service item ID
 * @param {FormData} formData - Updated service item data
 * @returns {Promise} Updated service item
 */
export const updateServiceItem = async (id, formData) => {
  const response = await api.put(`/ServiceItem/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Delete a service item
 * @param {number} id - Service item ID
 * @returns {Promise} Deletion result
 */
export const deleteServiceItem = async (id) => {
  const response = await api.delete(`/ServiceItem/${id}`);
  return response.data;
};
