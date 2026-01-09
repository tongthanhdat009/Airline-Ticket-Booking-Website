import axios from 'axios';
import { getClientAccessToken } from '../utils/cookieUtils';

const API_BASE_URL = 'http://localhost:8080/api/vnpay';

const VNPayService = {
  /**
   * Tạo URL thanh toán VNPay
   */
  createPayment: async (maThanhToan) => {
    try {
      const token = getClientAccessToken();
      const response = await axios.post(
        `${API_BASE_URL}/create-payment?maThanhToan=${maThanhToan}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
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
      const token = getClientAccessToken();
      const response = await axios.get(`${API_BASE_URL}/payment-result`, {
        params: params,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error handling VNPay callback:', error);
      throw error;
    }
  }
};

export default VNPayService;
