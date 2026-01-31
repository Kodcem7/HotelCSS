import api from './axios';

/**
 * Get all requests (role-based filtering handled by backend)
 * @returns {Promise} List of requests
 */
export const getRequests = async () => {
  const response = await api.get('/Request');
  return response.data;
};

/**
 * Create a new request
 * @param {Object} requestData - Request data
 * @param {number} requestData.RoomNumber - Room number
 * @param {number} requestData.ServiceItemId - Service item ID
 * @param {number} requestData.Quantity - Quantity (1-5)
 * @param {string} requestData.Note - Optional note
 * @returns {Promise} Created request
 */
export const createRequest = async (requestData) => {
  const response = await api.post('/Request', requestData);
  return response.data;
};

/**
 * Update request status
 * @param {number} id - Request ID
 * @param {string} newStatus - New status (Pending, InProcess, Completed, Cancelled)
 * @returns {Promise} Updated request
 */
export const updateRequestStatus = async (id, newStatus) => {
  const response = await api.put(`/Request/${id}?newStatus=${newStatus}`);
  return response.data;
};

/**
 * Delete a request
 * @param {number} id - Request ID
 * @returns {Promise} Deletion result
 */
export const deleteRequest = async (id) => {
  const response = await api.delete(`/Request/${id}`);
  return response.data;
};
