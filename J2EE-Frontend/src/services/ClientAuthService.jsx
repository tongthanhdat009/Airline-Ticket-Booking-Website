import apiClient, { loginAndSetTokens } from './apiClient';
import { setClientUserEmail, clearClientAuthCookies, getClientAccessToken } from '../utils/cookieUtils';

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
        
        // Lưu token - access token vào cookie, refresh token vào memory
        if (response.data.accessToken) {
            loginAndSetTokens('customer', response.data.accessToken, response.data.refreshToken);
            setClientUserEmail(email);
        }
        
        return response.data;
    } catch (error) {
        console.error("Error logging in:", error);
        throw error;
    }
};

// Đăng xuất khách hàng
export const logoutClient = async () => {
    try {
        // Backend quản lý refresh token trong httpOnly cookie, gọi logout all để revoke
        await apiClient.post('/dangxuat/all');
    } catch (error) {
        console.error("Error calling logout API:", error);
    } finally {
        // Luôn xóa local cookies ngay cả khi API fail
        clearClientAuthCookies();
    }
};

// Kiểm tra xem user đã đăng nhập chưa
export const isAuthenticatedClient = () => {
    return !!getClientAccessToken();
};

// Đăng xuất tất cả các thiết bị
export const logoutAllDevicesClient = async () => {
    try {
        await apiClient.post('/dangxuat/all');
    } catch (error) {
        console.error("Error logging out all devices:", error);
        throw error;
    } finally {
        // Xóa local cookies và memory
        clearClientAuthCookies();
    }
};
