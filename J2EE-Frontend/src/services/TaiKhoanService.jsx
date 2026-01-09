import apiClient from './apiClient';
import { getClientAccessToken } from '../utils/cookieUtils';

const TaiKhoanService = {
  // Lấy thông tin tài khoản theo email
  getTaiKhoanByEmail: async (email) => {
    const token = getClientAccessToken();
    const response = await apiClient.get(`/taikhoan/email/${email}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Cập nhật thông tin tài khoản
  updateTaiKhoan: async (maTaiKhoan, data) => {
    const token = getClientAccessToken();
    const response = await apiClient.put(`/taikhoan/${maTaiKhoan}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Đổi mật khẩu
  changePassword: async (maTaiKhoan, oldPassword, newPassword) => {
    const token = getClientAccessToken();
    const response = await apiClient.post(`/taikhoan/${maTaiKhoan}/change-password`, {
      oldPassword,
      newPassword
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  }
};

export default TaiKhoanService;
