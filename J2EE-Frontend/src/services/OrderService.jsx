import apiClient from "./apiClient";

/**
 * OrderService - Service quản lý Đơn Hàng
 * Base URL: /internal/orders
 */

const BASE_URL = "/internal/orders";

/**
 * Lấy danh sách đơn hàng với bộ lọc và sắp xếp
 * @param {Object} filters - Bộ lọc
 * @returns {Promise} Danh sách đơn hàng
 */
export const getOrderList = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.trangThai) params.append("trangThai", filters.trangThai);
    if (filters.email) params.append("email", filters.email);
    if (filters.soDienThoai) params.append("soDienThoai", filters.soDienThoai);
    if (filters.pnr) params.append("pnr", filters.pnr);
    if (filters.tuNgay) params.append("tuNgay", filters.tuNgay);
    if (filters.denNgay) params.append("denNgay", filters.denNgay);
    if (filters.tuGia) params.append("tuGia", filters.tuGia);
    if (filters.denGia) params.append("denGia", filters.denGia);
    if (filters.sort) params.append("sort", filters.sort);

    const queryString = params.toString();
    const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;

    const response = await apiClient.get(url);
    return response.data;
};

/**
 * Lấy chi tiết đơn hàng theo ID
 * @param {number} id - Mã đơn hàng
 * @returns {Promise} Chi tiết đơn hàng
 */
export const getOrderById = async (id) => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response.data;
};

/**
 * Tìm đơn hàng theo mã PNR
 * @param {string} pnr - Mã PNR
 * @returns {Promise} Chi tiết đơn hàng
 */
export const getOrderByPnr = async (pnr) => {
    const response = await apiClient.get(`${BASE_URL}/pnr/${pnr}`);
    return response.data;
};

/**
 * Cập nhật trạng thái đơn hàng
 * @param {number} id - Mã đơn hàng
 * @param {string} status - Trạng thái mới
 * @returns {Promise} Đơn hàng đã cập nhật
 */
export const updateOrderStatus = async (id, status) => {
    const response = await apiClient.patch(`${BASE_URL}/${id}/status`, {
        trangThai: status,
    });
    return response.data;
};

/**
 * Hủy đơn hàng
 * @param {number} id - Mã đơn hàng
 * @param {string} reason - Lý do hủy
 * @returns {Promise} Đơn hàng đã hủy
 */
export const cancelOrder = async (id, reason) => {
    const response = await apiClient.put(`${BASE_URL}/${id}/cancel`, {
        lyDoHuy: reason,
    });
    return response.data;
};

/**
 * Lấy danh sách đơn hàng đã xóa (soft delete)
 * @param {Object} filters - Bộ lọc
 * @returns {Promise} Danh sách đơn hàng đã xóa
 */
export const getDeletedOrderList = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.trangThai) params.append("trangThai", filters.trangThai);
    if (filters.email) params.append("email", filters.email);
    if (filters.soDienThoai) params.append("soDienThoai", filters.soDienThoai);
    if (filters.pnr) params.append("pnr", filters.pnr);
    if (filters.tuNgay) params.append("tuNgay", filters.tuNgay);
    if (filters.denNgay) params.append("denNgay", filters.denNgay);
    if (filters.tuGia) params.append("tuGia", filters.tuGia);
    if (filters.denGia) params.append("denGia", filters.denGia);
    if (filters.sort) params.append("sort", filters.sort);

    const queryString = params.toString();
    const url = queryString
        ? `${BASE_URL}/deleted?${queryString}`
        : `${BASE_URL}/deleted`;

    const response = await apiClient.get(url);
    return response.data;
};

/**
 * Khôi phục đơn hàng đã xóa
 * @param {number} id - Mã đơn hàng
 * @returns {Promise} Kết quả khôi phục
 */
export const restoreOrder = async (id) => {
    const response = await apiClient.put(`${BASE_URL}/${id}/restore`);
    return response.data;
};

/**
 * Xóa mềm đơn hàng
 * @param {number} id - Mã đơn hàng
 * @returns {Promise} Kết quả xóa
 */
export const softDeleteOrder = async (id) => {
    const response = await apiClient.delete(`${BASE_URL}/${id}`);
    return response.data;
};

/**
 * Duyệt thanh toán hàng loạt
 * @param {Array} orderIds - Mảng các mã đơn hàng cần duyệt
 * @returns {Promise} Kết quả duyệt
 */
export const batchApprovePayment = async (orderIds) => {
    const response = await apiClient.post(`${BASE_URL}/batch/approve`, {
        maDonHangs: orderIds
    });
    return response.data;
};

/**
 * Hoàn tiền hàng loạt
 * @param {Array} orderIds - Mảng các mã đơn hàng cần hoàn tiền
 * @param {string} reason - Lý do hoàn tiền
 * @returns {Promise} Kết quả hoàn tiền
 */
export const batchRefund = async (orderIds, reason) => {
    const response = await apiClient.post(`${BASE_URL}/batch/refund`, {
        maDonHangs: orderIds,
        lyDoHoanTien: reason
    });
    return response.data;
};

// ==================== BACKWARD COMPATIBILITY ALIASES ====================
// Các hàm alias để tương thích ngược với code cũ (donHangApi)
export const getDonHangList = getOrderList;
export const getDonHangById = getOrderById;
export const getDonHangByPnr = getOrderByPnr;
export const updateTrangThaiDonHang = updateOrderStatus;
export const huyDonHang = cancelOrder;
export const getDeletedDonHangList = getDeletedOrderList;
export const restoreDonHang = restoreOrder;
export const softDeleteDonHang = softDeleteOrder;

export default {
    getOrderList,
    getOrderById,
    getOrderByPnr,
    updateOrderStatus,
    cancelOrder,
    getDeletedOrderList,
    restoreOrder,
    softDeleteOrder,
    batchApprovePayment,
    batchRefund,
    // Backward compatibility
    getDonHangList,
    getDonHangById,
    getDonHangByPnr,
    updateTrangThaiDonHang,
    huyDonHang,
    getDeletedDonHangList,
    restoreDonHang,
    softDeleteDonHang,
};
