import apiClient from "./apiClient";

/**
 * AircraftService - Service quản lý Máy Bay
 * Internal URL: /internal/aircrafts (yêu cầu JWT)
 * Public URL: /api/v1/aircrafts (không cần JWT)
 */

const INTERNAL_BASE_URL = '/internal/aircrafts';
const PUBLIC_BASE_URL = '/api/v1/aircrafts';

// ==================== INTERNAL API (Yêu cầu JWT) ====================

/**
 * Lấy danh sách tất cả máy bay
 * @returns {Promise} - Promise chứa danh sách máy bay
 */
export const getAllAircrafts = async () => {
    try {
        const response = await apiClient.get(INTERNAL_BASE_URL);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách máy bay", error);
        throw error;
    }
};

/**
 * Lấy thông tin máy bay theo ID
 * @param {string} id - Mã máy bay
 * @returns {Promise} - Promise chứa thông tin máy bay
 */
export const getAircraftById = async (id) => {
    try {
        const response = await apiClient.get(`${INTERNAL_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi lấy thông tin máy bay ${id}`, error);
        throw error;
    }
};

/**
 * Lấy danh sách máy bay đã xóa
 * @returns {Promise} - Promise chứa danh sách máy bay đã xóa
 */
export const getDeletedAircrafts = async () => {
    try {
        const response = await apiClient.get(`${INTERNAL_BASE_URL}/deleted`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách máy bay đã xóa", error);
        throw error;
    }
};

/**
 * Tạo máy bay mới
 * @param {Object} aircraftData - Dữ liệu máy bay
 * @returns {Promise} - Promise chứa máy bay đã tạo
 */
export const createAircraft = async (aircraftData) => {
    try {
        const response = await apiClient.post(INTERNAL_BASE_URL, aircraftData);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi thêm máy bay', error);
        throw error;
    }
};

/**
 * Cập nhật thông tin máy bay
 * @param {string} id - Mã máy bay
 * @param {Object} aircraftData - Dữ liệu cập nhật
 * @returns {Promise} - Promise chứa máy bay đã cập nhật
 */
export const updateAircraft = async (id, aircraftData) => {
    try {
        const response = await apiClient.put(`${INTERNAL_BASE_URL}/${id}`, aircraftData);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi cập nhật máy bay ${id}`, error);
        throw error;
    }
};

/**
 * Cập nhật trạng thái máy bay
 * @param {string} id - Mã máy bay
 * @param {string} status - Trạng thái mới
 * @returns {Promise} - Promise chứa kết quả
 */
export const updateAircraftStatus = async (id, status) => {
    try {
        const response = await apiClient.patch(`${INTERNAL_BASE_URL}/${id}/status`, { trangThai: status });
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi cập nhật trạng thái máy bay ${id}`, error);
        throw error;
    }
};

/**
 * Khôi phục máy bay đã xóa
 * @param {string} id - Mã máy bay
 * @returns {Promise} - Promise chứa kết quả
 */
