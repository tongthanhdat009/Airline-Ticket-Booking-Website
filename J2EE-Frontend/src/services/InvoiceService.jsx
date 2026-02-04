import apiClient from "./apiClient";

/**
 * InvoiceService - Service quản lý Hóa Đơn
 * Base URL: /internal/invoices
 */

const BASE_URL = "/internal/invoices";

/**
 * Lấy danh sách hóa đơn với bộ lọc
 * @param {Object} filters - Bộ lọc
 * @returns {Promise} Danh sách hóa đơn
 */
export const getInvoiceList = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.search) params.append("search", filters.search);
    if (filters.trangThai) params.append("trangThai", filters.trangThai);
    if (filters.tuNgay) params.append("tuNgay", filters.tuNgay);
    if (filters.denNgay) params.append("denNgay", filters.denNgay);
    if (filters.sort) params.append("sort", filters.sort);

    const queryString = params.toString();
    const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;

    const response = await apiClient.get(url);
    return response.data;
};

/**
 * Lấy chi tiết hóa đơn theo ID
 * @param {number} id - Mã hóa đơn
 * @returns {Promise} Chi tiết hóa đơn
 */
export const getInvoiceById = async (id) => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response.data;
};

/**
 * Tìm hóa đơn theo số hóa đơn
 * @param {string} invoiceNumber - Số hóa đơn
 * @returns {Promise} Chi tiết hóa đơn
 */
export const getInvoiceByNumber = async (invoiceNumber) => {
    const response = await apiClient.get(`${BASE_URL}/number/${invoiceNumber}`);
    return response.data;
};

/**
 * Tạo hóa đơn mới
 * @param {Object} data - Dữ liệu hóa đơn
 * @returns {Promise} Hóa đơn đã tạo
 */
export const createInvoice = async (data) => {
    const response = await apiClient.post(BASE_URL, data);
    return response.data;
};

/**
 * Cập nhật hóa đơn
 * @param {number} id - Mã hóa đơn
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Promise} Hóa đơn đã cập nhật
 */
export const updateInvoice = async (id, data) => {
    const response = await apiClient.put(`${BASE_URL}/${id}`, data);
    return response.data;
};

/**
 * Hủy hóa đơn
 * @param {number} id - Mã hóa đơn
 * @param {Object} data - { lyDoHuy, nguoiThucHien }
 * @returns {Promise} Hóa đơn đã hủy
 */
export const cancelInvoice = async (id, data) => {
    const response = await apiClient.put(`${BASE_URL}/${id}/cancel`, data);
    return response.data;
};

/**
 * Xóa mềm hóa đơn
 * @param {number} id - Mã hóa đơn
 * @returns {Promise} Kết quả xóa
 */
export const softDeleteInvoice = async (id) => {
    const response = await apiClient.delete(`${BASE_URL}/${id}`);
    return response.data;
};

/**
 * Khôi phục hóa đơn đã xóa
 * @param {number} id - Mã hóa đơn
 * @returns {Promise} Kết quả khôi phục
 */
export const restoreInvoice = async (id) => {
    const response = await apiClient.put(`${BASE_URL}/${id}/restore`);
    return response.data;
};

/**
 * Tạo số hóa đơn tự động
 * @returns {Promise} Số hóa đơn mới
 */
export const generateInvoiceNumber = async () => {
    const response = await apiClient.get(`${BASE_URL}/generate-number`);
    return response.data;
};

/**
 * Lấy thống kê hóa đơn
 * @returns {Promise} Thống kê
 */
export const getInvoiceStatistics = async () => {
    const response = await apiClient.get(`${BASE_URL}/statistics`);
    return response.data;
};

/**
 * Export hóa đơn ra PDF
 * @param {number} id - Mã hóa đơn
 * @returns {Promise<Blob>} PDF file blob
 */
export const exportInvoicePdf = async (id) => {
    const response = await apiClient.get(`${BASE_URL}/${id}/pdf`, {
        responseType: 'blob'
    });
    return response.data;
};

/**
 * Export danh sách hóa đơn ra Excel
 * @param {Object} filters - Bộ lọc
 * @returns {Promise<Blob>} Excel file blob
 */
export const exportInvoiceExcel = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.search) params.append("search", filters.search);
    if (filters.trangThai) params.append("trangThai", filters.trangThai);
    if (filters.tuNgay) params.append("tuNgay", filters.tuNgay);
    if (filters.denNgay) params.append("denNgay", filters.denNgay);

    const queryString = params.toString();
    const url = queryString 
        ? `${BASE_URL}/export/excel?${queryString}` 
        : `${BASE_URL}/export/excel`;

    const response = await apiClient.get(url, {
        responseType: 'blob'
    });
    return response.data;
};

// ==================== BACKWARD COMPATIBILITY ALIASES ====================
// Các hàm alias để tương thích ngược với code cũ (hoaDonApi)
export const getHoaDonList = getInvoiceList;
export const getHoaDonById = getInvoiceById;
export const getHoaDonBySoHoaDon = getInvoiceByNumber;
export const createHoaDon = createInvoice;
export const updateHoaDon = updateInvoice;
export const huyHoaDon = cancelInvoice;
export const softDeleteHoaDon = softDeleteInvoice;
export const restoreHoaDon = restoreInvoice;
export const generateSoHoaDon = generateInvoiceNumber;
export const getThongKeHoaDon = getInvoiceStatistics;
export const exportHoaDonPdf = exportInvoicePdf;
export const exportHoaDonExcel = exportInvoiceExcel;

export default {
    getInvoiceList,
    getInvoiceById,
    getInvoiceByNumber,
    createInvoice,
    updateInvoice,
    cancelInvoice,
    softDeleteInvoice,
    restoreInvoice,
    generateInvoiceNumber,
    getInvoiceStatistics,
    exportInvoicePdf,
    exportInvoiceExcel,
    // Backward compatibility
    getHoaDonList,
    getHoaDonById,
    getHoaDonBySoHoaDon,
    createHoaDon,
    updateHoaDon,
    huyHoaDon,
    softDeleteHoaDon,
    restoreHoaDon,
    generateSoHoaDon,
    getThongKeHoaDon,
    exportHoaDonPdf,
    exportHoaDonExcel,
};
