import apiClient from './apiClient';

const API_BASE_URL = '/admin/dashboard/thanhtoan';

// Lấy tất cả thanh toán
export const getAllThanhToan = async () => {
    try {
        const response = await apiClient.get(API_BASE_URL);
        return response;
    } catch (error) {
        console.error("Error fetching payments:", error);
        throw error;
    }
};

// Lấy thanh toán theo ID
export const getThanhToanById = async (id) => {
    try {
        const response = await apiClient.get(`${API_BASE_URL}/${id}`);
        return response;
    } catch (error) {
        console.error("Error fetching payment by ID:", error);
        throw error;
    }
};

// Lấy thanh toán theo trạng thái (đã thanh toán hoặc đang xử lý)
export const getThanhToanByStatus = async (status) => {
    try {
        const response = await apiClient.get(`${API_BASE_URL}/status/${status}`);
        return response;
    } catch (error) {
        console.error("Error fetching payments by status:", error);
        throw error;
    }
};

// Cập nhật trạng thái thanh toán
export const updateThanhToanStatus = async (id, status) => {
    try {
        const response = await apiClient.put(`${API_BASE_URL}/${id}/status`, { daThanhToan: status });
        return response;
    } catch (error) {
        console.error("Error updating payment status:", error);
        throw error;
    }
};

// Xóa thanh toán
export const deleteThanhToan = async (id) => {
    try {
        const response = await apiClient.delete(`${API_BASE_URL}/${id}`);
        return response;
    } catch (error) {
        console.error("Error deleting payment:", error);
        throw error;
    }
};

// Lấy thông tin thanh toán chi tiết theo ID (bao gồm thông tin chuyến bay đầy đủ)
export const getThanhToanChiTiet = async (id) => {
    try {
        const response = await apiClient.get(`${API_BASE_URL}/${id}`);
        return response;
    } catch (error) {
        console.error("Error fetching payment details:", error);
        throw error;
    }
};

// Download PDF hóa đơn
export const downloadInvoicePdf = async (id) => {
    try {
        const response = await apiClient.get(`${API_BASE_URL}/${id}/invoice`, {
            responseType: 'blob', // Important để nhận file PDF
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
