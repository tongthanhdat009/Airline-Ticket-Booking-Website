import apiClient from "./apiClient";

/**
 * AirportService - Service quản lý Sân Bay
 * Internal URL: /internal/airports (yêu cầu JWT)
 * Public URL: /api/v1/airports (không cần JWT)
 */

const INTERNAL_BASE_URL = '/internal/airports';
const PUBLIC_BASE_URL = '/api/v1/airports';

// ==================== INTERNAL API (Yêu cầu JWT) ====================

/**
 * Lấy danh sách tất cả sân bay (Admin)
 * @returns {Promise} - Promise chứa danh sách sân bay
 */
export const getAllAirports = () => {
    try {
        const response = apiClient.get(INTERNAL_BASE_URL);
        return response;
    } catch (error) {
        console.error("Error fetching airports:", error);
        throw error;
    }
};

/**
 * Lấy thông tin sân bay theo ID
 * @param {string} id - Mã sân bay
 * @returns {Promise} - Promise chứa thông tin sân bay
 */
export const getAirportById = (id) => {
    try {
        const response = apiClient.get(`${INTERNAL_BASE_URL}/${id}`);
        return response;
    } catch (error) {
        console.error(`Error fetching airport ${id}:`, error);
        throw error;
    }
};

/**
 * Tạo sân bay mới
 * @param {Object} airportData - Dữ liệu sân bay
 * @returns {Promise} - Promise chứa sân bay đã tạo
 */
export const createAirport = (airportData) => {
    try {
        const response = apiClient.post(INTERNAL_BASE_URL, airportData);
        return response;
    } catch (error) {
        console.error("Error creating airport:", error);
        throw error;
    }
};

/**
 * Cập nhật trạng thái sân bay
 * @param {string} id - Mã sân bay
 * @param {string} status - Trạng thái mới
 * @returns {Promise} - Promise chứa kết quả
 */
export const updateAirportStatus = (id, status) => {
    try {
        const response = apiClient.patch(`${INTERNAL_BASE_URL}/${id}/status`, { trangThai: status });
        return response;
    } catch (error) {
        console.error("Error updating airport status:", error);
        throw error;
    }
};

/**
 * Xóa sân bay
 * @param {string} id - Mã sân bay
 * @returns {Promise} - Promise chứa kết quả xóa
 */
export const deleteAirport = (id) => {
    try {
        const response = apiClient.delete(`${INTERNAL_BASE_URL}/${id}`);
        return response;
    } catch (error) {
        console.error("Error deleting airport:", error);
        throw error;
    }
};

// ==================== PUBLIC API (Không cần JWT) ====================

/**
 * Lấy danh sách sân bay cho dropdown (Public API)
 * @returns {Promise} - Promise chứa danh sách sân bay
 */
export const getAirportsForDropdown = () => {
    try {
        const response = apiClient.get(PUBLIC_BASE_URL);
        return response;
    } catch (error) {
        console.error("Error fetching airports for dropdown:", error);
        throw error;
    }
};

/**
 * Lấy danh sách sân bay đang hoạt động (Public API)
 * @returns {Promise} - Promise chứa danh sách sân bay active
 */
export const getActiveAirports = () => {
    try {
        const response = apiClient.get(`${PUBLIC_BASE_URL}/active`);
        return response;
    } catch (error) {
        console.error("Error fetching active airports:", error);
        throw error;
    }
};

// ==================== BACKWARD COMPATIBILITY ALIASES ====================
// Các hàm alias để tương thích ngược với code cũ
export const getAllSanBay = getAllAirports;
export const getActiveSanBay = getActiveAirports;
export const getSanBayActive = getActiveAirports;  // Alias cho code cũ dùng getSanBayActive
export const createSanBay = createAirport;
export const addSanBay = createAirport;  // Alias cho code cũ dùng addSanBay
export const updateTrangThaiSanBay = updateAirportStatus;
export const deleteSanBay = deleteAirport;
export const thongTinSanBay = getAirportById;

export default {
    // Internal APIs
    getAllAirports,
    getAirportById,
    createAirport,
    updateAirportStatus,
    deleteAirport,
    // Public APIs
    getAirportsForDropdown,
    getActiveAirports,
    // Backward compatibility
    getAllSanBay,
    getActiveSanBay,
    getSanBayActive,
    createSanBay,
    addSanBay,
    updateTrangThaiSanBay,
    deleteSanBay,
    thongTinSanBay,
};
