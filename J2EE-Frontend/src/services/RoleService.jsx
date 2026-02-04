import apiClient from "./apiClient";

/**
 * RoleService - Service quản lý Vai Trò
 * Internal URL: /internal/roles (yêu cầu JWT)
 * Public URL: /api/v1/roles (không cần JWT)
 */

const INTERNAL_BASE_URL = '/internal/roles';
const PUBLIC_BASE_URL = '/api/v1/roles';

// ==================== INTERNAL API (Yêu cầu JWT) ====================

/**
 * Lấy tất cả vai trò
 * @returns {Promise} - Promise chứa danh sách vai trò
 */
export const getAllRoles = async () => {
    try {
        const response = await apiClient.get(INTERNAL_BASE_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching roles:", error);
        throw error;
    }
};

/**
 * Lấy vai trò theo ID
 * @param {number} id - Mã vai trò
 * @returns {Promise} - Promise chứa thông tin vai trò
 */
export const getRoleById = async (id) => {
    try {
        const response = await apiClient.get(`${INTERNAL_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching role:", error);
        throw error;
    }
};

/**
 * Lấy danh sách vai trò theo trạng thái
 * @param {boolean} status - Trạng thái vai trò
 * @returns {Promise} - Promise chứa danh sách vai trò
 */
export const getRolesByStatus = async (status) => {
    try {
        const response = await apiClient.get(`${INTERNAL_BASE_URL}/status/${status}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching roles by status:", error);
        throw error;
    }
};

/**
 * Tìm kiếm vai trò
 * @param {string} keyword - Từ khóa tìm kiếm
 * @returns {Promise} - Promise chứa kết quả tìm kiếm
 */
export const searchRoles = async (keyword) => {
    try {
        const response = await apiClient.get(`${INTERNAL_BASE_URL}/search`, {
            params: { keyword }
        });
        return response.data;
    } catch (error) {
        console.error("Error searching roles:", error);
        throw error;
    }
};

/**
 * Đếm số admin đang sử dụng vai trò
 * @param {number} id - Mã vai trò
 * @returns {Promise} - Promise chứa số lượng admin
 */
export const countAdminsByRole = async (id) => {
    try {
        const response = await apiClient.get(`${INTERNAL_BASE_URL}/${id}/admin-count`);
        return response.data;
    } catch (error) {
        console.error("Error counting admin by role:", error);
        throw error;
    }
};

/**
 * Tạo vai trò mới
 * @param {Object} roleData - Dữ liệu vai trò
 * @returns {Promise} - Promise chứa vai trò đã tạo
 */
export const createRole = async (roleData) => {
    try {
        const response = await apiClient.post(INTERNAL_BASE_URL, roleData);
        return response.data;
    } catch (error) {
        console.error("Error creating role:", error);
        throw error;
    }
};

/**
 * Cập nhật vai trò
 * @param {number} id - Mã vai trò
 * @param {Object} roleData - Dữ liệu cập nhật
 * @returns {Promise} - Promise chứa vai trò đã cập nhật
 */
export const updateRole = async (id, roleData) => {
    try {
        const response = await apiClient.put(`${INTERNAL_BASE_URL}/${id}`, roleData);
        return response.data;
    } catch (error) {
        console.error("Error updating role:", error);
        throw error;
    }
};

/**
 * Xóa vai trò (soft delete)
 * @param {number} id - Mã vai trò
 * @returns {Promise} - Promise chứa kết quả xóa
 */
export const deleteRole = async (id) => {
    try {
        const response = await apiClient.delete(`${INTERNAL_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting role:", error);
        throw error;
    }
};

// ==================== PUBLIC API (Không cần JWT) ====================

/**
 * Lấy danh sách vai trò cho dropdown (Public)
 * @returns {Promise} - Promise chứa danh sách vai trò
 */
export const getRolesForDropdown = async () => {
    try {
        const response = await apiClient.get(PUBLIC_BASE_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching roles for dropdown:", error);
        throw error;
    }
};

// ==================== BACKWARD COMPATIBILITY ALIASES ====================
// Các hàm alias để tương thích ngược với code cũ (VaiTroService)
export const getAllVaiTro = getAllRoles;
export const getVaiTroById = getRoleById;
export const getVaiTroByTrangThai = getRolesByStatus;
export const searchVaiTro = searchRoles;
export const countAdminByVaiTro = countAdminsByRole;
export const createVaiTro = createRole;
export const updateVaiTro = updateRole;
export const deleteVaiTro = deleteRole;

export default {
    // Internal APIs
    getAllRoles,
    getRoleById,
    getRolesByStatus,
    searchRoles,
    countAdminsByRole,
    createRole,
    updateRole,
    deleteRole,
    // Public APIs
    getRolesForDropdown,
    // Backward compatibility
    getAllVaiTro,
    getVaiTroById,
    getVaiTroByTrangThai,
    searchVaiTro,
    countAdminByVaiTro,
    createVaiTro,
    updateVaiTro,
    deleteVaiTro,
};
