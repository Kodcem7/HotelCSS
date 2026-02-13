import api from './axios';

/**
 * Get all rooms
 * @returns {Promise} List of rooms
 */
export const getRooms = async () => {
  const response = await api.get('/Room');
  return response.data;
};

/**
 * Create a single room
 * @param {Object} roomData - Room data
 * @param {number} roomData.RoomNumber - Room number
 * @param {string} roomData.Status - Room status
 * @returns {Promise} Created room
 */
export const createRoom = async (roomData) => {
  const response = await api.post('/Room/CreateRoom', roomData);
  return response.data;
};

/**
 * Create multiple rooms at once
 * @param {Object} config - Room configuration
 * @param {number} config.TotalFloors - Total number of floors
 * @param {number} config.RoomsPerFloor - Rooms per floor
 * @param {number} config.StartingRoomNumber - Starting room number multiplier
 * @returns {Promise} Creation result
 */
export const createAllRooms = async (config) => {
  const response = await api.post('/Room/CreateAllRooms', config);
  return response.data;
};

/**
 * Update room status
 * @param {number} id - Room number
 * @param {string} status - New room status
 * @returns {Promise} Updated room
 */
export const updateRoom = async (id, status) => {
  const response = await api.put(`/Room/${id}`, {
    Status: status,
  });
  return response.data;
};

/**
 * Delete a room
 * @param {number} id - Room number
 * @returns {Promise} Deletion result
 */
export const deleteRoom = async (id) => {
  const response = await api.delete(`/Room/${id}`);
  return response.data;
};

/**
 * Delete all rooms
 * @returns {Promise} Deletion result
 */
export const deleteAllRooms = async () => {
  const response = await api.delete('/Room/DeleteAll');
  return response.data;
};
