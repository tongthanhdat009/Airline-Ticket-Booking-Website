import apiClient from "./apiClient";

/**
 * PermissionService - Service quản lý Phân Quyền
 * Internal URL: /internal/permissions (yêu cầu JWT)
 * Public URL: /api/v1/features, /api/v1/actions (không cần JWT)
 */

const INTERNAL_BASE_URL = '/internal/permissions';
const PUBLIC_BASE_URL_FEATURES = '/api/v1/features';
const PUBLIC_BASE_URL_ACTIONS = '/api/v1/actions';

// ==================== INTERNAL API (Yêu cầu JWT) ====================

/**
 * Lấy tất cả chức năng trong hệ thống
 * @returns {Promise} - Promise chứa danh sách chức năng
 */
export const getAllFeatures = async () => {
    try {
        const response = await apiClient.get(`${INTERNAL_BASE_URL}/features`);
        return response.data;
    } catch (error) {
        console.error("Error fetching features:", error);
        throw error;
    }
};

/**
 * Lấy tất cả chức năng theo nhóm
 * @returns {Promise} - Promise chứa danh sách chức năng theo nhóm
 */
export const getGroupedFeatures = async () => {
    try {
        const response = await apiClient.get(`${INTERNAL_BASE_URL}/features/grouped`);
        return response.data;
    } catch (error) {
        console.error("Error fetching grouped features:", error);
        throw error;
    }
};

/**
 * Lấy tất cả hành động trong hệ thống
 * @returns {Promise} - Promise chứa danh sách hành động
 */
export const getAllActions = async () => {
    try {
        const response = await apiClient.get(`${INTERNAL_BASE_URL}/actions`);
        return response.data;
    } catch (error) {
        console.error("Error fetching actions:", error);
        throw error;
    }
};

/**
 * Lấy tất cả vai trò kèm thông tin SUPER_ADMIN
 * @returns {Promise} - Promise chứa danh sách vai trò
 */
export const getAllRolesWithSuperAdminFlag = async () => {
    try {
        const response = await apiClient.get(`${INTERNAL_BASE_URL}/roles`);
        return response.data;
    } catch (error) {
        console.error("Error fetching roles:", error);
        throw error;
    }
};

/**
 * Lấy danh sách phân quyền của một vai trò
 * @param {number} roleId - Mã vai trò
 * @returns {Promise} - Promise chứa danh sách phân quyền
 */
export const getPermissionsByRole = async (roleId) => {
    try {
        const response = await apiClient.get(`${INTERNAL_BASE_URL}/roles/${roleId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching permissions:", error);
        throw error;
    }
};

/**
 * Lấy ma trận phân quyền của một vai trò
 * @param {number} roleId - Mã vai trò
 * @returns {Promise} - Promise chứa ma trận phân quyền
 */
export const getPermissionMatrix = async (roleId) => {
    try {
        const response = await apiClient.get(`${INTERNAL_BASE_URL}/roles/${roleId}/matrix`);
        return response.data;
    } catch (error) {
        console.error("Error fetching permission matrix:", error);
        throw error;
    }
};

/**
 * Cập nhật phân quyền cho vai trò
 * @param {Object} data - Dữ liệu cập nhật
 * @param {number} data.maVaiTro - Mã vai trò
 * @param {Array} data.permissions - Danh sách quyền
 * @returns {Promise} - Promise chứa kết quả
 */
export const updatePermissions = async (data) => {
    try {
        const response = await apiClient.put(INTERNAL_BASE_URL, data);
        return response.data;
    } catch (error) {
        console.error("Error updating permissions:", error);
        throw error;
    }
};

/**
 * Thêm một quyền cho vai trò
 * @param {number} roleId - Mã vai trò
 * @param {number} featureId - Mã chức năng
 * @param {string} actionId - Mã hành động
 * @returns {Promise} - Promise chứa kết quả
 */
export const addPermission = async (roleId, featureId, actionId) => {
    try {
        const response = await apiClient.post(
            `${INTERNAL_BASE_URL}/roles/${roleId}/permissions`,
            { maChucNang: featureId, maHanhDong: actionId }
        );
        return response.data;
    } catch (error) {
        console.error("Error adding permission:", error);
        throw error;
    }
};

/**
 * Xóa một quyền khỏi vai trò
 * @param {number} roleId - Mã vai trò
 * @param {number} featureId - Mã chức năng
 * @param {string} actionId - Mã hành động
 * @returns {Promise} - Promise chứa kết quả
 */
export const removePermission = async (roleId, featureId, actionId) => {
    try {
        const response = await apiClient.delete(
            `${INTERNAL_BASE_URL}/roles/${roleId}/permissions`,
            { data: { maChucNang: featureId, maHanhDong: actionId } }
        );
        return response.data;
    } catch (error) {
        console.error("Error removing permission:", error);
        throw error;
    }
};

/**
 * Sao chép phân quyền từ vai trò này sang vai trò khác
 * @param {number} fromRoleId - Mã vai trò nguồn
 * @param {number} toRoleId - Mã vai trò đích
 * @returns {Promise} - Promise chứa kết quả
 */
export const copyPermissions = async (fromRoleId, toRoleId) => {
    try {
        const response = await apiClient.post(
            `${INTERNAL_BASE_URL}/copy`,
            { fromVaiTro: fromRoleId, toVaiTro: toRoleId }
        );
        return response.data;
    } catch (error) {
        console.error("Error copying permissions:", error);
        throw error;
    }
};

// ==================== PUBLIC API (Không cần JWT) ====================

/**
 * Lấy danh sách chức năng cho dropdown (Public)
 * @returns {Promise} - Promise chứa danh sách chức năng
 */
export const getFeaturesForDropdown = async () => {
    try {
        const response = await apiClient.get(PUBLIC_BASE_URL_FEATURES);
        return response.data;
    } catch (error) {
        console.error("Error fetching features for dropdown:", error);
        throw error;
    }
};

/**
 * Lấy danh sách hành động cho dropdown (Public)
 * @returns {Promise} - Promise chứa danh sách hành động
 */
export const getActionsForDropdown = async () => {
    try {
        const response = await apiClient.get(PUBLIC_BASE_URL_ACTIONS);
        return response.data;
    } catch (error) {
        console.error("Error fetching actions for dropdown:", error);
        throw error;
    }
};

// ==================== BACKWARD COMPATIBILITY ALIASES ====================
// Các hàm alias để tương thích ngược với code cũ (PhanQuyenService)
export const getAllChucNang = getAllFeatures;
export const getAllChucNangGrouped = getGroupedFeatures;
export const getAllHanhDong = getAllActions;
export const getAllVaiTroWithSuperAdminFlag = getAllRolesWithSuperAdminFlag;
export const getPhanQuyenByVaiTro = getPermissionsByRole;
export const updatePhanQuyen = updatePermissions;

export default {
    // Internal APIs
    getAllFeatures,
    getGroupedFeatures,
    getAllActions,
    getAllRolesWithSuperAdminFlag,
    getPermissionsByRole,
    getPermissionMatrix,
    updatePermissions,
    addPermission,
    removePermission,
    copyPermissions,
    // Public APIs
    getFeaturesForDropdown,
    getActionsForDropdown,
    // Backward compatibility
    getAllChucNang,
    getAllChucNangGrouped,
    getAllHanhDong,
    getAllVaiTroWithSuperAdminFlag,
    getPhanQuyenByVaiTro,
    updatePhanQuyen,
};
