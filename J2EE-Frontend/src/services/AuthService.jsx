import apiClient, { loginAndSetTokens, getRefreshToken } from './apiClient';
import { setAdminUserInfo, clearAdminAuthCookies } from '../utils/cookieUtils';

const AUTH_API_URL = '/admin/dangnhap';

/**
 * Đăng nhập admin với multi-role và permissions
 * @param {Object} credentials - { username, password }
 * @returns {Object} - { accessToken, refreshToken, roles, permissions, username }
 * NOTE: refreshToken giờ được trả về trong response và lưu vào localStorage
 */
export const loginAdmin = async (credentials) => {
    try {
        const response = await apiClient.post(AUTH_API_URL, {
            tenDangNhap: credentials.username,
            matKhau: credentials.password
        });

        // Lưu cả access token và refresh token
        if (response.data.accessToken) {
            loginAndSetTokens('admin', response.data.accessToken, response.data.refreshToken);

            // Lưu thông tin user với roles và permissions
            const userInfo = {
                username: response.data.username || credentials.username,
                roles: response.data.roles || [],
                permissions: response.data.permissions || []
            };
            setAdminUserInfo(userInfo);
        }

        return response.data;
    } catch (error) {
        console.error("Error logging in:", error);
        throw error;
    }
};

// Đăng xuất
export const logout = async () => {
    try {
        // Gửi refreshToken trong body để backend revoke nó
        const refreshToken = getRefreshToken('admin');
        await apiClient.post('/admin/dangxuat', { refreshToken });
    } catch (error) {
        console.error("Error calling logout API:", error);
    } finally {
        // Luôn xóa local tokens ngay cả khi API fail
        clearAdminAuthCookies();
        // Xóa refreshToken từ localStorage
        try {
            localStorage.removeItem('admin_refresh_token');
        } catch (e) {
            console.error("Error removing refresh token:", e);
        }
    }
};

/**
 * Lấy thông tin user hiện tại từ backend
 * @returns {Object} - { username, roles, permissions, isAuthenticated }
 */
export const getCurrentUser = async () => {
    try {
        const response = await apiClient.get('/admin/current-user');
        return response.data;
    } catch (error) {
        console.error("Error getting current user:", error);
        return null;
    }
};

// Đăng xuất tất cả các thiết bị
export const logoutAllDevices = async () => {
    try {
        await apiClient.post('/admin/dangxuat/all');
    } catch (error) {
        console.error("Error logging out all devices:", error);
        throw error;
    } finally {
        // Xóa local cookies và refreshToken
        clearAdminAuthCookies();
        try {
            localStorage.removeItem('admin_refresh_token');
        } catch (e) {
            console.error("Error removing refresh token:", e);
        }
    }
};
