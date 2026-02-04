import apiClient from './apiClient';

/**
 * CustomerService - Service quản lý Khách Hàng (Hành Khách)
 * Base URL: /internal/customers
 */

const BASE_URL = '/internal/customers';

/**
 * Lấy danh sách tất cả khách hàng
 * @returns {Promise} - Promise chứa danh sách khách hàng
 */
export const getAllCustomers = async () => {
    try {
        const response = await apiClient.get(BASE_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching customers:", error);
        throw error;
    }
};

/**
 * Lấy khách hàng theo ID
 * @param {number} id - Mã khách hàng
 * @returns {Promise} - Promise chứa thông tin khách hàng
 */
export const getCustomerById = async (id) => {
    try {
        const response = await apiClient.get(`${BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching customer by ID:", error);
        throw error;
    }
};

/**
 * Tạo khách hàng mới
 * @param {Object} customerData - Dữ liệu khách hàng
 * @returns {Promise} - Promise chứa khách hàng đã tạo
 */
export const createCustomer = async (customerData) => {
    try {
        const response = await apiClient.post(BASE_URL, customerData);
        return response.data;
    } catch (error) {
        console.error("Error creating customer:", error);
        if (error.response && error.response.data) {
            throw error;
        } else {
            throw new Error('Không thể tạo khách hàng. Vui lòng kiểm tra kết nối.');
        }
    }
};

/**
 * Cập nhật khách hàng
 * @param {number} id - Mã khách hàng
 * @param {Object} customerData - Dữ liệu cập nhật
 * @returns {Promise} - Promise chứa khách hàng đã cập nhật
 */
export const updateCustomer = async (id, customerData) => {
    try {
        const response = await apiClient.put(`${BASE_URL}/${id}`, customerData);
        return response.data;
    } catch (error) {
        console.error("Error updating customer:", error);
        if (error.response && error.response.data) {
            throw error;
        } else {
            throw new Error('Không thể cập nhật khách hàng. Vui lòng kiểm tra kết nối.');
        }
    }
};

/**
 * Xóa khách hàng
 * @param {number} id - Mã khách hàng
 * @returns {Promise} - Promise chứa kết quả xóa
 */
export const deleteCustomer = async (id) => {
    try {
        const response = await apiClient.delete(`${BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting customer:", error);
        if (error.response && error.response.data) {
            throw error;
        } else {
            throw new Error('Không thể xóa khách hàng. Vui lòng kiểm tra kết nối.');
        }
    }
};

/**
 * Lấy chuyến bay của khách hàng theo ID
 * @param {number} id - Mã khách hàng
 * @returns {Promise} - Promise chứa danh sách chuyến bay
 */
export const getCustomerFlights = async (id) => {
    try {
        // Sửa endpoint từ /internal/customers/{id}/flights thành /internal/passengers/{id}/flights
        const response = await apiClient.get(`/internal/passengers/${id}/flights`);
        console.log("Fetched flights for customer ID", id, ":", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching flights by customer ID:", error);
        throw error;
    }
};

// ==================== BACKWARD COMPATIBILITY ALIASES ====================
// Các hàm alias để tương thích ngược với code cũ (QLKhachHangService)
export const getAllKhachHang = getAllCustomers;
export const getKhachHangById = getCustomerById;
export const createKhachHang = createCustomer;
export const updateKhachHang = updateCustomer;
export const deleteKhachHang = deleteCustomer;
export const getChuyenBayByKhachHangId = getCustomerFlights;

export default {
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerFlights,
    // Backward compatibility
    getAllKhachHang,
    getKhachHangById,
    createKhachHang,
    updateKhachHang,
    deleteKhachHang,
    getChuyenBayByKhachHangId,
};
