import apiClient from "./apiClient";

const BASE_URL = "/admin/dashboard/banners";

/**
 * Service cho Quản lý Banner
 * Xử lý tất cả CRUD operations cho banner
 */
const BannerService = {
  /**
   * Lấy tất cả banner
   * @returns {Promise<Array>} Danh sách banner
   */
  getAll: async () => {
    try {
      const response = await apiClient.get(BASE_URL);
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách banner:", error);
      throw error;
    }
  },

  /**
   * Lấy banner theo ID
   * @param {number} id - ID của banner
   * @returns {Promise<Object>} Thông tin banner
   */
  getById: async (id) => {
    try {
      const response = await apiClient.get(`${BASE_URL}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Lỗi khi lấy banner ${id}:`, error);
      throw error;
    }
  },

  /**
   * Tạo banner mới
   * @param {Object} data - Dữ liệu banner mới
   * @returns {Promise<Object>} Banner đã tạo
   */
  create: async (data) => {
    try {
      const response = await apiClient.post(BASE_URL, data);
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi tạo banner:", error);
      throw error;
    }
  },

  /**
   * Cập nhật banner
   * @param {number} id - ID của banner
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Promise<Object>} Banner đã cập nhật
   */
  update: async (id, data) => {
    try {
      const response = await apiClient.put(`${BASE_URL}/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật banner ${id}:`, error);
      throw error;
    }
  },

  /**
   * Xóa banner
   * @param {number} id - ID của banner
   * @returns {Promise<string>} Thông báo thành công
   */
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`${BASE_URL}/${id}`);
      return response.data.message;
    } catch (error) {
      console.error(`Lỗi khi xóa banner ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái banner (toggle)
   * @param {number} id - ID của banner
   * @returns {Promise<Object>} Banner đã cập nhật
   */
  updateStatus: async (id) => {
    try {
      const response = await apiClient.patch(`${BASE_URL}/${id}/toggle-status`);
      return response.data.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật trạng thái banner ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cập nhật thứ tự banner
   * @param {number} id - ID của banner
   * @param {number} thuTu - Thứ tự mới
   * @returns {Promise<Object>} Banner đã cập nhật
   */
  updateOrder: async (id, thuTu) => {
    try {
      const response = await apiClient.patch(`${BASE_URL}/${id}/thu-tu`, null, {
        params: { thuTu }
      });
      return response.data.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật thứ tự banner ${id}:`, error);
      throw error;
    }
  },
};

export default BannerService;
