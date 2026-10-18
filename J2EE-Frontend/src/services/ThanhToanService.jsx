import apiClient from './apiClient';

const ThanhToanService = {
  /**
   * Xác nhận thanh toán thường (nội bộ, không qua cổng thanh toán ngoài)
   */
  xacNhanThanhToan: async (maThanhToan, token) => {
    try {
      const url = token
        ? `/client/thanhtoan/${maThanhToan}/xac-nhan?token=${encodeURIComponent(token)}`
        : `/client/thanhtoan/${maThanhToan}/xac-nhan`;
      const response = await apiClient.post(url);
      return response.data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }
};

export default ThanhToanService;
