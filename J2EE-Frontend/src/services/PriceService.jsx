import apiClient from './apiClient';

/**
 * PriceService - Service quản lý Giá Chuyến Bay
 * Internal URL: /internal/prices (yêu cầu JWT)
 * Public URL: /api/v1/prices (không cần JWT)
 */

const INTERNAL_BASE_URL = '/internal/prices';
const PUBLIC_BASE_URL = '/api/v1/prices';

// ==================== INTERNAL API (Yêu cầu JWT) ====================

/**
 * Lấy tất cả giá chuyến bay
 * @returns {Promise} - Promise chứa danh sách giá
 */
export const getAllPrices = async () => {
    try {
        const response = await apiClient.get(INTERNAL_BASE_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching flight prices:", error);
        throw error;
    }
};

/**
 * Lấy giá chuyến bay theo ID
 * @param {number} id - Mã giá
 * @returns {Promise} - Promise chứa thông tin giá
 */
export const getPriceById = async (id) => {
    try {
        const response = await apiClient.get(`${INTERNAL_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching flight price by ID:", error);
        throw error;
    }
};

/**
 * Tạo giá chuyến bay mới
 * @param {Object} priceData - Dữ liệu giá
 * @returns {Promise} - Promise chứa giá đã tạo
 */
export const createPrice = async (priceData) => {
    try {
        const response = await apiClient.post(INTERNAL_BASE_URL, priceData);
        return response.data;
    } catch (error) {
        console.error("Error creating flight price:", error);
        throw error;
    }
};

/**
 * Cập nhật giá chuyến bay
 * @param {number} id - Mã giá
 * @param {Object} priceData - Dữ liệu cập nhật
 * @returns {Promise} - Promise chứa giá đã cập nhật
 */
export const updatePrice = async (id, priceData) => {
    try {
        const response = await apiClient.put(`${INTERNAL_BASE_URL}/${id}`, priceData);
        return response.data;
    } catch (error) {
        console.error("Error updating flight price:", error);
        throw error;
    }
};

/**
 * Xóa giá chuyến bay
 * @param {number} id - Mã giá
 * @returns {Promise} - Promise chứa kết quả xóa
 */
export const deletePrice = async (id) => {
    try {
        const response = await apiClient.delete(`${INTERNAL_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting flight price:", error);
        throw error;
    }
};

// ==================== PUBLIC API (Không cần JWT) ====================

/**
 * Lấy giá chuyến bay theo tuyến bay (Public)
 * @param {number} routeId - Mã tuyến bay
 * @returns {Promise} - Promise chứa danh sách giá
 */
export const getPricesByRoute = async (routeId) => {
    try {
        const response = await apiClient.get(`${PUBLIC_BASE_URL}/routes/${routeId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching flight prices by route:", error);
        throw error;
    }
};

// ==================== BACKWARD COMPATIBILITY ALIASES ====================
// Các hàm alias để tương thích ngược với code cũ (QLGiaChuyenBayService)
export const getAllGiaChuyenBay = getAllPrices;
export const getGiaChuyenBayById = getPriceById;
export const getGiaByTuyenBay = getPricesByRoute;
export const createGiaChuyenBay = createPrice;
export const updateGiaChuyenBay = updatePrice;
export const deleteGiaChuyenBay = deletePrice;

export default {
    // Internal APIs
    getAllPrices,
    getPriceById,
    createPrice,
    updatePrice,
    deletePrice,
    // Public APIs
    getPricesByRoute,
    // Backward compatibility
    getAllGiaChuyenBay,
    getGiaChuyenBayById,
    getGiaByTuyenBay,
    createGiaChuyenBay,
    updateGiaChuyenBay,
    deleteGiaChuyenBay,
};
