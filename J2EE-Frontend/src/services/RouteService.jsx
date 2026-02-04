import apiClient from "./apiClient";

/**
 * RouteService - Service quản lý Tuyến Bay
 * Base URL: /internal/routes
 */

const BASE_URL = '/internal/routes';

/**
 * Lấy danh sách tất cả tuyến bay
 * @returns {Promise} - Promise chứa danh sách tuyến bay
 */
export const getAllRoutes = async () => {
    try {
        const response = await apiClient.get(BASE_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching routes:", error);
        throw error;
    }
};

/**
 * Lấy thông tin tuyến bay theo ID
 * @param {number} id - Mã tuyến bay
 * @returns {Promise} - Promise chứa thông tin tuyến bay
 */
export const getRouteById = async (id) => {
    try {
        const response = await apiClient.get(`${BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching route by ID:", error);
        throw error;
    }
};

/**
 * Tạo tuyến bay mới
 * @param {Object} routeData - Dữ liệu tuyến bay
 * @returns {Promise} - Promise chứa tuyến bay đã tạo
 */
export const createRoute = async (routeData) => {
    try {
        const response = await apiClient.post(BASE_URL, routeData);
        return response.data;
    } catch (error) {
        console.error("Error creating route:", error);
        throw error;
    }
};

/**
 * Cập nhật thông tin tuyến bay
 * @param {number} id - Mã tuyến bay
 * @param {Object} routeData - Dữ liệu cập nhật
 * @returns {Promise} - Promise chứa tuyến bay đã cập nhật
 */
export const updateRoute = async (id, routeData) => {
    try {
        const response = await apiClient.put(`${BASE_URL}/${id}`, routeData);
        return response.data;
    } catch (error) {
        console.error("Error updating route:", error);
        throw error;
    }
};

/**
 * Xóa tuyến bay
 * @param {number} id - Mã tuyến bay
 * @returns {Promise} - Promise chứa kết quả xóa
 */
export const deleteRoute = async (id) => {
    try {
        const response = await apiClient.delete(`${BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting route:", error);
        throw error;
    }
};

// ==================== BACKWARD COMPATIBILITY ALIASES ====================
// Các hàm alias để tương thích ngược với code cũ
export const getAllTuyenBay = getAllRoutes;
export const getTuyenBayById = getRouteById;
export const createTuyenBay = createRoute;
export const addTuyenBay = createRoute;  // Alias cho code cũ dùng addTuyenBay
export const updateTuyenBay = async (routeData) => updateRoute(routeData.maTuyenBay, routeData);
export const deleteTuyenBay = deleteRoute;

export default {
    getAllRoutes,
    getRouteById,
    createRoute,
    updateRoute,
    deleteRoute,
    // Backward compatibility
    getAllTuyenBay,
    getTuyenBayById,
    createTuyenBay,
    addTuyenBay,
    updateTuyenBay,
    deleteTuyenBay,
};
