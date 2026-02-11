import apiClient, { loginAndSetTokens } from './apiClient';
import { setAdminUserInfo, clearAdminAuthCookies } from '../utils/cookieUtils';

const AUTH_API_URL = '/admin/dangnhap';

/**
 * Đăng nhập admin với multi-role và permissions
 * @param {Object} credentials - { username, password }
 * @returns {Object} - { accessToken, roles, permissions, username }
 * NOTE: refreshToken KHÔNG được trả về nữa, nó được backend set vào httpOnly cookie
 */
export const loginAdmin = async (credentials) => {
    try {
        const response = await apiClient.post(AUTH_API_URL, {
            tenDangNhap: credentials.username,
            matKhau: credentials.password
        });

        // Lưu access token - refresh token đã được backend set vào httpOnly cookie
        if (response.data.accessToken) {
            loginAndSetTokens('admin', response.data.accessToken);

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
        // SECURITY: Refresh token giờ ở httpOnly cookie, frontend không thể truy cập
        // Backend sẽ tự động đọc refreshToken từ cookie và revoke nó
        // Gọi logout API để backend revoke refresh token và xóa cookie
        await apiClient.post('/admin/dangxuat');
    } catch (error) {
        console.error("Error calling logout API:", error);
    } finally {
        // Luôn xóa local cookies ngay cả khi API fail
        clearAdminAuthCookies();
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
        // Xóa local cookies
        clearAdminAuthCookies();
    }
};
