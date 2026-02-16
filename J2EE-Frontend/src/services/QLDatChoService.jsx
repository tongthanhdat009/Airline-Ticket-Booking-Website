import apiClient from './apiClient';

const BASE_URL = '/admin/datcho';

/**
 * Service cho Quản lý Đặt Chỗ (Admin)
 */
const QLDatChoService = {
    /**
     * Lấy danh sách đặt chỗ với filter và phân trang
     * @param {Object} filters - Các tham số lọc
     * @returns {Promise} - Promise chứa danh sách đặt chỗ
     */
    getAllDatCho: async (filters = {}) => {
        const response = await apiClient.get(BASE_URL, { params: filters });
        return response.data;
    },

    /**
     * Lấy chi tiết đặt chỗ theo ID
     * @param {number} id - Mã đặt chỗ
     * @returns {Promise} - Promise chứa thông tin chi tiết
     */
    getDatChoById: async (id) => {
        const response = await apiClient.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    /**
     * Đổi ghế cho đặt chỗ
     * @param {number} id - Mã đặt chỗ
     * @param {number} maGheMoi - Mã ghế mới
     * @param {string} lyDo - Lý do đổi ghế (tùy chọn)
     * @returns {Promise} - Promise chứa kết quả
     */
    doiGhe: async (id, maGheMoi, lyDo = '') => {
        const response = await apiClient.put(`${BASE_URL}/${id}/doi-ghe`, {
            maGheMoi,
            lyDo
        });
        return response.data;
    },

    /**
     * Đổi chuyến bay cho đặt chỗ
     * @param {number} id - Mã đặt chỗ
     * @param {number} maChuyenBayMoi - Mã chuyến bay mới
     * @param {number} maGheMoi - Mã ghế mới
     * @param {string} lyDo - Lý do đổi chuyến (tùy chọn)
     * @returns {Promise} - Promise chứa kết quả
     */
    doiChuyenBay: async (id, maChuyenBayMoi, maGheMoi, lyDo = '') => {
        const response = await apiClient.put(`${BASE_URL}/${id}/doi-chuyen-bay`, {
            maChuyenBayMoi,
            maGheMoi,
            lyDo
        });
        return response.data;
    },

    /**
     * Admin check-in cho hành khách
     * @param {number} id - Mã đặt chỗ
     * @returns {Promise} - Promise chứa kết quả
     */
    checkIn: async (id) => {
        const response = await apiClient.put(`${BASE_URL}/${id}/check-in`);
        return response.data;
    },

    /**
     * Hủy đặt chỗ
     * @param {number} id - Mã đặt chỗ
     * @param {string} lyDo - Lý do hủy (tùy chọn)
     * @returns {Promise} - Promise chứa kết quả
     */
    huyDatCho: async (id, lyDo = '') => {
        const response = await apiClient.delete(`${BASE_URL}/${id}`, {
            params: { lyDo }
        });
        return response.data;
    },

    /**
     * Lấy danh sách chuyến bay có thể đổi
     * - Chỉ lấy các chuyến từ thờ gian hiện tại trở đi
     * - Không bao gồm chuyến đã hủy
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
     * Lấy danh sách hạng vé có thể đổi
     * @returns {Promise} - Promise chứa danh sách hạng vé
     */
    getAvailableHangVe: async () => {
        const response = await apiClient.get(`/api/admin/hangve`);
        return response.data;
    },

    /**
     * Tính phí đổi hạng vé
     * @param {number} id - Mã đặt chỗ
     * @param {number} maHangVeMoi - Mã hạng vé mới
     * @returns {Promise} - Promise chứa thông tin phí
     */
    tinhPhiDoiHangVe: async (id, maHangVeMoi) => {
        const response = await apiClient.get(`${BASE_URL}/${id}/tinh-phi-doi-hang-ve`, {
            params: { maHangVeMoi }
        });
        return response.data;
    },

    /**
     * Đổi hạng vé cho đặt chỗ
     * @param {number} id - Mã đặt chỗ
     * @param {number} maHangVeMoi - Mã hạng vé mới
     * @param {number} maGheMoi - Mã ghế mới (tùy chọn)
     * @param {string} lyDo - Lý do đổi
     * @returns {Promise} - Promise chứa kết quả
     */
    doiHangVe: async (id, maHangVeMoi, maGheMoi = null, lyDo = '') => {
        const response = await apiClient.put(`${BASE_URL}/${id}/doi-hang-ve`, {
            maHangVeMoi,
            maGheMoi,
            lyDo
        });
        return response.data;
    }
};

export default QLDatChoService;
