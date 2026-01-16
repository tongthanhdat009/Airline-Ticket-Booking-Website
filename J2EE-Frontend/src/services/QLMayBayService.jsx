import apiClient from "./apiClient";

/**
 * Lấy danh sách tất cả máy bay
 */
export const getAllMayBay = async () => {
  try {
    const response = await apiClient.get("/admin/dashboard/maybay");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách máy bay", error);
    throw error;
  }
};

/**
 * Lấy thông tin máy bay theo ID
 */
export const getMayBayById = async (maMayBay) => {
  try {
    const response = await apiClient.get(`/admin/dashboard/maybay/${maMayBay}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy thông tin máy bay ${maMayBay}`, error);
    throw error;
  }
};

/**
 * Thêm máy bay mới
 */
export const addMayBay = async (mayBayData) => {
  try {
    const response = await apiClient.post('/admin/dashboard/maybay', mayBayData);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi thêm máy bay', error);
    throw error;
  }
};

/**
 * Cập nhật thông tin máy bay
 */
export const updateMayBay = async (maMayBay, mayBayData) => {
  try {
    const response = await apiClient.put(`/admin/dashboard/maybay/${maMayBay}`, mayBayData);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật máy bay ${maMayBay}`, error);
    throw error;
  }
};

/**
 * Xóa máy bay
 */
export const deleteMayBay = async (maMayBay) => {
  try {
    const response = await apiClient.delete(`/admin/dashboard/maybay?maMayBay=${maMayBay}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa máy bay ${maMayBay}`, error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái máy bay
 */
export const updateTrangThaiMayBay = async (maMayBay, trangThai) => {
  try {
    const response = await apiClient.put(`/admin/dashboard/maybay/trangthai?maMayBay=${maMayBay}&trangThai=${trangThai}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật trạng thái máy bay ${maMayBay}`, error);
    throw error;
  }
};

/**
 * Khôi phục máy bay đã xóa
 */
export const restoreMayBay = async (maMayBay) => {
  try {
    const response = await apiClient.put(`/admin/dashboard/maybay/${maMayBay}/restore`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi khôi phục máy bay ${maMayBay}`, error);
    throw error;
  }
};

/**
 * Lấy danh sách máy bay đã xóa
 */
export const getDeletedMayBay = async () => {
  try {
    const response = await apiClient.get("/admin/dashboard/maybay/deleted");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách máy bay đã xóa", error);
    throw error;
  }
};
