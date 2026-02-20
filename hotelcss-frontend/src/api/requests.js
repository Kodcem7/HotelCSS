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
  // Backend expects form-data (RequestCreateDTO with [FromForm])
  const formData = new FormData();
  formData.append('ServiceItemId', requestData.ServiceItemId);
  formData.append('Quantity', requestData.Quantity);
  if (requestData.Note) {
    formData.append('Note', requestData.Note);
  }
  if (requestData.Type) {
    formData.append('Type', requestData.Type);
  }
  if (requestData.Photo) {
    formData.append('Photo', requestData.Photo);
  }

  const response = await api.post('/Request', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Report a generic room issue (no specific service item)
 * @param {Object} issueData
 * @param {string} issueData.Title - Short title of the issue
 * @param {string} issueData.Description - Detailed description
 * @param {File} [issueData.Photo] - Optional photo file
 * @returns {Promise} API response
 */
export const reportIssue = async (issueData) => {
  const formData = new FormData();
  formData.append('Title', issueData.Title);
  formData.append('Description', issueData.Description);
  if (issueData.Photo) {
    formData.append('Photo', issueData.Photo);
  }

  const response = await api.post('/Request/ReportIssue', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
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

/**
 * Get departments available for creating requests (excludes Administration, Room, Manager)
 * Used by room users to pick a department before selecting a service item.
 * @returns {Promise} List of departments with imageUrl
 */
export const getRequestDepartments = async () => {
  const response = await api.get('/Request/GetDepartments');
  return response.data;
};

/**
 * Get service items for a given department
 * @param {number} departmentId - Department ID
 * @returns {Promise} List of service items for that department
 */
export const getServicesByDepartment = async (departmentId) => {
  const response = await api.get(`/Request/GetServicesByDepartment/${departmentId}`);
  return response.data;
};
