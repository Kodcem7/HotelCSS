import api from './axios';

export const getActiveBonusEventsForDashboard = async () => {
  const response = await api.get('/HotelEvent/GetActiveBonusEventsForDashboard');
  return response.data;
};

export const deleteBonusCampaign = async (id) => {
  const response = await api.delete(`/BonusCampaign/${id}`);
  return response.data;
};

