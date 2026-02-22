import apiClient from "./apiClient";

const BASE_URL = "/admin/dashboard/tintuc";

/**
 * Service cho Quản lý Tin tức
 * Xử lý tất cả CRUD operations cho tin tức
 */
const TinTucService = {
  /**
   * Lấy tất cả tin tức
   * @returns {Promise<Array>} Danh sách tin tức
   */
  getAll: async () => {
    try {
      const response = await apiClient.get(BASE_URL);
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tin tức:", error);
      throw error;
    }
  },

  /**
   * Lấy tin tức theo ID
   * @param {number} id - ID của tin tức
   * @returns {Promise<Object>} Thông tin tin tức
   */
  getById: async (id) => {
    try {
      const response = await apiClient.get(`${BASE_URL}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Lỗi khi lấy tin tức ${id}:`, error);
      throw error;
    }
  },

  /**
   * Tạo tin tức mới
   * @param {Object} data - Dữ liệu tin tức mới
   * @returns {Promise<Object>} Tin tức đã tạo
   */
  create: async (data) => {
    try {
      const response = await apiClient.post(BASE_URL, data);
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi tạo tin tức:", error);
      throw error;
    }
  },

  /**
   * Cập nhật tin tức
   * @param {number} id - ID của tin tức
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Promise<Object>} Tin tức đã cập nhật
   */
  update: async (id, data) => {
    try {
      const response = await apiClient.put(`${BASE_URL}/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật tin tức ${id}:`, error);
      throw error;
    }
  },

  /**
   * Xóa tin tức
   * @param {number} id - ID của tin tức
   * @returns {Promise<string>} Thông báo thành công
   */
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`${BASE_URL}/${id}`);
      return response.data.message;
    } catch (error) {
      console.error(`Lỗi khi xóa tin tức ${id}:`, error);
      throw error;
    }
  },

  /**
   * Toggle publish status của tin tức
   * @param {number} id - ID của tin tức
   * @returns {Promise<Object>} Tin tức đã cập nhật
   */
  togglePublish: async (id) => {
    try {
      const response = await apiClient.patch(`${BASE_URL}/${id}/publish`);
      return response.data.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật trạng thái xuất bản ${id}:`, error);
      throw error;
    }
  },

  /**
   * Tăng lượt xem
   * @param {number} id - ID của tin tức
   * @returns {Promise<Object>} Tin tức đã cập nhật
   */
  incrementView: async (id) => {
    try {
      const response = await apiClient.patch(`${BASE_URL}/${id}/increment-view`);
      return response.data.data;
    } catch (error) {
      console.error(`Lỗi khi tăng lượt xem ${id}:`, error);
      throw error;
    }
  },

  /**
   * Lấy tin tức theo danh mục
   * @param {string} danhMuc - Danh mục
   * @returns {Promise<Array>} Danh sách tin tức
   */
  getByDanhMuc: async (danhMuc) => {
    try {
      const response = await apiClient.get(`${BASE_URL}/danhmuc/${danhMuc}`);
      return response.data.data;
    } catch (error) {
      console.error(`Lỗi khi lấy tin tức danh mục ${danhMuc}:`, error);
      throw error;
    }
  },

  /**
   * Lấy tin tức theo trạng thái
   * @param {string} trangThai - Trạng thái (da_xuat_ban/ban_nhap)
   * @returns {Promise<Array>} Danh sách tin tức
   */
  getByTrangThai: async (trangThai) => {
    try {
      const response = await apiClient.get(`${BASE_URL}/trangthai/${trangThai}`);
      return response.data.data;
    } catch (error) {
      console.error(`Lỗi khi lấy tin tức trạng thái ${trangThai}:`, error);
      throw error;
    }
  },
};

export default TinTucService;
