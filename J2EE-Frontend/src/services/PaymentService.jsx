import apiClient from './apiClient';

/**
 * PaymentService - Service quản lý Thanh Toán
 * Base URL: /internal/payments
 */

const BASE_URL = '/internal/payments';

/**
 * Lấy tất cả thanh toán
 * @returns {Promise} - Promise chứa danh sách thanh toán
 */
export const getAllPayments = async () => {
    try {
        const response = await apiClient.get(BASE_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching payments:", error);
        throw error;
    }
};

/**
 * Lấy thanh toán theo ID
 * @param {number} id - Mã thanh toán
 * @returns {Promise} - Promise chứa thông tin thanh toán
 */
export const getPaymentById = async (id) => {
    try {
        const response = await apiClient.get(`${BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching payment by ID:", error);
        throw error;
    }
};

/**
 * Lấy thanh toán theo trạng thái
 * @param {string} status - Trạng thái thanh toán
 * @returns {Promise} - Promise chứa danh sách thanh toán
 */
export const getPaymentsByStatus = async (status) => {
    try {
        const response = await apiClient.get(`${BASE_URL}/status/${status}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching payments by status:", error);
        throw error;
    }
};

/**
 * Cập nhật trạng thái thanh toán
 * @param {number} id - Mã thanh toán
 * @param {boolean} status - Trạng thái mới
 * @returns {Promise} - Promise chứa kết quả
 */
export const updatePaymentStatus = async (id, status) => {
    try {
        const response = await apiClient.patch(`${BASE_URL}/${id}/status`, { daThanhToan: status });
        return response.data;
    } catch (error) {
        console.error("Error updating payment status:", error);
        throw error;
    }
};

/**
 * Xóa thanh toán
 * @param {number} id - Mã thanh toán
 * @returns {Promise} - Promise chứa kết quả xóa
 */
export const deletePayment = async (id) => {
    try {
        const response = await apiClient.delete(`${BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting payment:", error);
        throw error;
    }
};

/**
 * Lấy thông tin thanh toán chi tiết theo ID
 * @param {number} id - Mã thanh toán
 * @returns {Promise} - Promise chứa thông tin chi tiết
 */
export const getPaymentDetails = async (id) => {
    try {
        const response = await apiClient.get(`${BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching payment details:", error);
        throw error;
    }
};

/**
 * Download PDF hóa đơn
 * @param {number} id - Mã thanh toán
 * @returns {Promise} - Promise chứa file PDF
 */
export const downloadInvoice = async (id) => {
    try {
        const response = await apiClient.get(`${BASE_URL}/${id}/invoice`, {
            responseType: 'blob',
        });
        
        // Tạo URL để download file
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice-${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        return response;
    } catch (error) {
        console.error("Error downloading invoice:", error);
        throw error;
    }
};

// ==================== BACKWARD COMPATIBILITY ALIASES ====================
// Các hàm alias để tương thích ngược với code cũ (QLThanhToanService)
export const getAllThanhToan = getAllPayments;
export const getThanhToanById = getPaymentById;
export const getThanhToanByStatus = getPaymentsByStatus;
export const updateThanhToanStatus = updatePaymentStatus;
export const deleteThanhToan = deletePayment;
export const getThanhToanChiTiet = getPaymentDetails;
export const downloadInvoicePdf = downloadInvoice;

export default {
    getAllPayments,
    getPaymentById,
    getPaymentsByStatus,
    updatePaymentStatus,
    deletePayment,
    getPaymentDetails,
    downloadInvoice,
    // Backward compatibility
    getAllThanhToan,
    getThanhToanById,
    getThanhToanByStatus,
    updateThanhToanStatus,
    deleteThanhToan,
    getThanhToanChiTiet,
    downloadInvoicePdf,
};
