import apiClient from "./apiClient";

export const getAllTuyenBay = async () => {
    try {
        const response = await apiClient.get('/admin/dashboard/tuyenbay');
        return response.data;
    } catch (error) {
        console.error("Error fetching routes:", error);
        throw error;
    }
};

export const getTuyenBayById = async (id) => {
    try {
        const response = await apiClient.get(`/admin/dashboard/tuyenbay/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching route by ID:", error);
        throw error;
    }
};

export const createTuyenBay = async (routeData) => {
    try {
        const response = await apiClient.post('/admin/dashboard/tuyenbay', routeData);
        return response.data;
    } catch (error) {
        console.error("Error creating route:", error);
        throw error;
    }
};

export const updateTuyenBay = async (routeData) => {
    try {
        const response = await apiClient.put('/admin/dashboard/tuyenbay', routeData);
        return response.data;
    } catch (error) {
        console.error("Error updating route:", error);
        throw error;
    }
};

export const deleteTuyenBay = async (id) => {
    try {
        const response = await apiClient.delete(`/admin/dashboard/tuyenbay/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting route:", error);
        throw error;
    }
};