import apiClient from "./apiClient";

/**
 * PromotionService - Service quản lý Khuyến Mãi
 * Internal URL: /internal/promotions (yêu cầu JWT)
 * Public URL: /api/v1/promotions (không cần JWT)
 */

const INTERNAL_BASE_URL = "/internal/promotions";
const PUBLIC_BASE_URL = "/api/v1/promotions";

const PromotionService = {
    // ==================== INTERNAL API (Yêu cầu JWT) ====================

    /**
     * Lấy tất cả khuyến mãi
     * @returns {Promise<Array>} Danh sách khuyến mãi
     */
    getAll: async () => {
        try {
            const response = await apiClient.get(INTERNAL_BASE_URL);
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
            const response = await apiClient.get(`${INTERNAL_BASE_URL}/${id}`);
            return response.data.data;
        } catch (error) {
            console.error(`Lỗi khi lấy khuyến mãi ${id}:`, error);
            throw error;
        }
    },

    /**
     * Tạo khuyến mãi mới
     * @param {Object} data - Dữ liệu khuyến mãi mới
     * @returns {Promise<Object>} Khuyến mãi đã tạo
     */
    create: async (data) => {
        try {
            const response = await apiClient.post(INTERNAL_BASE_URL, data);
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi tạo khuyến mãi:", error);
            throw error;
        }
    },

    /**
     * Cập nhật khuyến mãi
     * @param {number} id - ID của khuyến mãi
     * @param {Object} data - Dữ liệu cập nhật
     * @returns {Promise<Object>} Khuyến mãi đã cập nhật
     */
    update: async (id, data) => {
        try {
            const response = await apiClient.put(`${INTERNAL_BASE_URL}/${id}`, data);
            return response.data.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật khuyến mãi ${id}:`, error);
            throw error;
        }
    },

    /**
     * Xóa mềm khuyến mãi
     * @param {number} id - ID của khuyến mãi
     * @returns {Promise<string>} Thông báo thành công
     */
    delete: async (id) => {
        try {
            const response = await apiClient.delete(`${INTERNAL_BASE_URL}/${id}`);
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
            const response = await apiClient.put(`${INTERNAL_BASE_URL}/${id}/restore`);
            return response.data.data;
        } catch (error) {
            console.error(`Lỗi khi khôi phục khuyến mãi ${id}:`, error);
            throw error;
        }
    },

    /**
     * Cập nhật trạng thái khuyến mãi
     * @param {number} id - ID của khuyến mãi
     * @param {string} status - Trạng thái mới (ACTIVE/INACTIVE/EXPIRED)
     * @returns {Promise<Object>} Khuyến mãi đã cập nhật
     */
    updateStatus: async (id, status) => {
        try {
            const response = await apiClient.patch(`${INTERNAL_BASE_URL}/${id}/status`, { trangThai: status });
            return response.data.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật trạng thái khuyến mãi ${id}:`, error);
            throw error;
        }
    },

    // ==================== PUBLIC API (Không cần JWT) ====================

    /**
     * Lấy danh sách khuyến mãi cho dropdown (Public)
     * @returns {Promise<Array>} Danh sách khuyến mãi
     */
    getPromotionsForDropdown: async () => {
        try {
            const response = await apiClient.get(PUBLIC_BASE_URL);
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách khuyến mãi:", error);
            throw error;
        }
    },
};

// ==================== BACKWARD COMPATIBILITY EXPORTS ====================
// Named exports cho tương thích ngược với QLKhuyenMaiService
export const findAll = PromotionService.getAll;
export const findById = PromotionService.getById;
export const create = PromotionService.create;
export const update = PromotionService.update;
export const deletePromotion = PromotionService.delete;
export const restore = PromotionService.restore;
export const updateStatus = PromotionService.updateStatus;
export const getPromotionsForDropdown = PromotionService.getPromotionsForDropdown;

// Additional long-form exports for consistency with other services
export const getAllPromotions = PromotionService.getAll;
export const getPromotionById = PromotionService.getById;
export const createPromotion = PromotionService.create;
export const updatePromotion = PromotionService.update;
export const deletePromotionById = PromotionService.delete;
export const restorePromotion = PromotionService.restore;
export const updatePromotionStatus = PromotionService.updateStatus;

export default PromotionService;
