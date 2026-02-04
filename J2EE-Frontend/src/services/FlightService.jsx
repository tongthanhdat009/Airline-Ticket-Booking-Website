import apiClient from "./apiClient";

/**
 * FlightService - Service quản lý Chuyến Bay
 * Base URL: /internal/flights
 */

const BASE_URL = '/internal/flights';

/**
 * Lấy danh sách tất cả chuyến bay
 * @returns {Promise} - Promise chứa danh sách chuyến bay
 */
export const getAllFlights = () => {
    try {
        const response = apiClient.get(BASE_URL);
        return response;
    } catch (error) {
        console.error("Error fetching flights:", error);
        throw error;
    }
};

/**
 * Lấy thông tin chuyến bay theo ID
 * @param {number} id - Mã chuyến bay
 * @returns {Promise} - Promise chứa thông tin chuyến bay
 */
export const getFlightById = (id) => {
    try {
        const response = apiClient.get(`${BASE_URL}/${id}`);
        return response;
    } catch (error) {
        console.error("Error fetching flight by ID:", error);
        throw error;
    }
};

/**
 * Tạo chuyến bay mới
 * @param {Object} flightData - Dữ liệu chuyến bay
 * @returns {Promise} - Promise chứa chuyến bay đã tạo
 */
export const createFlight = (flightData) => {
    try {
        console.log("Creating flight with data:", flightData);
        const response = apiClient.post(BASE_URL, flightData);
        return response;
    } catch (error) {
        console.error("Error creating flight:", error);
        throw error;
    }
};

/**
 * Cập nhật thông tin chuyến bay
 * @param {number} id - Mã chuyến bay
 * @param {Object} flightData - Dữ liệu cập nhật
 * @returns {Promise} - Promise chứa chuyến bay đã cập nhật
 */
export const updateFlight = (id, flightData) => {
    try {
        const response = apiClient.put(`${BASE_URL}/${id}`, flightData);
        return response;
    } catch (error) {
        console.error("Error updating flight:", error);
        throw error;
    }
};

/**
 * Xóa chuyến bay
 * @param {number} id - Mã chuyến bay
 * @returns {Promise} - Promise chứa kết quả xóa
 */
export const deleteFlight = (id) => {
    try {
        const response = apiClient.delete(`${BASE_URL}/${id}`);
        return response;
    } catch (error) {
        console.error("Error deleting flight:", error);
        throw error;
    }
};

/**
 * Cập nhật trạng thái chuyến bay
 * @param {number} id - Mã chuyến bay
 * @param {string} status - Trạng thái mới
 * @returns {Promise} - Promise chứa kết quả
 */
export const updateFlightStatus = (id, status) => {
    try {
        const response = apiClient.patch(`${BASE_URL}/${id}/status`, { trangThai: status });
        return response;
    } catch (error) {
        console.error("Error updating flight status:", error);
        throw error;
    }
};

/**
 * Cập nhật thông tin delay
 * @param {number} id - Mã chuyến bay
 * @param {Object} delayData - Dữ liệu delay
 * @returns {Promise} - Promise chứa kết quả
 */
export const updateFlightDelay = (id, delayData) => {
    try {
        const response = apiClient.put(`${BASE_URL}/${id}/delay`, delayData);
        return response;
    } catch (error) {
        console.error("Error updating delay:", error);
        throw error;
    }
};

/**
 * Hủy chuyến bay
 * @param {number} id - Mã chuyến bay
 * @param {Object} cancelData - Dữ liệu hủy
 * @returns {Promise} - Promise chứa kết quả
 */
export const cancelFlight = (id, cancelData) => {
    try {
        const response = apiClient.put(`${BASE_URL}/${id}/cancel`, cancelData);
        return response;
    } catch (error) {
        console.error("Error canceling flight:", error);
        throw error;
    }
};

/**
 * Thêm ghế vào chuyến bay
 * @param {number} id - Mã chuyến bay
 * @param {Object} seatData - Dữ liệu ghế
 * @returns {Promise} - Promise chứa kết quả
 */
export const addSeatsToFlight = async (id, seatData) => {
    try {
        const response = await apiClient.post(`${BASE_URL}/${id}/seats`, seatData);
        return response.data;
    } catch (error) {
        console.error('Error adding seats to flight:', error);
        throw error;
    }
};

