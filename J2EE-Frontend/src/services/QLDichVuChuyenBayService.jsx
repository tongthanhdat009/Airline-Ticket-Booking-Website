import apiClient from './apiClient';

const API_BASE_URL = '/admin/dashboard/chuyenbay';

// Lấy danh sách dịch vụ của một chuyến bay
export const getDichVuByChuyenBay = async (maChuyenBay) => {
    try {
        const response = await apiClient.get(`${API_BASE_URL}/${maChuyenBay}/dichvu`);
        return response;
    } catch (error) {
        console.error("Error fetching services for flight:", error);
        throw error;
    }
};

// Thêm dịch vụ vào chuyến bay
export const addDichVuToChuyenBay = async (maChuyenBay, maDichVu) => {
    try {
        const response = await apiClient.post(`${API_BASE_URL}/${maChuyenBay}/dichvu/${maDichVu}`);
        return response;
    } catch (error) {
        console.error("Error adding service to flight:", error);
        throw error;
    }
};

// Xóa dịch vụ khỏi chuyến bay
export const removeDichVuFromChuyenBay = async (maChuyenBay, maDichVu) => {
    try {
        const response = await apiClient.delete(`${API_BASE_URL}/${maChuyenBay}/dichvu/${maDichVu}`);
        return response;
    } catch (error) {
        console.error("Error removing service from flight:", error);
        throw error;
    }
};
