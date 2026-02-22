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

  // Detect production
  const isProduction = import.meta.env.VITE_APP_ENV === 'production' ||
                       (typeof window !== 'undefined' && window.location.hostname === 'jadt-airline.io.vn');

  // Nếu là production và path bắt đầu bằng /, dùng path tương đối (nginx sẽ serve)
  if (isProduction && path.startsWith('/')) {
    return path;
  }

  // Development hoặc path không bắt đầu bằng /
  if (path.startsWith('/')) {
    return `${API_BASE_URL}${path}`;
  }
  return `${API_BASE_URL}/${path}`;
};

// Helper function riêng cho ảnh dịch vụ (nginx serve trên production, API trên local)
export const getServiceImageUrl = (filename) => {
  if (!filename) return '';
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }

  // Detect production
  const isProduction = import.meta.env.VITE_APP_ENV === 'production' ||
                       (typeof window !== 'undefined' && window.location.hostname === 'jadt-airline.io.vn');

  // Production: dùng nginx serve trực tiếp
  if (isProduction) {
    return `/uploads/AnhDichVuCungCap/${filename}`;
  }

  // Development: dùng API backend
  return getApiUrl(`/admin/dashboard/dichvu/anh/${filename}`);
};

// Helper function riêng cho ảnh lựa chọn dịch vụ
export const getServiceOptionImageUrl = (filename) => {
  if (!filename) return '';
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }

  // Detect production
  const isProduction = import.meta.env.VITE_APP_ENV === 'production' ||
                       (typeof window !== 'undefined' && window.location.hostname === 'jadt-airline.io.vn');

  // Production: dùng nginx serve trực tiếp
  if (isProduction) {
    return `/uploads/AnhLuaChonDichVu/${filename}`;
  }

  // Development: dùng API backend
  return getApiUrl(`/admin/dashboard/dichvu/luachon/anh/${filename}`);
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
  getServiceImageUrl,
  getServiceOptionImageUrl,
  getOAuthUrl,
  getPdfUrl,
};
