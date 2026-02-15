import apiClient from './apiClient';

const API_BASE_URL = '/api/vnpay';

const VNPayService = {
  /**
   * Tạo URL thanh toán VNPay
   */
  createPayment: async (maThanhToan) => {
    try {
      const response = await apiClient.post(
        `${API_BASE_URL}/create-payment?maThanhToan=${maThanhToan}`
      );
      return response.data;
    } catch (error) {
      console.error('Error creating VNPay payment:', error);
      throw error;
    }
  },

  /**
   * Xử lý callback từ VNPay
   */
  handleCallback: async (params) => {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/payment-result`, {
        params: params
      });
      return response.data;
    } catch (error) {
      console.error('Error handling VNPay callback:', error);
      throw error;
    }
  }
};

export default VNPayService;
