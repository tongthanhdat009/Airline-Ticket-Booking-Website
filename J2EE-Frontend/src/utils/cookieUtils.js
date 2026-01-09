import Cookies from "js-cookie";

// ==================== COOKIE KEYS ====================
// Định nghĩa các key cho Admin và Client riêng biệt
export const ADMIN_COOKIE_KEYS = {
  ACCESS_TOKEN: "admin_access_token",
  REFRESH_TOKEN: "admin_refresh_token",
  USER_INFO: "admin_user_info",
};

export const CLIENT_COOKIE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER_EMAIL: "userEmail",
};

// Cấu hình cookie mặc định
const cookieConfig = {
  path: "/",
  sameSite: "strict",
  secure: false, // Set true nếu dùng HTTPS
};

// ==================== ADMIN FUNCTIONS ====================

// Lưu token admin vào cookie
export const setAdminAuthToken = (accessToken, refreshToken = null) => {
  Cookies.set(ADMIN_COOKIE_KEYS.ACCESS_TOKEN, accessToken, {
    ...cookieConfig,
    expires: 7, // 7 ngày
  });

  if (refreshToken) {
    Cookies.set(ADMIN_COOKIE_KEYS.REFRESH_TOKEN, refreshToken, {
      ...cookieConfig,
      expires: 30, // 30 ngày
    });
  }
};

// Lấy access token admin từ cookie
export const getAdminAccessToken = () => {
  return Cookies.get(ADMIN_COOKIE_KEYS.ACCESS_TOKEN);
};

// Lấy refresh token admin từ cookie
export const getAdminRefreshToken = () => {
  return Cookies.get(ADMIN_COOKIE_KEYS.REFRESH_TOKEN);
};

// Lưu thông tin admin vào cookie
export const setAdminUserInfo = (userInfo) => {
  Cookies.set(ADMIN_COOKIE_KEYS.USER_INFO, JSON.stringify(userInfo), {
    ...cookieConfig,
    expires: 7,
  });
};

// Lấy thông tin admin từ cookie
export const getAdminUserInfo = () => {
  const userInfo = Cookies.get(ADMIN_COOKIE_KEYS.USER_INFO);
  return userInfo ? JSON.parse(userInfo) : null;
};

// Xóa tất cả cookie admin khi đăng xuất
export const clearAdminAuthCookies = () => {
  Cookies.remove(ADMIN_COOKIE_KEYS.ACCESS_TOKEN, cookieConfig);
  Cookies.remove(ADMIN_COOKIE_KEYS.REFRESH_TOKEN, cookieConfig);
  Cookies.remove(ADMIN_COOKIE_KEYS.USER_INFO, cookieConfig);

  // Xóa localStorage
  localStorage.removeItem("admin_access_token");
  localStorage.removeItem("admin_refresh_token");
  localStorage.removeItem("admin_user_info");
};

// Kiểm tra admin đã đăng nhập chưa
export const isAdminAuthenticated = () => {
  return !!getAdminAccessToken();
};

// ==================== CLIENT FUNCTIONS ====================

// Lưu token client vào cookie
export const setClientAuthToken = (accessToken, refreshToken = null) => {
  Cookies.set(CLIENT_COOKIE_KEYS.ACCESS_TOKEN, accessToken, {
    ...cookieConfig,
    expires: 7, // 7 ngày
  });

  if (refreshToken) {
    Cookies.set(CLIENT_COOKIE_KEYS.REFRESH_TOKEN, refreshToken, {
      ...cookieConfig,
      expires: 30, // 30 ngày
    });
  }
};

// Lấy access token client từ cookie
export const getClientAccessToken = () => {
  return Cookies.get(CLIENT_COOKIE_KEYS.ACCESS_TOKEN);
};

// Lấy refresh token client từ cookie
export const getClientRefreshToken = () => {
  return Cookies.get(CLIENT_COOKIE_KEYS.REFRESH_TOKEN);
};

// Lưu email client vào cookie
export const setClientUserEmail = (email) => {
  Cookies.set(CLIENT_COOKIE_KEYS.USER_EMAIL, email, {
    ...cookieConfig,
    expires: 7,
  });
};

// Lấy email client từ cookie
export const getClientUserEmail = () => {
  return Cookies.get(CLIENT_COOKIE_KEYS.USER_EMAIL);
};

// Xóa tất cả cookie client khi đăng xuất
export const clearClientAuthCookies = () => {
  Cookies.remove(CLIENT_COOKIE_KEYS.ACCESS_TOKEN, cookieConfig);
  Cookies.remove(CLIENT_COOKIE_KEYS.REFRESH_TOKEN, cookieConfig);
  Cookies.remove(CLIENT_COOKIE_KEYS.USER_EMAIL, cookieConfig);

  // Xóa localStorage
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userEmail");
};

// Kiểm tra client đã đăng nhập chưa
export const isClientAuthenticated = () => {
  return !!getClientAccessToken();
};

// ==================== LEGACY FUNCTIONS (Backward Compatibility) ====================
// Các hàm này giữ lại để không break code cũ, mặc định dùng cho admin

export const setAuthToken = setAdminAuthToken;
export const getAccessToken = getAdminAccessToken;
export const getRefreshToken = getAdminRefreshToken;
export const setUserInfo = setAdminUserInfo;
export const getUserInfo = getAdminUserInfo;
export const clearAuthCookies = () => {
  clearAdminAuthCookies();
  clearClientAuthCookies();
};
export const isAuthenticated = isAdminAuthenticated;
