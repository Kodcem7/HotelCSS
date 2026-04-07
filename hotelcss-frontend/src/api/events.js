import api from './axios';

// -----------------------------------------
// PUBLIC ENDPOINTS (Used by ChatWidget)
// -----------------------------------------

export const getActiveBonusEvents = async () => {
    const response = await api.get('/HotelEvent/GetActiveBonusEventsForDashboard');
    return response.data;
};

export const getActiveEvents = async () => {
    const response = await api.get('/HotelEvent/GetActiveEvents');
    return response.data;
};

export const getMealList = async () => {
    const response = await api.get('/HotelEvent/GetMealList');
    return response.data;
};


// -----------------------------------------
// ADMIN ENDPOINTS (Used by Dashboard)
// -----------------------------------------

export const getHotelEvents = async () => {
    const response = await api.get('/HotelEvent');
    return response.data;
};

export const createHotelEvent = async (payload) => {
    // Backend expects [FromForm] (multipart/form-data)
    const formData = new FormData();
    Object.entries(payload || {}).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        formData.append(key, value);
    });

    const response = await api.post('/HotelEvent', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const updateHotelEvent = async (id, payload) => {
    // Backend expects [FromForm] (multipart/form-data)
    const formData = new FormData();
    Object.entries(payload || {}).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        formData.append(key, value);
    });

    const response = await api.put(`/HotelEvent/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const deleteHotelEvent = async (id) => {
    const response = await api.delete(`/HotelEvent/${id}`);
    return response.data;
};