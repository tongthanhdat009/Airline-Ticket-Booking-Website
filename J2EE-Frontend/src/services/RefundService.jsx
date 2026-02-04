import apiClient from "./apiClient";

/**
 * RefundService - Service quản lý Hoàn Tiền
 * Base URL: /internal/refunds
 */

const BASE_URL = "/internal/refunds";

/**
 * Lấy danh sách yêu cầu hoàn tiền với bộ lọc
 * @param {Object} filters - Bộ lọc
 * @returns {Promise} Danh sách yêu cầu hoàn tiền
 */
export const getRefundList = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.search) params.append("search", filters.search);
    if (filters.trangThai) params.append("trangThai", filters.trangThai);
    if (filters.tuNgay) params.append("tuNgay", filters.tuNgay);
    if (filters.denNgay) params.append("denNgay", filters.denNgay);

    const queryString = params.toString();
    const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;

    const response = await apiClient.get(url);
    return response.data;
};

/**
 * Lấy chi tiết yêu cầu hoàn tiền theo ID
 * @param {number} id - Mã hoàn tiền
 * @returns {Promise} Chi tiết yêu cầu hoàn tiền
 */
export const getRefundById = async (id) => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response.data;
};

/**
 * Duyệt yêu cầu hoàn tiền
 * @param {number} id - Mã hoàn tiền
 * @param {string} processor - Người xử lý
 * @param {string} note - Ghi chú (tùy chọn)
 * @returns {Promise} Yêu cầu hoàn tiền đã duyệt
 */
export const approveRefund = async (id, processor, note = "") => {
    const response = await apiClient.put(`${BASE_URL}/${id}/approve`, {
        maHoanTien: id,
        nguoiXuLy: processor,
        ghiChu: note,
    });
    return response.data;
};

/**
 * Từ chối yêu cầu hoàn tiền
 * @param {number} id - Mã hoàn tiền
 * @param {string} processor - Người xử lý
 * @param {string} reason - Lý do từ chối
 * @param {string} note - Ghi chú (tùy chọn)
 * @returns {Promise} Yêu cầu hoàn tiền đã từ chối
 */
export const rejectRefund = async (id, processor, reason, note = "") => {
    const response = await apiClient.put(`${BASE_URL}/${id}/reject`, {
        maHoanTien: id,
        nguoiXuLy: processor,
        lyDoTuChoi: reason,
        ghiChu: note,
    });
    return response.data;
};

/**
 * Lấy thống kê hoàn tiền
 * @returns {Promise} Thống kê hoàn tiền
 */
export const getRefundStatistics = async () => {
    const response = await apiClient.get(`${BASE_URL}/statistics`);
    return response.data;
};

// ==================== BACKWARD COMPATIBILITY ALIASES ====================
// Các hàm alias để tương thích ngược với code cũ (hoanTienApi)
export const getHoanTienList = getRefundList;
export const getHoanTienById = getRefundById;
export const duyetHoanTien = approveRefund;
export const tuChoiHoanTien = rejectRefund;
export const getThongKeHoanTien = getRefundStatistics;

export default {
    getRefundList,
    getRefundById,
    approveRefund,
    rejectRefund,
    getRefundStatistics,
    // Backward compatibility
    getHoanTienList,
    getHoanTienById,
    duyetHoanTien,
    tuChoiHoanTien,
    getThongKeHoanTien,
};
