import api from './axios';

/**
 * Create a wake-up service request for the current room user.
 * Backend route: POST /api/ReceptionService/Wake-Up Service (space must be URL-encoded)
 * @param {{ ScheduledTime: string, Notes?: string }} data
 */
export const createWakeUpService = async (data) => {
  const formData = new FormData();
  formData.append('ScheduledTime', data.ScheduledTime);
  if (data.Notes) {
    formData.append('Notes', data.Notes);
  }

  const response = await api.post('/ReceptionService/Wake-Up%20Service', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Get reception-related services for the current user.
 * Room role: only their own wake-up services.
 */
export const getReceptionServices = async () => {
  const response = await api.get('/ReceptionService/GetReceptionServices');
  return response.data;
};

/**
 * Get pick-up time information for the current room, if any.
 * (Uses strange route name with spaces in backend.)
 */
export const getPickUpTime = async () => {
  const response = await api.get('/ReceptionService/Learn%20Pick-Up%20Time');
  return response.data;
};

/**
 * Update an existing wake-up service time (used by reception/admin).
 * @param {number} id
 * @param {string} scheduledTimeIso ISO datetime string
 */
export const updateWakeUpTime = async (id, scheduledTimeIso) => {
  const response = await api.put(`/ReceptionService/wakeup/${id}`, scheduledTimeIso, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

/**
 * Create or update pick-up time information for a room.
 * Backend will upsert based on existing record.
 * @param {number} roomNumber
 * @param {{ ScheduledTime: string, Notes?: string }} data
 */
export const setPickUpTime = async (roomNumber, data) => {
  const formData = new FormData();
  formData.append('ScheduledTime', data.ScheduledTime);
  if (data.Notes) {
    formData.append('Notes', data.Notes);
  }

  const response = await api.post(
    `/ReceptionService/SetPickUpTime?roomNumber=${roomNumber}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

/**
 * Update existing pick-up time by record id.
 * @param {number} id
 * @param {string} scheduledTimeIso ISO datetime string
 */
export const updatePickUpTime = async (id, scheduledTimeIso) => {
  const response = await api.put(`/ReceptionService/pickup/${id}`, scheduledTimeIso, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};


