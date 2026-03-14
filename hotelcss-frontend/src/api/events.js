import api from './axios';


export const getActiveEvents = async () => {
  const response = await api.get('/HotelEvent/GetActiveEvents');
  return response.data;
};


export const getHotelEvents = async () => {
  const response = await api.get('/HotelEvent');
  return response.data;
};


export const createHotelEvent = async (payload) => {
  const response = await api.post('/HotelEvent', payload);
  return response.data;
};


export const updateHotelEvent = async (id, payload) => {
  const response = await api.put(`/HotelEvent/${id}`, payload);
  return response.data;
};

export const deleteHotelEvent = async (id) => {
  const response = await api.delete(`/HotelEvent/${id}`);
  return response.data;
};

