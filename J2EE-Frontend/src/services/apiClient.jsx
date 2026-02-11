import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = "http://localhost:8080";

// Tạo một axios instance dùng chung
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
  // QUAN TRỌNG: withCredentials = true để gửi httpOnly cookies đi với request
  withCredentials: true,
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
 * SECURITY UPDATE:
 * Refresh token giờ được lưu trong httpOnly cookie (backend set)
 * Frontend KHÔNG thể truy cập httpOnly cookie qua JavaScript
 * Browser sẽ tự động gửi cookie cùng với request khi withCredentials = true
 * Không cần lưu refresh token trong memory nữa!
 */

/**
 * Lưu access token theo loại người dùng
 * Refresh token đã được backend set vào httpOnly cookie, frontend không cần quản lý
 */
const setAccessTokenByType = (userType, accessToken) => {
  if (userType === 'admin') {
    Cookies.set('admin_access_token', accessToken, { expires: 1, sameSite: 'strict' }); // 1 day
  } else if (userType === 'customer') {
    Cookies.set('accessToken', accessToken, { expires: 7, path: '/', sameSite: 'strict' }); // 7 days
  }
};

/**
 * Xóa access token (refresh token ở httpOnly cookie sẽ được backend xóa khi logout)
 */
const clearAccessTokenByType = (userType) => {
  if (userType === 'admin') {
    Cookies.remove('admin_access_token');
  } else if (userType === 'customer') {
    Cookies.remove('accessToken', { path: '/' });
  }
};

/**
 * Lưu token theo loại người dùng
 * Chỉ lưu access token, refresh token đã được backend set vào httpOnly cookie
 */
const setTokensByType = (userType, accessToken) => {
  setAccessTokenByType(userType, accessToken);
  // Refresh token được backend quản lý trong httpOnly cookie, frontend không cần làm gì
};

/**
 * Xóa token theo loại người dùng
 */
const clearTokensByType = (userType) => {
  clearAccessTokenByType(userType);
  // Refresh token ở httpOnly cookie sẽ được backend xóa
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

      // SECURITY: Không cần check refreshToken nữa vì nó ở httpOnly cookie
      // Backend sẽ tự động đọc refresh token từ cookie
      const accessToken = getAccessTokenByType(userType);

      if (!accessToken) {
        // Không có access token => redirect về login
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

        // Gọi API refresh token - KHÔNG gửi refreshToken trong body
        // Backend sẽ đọc refreshToken từ httpOnly cookie
        const { data } = await axios.post(
          `${BASE_URL}${refreshEndpoint}`,
          {}, // Empty body - refreshToken từ cookie
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true // QUAN TRỌNG: để gửi httpOnly cookies
          }
        );

        const newAccessToken = data?.accessToken;

        if (!newAccessToken) {
          throw new Error("No accessToken in response");
        }

        // Lưu access token mới (refresh token vẫn ở httpOnly cookie, backend quản lý)
        setTokensByType(userType, newAccessToken);

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
 * Helper function để login và lưu access token
 * Refresh token được backend set vào httpOnly cookie tự động
 */
export const loginAndSetTokens = (userType, accessToken) => {
  setTokensByType(userType, accessToken);
};

/**
 * Helper function để logout
 * Xóa access token và gọi API để xóa httpOnly cookie
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

// DEPRECATED: Các hàm này không còn cần thiết vì refresh token ở httpOnly cookie
/**
 * @deprecated Refresh token giờ được backend quản lý trong httpOnly cookie
 */
export const setRefreshToken = () => {
  console.warn('setRefreshToken is deprecated - refreshToken now managed by backend in httpOnly cookie');
};

/**
 * @deprecated Refresh token giờ được backend quản lý trong httpOnly cookie
 */
export const getRefreshToken = () => {
  console.warn('getRefreshToken is deprecated - refreshToken now managed by backend in httpOnly cookie');
  return null;
};

export default apiClient;
