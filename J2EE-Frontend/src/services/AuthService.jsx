import apiClient from './apiClient';
import { setAdminAuthToken, setAdminUserInfo, clearAdminAuthCookies } from '../utils/cookieUtils';

const AUTH_API_URL = '/admin/dangnhap';

// Đăng nhập admin
export const loginAdmin = async (credentials) => {
    try {
        const response = await apiClient.post(AUTH_API_URL, {
            tenDangNhap: credentials.username,
            matKhau: credentials.password
        });
        
        // Lưu token vào cookie
        if (response.data.accessToken) {
            setAdminAuthToken(response.data.accessToken, response.data.refreshToken);
            
            // Lưu thông tin user
            const userInfo = {
                username: credentials.username,
                role: 'ADMIN'
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
        // Không cần gọi API logout vì backend dùng JWT stateless
        clearAdminAuthCookies();
    } catch (error) {
        console.error("Error logging out:", error);
        clearAdminAuthCookies();
    }
};

// Refresh token
export const refreshToken = async (refreshToken) => {
    try {
        const response = await apiClient.post('/admin/dangnhap/refresh', null, {
            headers: {
                'Cookie': `refresh_token_admin=${refreshToken}`
            }
        });
        
        if (response.data.accessToken) {
            setAdminAuthToken(response.data.accessToken, refreshToken);
        }
        
        return response.data;
    } catch (error) {
        console.error("Error refreshing token:", error);
        clearAdminAuthCookies();
        throw error;
    }
};

// Lấy thông tin user hiện tại từ backend
export const getCurrentUser = async () => {
    try {
        const response = await apiClient.get('/admin/current-user');
        return response.data;
    } catch (error) {
        console.error("Error getting current user:", error);
        return null;
    }
};
