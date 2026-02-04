import apiClient from "./apiClient";

/**
 * AdminUserService - Service quản lý Tài khoản Admin
 * Base URL: /internal/admin-users
 */

const BASE_URL = '/internal/admin-users';

// ==================== ROLE MANAGEMENT ====================

/**
 * Lấy danh sách vai trò
 * @returns {Promise} - Promise chứa danh sách vai trò
 */
export const getAllRoles = async () => {
    try {
        const response = await apiClient.get("/internal/roles");
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách vai trò", error);
        throw error;
    }
};

// ==================== ADMIN USER MANAGEMENT ====================

/**
 * Lấy danh sách tài khoản admin
 * @returns {Promise} - Promise chứa danh sách tài khoản admin
 */
export const getAllAdminUsers = async () => {
    try {
        const response = await apiClient.get(BASE_URL);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách tài khoản admin", error);
        throw error;
    }
};

/**
 * Lấy thông tin tài khoản admin theo ID
 * @param {number} id - Mã tài khoản admin
 * @returns {Promise} - Promise chứa thông tin tài khoản
 */
export const getAdminUserById = async (id) => {
    try {
        const response = await apiClient.get(`${BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi lấy thông tin tài khoản admin ${id}`, error);
        throw error;
    }
};

/**
 * Tìm kiếm tài khoản admin
 * @param {string} username - Tên đăng nhập
 * @param {string} email - Email
 * @returns {Promise} - Promise chứa kết quả tìm kiếm
 */
export const searchAdminUsers = async (username, email) => {
    try {
        const params = {};
        if (username) params.tenDangNhap = username;
        if (email) params.email = email;
        const response = await apiClient.get(`${BASE_URL}/search`, { params });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tìm kiếm tài khoản admin", error);
        throw error;
    }
};

/**
 * Tạo tài khoản admin mới
 * @param {Object} adminData - Dữ liệu tài khoản admin
 * @returns {Promise} - Promise chứa tài khoản đã tạo
 */
export const createAdminUser = async (adminData) => {
    try {
        const response = await apiClient.post(BASE_URL, adminData);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi thêm tài khoản admin", error);
        throw error;
    }
};

/**
 * Cập nhật thông tin tài khoản admin
 * @param {number} id - Mã tài khoản admin
 * @param {Object} adminData - Dữ liệu cập nhật
 * @returns {Promise} - Promise chứa tài khoản đã cập nhật
 */
export const updateAdminUser = async (id, adminData) => {
    try {
        console.log('=== CALLING UPDATE API ===');
        console.log('URL:', `${BASE_URL}/${id}`);
        console.log('Data sent:', JSON.stringify(adminData, null, 2));
        const response = await apiClient.put(`${BASE_URL}/${id}`, adminData);
        console.log('Response:', response.data);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi cập nhật tài khoản admin ${id}`, error);
        console.error('Error response:', error.response?.data);
        throw error;
    }
};

/**
 * Xóa tài khoản admin
 * @param {number} id - Mã tài khoản admin
 * @returns {Promise} - Promise chứa kết quả xóa
 */
export const deleteAdminUser = async (id) => {
    try {
        const response = await apiClient.delete(`${BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi xóa tài khoản admin`, error);
        throw error;
    }
};

// ==================== ROLE ASSIGNMENT ====================

/**
 * Gán vai trò cho tài khoản admin
 * @param {number} userId - Mã tài khoản admin
 * @param {Array} roleIds - Danh sách mã vai trò
 * @returns {Promise} - Promise chứa kết quả
 */
export const assignRoles = async (userId, roleIds) => {
    try {
        const response = await apiClient.put(`${BASE_URL}/${userId}/roles`, {
            vaiTroIds: roleIds
        });
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi gán vai trò cho tài khoản admin ${userId}`, error);
        throw error;
    }
};

/**
 * Thêm một vai trò cho tài khoản admin
 * @param {number} userId - Mã tài khoản admin
 * @param {number} roleId - Mã vai trò
 * @returns {Promise} - Promise chứa kết quả
 */
export const addRole = async (userId, roleId) => {
    try {
        const response = await apiClient.post(`${BASE_URL}/${userId}/roles/${roleId}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi thêm vai trò cho tài khoản admin ${userId}`, error);
        throw error;
    }
};

/**
 * Xóa một vai trò khỏi tài khoản admin
 * @param {number} userId - Mã tài khoản admin
 * @param {number} roleId - Mã vai trò
 * @returns {Promise} - Promise chứa kết quả
 */
export const removeRole = async (userId, roleId) => {
    try {
        const response = await apiClient.delete(`${BASE_URL}/${userId}/roles/${roleId}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi xóa vai trò khỏi tài khoản admin ${userId}`, error);
        throw error;
    }
};

// ==================== BACKWARD COMPATIBILITY ALIASES ====================
// Các hàm alias để tương thích ngược với code cũ (QLTaiKhoanAdminServices)
export const getAllVaiTro = getAllRoles;
export const getAllTKadmin = getAllAdminUsers;
export const thongTinTKadmin = getAdminUserById;
export const addTKadmin = createAdminUser;
export const updateTKadmin = updateAdminUser;
export const deleteTKadmin = deleteAdminUser;
export const assignRolesToAccount = assignRoles;
export const addRoleToAccount = addRole;
export const removeRoleFromAccount = removeRole;

export default {
    // Role management
    getAllRoles,
    // Admin user management
    getAllAdminUsers,
    getAdminUserById,
    searchAdminUsers,
    createAdminUser,
    updateAdminUser,
    deleteAdminUser,
    // Role assignment
    assignRoles,
    addRole,
    removeRole,
    // Backward compatibility
    getAllVaiTro,
    getAllTKadmin,
    thongTinTKadmin,
    addTKadmin,
    updateTKadmin,
    deleteTKadmin,
    assignRolesToAccount,
    addRoleToAccount,
    removeRoleFromAccount,
};
