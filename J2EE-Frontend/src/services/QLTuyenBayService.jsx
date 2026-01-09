import apiClient from "./apiClient";

export const getAllTuyenBay = () => {
    try {
        const response = apiClient.get('/admin/dashboard/tuyenbay');
        return response;
    } catch (error) {
        console.error("Error fetching routes:", error);
        throw error;
    }
};

export const getTuyenBayById = (id) => {
    try {
        const response = apiClient.get(`/admin/dashboard/tuyenbay/${id}`);
        return response;
    } catch (error) {
        console.error("Error fetching route by ID:", error);
        throw error;
    }
};

export const createTuyenBay = (routeData) => {
    try {
        const response = apiClient.post('/admin/dashboard/tuyenbay', routeData);
        return response;
    } catch (error) {
        console.error("Error creating route:", error);
        throw error;
    }
};

export const updateTuyenBay = (routeData) => {
    try {
        const response = apiClient.put('/admin/dashboard/tuyenbay', routeData);
        return response;
    } catch (error) {
        console.error("Error updating route:", error);
        throw error;
    }
};

export const deleteTuyenBay = (id) => {
    try {
        const response = apiClient.delete(`/admin/dashboard/tuyenbay/${id}`);
        return response;
    } catch (error) {
        console.error("Error deleting route:", error);
        throw error;
    }
};