import apiClient from "./apiClient";

export const getAllSanBay = () => {
    try {
        const response = apiClient.get('/admin/dashboard/sanbay');
        return response;
    } catch (error) {
        console.error("Error fetching airports:", error);
        throw error;
    }
};

export const getActiveSanBay = () => {
    try {
        const response = apiClient.get('/admin/dashboard/sanbay/trangthai/active');
        return response;
    } catch (error) {
        console.error("Error fetching active airports:", error);
        throw error;
    }
};

export const createSanBay = (airportData) => {
    try {
        const response = apiClient.post('/admin/dashboard/sanbay', airportData);
        return response;
    } catch (error) {
        console.error("Error creating airport:", error);
        throw error;
    }
};

export const updateTrangThaiSanBay = (maSanBay, trangThai) => {
    try {
        const response = apiClient.put(`/admin/dashboard/sanbay/trangthai?maSanBay=${maSanBay}&trangThai=${trangThai}`);
        return response;
    } catch (error) {
        console.error("Error updating airport status:", error);
        throw error;
    }
};

export const deleteSanBay = (maSanBay) => {
    try {
        const response = apiClient.delete(`/admin/dashboard/sanbay?maSanBay=${maSanBay}`);
        return response;
    } catch (error) {
        console.error("Error deleting airport:", error);
        throw error;
    }
};