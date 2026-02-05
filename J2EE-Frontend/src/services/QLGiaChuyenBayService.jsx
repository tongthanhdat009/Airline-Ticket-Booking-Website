import apiClient from './apiClient';

const API_BASE_URL = '/admin/dashboard/giachuyenbay';

// Lấy tất cả giá chuyến bay
export const getAllGiaChuyenBay = async () => {
    try {
        const response = await apiClient.get(API_BASE_URL);
        return response;
    } catch (error) {
        console.error("Error fetching flight prices:", error);
        throw error;
    }
};

// Lấy giá chuyến bay theo ID
export const getGiaChuyenBayById = async (id) => {
    try {
        const response = await apiClient.get(`${API_BASE_URL}/${id}`);
        return response;
    } catch (error) {
        console.error("Error fetching flight price by ID:", error);
        throw error;
    }
};

// Lấy giá chuyến bay theo tuyến bay
export const getGiaByTuyenBay = async (maTuyenBay) => {
    try {
        const response = await apiClient.get(`${API_BASE_URL}/tuyenbay/${maTuyenBay}`);
        return response;
    } catch (error) {
        console.error("Error fetching flight prices by route:", error);
        throw error;
    }
};

// Tạo giá chuyến bay mới
export const createGiaChuyenBay = async (giaData) => {
    try {
        const response = await apiClient.post(API_BASE_URL, giaData);
        return response;
    } catch (error) {
        console.error("Error creating flight price:", error);
        throw error;
    }
};

// Cập nhật giá chuyến bay
export const updateGiaChuyenBay = async (id, giaData) => {
    try {
        const response = await apiClient.put(`${API_BASE_URL}/${id}`, giaData);
        return response;
    } catch (error) {
        console.error("Error updating flight price:", error);
        throw error;
    }
};

// Xóa giá chuyến bay
export const deleteGiaChuyenBay = async (id) => {
    try {
        const response = await apiClient.delete(`${API_BASE_URL}/${id}`);
        return response;
    } catch (error) {
        console.error("Error deleting flight price:", error);
        throw error;
    }
};
