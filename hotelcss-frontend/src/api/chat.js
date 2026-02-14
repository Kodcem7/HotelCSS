import api from './axios';

/**
 * Analyze natural language request and get structured order intent
 * @param {string} question - User message (e.g. "I'd like 2 towels and extra pillows")
 * @returns {Promise<{ success: boolean, data?: { ServiceItemId, ItemName, Quantity, Intent, Note } }>}
 */
export const analyzeRequest = async (question) => {
  const response = await api.post('/Chat/analyze', { Question: question });
  return response.data;
};
