import apiClient from "./apiClient";

export const getAllHangVe = async () => {
    try {
        const response = await apiClient.get('/api/hangve');
        return response.data;
    } catch (error) {
        console.error("Error fetching ticket classes:", error);
        throw error;
    }
};

export const getHangVeById = async (id) => {
    try {
        const response = await apiClient.get(`/api/hangve/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching ticket class:", error);
        throw error;
    }
};

export const createHangVe = async (hangVeData) => {
    try {
        const response = await apiClient.post('/api/hangve', hangVeData);
        return response.data;
    } catch (error) {
        console.error("Error creating ticket class:", error);
        throw error;
    }
};

export const updateHangVe = async (id, hangVeData) => {
    try {
        const response = await apiClient.put(`/api/hangve/${id}`, hangVeData);
        return response.data;
    } catch (error) {
        console.error("Error updating ticket class:", error);
        throw error;
    }
};

export const deleteHangVe = async (id) => {
    try {
        const response = await apiClient.delete(`/api/hangve/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting ticket class:", error);
        throw error;
    }
};