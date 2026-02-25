import apiClient from "./apiClient";

const QL_CHAT_API_BASE = "/api/chat/admin";

/**
 * Lấy danh sách chat sessions (admin)
 */
export const getChatSessions = async () => {
  const response = await apiClient.get(`${QL_CHAT_API_BASE}/sessions`);
  return response.data;
};

/**
 * Admin nhận chat (assign)
 * @param {string} sessionId
 */
export const assignChat = async (sessionId) => {
  const response = await apiClient.post(`${QL_CHAT_API_BASE}/assign`, { sessionId });
  return response.data;
};

/**
 * Admin gửi tin nhắn
 * @param {Object} data - { sessionId, noiDung }
 */
export const sendAdminMessage = async (data) => {
  const response = await apiClient.post(`${QL_CHAT_API_BASE}/message`, data);
  return response.data;
};

/**
 * Admin đóng chat
 * @param {string} sessionId
 */
export const closeChat = async (sessionId) => {
  const response = await apiClient.post(`${QL_CHAT_API_BASE}/close`, { sessionId });
  return response.data;
};

/**
 * Lấy thống kê chat (admin)
 */
export const getChatStats = async () => {
  const response = await apiClient.get(`${QL_CHAT_API_BASE}/stats`);
  return response.data;
};

/**
 * Lấy lịch sử chat (admin dùng chung endpoint với customer)
 * @param {string} sessionId
 */
export const getChatHistory = async (sessionId) => {
  const response = await apiClient.get(`/api/chat/history/${sessionId}`);
  return response.data;
};
