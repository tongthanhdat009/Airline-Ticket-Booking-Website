import apiClient from "./apiClient";

const ADMIN_BASE_PATH = '/admin/dashboard/hangve';
const PUBLIC_BASE_PATH = '/api/hangve';

// ==================== PUBLIC API (Read-only) ====================
/**
 * Lấy danh sách tất cả hạng vé đang hoạt động
 * Public API - không cần authentication
 */
export const getAllHangVe = async () => {
    try {
        const response = await apiClient.get(PUBLIC_BASE_PATH);
        return response.data;
    } catch (error) {
        console.error("Error fetching ticket classes:", error);
        throw error;
    }
};

/**
 * Lấy thông tin hạng vé theo ID
 * Public API - không cần authentication
 */
export const getHangVeById = async (id) => {
    try {
        const response = await apiClient.get(`${PUBLIC_BASE_PATH}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching ticket class:", error);
        throw error;
    }
};

// ==================== ADMIN API ====================
/**
 * Lấy danh sách tất cả hạng vé
 */
export const getAllHangVeAdmin = async () => {
    try {
        const response = await apiClient.get(ADMIN_BASE_PATH);
        return response.data;
    } catch (error) {
        console.error("Error fetching ticket classes:", error);
        throw error;
    }
};

/**
 * Lấy thông tin hạng vé theo ID
 */
export const getHangVeByIdAdmin = async (id) => {
    try {
        const response = await apiClient.get(`${ADMIN_BASE_PATH}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching ticket class:", error);
        throw error;
    }
};

/**
 * Tạo hạng vé mới
 */
export const createHangVe = async (hangVeData) => {
    try {
        const response = await apiClient.post(ADMIN_BASE_PATH, hangVeData);
        return response.data;
    } catch (error) {
        console.error("Error creating ticket class:", error);
        throw error;
    }
};

/**
 * Cập nhật thông tin hạng vé
 */
export const updateHangVe = async (id, hangVeData) => {
    try {
        const response = await apiClient.put(`${ADMIN_BASE_PATH}/${id}`, hangVeData);
        return response.data;
    } catch (error) {
        console.error("Error updating ticket class:", error);
        throw error;
    }
};

/**
 * Xóa mềm hạng vé
 */
export const deleteHangVe = async (id) => {
    try {
        const response = await apiClient.delete(`${ADMIN_BASE_PATH}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting ticket class:", error);
        throw error;
    }
};

/**
 * Khôi phục hạng vé đã xóa mềm
 */
export const restoreHangVe = async (id) => {
    try {
        const response = await apiClient.put(`${ADMIN_BASE_PATH}/${id}/restore`);
        return response.data;
    } catch (error) {
        console.error("Error restoring ticket class:", error);
        throw error;
    }
};

/**
 * Lấy danh sách hạng vé đã xóa mềm
 */
export const getAllDeleted = async () => {
    try {
        const response = await apiClient.get(`${ADMIN_BASE_PATH}/deleted`);
        return response.data;
    } catch (error) {
        console.error("Error fetching deleted ticket classes:", error);
        throw error;
    }
};

/**
 * Xóa cứng (vĩnh viễn) hạng vé - chỉ dùng khi cần thiết
 * Lưu ý: Tính năng này có thể không được implement ở backend vì lý do bảo mật
 */
export const hardDeleteHangVe = async (id) => {
    try {
        const response = await apiClient.delete(`${ADMIN_BASE_PATH}/${id}/hard`);
        return response.data;
    } catch (error) {
        console.error("Error hard deleting ticket class:", error);
        throw error;
    }
};

// ==================== EXPORT ALIASES FOR BACKWARD COMPATIBILITY ====================
/**
 * Alias cho backward compatibility với SeatLayoutEditor.jsx
 */
export { getAllHangVe as getallhangve };
