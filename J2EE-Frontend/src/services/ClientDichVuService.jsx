import apiClient from './apiClient';

const ClientDichVuService = {
  // Lấy danh sách dịch vụ khả dụng cho chuyến bay
  getAvailableServices: async (maDatCho) => {
    const response = await apiClient.get(`/client/dichvu/available/${maDatCho}`);
    return response.data;
  },

  // Lấy danh sách dịch vụ đã đặt
  getBookedServices: async (maDatCho) => {
    const response = await apiClient.get(`/client/dichvu/booked/${maDatCho}`);
    return response.data;
  },

  // Thêm dịch vụ vào đặt chỗ
  addService: async (maDatCho, maLuaChon, soLuong = 1) => {
    const response = await apiClient.post('/client/dichvu/add', {
      maDatCho,
      maLuaChon,
      soLuong
    });
    return response.data;
  }
};

export default ClientDichVuService;
