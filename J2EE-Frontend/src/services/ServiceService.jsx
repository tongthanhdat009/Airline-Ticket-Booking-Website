import apiClient from "./apiClient";

/**
 * ServiceService - Service quản lý Dịch Vụ
 * Internal URL: /internal/services (yêu cầu JWT)
 * Public URL: /api/v1/services (không cần JWT)
 */

const INTERNAL_BASE_URL = '/internal/services';
const PUBLIC_BASE_URL = '/api/v1/services';

// ==================== INTERNAL API (Yêu cầu JWT) ====================

/**
 * Lấy danh sách tất cả dịch vụ
 * @returns {Promise} - Promise chứa danh sách dịch vụ
 */
export const getAllServices = async () => {
    try {
        const response = await apiClient.get(INTERNAL_BASE_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching services:", error);
        throw error;
    }
};

/**
 * Lấy thông tin dịch vụ theo ID
 * @param {number} id - Mã dịch vụ
 * @returns {Promise} - Promise chứa thông tin dịch vụ
 */
export const getServiceById = async (id) => {
    try {
        const response = await apiClient.get(`${INTERNAL_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching service:", error);
        throw error;
    }
};

/**
 * Lấy danh sách dịch vụ đã xóa
 * @returns {Promise} - Promise chứa danh sách dịch vụ đã xóa
 */
export const getDeletedServices = async () => {
    try {
        const response = await apiClient.get(`${INTERNAL_BASE_URL}/deleted`);
        return response.data;
    } catch (error) {
        console.error("Error fetching deleted services:", error);
        throw error;
    }
};

/**
 * Tạo dịch vụ mới
 * @param {Object} serviceData - Dữ liệu dịch vụ
 * @returns {Promise} - Promise chứa dịch vụ đã tạo
 */
export const createService = async (serviceData) => {
    try {
        const response = await apiClient.post(INTERNAL_BASE_URL, serviceData);
        return response.data;
    } catch (error) {
        console.error("Error creating service:", error);
        throw error;
    }
};

/**
 * Cập nhật dịch vụ
 * @param {number} id - Mã dịch vụ
 * @param {Object} serviceData - Dữ liệu cập nhật
 * @returns {Promise} - Promise chứa dịch vụ đã cập nhật
 */
export const updateService = async (id, serviceData) => {
    try {
        const response = await apiClient.put(`${INTERNAL_BASE_URL}/${id}`, serviceData);
        return response.data;
    } catch (error) {
        console.error("Error updating service:", error);
        throw error;
    }
};

/**
 * Upload ảnh dịch vụ
 * @param {number} id - Mã dịch vụ
 * @param {File} imageFile - File ảnh
 * @returns {Promise} - Promise chứa kết quả
 */
export const uploadServiceImage = async (id, imageFile) => {
    try {
        const formData = new FormData();
        formData.append('anh', imageFile);
        const response = await apiClient.post(`${INTERNAL_BASE_URL}/${id}/image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating service image:", error);
        throw error;
    }
};

/**
 * Khôi phục dịch vụ đã xóa
 * @param {number} id - Mã dịch vụ
 * @returns {Promise} - Promise chứa kết quả
 */
export const restoreService = async (id) => {
    try {
        const response = await apiClient.put(`${INTERNAL_BASE_URL}/${id}/restore`);
        return response.data;
    } catch (error) {
        console.error("Error restoring service:", error);
        throw error;
    }
};

/**
 * Xóa mềm dịch vụ
 * @param {number} id - Mã dịch vụ
 * @returns {Promise} - Promise chứa kết quả xóa
 */
export const deleteService = async (id) => {
    try {
        const response = await apiClient.delete(`${INTERNAL_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting service:", error);
        throw error;
    }
};

/**
 * Xóa cứng (vĩnh viễn) dịch vụ
 * @param {number} id - Mã dịch vụ
 * @returns {Promise} - Promise chứa kết quả
 */
export const hardDeleteService = async (id) => {
    try {
        const response = await apiClient.delete(`${INTERNAL_BASE_URL}/${id}/hard`);
        return response.data;
    } catch (error) {
        console.error("Error hard deleting service:", error);
        throw error;
    }
};

// ==================== SERVICE OPTIONS ====================

/**
 * Lấy danh sách lựa chọn của dịch vụ
 * @param {number} serviceId - Mã dịch vụ
 * @returns {Promise} - Promise chứa danh sách lựa chọn
 */
export const getServiceOptions = async (serviceId) => {
    try {
        const response = await apiClient.get(`${INTERNAL_BASE_URL}/${serviceId}/options`);
        return response.data;
    } catch (error) {
        console.error("Error fetching service options:", error);
        throw error;
    }
};

/**
 * Tạo lựa chọn dịch vụ mới
 * @param {number} serviceId - Mã dịch vụ
 * @param {Object} optionData - Dữ liệu lựa chọn
 * @returns {Promise} - Promise chứa lựa chọn đã tạo
 */
export const createServiceOption = async (serviceId, optionData) => {
    try {
        const response = await apiClient.post(`${INTERNAL_BASE_URL}/${serviceId}/options`, optionData);
        return response.data;
    } catch (error) {
        console.error("Error creating service option:", error);
        throw error;
    }
};

/**
 * Cập nhật lựa chọn dịch vụ
 * @param {number} serviceId - Mã dịch vụ
 * @param {number} optionId - Mã lựa chọn
 * @param {Object} optionData - Dữ liệu cập nhật
 * @returns {Promise} - Promise chứa kết quả
 */
export const updateServiceOption = async (serviceId, optionId, optionData) => {
    try {
        const response = await apiClient.put(`${INTERNAL_BASE_URL}/${serviceId}/options/${optionId}`, optionData);
        return response.data;
    } catch (error) {
        console.error("Error updating service option:", error);
        throw error;
    }
};

/**
 * Upload ảnh lựa chọn dịch vụ
 * @param {number} serviceId - Mã dịch vụ
 * @param {number} optionId - Mã lựa chọn
 * @param {File} imageFile - File ảnh
 * @returns {Promise} - Promise chứa kết quả
 */
export const uploadServiceOptionImage = async (serviceId, optionId, imageFile) => {
    try {
        const formData = new FormData();
        formData.append('anh', imageFile);
        const response = await apiClient.post(`${INTERNAL_BASE_URL}/${serviceId}/options/${optionId}/image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating option image:", error);
        throw error;
    }
};

/**
 * Xóa lựa chọn dịch vụ
 * @param {number} serviceId - Mã dịch vụ
 * @param {number} optionId - Mã lựa chọn
 * @returns {Promise} - Promise chứa kết quả
 */
export const deleteServiceOption = async (serviceId, optionId) => {
    try {
        const response = await apiClient.delete(`${INTERNAL_BASE_URL}/${serviceId}/options/${optionId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting service option:", error);
        throw error;
    }
};

// ==================== IMAGE FETCH ====================

/**
 * Lấy ảnh dịch vụ theo tên
 * @param {string} imageName - Tên file ảnh
 * @returns {Promise} - Promise chứa blob ảnh
 */
export const fetchServiceImageByName = async (imageName) => {
    try {
        const response = await apiClient.get(`${INTERNAL_BASE_URL}/image/${imageName}`, {
            responseType: 'blob',
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching service image:", error);
        throw error;
    }
};

/**
 * Lấy ảnh lựa chọn theo tên
 * @param {string} imageName - Tên file ảnh
 * @returns {Promise} - Promise chứa blob ảnh
 */
export const fetchOptionImageByName = async (imageName) => {
    try {
        const response = await apiClient.get(`${INTERNAL_BASE_URL}/options/image/${imageName}`, {
            responseType: 'blob',
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching option image:", error);
        throw error;
    }
};

// ==================== PUBLIC API (Không cần JWT) ====================

/**
 * Lấy danh sách dịch vụ cho dropdown (Public)
 * @returns {Promise} - Promise chứa danh sách dịch vụ
 */
export const getServicesForDropdown = async () => {
    try {
        const response = await apiClient.get(PUBLIC_BASE_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching services for dropdown:", error);
        throw error;
    }
};

// ==================== BACKWARD COMPATIBILITY ALIASES ====================
// Các hàm alias để tương thích ngược với code cũ (QLDichVuService)
export const fetchImageByName = fetchServiceImageByName;
export const uploadImage = async (imageFile) => {
    try {
        const formData = new FormData();
        formData.append('file', imageFile);
        const response = await apiClient.post(`${INTERNAL_BASE_URL}/image/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
};
export const updateServiceImage = uploadServiceImage;
export const updateOption = updateServiceOption;
export const deleteOption = deleteServiceOption;
export const updateOptionImage = uploadServiceOptionImage;
export const getDichVuByMaDatCho = async (maDatCho) => {
    try {
        const response = await apiClient.get(`/internal/bookings/${maDatCho}/services`);
        return response.data;
    } catch (error) {
        console.error("Error fetching booked services:", error);
        throw error;
    }
};

export default {
    // Internal APIs
    getAllServices,
    getServiceById,
    getDeletedServices,
    createService,
    updateService,
    uploadServiceImage,
    restoreService,
    deleteService,
    hardDeleteService,
    // Service Options
    getServiceOptions,
    createServiceOption,
    updateServiceOption,
    uploadServiceOptionImage,
    deleteServiceOption,
    // Image
    fetchServiceImageByName,
    fetchOptionImageByName,
    // Public APIs
    getServicesForDropdown,
    // Backward compatibility
    fetchImageByName,
    uploadImage,
    updateServiceImage,
    updateOption,
    deleteOption,
    updateOptionImage,
    getDichVuByMaDatCho,
};
