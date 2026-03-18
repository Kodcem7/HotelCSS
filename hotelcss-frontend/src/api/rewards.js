import api from './axios';

export const getRewardsCatalog = async () => {
  const response = await api.get('/Reward/GetRewardsCatalog');
  return response.data;
};

export const claimReward = async (serviceItemId) => {
  const response = await api.post(`/Reward/ClaimReward?serviceItemId=${serviceItemId}`);
  return response.data;
};

export const getVouchersForReception = async () => {
  const response = await api.get('/Reward/GetVouchersForReception');
  return response.data;
};

export const updateRewardVoucherStatus = async (voucherId, newStatus) => {
  const response = await api.put(`/Reward/${voucherId}`, newStatus, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

