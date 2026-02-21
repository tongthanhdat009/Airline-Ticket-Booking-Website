import axios from "axios";
import Cookies from "js-cookie";

// Lấy BASE_URL từ biến môi trường, fallback về localhost khi phát triển
// Backend có context-path=/api nên cần thêm vào
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// Detect production environment
const isProduction = import.meta.env.VITE_APP_ENV === 'production' || typeof window !== 'undefined' && window.location.protocol === 'https:';

// Cookie config cho production
const getCookieConfig = () => ({
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'strict',
  path: '/'
});

// Tên keys cho localStorage
const ADMIN_REFRESH_TOKEN_KEY = 'admin_refresh_token';
const CUSTOMER_REFRESH_TOKEN_KEY = 'customer_refresh_token';

// Tạo một axios instance dùng chung
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
  // KHÔNG cần withCredentials vì refreshToken được gửi trong body
  withCredentials: false,
});

// Cờ và hàng đợi để xử lý tình huống refresh token đang diễn ra
let isRefreshing = false;
let pendingQueue = [];

/**
 * Xác định loại người dùng dựa trên URL hoặc cookie
 */
const getUserType = (url) => {
  // Nếu URL chứa /admin/ thì chắc chắn là admin request
  if (url && url.includes('/admin/')) {
    return 'admin';
  }

  // Nếu URL chứa /client/ hoặc /customer/ thì đánh dấu là customer
  if (url && (url.includes('/client/') || url.includes('/customer/'))) {
    return 'customer';
  }

  // Nếu không có dấu hiệu từ URL, kiểm tra cookie để xác định
  if (Cookies.get('admin_access_token')) {
    return 'admin';
  }
  if (Cookies.get('accessToken')) {
    return 'customer';
  }

  // Mặc định là customer (frontend) để tránh vô tình redirect về admin login
  return 'customer';
};

/**
 * Lấy access token theo loại người dùng
 */
const getAccessTokenByType = (userType) => {
  if (userType === 'admin') {
    return Cookies.get('admin_access_token');
  } else if (userType === 'customer') {
    return Cookies.get('accessToken');
  }
  return null;
};

/**
 * Lấy refresh token từ localStorage theo loại người dùng
 */
const getRefreshTokenByType = (userType) => {
  if (typeof window === 'undefined') return null;
  try {
    const key = userType === 'admin' ? ADMIN_REFRESH_TOKEN_KEY : CUSTOMER_REFRESH_TOKEN_KEY;
    return localStorage.getItem(key);
  } catch (e) {
    console.error("Error getting refresh token from localStorage:", e);
    return null;
  }
};

/**
 * Lưu access token theo loại người dùng (vào cookie)
 */
const setAccessTokenByType = (userType, accessToken) => {
  const cookieConfig = getCookieConfig();
  if (userType === 'admin') {
    Cookies.set('admin_access_token', accessToken, { ...cookieConfig, expires: 1 }); // 1 day
  } else if (userType === 'customer') {
    Cookies.set('accessToken', accessToken, { ...cookieConfig, expires: 7 }); // 7 days
  }
};

/**
 * Lưu refresh token theo loại người dùng (vào localStorage)
 */
const setRefreshTokenByType = (userType, refreshToken) => {
  if (typeof window === 'undefined') return;
  try {
    const key = userType === 'admin' ? ADMIN_REFRESH_TOKEN_KEY : CUSTOMER_REFRESH_TOKEN_KEY;
    if (refreshToken) {
      localStorage.setItem(key, refreshToken);
    } else {
      localStorage.removeItem(key);
    }
  } catch (e) {
    console.error("Error saving refresh token to localStorage:", e);
  }
};

/**
 * Xóa access token (cookie)
 */
const clearAccessTokenByType = (userType) => {
  const cookieConfig = getCookieConfig();
  if (userType === 'admin') {
    Cookies.remove('admin_access_token', cookieConfig);
  } else if (userType === 'customer') {
    Cookies.remove('accessToken', cookieConfig);
  }
};

/**
 * Xóa refresh token (localStorage)
 */
const clearRefreshTokenByType = (userType) => {
  if (typeof window === 'undefined') return;
  try {
    const key = userType === 'admin' ? ADMIN_REFRESH_TOKEN_KEY : CUSTOMER_REFRESH_TOKEN_KEY;
    localStorage.removeItem(key);
  } catch (e) {
    console.error("Error removing refresh token from localStorage:", e);
  }
};

/**
 * Lưu cả access token và refresh token
 */
const setTokensByType = (userType, accessToken, refreshToken) => {
  setAccessTokenByType(userType, accessToken);
  if (refreshToken) {
    setRefreshTokenByType(userType, refreshToken);
  }
};

/**
 * Xóa cả access token và refresh token
 */
const clearTokensByType = (userType) => {
  clearAccessTokenByType(userType);
  clearRefreshTokenByType(userType);
};

/**
 * Lấy đường dẫn refresh token theo loại người dùng
 */
const getRefreshEndpoint = (userType) => {
  if (userType === 'admin') {
    return '/admin/dangnhap/refresh';
  } else if (userType === 'customer') {
    return '/dangnhap/refresh';
  }
  return null;
};

/**
 * Lấy đường dẫn đăng nhập theo loại người dùng
 */
