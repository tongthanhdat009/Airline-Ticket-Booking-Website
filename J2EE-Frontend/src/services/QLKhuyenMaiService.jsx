import apiClient from "./apiClient";

const BASE_URL = "/api/khuyenmai";

/**
 * Service cho Quản lý Khuyến Mãi
 * Xử lý tất cả CRUD operations cho khuyến mãi
 */
const QLKhuyenMaiService = {
  /**
   * Lấy tất cả khuyến mãi
   * @returns {Promise<Array>} Danh sách khuyến mãi
   */
  getAll: async () => {
    try {
      const response = await apiClient.get(BASE_URL);
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khuyến mãi:", error);
      throw error;
    }
  },

  /**
   * Lấy khuyến mãi theo ID
   * @param {number} id - ID của khuyến mãi
   * @returns {Promise<Object>} Thông tin khuyến mãi
   */
  getById: async (id) => {
    try {
      const response = await apiClient.get(`${BASE_URL}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Lỗi khi lấy khuyến mãi ${id}:`, error);
      throw error;
    }
  },

  /**
   * Tạo khuyến mãi mới
   * @param {Object} data - Dữ liệu khuyến mãi mới
   * @param {string} data.maKM - Mã khuyến mãi (unique)
   * @param {string} data.tenKhuyenMai - Tên khuyến mãi
   * @param {string} data.moTa - Mô tả
   * @param {string} data.loaiKhuyenMai - PERCENT hoặc FIXED
   * @param {number} data.giaTriGiam - Giá trị giảm
   * @param {number} [data.giaTriToiThieu] - Giá trị đơn hàng tối thiểu
   * @param {number} [data.giaTriToiDa] - Giá trị giảm tối đa
   * @param {number} [data.soLuong] - Số lượng mã
   * @param {string} data.ngayBatDau - Ngày bắt đầu (ISO 8601)
   * @param {string} data.ngayKetThuc - Ngày kết thúc (ISO 8601)
   * @param {string} [data.trangThai] - ACTIVE hoặc INACTIVE (mặc định: ACTIVE)
   * @returns {Promise<Object>} Khuyến mãi đã tạo
   */
  create: async (data) => {
    try {
      const response = await apiClient.post(BASE_URL, data);
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi tạo khuyến mãi:", error);
      throw error;
    }
  },

  /**
   * Cập nhật khuyến mãi
   * Chỉ cho phép cập nhật khi trạng thái là INACTIVE
   * @param {number} id - ID của khuyến mãi
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Promise<Object>} Khuyến mãi đã cập nhật
   */
  update: async (id, data) => {
    try {
      const response = await apiClient.put(`${BASE_URL}/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật khuyến mãi ${id}:`, error);
      throw error;
    }
  },

  /**
   * Xóa mềm khuyến mãi
   * Không cho phép xóa nếu khuyến mãi đang được sử dụng
   * @param {number} id - ID của khuyến mãi
   * @returns {Promise<string>} Thông báo thành công
   */
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`${BASE_URL}/${id}`);
      return response.data.message;
    } catch (error) {
      console.error(`Lỗi khi xóa khuyến mãi ${id}:`, error);
      throw error;
    }
  },

  /**
   * Khôi phục khuyến mãi đã xóa
   * @param {number} id - ID của khuyến mãi
   * @returns {Promise<Object>} Khuyến mãi đã khôi phục
   */
  restore: async (id) => {
    try {
      const response = await apiClient.put(`${BASE_URL}/${id}/restore`);
      return response.data.data;
    } catch (error) {
      console.error(`Lỗi khi khôi phục khuyến mãi ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái khuyến mãi
   * @param {number} id - ID của khuyến mãi
   * @param {string} trangThai - Trạng thái mới (ACTIVE/INACTIVE/EXPIRED)
   * @returns {Promise<Object>} Khuyến mãi đã cập nhật
   */
  updateStatus: async (id, trangThai) => {
    try {
      const response = await apiClient.patch(`${BASE_URL}/${id}/status`, { trangThai });
      return response.data.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật trạng thái khuyến mãi ${id}:`, error);
      throw error;
    }
  },
};

export default QLKhuyenMaiService;
