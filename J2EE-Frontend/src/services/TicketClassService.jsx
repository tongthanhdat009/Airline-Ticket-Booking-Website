import apiClient from "./apiClient";

/**
 * TicketClassService - Service quản lý Hạng Vé
 * Internal URL: /internal/ticket-classes (yêu cầu JWT)
 * Public URL: /api/v1/ticket-classes (không cần JWT)
 */

const INTERNAL_BASE_URL = '/internal/ticket-classes';
const PUBLIC_BASE_URL = '/api/v1/ticket-classes';

// ==================== PUBLIC API (Không cần JWT) ====================

/**
 * Lấy danh sách tất cả hạng vé đang hoạt động (Public)
 * @returns {Promise} - Promise chứa danh sách hạng vé
 */
export const getAllTicketClasses = async () => {
    try {
        const response = await apiClient.get(PUBLIC_BASE_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching ticket classes:", error);
        throw error;
    }
};

/**
 * Lấy thông tin hạng vé theo ID (Public)
 * @param {number} id - Mã hạng vé
 * @returns {Promise} - Promise chứa thông tin hạng vé
 */
export const getTicketClassById = async (id) => {
    try {
        const response = await apiClient.get(`${PUBLIC_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching ticket class:", error);
        throw error;
    }
};

// ==================== INTERNAL API (Yêu cầu JWT) ====================

/**
 * Lấy danh sách tất cả hạng vé (Admin)
 * @returns {Promise} - Promise chứa danh sách hạng vé
 */
export const getAllTicketClassesAdmin = async () => {
    try {
        const response = await apiClient.get(INTERNAL_BASE_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching ticket classes:", error);
        throw error;
    }
};

/**
 * Lấy thông tin hạng vé theo ID (Admin)
 * @param {number} id - Mã hạng vé
 * @returns {Promise} - Promise chứa thông tin hạng vé
 */
export const getTicketClassByIdAdmin = async (id) => {
    try {
        const response = await apiClient.get(`${INTERNAL_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching ticket class:", error);
        throw error;
    }
};

/**
 * Lấy danh sách hạng vé đã xóa
 * @returns {Promise} - Promise chứa danh sách hạng vé đã xóa
 */
export const getDeletedTicketClasses = async () => {
    try {
        const response = await apiClient.get(`${INTERNAL_BASE_URL}/deleted`);
        return response.data;
    } catch (error) {
        console.error("Error fetching deleted ticket classes:", error);
        throw error;
    }
};

/**
 * Tạo hạng vé mới
 * @param {Object} ticketClassData - Dữ liệu hạng vé
 * @returns {Promise} - Promise chứa hạng vé đã tạo
 */
export const createTicketClass = async (ticketClassData) => {
    try {
        const response = await apiClient.post(INTERNAL_BASE_URL, ticketClassData);
        return response.data;
    } catch (error) {
        console.error("Error creating ticket class:", error);
        throw error;
    }
};

/**
 * Cập nhật thông tin hạng vé
 * @param {number} id - Mã hạng vé
 * @param {Object} ticketClassData - Dữ liệu cập nhật
 * @returns {Promise} - Promise chứa hạng vé đã cập nhật
 */
export const updateTicketClass = async (id, ticketClassData) => {
    try {
        const response = await apiClient.put(`${INTERNAL_BASE_URL}/${id}`, ticketClassData);
        return response.data;
    } catch (error) {
        console.error("Error updating ticket class:", error);
        throw error;
    }
};

/**
 * Khôi phục hạng vé đã xóa
 * @param {number} id - Mã hạng vé
 * @returns {Promise} - Promise chứa kết quả
 */
export const restoreTicketClass = async (id) => {
    try {
        const response = await apiClient.put(`${INTERNAL_BASE_URL}/${id}/restore`);
        return response.data;
    } catch (error) {
        console.error("Error restoring ticket class:", error);
        throw error;
    }
};

/**
 * Xóa mềm hạng vé
 * @param {number} id - Mã hạng vé
 * @returns {Promise} - Promise chứa kết quả xóa
 */
export const deleteTicketClass = async (id) => {
    try {
        const response = await apiClient.delete(`${INTERNAL_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting ticket class:", error);
        throw error;
    }
};

// ==================== BACKWARD COMPATIBILITY ALIASES ====================
// Các hàm alias để tương thích ngược với code cũ (QLHangVeService)
export const getAllHangVe = getAllTicketClasses;
export const getHangVeById = getTicketClassById;
export const getAllHangVeAdmin = getAllTicketClassesAdmin;
export const getHangVeByIdAdmin = getTicketClassByIdAdmin;
export const createHangVe = createTicketClass;
export const updateHangVe = updateTicketClass;
export const deleteHangVe = deleteTicketClass;
export const restoreHangVe = restoreTicketClass;
export const getAllDeleted = getDeletedTicketClasses;
export { getAllHangVe as getallhangve };

export default {
    // Public APIs
    getAllTicketClasses,
    getTicketClassById,
    // Internal APIs
    getAllTicketClassesAdmin,
    getTicketClassByIdAdmin,
    getDeletedTicketClasses,
    createTicketClass,
    updateTicketClass,
    restoreTicketClass,
    deleteTicketClass,
    // Backward compatibility
    getAllHangVe,
    getHangVeById,
    getAllHangVeAdmin,
    getHangVeByIdAdmin,
    createHangVe,
    updateHangVe,
    deleteHangVe,
    restoreHangVe,
    getAllDeleted,
};
