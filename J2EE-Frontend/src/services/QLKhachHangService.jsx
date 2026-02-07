import apiClient from './apiClient';

const API_BASE_URL = '/admin/dashboard/hanhkhach';

// Lấy danh sách tất cả khách hàng
export const getAllKhachHang = async () => {
    try {
        const response = await apiClient.get(API_BASE_URL);
        return response;
    } catch (error) {
        console.error("Error fetching customers:", error);
        // Throw lỗi để component có thể xử lý
        throw error;
    }
};

// Lấy khách hàng theo ID
export const getKhachHangById = async (id) => {
    try {
        const response = await apiClient.get(`${API_BASE_URL}/${id}`);
        return response;
    } catch (error) {
        console.error("Error fetching customer by ID:", error);
        throw error;
    }
};

// Tạo khách hàng mới
export const createKhachHang = async (khachHang) => {
    try {
        const response = await apiClient.post(API_BASE_URL, khachHang);
        return response;
    } catch (error) {
        console.error("Error creating customer:", error);
        // Throw lỗi với thông báo từ API hoặc thông báo mặc định
        if (error.response && error.response.data) {
            throw error; // Giữ nguyên error object để component lấy message
        } else {
            throw new Error('Không thể tạo khách hàng. Vui lòng kiểm tra kết nối.');
        }
    }
};

// Cập nhật khách hàng
export const updateKhachHang = async (id, khachHang) => {
    try {
        const response = await apiClient.put(`${API_BASE_URL}/${id}`, khachHang);
        return response;
    } catch (error) {
        console.error("Error updating customer:", error);
        if (error.response && error.response.data) {
            throw error;
        } else {
            throw new Error('Không thể cập nhật khách hàng. Vui lòng kiểm tra kết nối.');
        }
    }
};

// Xóa khách hàng
export const deleteKhachHang = async (id) => {
    try {
        const response = await apiClient.delete(`${API_BASE_URL}/${id}`);
        return response;
    } catch (error) {
        console.error("Error deleting customer:", error);
        if (error.response && error.response.data) {
            throw error;
        } else {
            throw new Error('Không thể xóa khách hàng. Vui lòng kiểm tra kết nối.');
        }
    }
};

// Lấy chuyến bay của khách hàng theo ID
export const getChuyenBayByKhachHangId = async (id) => {
    try {
        const response = await apiClient.get(`${API_BASE_URL}/${id}/chuyenbay`);
        console.log("Fetched flights for customer ID", id, ":", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching flights by customer ID:", error);
        throw error;
    }
};

// ==================== NEW METHODS FOR VIEW CUSTOMER MODAL ====================

// Lấy thông tin tài khoản của khách hàng
export const getTaiKhoanKhachHang = async (id) => {
    try {
        const response = await apiClient.get(`${API_BASE_URL}/${id}/tai-khoan`);
        return response.data;
    } catch (error) {
        console.error("Error fetching account info:", error);
        throw error;
    }
};

// Cập nhật một phần thông tin khách hàng
export const updateKhachHangPartial = async (id, data) => {
    try {
        const response = await apiClient.put(`${API_BASE_URL}/${id}/partial`, data);
        return response;
    } catch (error) {
        console.error("Error updating customer:", error);
        if (error.response && error.response.data) {
            throw error;
        } else {
            throw new Error('Không thể cập nhật khách hàng. Vui lòng kiểm tra kết nối.');
        }
    }
};

// Đổi mật khẩu cho khách hàng (admin)
export const doiMatKhauKhachHang = async (id, matKhauMoi) => {
    try {
        const response = await apiClient.put(`${API_BASE_URL}/${id}/doi-mat-khau`, { matKhauMoi });
        return response;
    } catch (error) {
        console.error("Error changing password:", error);
        if (error.response && error.response.data) {
            throw error;
        } else {
            throw new Error('Không thể đổi mật khẩu. Vui lòng kiểm tra kết nối.');
        }
    }
};