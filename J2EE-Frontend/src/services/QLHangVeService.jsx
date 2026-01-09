import apiClient from "./apiClient";

export const getAllHangVe = async () => {
    try {
        const response = await apiClient.get('/admin/dashboard/hangve');
        return response.data;
    } catch (error) {
        console.error("Error fetching ticket classes:", error);
        throw error;
    }
};

export const updateHangVe = async (id, hangVeData) => {
    try {
        const response = await apiClient.put(`/admin/dashboard/hangve/${id}`, hangVeData);
        return response.data;
    } catch (error) {
        console.error("Error updating ticket class:", error);
        throw error;
    }
};