/**
 * Lấy danh sách chuyến bay đã xóa
 * @returns {Promise} - Promise chứa danh sách chuyến bay đã xóa
 */
export const getDeletedFlights = async () => {
    try {
        const response = await apiClient.get(`${BASE_URL}/deleted`);
        return response;
    } catch (error) {
        console.error('Error fetching deleted flights:', error);
        throw error;
    }
};

/**
 * Khôi phục chuyến bay đã xóa
 * @param {number} id - Mã chuyến bay
 * @returns {Promise} - Promise chứa kết quả
 */
export const restoreFlight = async (id) => {
    try {
        const response = await apiClient.put(`${BASE_URL}/${id}/restore`);
        return response;
    } catch (error) {
        console.error('Error restoring flight:', error);
        throw error;
    }
};

/**
 * Lấy danh sách dịch vụ của chuyến bay
 * @param {number} id - Mã chuyến bay
 * @returns {Promise} - Promise chứa danh sách dịch vụ
 */
export const getFlightServices = async (id) => {
    try {
        const response = await apiClient.get(`${BASE_URL}/${id}/services`);
        return response;
    } catch (error) {
        console.error('Error fetching flight services:', error);
        throw error;
    }
};

/**
 * Thêm dịch vụ vào chuyến bay
 * @param {number} flightId - Mã chuyến bay
 * @param {number} serviceId - Mã dịch vụ
 * @returns {Promise} - Promise chứa kết quả
 */
export const addServiceToFlight = async (flightId, serviceId) => {
    try {
        const response = await apiClient.post(`${BASE_URL}/${flightId}/services/${serviceId}`);
        return response;
    } catch (error) {
        console.error('Error adding service to flight:', error);
        throw error;
    }
};

/**
 * Xóa dịch vụ khỏi chuyến bay
 * @param {number} flightId - Mã chuyến bay
 * @param {number} serviceId - Mã dịch vụ
 * @returns {Promise} - Promise chứa kết quả
 */
export const removeServiceFromFlight = async (flightId, serviceId) => {
    try {
        const response = await apiClient.delete(`${BASE_URL}/${flightId}/services/${serviceId}`);
        return response;
    } catch (error) {
        console.error('Error removing service from flight:', error);
        throw error;
    }
};

// ==================== BACKWARD COMPATIBILITY ALIASES ====================
// Các hàm alias để tương thích ngược với code cũ
export const getAllChuyenBay = getAllFlights;
export const getChuyenBayById = getFlightById;
export const createChuyenBay = createFlight;
export const updateChuyenBay = (flightData) => updateFlight(flightData.maChuyenBay, flightData);
export const deleteChuyenBay = (flightData) => deleteFlight(flightData.maChuyenBay);
export const updateTrangThaiChuyenBay = updateFlightStatus;
export const updateDelay = (delayData) => updateFlightDelay(delayData.maChuyenBay, delayData);
export const updateCancel = (cancelData) => cancelFlight(cancelData.maChuyenBay, cancelData);
export const addGheToChuyenBay = addSeatsToFlight;
export const getAllDeletedChuyenBay = getDeletedFlights;
export const restoreChuyenBay = restoreFlight;
export const getDichVuByChuyenBay = getFlightServices;
export const addDichVuToChuyenBay = addServiceToFlight;
export const removeDichVuFromChuyenBay = removeServiceFromFlight;

export default {
    getAllFlights,
    getFlightById,
    createFlight,
    updateFlight,
    deleteFlight,
    updateFlightStatus,
    updateFlightDelay,
    cancelFlight,
    addSeatsToFlight,
    getDeletedFlights,
    restoreFlight,
    getFlightServices,
    addServiceToFlight,
    removeServiceFromFlight,
    // Backward compatibility
    getAllChuyenBay,
    getChuyenBayById,
    createChuyenBay,
    updateChuyenBay,
    deleteChuyenBay,
    updateTrangThaiChuyenBay,
    updateDelay,
    updateCancel,
    addGheToChuyenBay,
    getAllDeletedChuyenBay,
    restoreChuyenBay,
    getDichVuByChuyenBay,
    addDichVuToChuyenBay,
    removeDichVuFromChuyenBay,
};
