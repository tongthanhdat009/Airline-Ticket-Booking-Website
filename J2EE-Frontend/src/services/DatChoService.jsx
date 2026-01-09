import apiClient from './apiClient';
import { getClientAccessToken } from '../utils/cookieUtils';

const DatChoService = {
  // Lấy tất cả đặt chỗ của khách hàng theo mã hành khách
  getDatChoByHanhKhach: async (maHanhKhach) => {
    const token = getClientAccessToken();
    const response = await apiClient.get(`/client/datcho/hanhkhach/${maHanhKhach}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Lấy chi tiết đặt chỗ theo mã
  getDatChoById: async (maDatCho) => {
    const token = getClientAccessToken();
    const response = await apiClient.get(`/client/datcho/${maDatCho}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Tìm kiếm đặt chỗ theo mã đặt chỗ và tên hành khách
  searchDatCho: async (maDatCho, tenHanhKhach) => {
    const response = await apiClient.get(`/client/datcho/search`, {
      params: {
        maDatCho,
        tenHanhKhach
      }
    });
    return response.data;
  },

  // Lấy lịch sử thanh toán của khách hàng
  getLichSuThanhToan: async (maHanhKhach) => {
    const token = getClientAccessToken();
    const response = await apiClient.get(`/client/thanhtoan/hanhkhach/${maHanhKhach}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Hủy đặt chỗ
  huyDatCho: async (maDatCho) => {
    const token = getClientAccessToken();
    const response = await apiClient.delete(`/client/datcho/${maDatCho}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  }
};

export default DatChoService;
