import apiClient from "./apiClient";

const CHAT_API_BASE = "/api/chat";

/**
 * Bắt đầu phiên chat (khách hàng)
 * @param {Object} data - { hoTen, email, soDienThoai }
 */
export const startChat = async (data) => {
  const response = await apiClient.post(`${CHAT_API_BASE}/start`, data);
  return response.data;
};

/**
 * Gửi tin nhắn (khách hàng)
 * @param {Object} data - { sessionId, noiDung }
 */
export const sendMessage = async (data) => {
  const response = await apiClient.post(`${CHAT_API_BASE}/message`, data);
  return response.data;
};

/**
 * Lấy lịch sử chat theo sessionId
 * @param {string} sessionId
 */
export const getChatHistory = async (sessionId) => {
  const response = await apiClient.get(`${CHAT_API_BASE}/history/${sessionId}`);
  return response.data;
};

/**
 * Lấy thông tin phiên chat
 * @param {string} sessionId
 */
export const getSessionInfo = async (sessionId) => {
  const response = await apiClient.get(`${CHAT_API_BASE}/session/${sessionId}`);
  return response.data;
};
