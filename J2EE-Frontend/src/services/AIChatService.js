import apiClient from './apiClient';

const API = '/ai-chat';

/**
 * Gọi AI để tạo gợi ý trả lời cho admin
 * @param {string} sessionId - ID phiên chat
 * @returns {Promise} response chứa suggestions
 */
export const getAISuggestions = async (sessionId) => {
  const res = await apiClient.post(`${API}/suggest`, { sessionId });
  return res.data;
};
