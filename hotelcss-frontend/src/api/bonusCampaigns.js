import api from './axios';

export const getActiveBonusEventsForDashboard = async () => {
  const response = await api.get('/HotelEvent/GetActiveBonusEventsForDashboard');
  return response.data;
};

export const deleteBonusCampaign = async (id) => {
  const response = await api.delete(`/BonusCampaign/${id}`);
  return response.data;
};

export const getActiveCampaigns = async () => {
    const response = await api.get('/BonusCampaign/GetActiveCampaigns'); // Change URL if needed
    return response.data;
};

