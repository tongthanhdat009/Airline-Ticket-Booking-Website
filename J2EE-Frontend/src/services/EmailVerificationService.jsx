import axios from "axios";

const BASE_URL = "http://localhost:8080";

export const EmailVerificationService = {
  // Gửi email xác thực - không cần token
  sendVerificationEmail: async (email) => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/send-verification`, 
        { email },
        {
          headers: { "Content-Type": "application/json" }
        }
      );
      return response.data;
    } catch (error) {
      const msg = error?.response?.data?.message || "Không thể gửi email xác thực!";
      throw new Error(msg);
    }
  },

  // Xác thực email bằng token - không cần authentication
  verifyEmail: async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/auth/verify-email?token=${token}`);
      return response.data;
    } catch (error) {
      const msg = error?.response?.data?.message || "Xác thực email thất bại!";
      throw new Error(msg);
    }
  },

  // Gửi lại email xác thực - không cần token
  resendVerificationEmail: async (email) => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/resend-verification`, 
        { email },
        {
          headers: { "Content-Type": "application/json" }
        }
      );
      return response.data;
    } catch (error) {
      const msg = error?.response?.data?.message || "Không thể gửi lại email xác thực!";
      throw new Error(msg);
    }
  }
};
