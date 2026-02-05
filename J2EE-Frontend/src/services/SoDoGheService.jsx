import apiClient from "./apiClient";

/**
 * Lấy danh sách ghế của máy bay
 */
export const getSeatsByAircraft = async (maMayBay) => {
  try {
    const response = await apiClient.get(`/admin/dashboard/maybay/${maMayBay}/ghe`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy danh sách ghế của máy bay ${maMayBay}`, error);
    throw error;
  }
};

/**
 * Thêm một ghế vào máy bay
 */
export const addSeatToAircraft = async (maMayBay, seatData) => {
  try {
    const response = await apiClient.post(`/admin/dashboard/maybay/${maMayBay}/ghe`, seatData);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi thêm ghế vào máy bay ${maMayBay}`, error);
    throw error;
  }
};

/**
 * Cập nhật thông tin ghế
 */
export const updateSeat = async (maGhe, seatData) => {
  try {
    const response = await apiClient.put(`/admin/dashboard/maybay/ghe/${maGhe}`, seatData);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật ghế ${maGhe}`, error);
    throw error;
  }
};

/**
 * Xóa một ghế
 */
export const deleteSeat = async (maGhe) => {
  try {
    const response = await apiClient.delete(`/admin/dashboard/maybay/ghe/${maGhe}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa ghế ${maGhe}`, error);
    throw error;
  }
};

/**
 * Xóa tất cả ghế của máy bay
 */
export const deleteAllSeatsByAircraft = async (maMayBay) => {
  try {
    const response = await apiClient.delete(`/admin/dashboard/maybay/${maMayBay}/ghe`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa tất cả ghế của máy bay ${maMayBay}`, error);
    throw error;
  }
};

/**
 * Tự động tạo sơ đồ ghế cho máy bay
 */
export const autoGenerateSeats = async (maMayBay, configs) => {
  try {
    const response = await apiClient.post(`/admin/dashboard/maybay/${maMayBay}/ghe/auto-generate`, {
      configs: configs
    });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi tự động tạo sơ đồ ghế cho máy bay ${maMayBay}`, error);
    throw error;
  }
};
