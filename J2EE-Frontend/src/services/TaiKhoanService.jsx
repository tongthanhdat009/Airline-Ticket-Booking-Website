import apiClient from './apiClient';

const TaiKhoanService = {
  getTaiKhoanByEmail: async (email, skipRedirect = false) => {
    const response = await apiClient.get(`/taikhoan/email/${email}`, {
      // Thêm config để tránh redirect khi 401
      skipRedirect: skipRedirect
    });
    return response.data;
  },

  updateTaiKhoan: async (maTaiKhoan, data) => {
    const response = await apiClient.put(`/taikhoan/${maTaiKhoan}`, data);
    return response.data;
  },

  changePassword: async (maTaiKhoan, oldPassword, newPassword) => {
    const response = await apiClient.post(`/taikhoan/${maTaiKhoan}/change-password`, {
      oldPassword,
      newPassword
    });
    return response.data;
  },

  updateHanhKhach: async (maHanhKhach, data) => {
    const response = await apiClient.put(`/hanhkhach/${maHanhKhach}`, data);
    return response.data;
  }
};

export default TaiKhoanService;
