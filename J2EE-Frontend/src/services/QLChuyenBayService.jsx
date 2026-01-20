import apiClient from "./apiClient";

export const getAllChuyenBay = () => {
    try {
        const response = apiClient.get('/admin/dashboard/chuyenbay');
        return response;
    } catch (error) {
        console.error("Error fetching flights:", error);
        throw error;
    }
};

export const getChuyenBayById = (id) => {
    try {
        const response = apiClient.get(`/admin/dashboard/chuyenbay/${id}`);
        return response;
    } catch (error) {
        console.error("Error fetching flight by ID:", error);
        throw error;
    }
};

export const createChuyenBay = (flightData) => {
    try {
        console.log("Creating flight with data:", flightData);
        const response = apiClient.post('/admin/dashboard/chuyenbay', flightData);
        return response;
    } catch (error) {
        console.error("Error creating flight:", error);
        throw error;
    }
};

export const updateChuyenBay = (flightData) => {
    try {
        const response = apiClient.put('/admin/dashboard/chuyenbay', flightData);
        return response;
    } catch (error) {
        console.error("Error updating flight:", error);
        throw error;
    }
};

export const deleteChuyenBay = (flightData) => {
    try {
        const response = apiClient.delete('/admin/dashboard/chuyenbay', { data: flightData });
        return response;
    } catch (error) {
        console.error("Error deleting flight:", error);
        throw error;
    }
};

export const updateTrangThaiChuyenBay = (maChuyenBay, trangThai) => {
    try {
        const response = apiClient.put(`/admin/dashboard/chuyenbay/trangthai?maChuyenBay=${maChuyenBay}&trangThai=${trangThai}`);
        return response;
    } catch (error) {
        console.error("Error updating flight status:", error);
        throw error;
    }
};

export const updateDelay = (delayData) => {
    try {
        const response = apiClient.put('/admin/dashboard/chuyenbay/delay', delayData);
        return response;
    } catch (error) {
        console.error("Error updating delay:", error);
        throw error;
    }
};

export const updateCancel = (cancelData) => {
    try {
        const response = apiClient.put('/admin/dashboard/chuyenbay/huychuyen', cancelData);
        return response;
    } catch (error) {
        console.error("Error updating cancel:", error);
        throw error;
    }
};

export const addGheToChuyenBay = async (maChuyenBay, soGheTheoHangVe) => {
    try {
        const response = await apiClient.post(`/admin/dashboard/chuyenbay/${maChuyenBay}/ghe`, soGheTheoHangVe);
        return response.data;
    } catch (error) {
        console.error('Error adding seats to flight:', error);
        throw error;
    }
};

export const getAllDeletedChuyenBay = async () => {
    try {
        const response = await apiClient.get('/admin/dashboard/chuyenbay/deleted');
        return response;
    } catch (error) {
        console.error('Error fetching deleted flights:', error);
        throw error;
    }
};

export const restoreChuyenBay = async (maChuyenBay) => {
    try {
        const response = await apiClient.put(`/admin/dashboard/chuyenbay/${maChuyenBay}/restore`);
        return response;
    } catch (error) {
        console.error('Error restoring flight:', error);
        throw error;
    }
};
