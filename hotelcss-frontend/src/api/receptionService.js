import api from './axios';

/**
 * Create a wake-up service request for the current room user.
 * 👇 FIXED: Renamed to match ChatWidget and updated to send JSON for [FromBody]
 * @param {{ ScheduledTime: string, Notes?: string }} data
 */
export const createWakeUpCall = async (data) => {
    const response = await api.post('/ReceptionService/WakeUpService', data);
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
 * 👇 FIXED: Updated the URL to match your C# [HttpGet("GetPickUpTime")] route!
 */
export const getPickUpTime = async () => {
    const response = await api.get('/ReceptionService/GetPickUpTime');
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

/**
 * Update status for a wake-up service (Pending -> InProcess -> Completed).
 * @param {number} id
 * @param {'Pending' | 'InProcess' | 'Completed'} status
 */
export const updateWakeUpStatus = async (id, status) => {
    const response = await api.put(
        `/ReceptionService/wakeup/status/${id}?status=${encodeURIComponent(status)}`
    );
    return response.data;
};

/**
 * Update status for a pick-up info record (Pending -> InProcess -> Completed).
 * @param {number} id
 * @param {'Pending' | 'InProcess' | 'Completed'} status
 */
export const updatePickUpStatus = async (id, status) => {
    const response = await api.put(
        `/ReceptionService/pickup/status/${id}?status=${encodeURIComponent(status)}`
    );
    return response.data;
};

/**
 * Delete a completed wake-up service.
 * @param {number} id
 */
export const deleteWakeUpService = async (id) => {
    const response = await api.delete(`/ReceptionService/Delete_WakeUp/${id}`);
    return response.data;
};

/**
 * Delete a completed pick-up info.
 * @param {number} id
 */
export const deletePickUpService = async (id) => {
    const response = await api.delete(`/ReceptionService/Delete_PickUp/${id}`);
    return response.data;
};