const getLoginPath = (userType) => {
  if (userType === 'admin') {
    return '/admin/login';
  }
  // For any non-admin (customer) default to client login
  return '/dang-nhap-client';
};

/**
 * Xử lý hàng đợi request sau khi refresh token
 */
const processQueue = (newToken, error) => {
  pendingQueue.forEach(({ resolve, reject, originalRequest }) => {
    if (newToken) {
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      resolve(apiClient(originalRequest));
    } else {
      reject(error);
    }
  });
  pendingQueue = [];
};

// Request interceptor - Tự động thêm token vào headers
apiClient.interceptors.request.use(
  (config) => {
    const userType = getUserType(config.url);
    const accessToken = getAccessTokenByType(userType);

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý lỗi 401 và refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config: originalRequest, response } = error;

    // Nếu không có response hoặc request không hợp lệ, hoặc đã retry rồi
    if (!response?.status || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Chỉ xử lý khi gặp 401 (Unauthorized)
    if (response.status === 401) {
      originalRequest._retry = true;

      const userType = getUserType(originalRequest.url);

      const accessToken = getAccessTokenByType(userType);
      const refreshToken = getRefreshTokenByType(userType);

      if (!accessToken || !refreshToken) {
        // Không có access token hoặc refresh token => redirect về login
        clearTokensByType(userType);

        // Nếu originalRequest.skipRedirect được đặt thì không redirect
        if (!originalRequest.skipRedirect) {
          // Chỉ redirect nếu trang hiện tại tương ứng với loại user
          const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
          if (userType === 'admin' && currentPath.startsWith('/admin')) {
            window.location.href = getLoginPath('admin');
          } else if (userType === 'customer' && !currentPath.startsWith('/admin')) {
            window.location.href = getLoginPath('customer');
          }
        }

        return Promise.reject(error);
      }

      // Nếu đang refresh rồi: đưa request vào hàng đợi
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject, originalRequest });
        });
      }

      try {
        isRefreshing = true;

        const refreshEndpoint = getRefreshEndpoint(userType);

        // Gọi API refresh token - Gửi refreshToken trong body
        const { data } = await axios.post(
          `${BASE_URL}${refreshEndpoint}`,
          { refreshToken }, // Gửi refreshToken trong body
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: false // Không cần với cách mới
          }
        );

        const newAccessToken = data?.accessToken;

        if (!newAccessToken) {
          throw new Error("No accessToken in response");
        }

        // Lưu access token mới
        // Refresh token vẫn giữ nguyên (không đổi) nên không cần update
        setTokensByType(userType, newAccessToken, null);

        // Cập nhật userInfo trong cookie nếu có roles và permissions mới (cho admin)
        if (userType === 'admin' && (data.roles || data.permissions)) {
          const userInfoCookie = Cookies.get('admin_user_info');
          if (userInfoCookie) {
            try {
              const userInfo = JSON.parse(userInfoCookie);
              userInfo.roles = data.roles || userInfo.roles || [];
              userInfo.permissions = data.permissions || userInfo.permissions || [];
              const cookieConfig = getCookieConfig();
              Cookies.set('admin_user_info', JSON.stringify(userInfo), { ...cookieConfig, expires: 1 });
            } catch (e) {
              console.error("Error updating user info in cookie:", e);
            }
          }
        }

        // Xử lý các request đang chờ
        processQueue(newAccessToken, null);

        // Retry request ban đầu với token mới
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);

      } catch (err) {
        // Refresh thất bại: xóa token và xử lý queue
        clearTokensByType(userType);
        processQueue(null, err);

        // Chỉ redirect nếu trang hiện tại thuộc loại người dùng tương ứng
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        if (userType === 'admin' && currentPath.startsWith('/admin')) {
          window.location.href = getLoginPath('admin');
        } else if (userType === 'customer' && !currentPath.startsWith('/admin')) {
          window.location.href = getLoginPath('customer');
        }

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Các lỗi khác
    return Promise.reject(error);
  }
);

/**
 * Helper function để login và lưu access token và refresh token
 */
export const loginAndSetTokens = (userType, accessToken, refreshToken) => {
  setTokensByType(userType, accessToken, refreshToken);
};

/**
 * Helper function để logout
 * Xóa access token, refresh token và gọi API để thu hồi refresh token
 */
export const logoutAndClearTokens = (userType) => {
  const refreshToken = getRefreshTokenByType(userType);
  clearTokensByType(userType);
  const loginPath = getLoginPath(userType);

  // Gọi API để thu hồi refresh token ở backend
  if (refreshToken) {
    const refreshEndpoint = userType === 'admin' ? '/admin/dangxuat' : '/dangxuat';
    axios.post(
      `${BASE_URL}${refreshEndpoint}`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } }
    ).catch(e => console.error("Error calling logout API:", e));
  }

  window.location.href = loginPath;
};

/**
 * Kiểm tra xem user đã đăng nhập chưa
 */
export const isAuthenticated = (userType) => {
  const accessToken = getAccessTokenByType(userType);
  return !!accessToken;
};

/**
 * Lấy refresh token hiện tại
 */
export const getRefreshToken = (userType) => {
  return getRefreshTokenByType(userType);
};

export default apiClient;
