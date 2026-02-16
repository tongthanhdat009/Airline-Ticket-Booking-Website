/**
 * Cấu hình API cho ứng dụng
 * Sử dụng biến môi trường để dễ dàng deploy lên các môi trường khác nhau
 */

// Lấy API Base URL từ biến môi trường, fallback về localhost khi phát triển
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Lấy WebSocket URL từ biến môi trường, fallback về localhost khi phát triển
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "http://localhost:8080/ws";

// Helper function để build đầy đủ URL cho API endpoint
export const getApiUrl = (path) => {
  // Nếu path đã là đầy đủ URL (http/https), trả về nguyên trạng
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Nếu path bắt đầu bằng /, nối trực tiếp với BASE_URL
  if (path.startsWith('/')) {
    return `${API_BASE_URL}${path}`;
  }
  // Ngược lại, thêm / vào giữa
  return `${API_BASE_URL}/${path}`;
};

// Helper function để build URL cho static assets (images, etc.)
export const getAssetUrl = (path) => {
  if (!path) return '';
  // Nếu path đã là đầy đủ URL hoặc blob URL
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }
  // Nếu path bắt đầu bằng /, nối trực tiếp với BASE_URL
  if (path.startsWith('/')) {
    return `${API_BASE_URL}${path}`;
  }
  // Ngược lại, thêm / vào giữa
  return `${API_BASE_URL}/${path}`;
};

// Helper function để build URL cho OAuth
export const getOAuthUrl = (provider = 'google') => {
  return `${API_BASE_URL}/oauth2/authorization/${provider}`;
};

// Helper function để build URL cho PDF export
export const getPdfUrl = (path) => {
  return getApiUrl(path);
};

export default {
  API_BASE_URL,
  WS_BASE_URL,
  getApiUrl,
  getAssetUrl,
  getOAuthUrl,
  getPdfUrl,
};
