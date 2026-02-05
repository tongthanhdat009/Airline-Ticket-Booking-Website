import axios from "axios";
import Cookies from "js-cookie";

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
    return Cookies.get('accessToken');
  }
  return null;
};

/**
 * Lấy refresh token theo loại người dùng từ memory
 * Refresh token KHÔNG được lưu trong cookies hay localStorage
 * Chỉ lưu trong memory khi login và mất đi khi refresh trang
 */
let adminRefreshToken = null;
let customerRefreshToken = null;

const getRefreshTokenByType = (userType) => {
  if (userType === 'admin') {
    return adminRefreshToken;
  } else if (userType === 'customer') {
    return customerRefreshToken;
  }
  return null;
};

const setRefreshTokenByType = (userType, refreshToken) => {
  if (userType === 'admin') {
    adminRefreshToken = refreshToken;
  } else if (userType === 'customer') {
    customerRefreshToken = refreshToken;
  }
};

const clearRefreshTokenByType = (userType) => {
  if (userType === 'admin') {
    adminRefreshToken = null;
  } else if (userType === 'customer') {
    customerRefreshToken = null;
  }
};

/**
 * Lưu token theo loại người dùng
 * Access token lưu vào cookie, refresh token lưu vào memory (in-app only)
 */
const setTokensByType = (userType, accessToken, refreshToken) => {
  if (userType === 'admin') {
    Cookies.set('admin_access_token', accessToken, { expires: 1 }); // 1 day
    if (refreshToken) {
      setRefreshTokenByType('admin', refreshToken);
    }
  } else if (userType === 'customer') {
    Cookies.set('accessToken', accessToken, { expires: 7, path: '/', sameSite: 'strict' }); // 7 days
    if (refreshToken) {
      setRefreshTokenByType('customer', refreshToken);
    }
  }
};

/**
 * Xóa token theo loại người dùng
 */
const clearTokensByType = (userType) => {
  if (userType === 'admin') {
    Cookies.remove('admin_access_token');
    clearRefreshTokenByType('admin');
  } else if (userType === 'customer') {
    Cookies.remove('accessToken', { path: '/' });
    clearRefreshTokenByType('customer');
  }
};

/**
 * Lấy đường dẫn refresh token theo loại người dùng
 */
const getRefreshEndpoint = (userType) => {
  if (userType === 'admin') {
    return '/admin/dangnhap/refresh';
  } else if (userType === 'customer') {
    return '/dangnhap/refresh'; // Sửa từ /customer/dangnhap/refresh thành /dangnhap/refresh
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

        // Gọi API refresh token với refreshToken trong body
        const { data } = await axios.post(
          `${BASE_URL}${refreshEndpoint}`,
          { refreshToken },
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );

        const newAccessToken = data?.accessToken;

        if (!newAccessToken) {
          throw new Error("No accessToken in response");
        }

        // Lưu access token mới (refresh token giữ nguyên trong memory)
        setTokensByType(userType, newAccessToken, refreshToken);

        // Cập nhật userInfo trong cookie nếu có roles và permissions mới (cho admin)
        if (userType === 'admin' && (data.roles || data.permissions)) {
          const userInfoCookie = Cookies.get('admin_user_info');
          if (userInfoCookie) {
            try {
              const userInfo = JSON.parse(userInfoCookie);
              userInfo.roles = data.roles || userInfo.roles || [];
              userInfo.permissions = data.permissions || userInfo.permissions || [];
              Cookies.set('admin_user_info', JSON.stringify(userInfo), { expires: 1 });
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
 * Helper function để login và lưu token
 * Lưu access token vào cookie, refresh token vào memory
 */
export const loginAndSetTokens = (userType, accessToken, refreshToken) => {
  setTokensByType(userType, accessToken, refreshToken);
};

/**
 * Helper function để logout
 * Xóa cả access token và refresh token
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

/**
 * Export hàm để component có thể lưu refresh token sau khi login
 */
export const setRefreshToken = (userType, refreshToken) => {
  setRefreshTokenByType(userType, refreshToken);
};

/**
 * Export hàm để component có thể lấy refresh token
 */
export const getRefreshToken = (userType) => {
  return getRefreshTokenByType(userType);
};

export default apiClient;