export const restoreAircraft = async (id) => {
    try {
        const response = await apiClient.put(`${INTERNAL_BASE_URL}/${id}/restore`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi khôi phục máy bay ${id}`, error);
        throw error;
    }
};

/**
 * Xóa máy bay
 * @param {string} id - Mã máy bay
 * @returns {Promise} - Promise chứa kết quả xóa
 */
export const deleteAircraft = async (id) => {
    try {
        const response = await apiClient.delete(`${INTERNAL_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi xóa máy bay ${id}`, error);
        throw error;
    }
};

// ==================== SEAT MANAGEMENT ====================

/**
 * Lấy danh sách ghế của máy bay
 * @param {string} aircraftId - Mã máy bay
 * @returns {Promise} - Promise chứa danh sách ghế
 */
export const getAircraftSeats = async (aircraftId) => {
    try {
        const response = await apiClient.get(`${INTERNAL_BASE_URL}/${aircraftId}/seats`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi lấy danh sách ghế của máy bay ${aircraftId}`, error);
        throw error;
    }
};

/**
 * Thêm ghế vào máy bay
 * @param {string} aircraftId - Mã máy bay
 * @param {Object} seatData - Dữ liệu ghế
 * @returns {Promise} - Promise chứa kết quả
 */
export const addSeat = async (aircraftId, seatData) => {
    try {
        const response = await apiClient.post(`${INTERNAL_BASE_URL}/${aircraftId}/seats`, seatData);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi thêm ghế', error);
        throw error;
    }
};

/**
 * Cập nhật thông tin ghế
 * @param {string} seatId - Mã ghế
 * @param {Object} seatData - Dữ liệu cập nhật
 * @returns {Promise} - Promise chứa kết quả
 */
export const updateSeat = async (seatId, seatData) => {
    try {
        const response = await apiClient.put(`/internal/seats/${seatId}`, seatData);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi cập nhật ghế ${seatId}`, error);
        throw error;
    }
};

/**
 * Xóa ghế
 * @param {string} seatId - Mã ghế
 * @returns {Promise} - Promise chứa kết quả
 */
export const deleteSeat = async (seatId) => {
    try {
        const response = await apiClient.delete(`/internal/seats/${seatId}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi xóa ghế ${seatId}`, error);
        throw error;
    }
};

/**
 * Xóa tất cả ghế của máy bay
 * @param {string} aircraftId - Mã máy bay
 * @returns {Promise} - Promise chứa kết quả
 */
export const deleteAllSeats = async (aircraftId) => {
    try {
        const response = await apiClient.delete(`${INTERNAL_BASE_URL}/${aircraftId}/seats`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi xóa tất cả ghế của máy bay ${aircraftId}`, error);
        throw error;
    }
};

/**
 * Tự động tạo ghế cho máy bay
 * @param {string} aircraftId - Mã máy bay
 * @param {Object} configs - Cấu hình tạo ghế
 * @returns {Promise} - Promise chứa kết quả
 */
export const autoGenerateSeats = async (aircraftId, configs) => {
    try {
        const response = await apiClient.post(`${INTERNAL_BASE_URL}/${aircraftId}/seats/generate`, configs);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi tự động tạo ghế cho máy bay ${aircraftId}`, error);
        throw error;
    }
};

// ==================== PUBLIC API (Không cần JWT) ====================

/**
 * Lấy danh sách máy bay đang hoạt động (Public API)
 * @returns {Promise} - Promise chứa danh sách máy bay active
 */
export const getActiveAircrafts = async () => {
    try {
        const response = await apiClient.get(`${PUBLIC_BASE_URL}/active`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách máy bay active", error);
        throw error;
    }
};

// ==================== BACKWARD COMPATIBILITY ALIASES ====================
// Các hàm alias để tương thích ngược với code cũ
export const getAllMayBay = getAllAircrafts;
export const getActiveMayBay = getActiveAircrafts;
export const getMayBayById = getAircraftById;
export const getDeletedMayBay = getDeletedAircrafts;
export const addMayBay = createAircraft;
export const updateMayBay = updateAircraft;
export const updateTrangThaiMayBay = updateAircraftStatus;
export const restoreMayBay = restoreAircraft;
export const deleteMayBay = deleteAircraft;
export const getSeatsByAircraft = getAircraftSeats;

export default {
    // Internal APIs
    getAllAircrafts,
    getAircraftById,
    getDeletedAircrafts,
    createAircraft,
    updateAircraft,
    updateAircraftStatus,
    restoreAircraft,
    deleteAircraft,
    // Seat management
    getAircraftSeats,
    addSeat,
    updateSeat,
    deleteSeat,
    deleteAllSeats,
    autoGenerateSeats,
    // Public APIs
    getActiveAircrafts,
    // Backward compatibility
    getAllMayBay,
    getActiveMayBay,
    getMayBayById,
    getDeletedMayBay,
    addMayBay,
    updateMayBay,
    updateTrangThaiMayBay,
    restoreMayBay,
    deleteMayBay,
    getSeatsByAircraft,
};
