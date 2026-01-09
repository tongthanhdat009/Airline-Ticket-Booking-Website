import axios from "axios";
import Cookies from "js-cookie";
import { getAccessToken, getRefreshToken, setAuthToken, clearAuthCookies } from '../utils/cookieUtils';

const BASE_URL = "http://localhost:8080";

// Tạo một axios instance dùng chung
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
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
    return Cookies.get('accessToken'); // Sửa từ 'user_access_token' thành 'accessToken'
  }
  return null;
};

/**
 * Lấy refresh token theo loại người dùng
 */
const getRefreshTokenByType = (userType) => {
  if (userType === 'admin') {
    return Cookies.get('admin_refresh_token');
  } else if (userType === 'customer') {
    return Cookies.get('refreshToken'); // Sửa từ 'user_refresh_token' thành 'refreshToken'
  }
  return null;
};

/**
 * Lưu token theo loại người dùng
 */
const setTokensByType = (userType, accessToken, refreshToken) => {
  if (userType === 'admin') {
    Cookies.set('admin_access_token', accessToken, { expires: 1 }); // 1 day
    if (refreshToken) {
      Cookies.set('admin_refresh_token', refreshToken, { expires: 30 }); // 30 days
    }
  } else if (userType === 'customer') {
    Cookies.set('accessToken', accessToken, { expires: 7, path: '/', sameSite: 'strict' }); // 7 days
    if (refreshToken) {
      Cookies.set('refreshToken', refreshToken, { expires: 30, path: '/', sameSite: 'strict' }); // 30 days
    }
  }
};

/**
 * Xóa token theo loại người dùng
 */
const clearTokensByType = (userType) => {
  if (userType === 'admin') {
    Cookies.remove('admin_access_token');
    Cookies.remove('admin_refresh_token');
  } else if (userType === 'customer') {
    Cookies.remove('accessToken', { path: '/' });
    Cookies.remove('refreshToken', { path: '/' });
  }
};

/**
 * Lấy đường dẫn refresh token theo loại người dùng
 */
const getRefreshEndpoint = (userType) => {
  if (userType === 'admin') {
    return '/admin/dangnhap/refresh';
  } else if (userType === 'customer') {
    return '/customer/dangnhap/refresh';
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
      const refreshToken = getRefreshTokenByType(userType);

      if (!refreshToken) {
        // Không có refresh token => xóa token
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
        
        // Gọi API refresh token
        const { data } = await axios.post(
          `${BASE_URL}${refreshEndpoint}`,
          { refreshToken },
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );

        const newAccessToken = data?.accessToken;
        const newRefreshToken = data?.refreshToken;

        if (!newAccessToken) {
          throw new Error("No accessToken in response");
        }

        // Lưu token mới
        setTokensByType(userType, newAccessToken, newRefreshToken);

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
 * Helper function để login và lưu token
 */
export const loginAndSetTokens = (userType, accessToken, refreshToken) => {
  setTokensByType(userType, accessToken, refreshToken);
};

/**
 * Helper function để logout
 */
export const logoutAndClearTokens = (userType) => {
  clearTokensByType(userType);
  const loginPath = getLoginPath(userType);
  window.location.href = loginPath;
};

/**
 * Kiểm tra xem user đã đăng nhập chưa
 */
export const isAuthenticated = (userType) => {
  const accessToken = getAccessTokenByType(userType);
  return !!accessToken;
};

export default apiClient;
