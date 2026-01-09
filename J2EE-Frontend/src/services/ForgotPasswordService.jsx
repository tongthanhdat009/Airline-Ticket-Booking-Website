import apiClient from "./apiClient";

export const ForgotPasswordService = {
  // Kiểm tra email tồn tại và gửi OTP
  sendResetPasswordEmail: async (email) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      const msg = error?.response?.data?.message || "Email không tồn tại trong hệ thống!";
      throw new Error(msg);
    }
  },

  // Xác thực OTP
  verifyOTP: async (email, otp) => {
    try {
      const response = await apiClient.post('/auth/verify-otp', { email, otp });
      return response.data;
    } catch (error) {
      const msg = error?.response?.data?.message || "Mã OTP không hợp lệ!";
      throw new Error(msg);
    }
  },

  // Đặt lại mật khẩu
  resetPassword: async (email, otp, newPassword) => {
    try {
      const response = await apiClient.post('/auth/reset-password', { email, otp, newPassword });
      return response.data;
    } catch (error) {
      const msg = error?.response?.data?.message || "Không thể đặt lại mật khẩu!";
      throw new Error(msg);
    }
  }
};
