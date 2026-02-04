import apiClient from './apiClient';

/**
 * BookingService - Service quản lý Đặt Chỗ (Admin)
 * Base URL: /internal/bookings
 */

const BASE_URL = '/internal/bookings';

const BookingService = {
    /**
     * Lấy danh sách đặt chỗ với filter và phân trang
     * @param {Object} filters - Các tham số lọc
     * @returns {Promise} - Promise chứa danh sách đặt chỗ
     */
    getAllBookings: async (filters = {}) => {
        const response = await apiClient.get(BASE_URL, { params: filters });
        return response.data;
    },

    /**
     * Lấy chi tiết đặt chỗ theo ID
     * @param {number} id - Mã đặt chỗ
     * @returns {Promise} - Promise chứa thông tin chi tiết
     */
    getBookingById: async (id) => {
        const response = await apiClient.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    /**
     * Đổi ghế cho đặt chỗ
     * @param {number} id - Mã đặt chỗ
     * @param {number} newSeatId - Mã ghế mới
     * @param {string} reason - Lý do đổi ghế (tùy chọn)
     * @returns {Promise} - Promise chứa kết quả
     */
    changeSeat: async (id, newSeatId, reason = '') => {
        const response = await apiClient.put(`${BASE_URL}/${id}/change-seat`, {
            maGheMoi: newSeatId,
            lyDo: reason
        });
        return response.data;
    },

    /**
     * Đổi chuyến bay cho đặt chỗ
     * @param {number} id - Mã đặt chỗ
     * @param {number} newFlightId - Mã chuyến bay mới
     * @param {number} newSeatId - Mã ghế mới
     * @param {string} reason - Lý do đổi chuyến (tùy chọn)
     * @returns {Promise} - Promise chứa kết quả
     */
    changeFlight: async (id, newFlightId, newSeatId, reason = '') => {
        const response = await apiClient.put(`${BASE_URL}/${id}/change-flight`, {
            maChuyenBayMoi: newFlightId,
            maGheMoi: newSeatId,
            lyDo: reason
        });
        return response.data;
    },

    /**
     * Admin check-in cho hành khách
     * @param {number} id - Mã đặt chỗ
     * @returns {Promise} - Promise chứa kết quả
     */
    checkIn: async (id) => {
        const response = await apiClient.put(`${BASE_URL}/${id}/checkin`);
        return response.data;
    },

    /**
     * Hủy đặt chỗ
     * @param {number} id - Mã đặt chỗ
     * @param {string} reason - Lý do hủy (tùy chọn)
     * @returns {Promise} - Promise chứa kết quả
     */
    cancelBooking: async (id, reason = '') => {
        const response = await apiClient.delete(`${BASE_URL}/${id}`, {
            params: { lyDo: reason }
        });
        return response.data;
    },

    /**
     * Lấy danh sách chuyến bay có thể đổi
     * @param {number} id - Mã đặt chỗ
     * @returns {Promise} - Promise chứa danh sách chuyến bay
     */
    getAvailableFlights: async (id) => {
        const response = await apiClient.get(`${BASE_URL}/${id}/available-flights`);
        return response.data;
    },

    /**
     * Lấy sơ đồ ghế của chuyến bay
     * @param {number} id - Mã đặt chỗ
     * @returns {Promise} - Promise chứa sơ đồ ghế
     */
    getSeatMap: async (id) => {
        const response = await apiClient.get(`${BASE_URL}/${id}/seat-map`);
        return response.data;
    },

    /**
     * Tính phí đổi hạng vé
     * @param {number} id - Mã đặt chỗ
     * @param {number} newTicketClassId - Mã hạng vé mới
     * @returns {Promise} - Promise chứa thông tin phí
     */
    calculateUpgradeFee: async (id, newTicketClassId) => {
        const response = await apiClient.get(`${BASE_URL}/${id}/upgrade-fee`, {
            params: { maHangVeMoi: newTicketClassId }
        });
        return response.data;
    },

    /**
     * Đổi hạng vé cho đặt chỗ
     * @param {number} id - Mã đặt chỗ
     * @param {number} newTicketClassId - Mã hạng vé mới
     * @param {number} newSeatId - Mã ghế mới (tùy chọn)
     * @param {string} reason - Lý do đổi
     * @returns {Promise} - Promise chứa kết quả
     */
    upgradeTicketClass: async (id, newTicketClassId, newSeatId = null, reason = '') => {
        const response = await apiClient.put(`${BASE_URL}/${id}/upgrade`, {
            maHangVeMoi: newTicketClassId,
            maGheMoi: newSeatId,
            lyDo: reason
        });
        return response.data;
    }
};

// ==================== BACKWARD COMPATIBILITY ====================
// Named exports cho tương thích ngược với QLDatChoService
export const getAllDatCho = BookingService.getAllBookings;
export const getDatChoById = BookingService.getBookingById;
export const doiGhe = (id, maGheMoi, lyDo) => BookingService.changeSeat(id, maGheMoi, lyDo);
export const doiChuyenBay = (id, maChuyenBayMoi, maGheMoi, lyDo) => BookingService.changeFlight(id, maChuyenBayMoi, maGheMoi, lyDo);
export const adminCheckIn = BookingService.checkIn;
export const huyDatCho = BookingService.cancelBooking;
export const getAvailableFlights = BookingService.getAvailableFlights;
export const getSeatMap = BookingService.getSeatMap;
export const tinhPhiDoiHangVe = BookingService.calculateUpgradeFee;
export const doiHangVe = (id, maHangVeMoi, maGheMoi, lyDo) => BookingService.upgradeTicketClass(id, maHangVeMoi, maGheMoi, lyDo);

// Default export với tất cả aliases để tương thích ngược
export default {
    ...BookingService,
    // Backward compatibility aliases
    getAllDatCho: BookingService.getAllBookings,
    getDatChoById: BookingService.getBookingById,
    doiGhe: BookingService.changeSeat,
    doiChuyenBay: BookingService.changeFlight,
    adminCheckIn: BookingService.checkIn,
    huyDatCho: BookingService.cancelBooking,
    getAvailableFlights: BookingService.getAvailableFlights,
    getSeatMap: BookingService.getSeatMap,
    tinhPhiDoiHangVe: BookingService.calculateUpgradeFee,
    doiHangVe: BookingService.upgradeTicketClass,
};
