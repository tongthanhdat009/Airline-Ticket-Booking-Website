import apiClient from './apiClient';
import { setClientAuthToken, setClientUserEmail, clearClientAuthCookies, getClientAccessToken } from '../utils/cookieUtils';

// Lấy thông tin khách hàng hiện tại từ backend
export const getCurrentUserClient = async () => {
    try {
        const response = await apiClient.get('/current-user');
        return response.data;
    } catch (error) {
        console.error("Error getting current user:", error);
        return null;
    }
};

// Đăng nhập khách hàng
export const loginClient = async (email, matKhau) => {
    try {
        const response = await apiClient.post('/dangnhap', {
            email,
            matKhau
        });
        
        // Lưu token vào cookie
        if (response.data.accessToken) {
            setClientAuthToken(response.data.accessToken, response.data.refreshToken);
            setClientUserEmail(email);
        }
        
        return response.data;
    } catch (error) {
        console.error("Error logging in:", error);
        throw error;
    }
};

// Đăng xuất khách hàng
export const logoutClient = () => {
    clearClientAuthCookies();
};

// Refresh token cho khách hàng
export const refreshTokenClient = async (refreshToken) => {
    try {
        const response = await apiClient.post('/dangnhap/refresh', {
            refreshToken
        });
        
        if (response.data.accessToken) {
            setClientAuthToken(response.data.accessToken, refreshToken);
        }
        
        return response.data;
    } catch (error) {
        console.error("Error refreshing token:", error);
        logoutClient();
        throw error;
    }
};

// Kiểm tra xem user đã đăng nhập chưa
export const isAuthenticatedClient = () => {
    return !!getClientAccessToken();
};
