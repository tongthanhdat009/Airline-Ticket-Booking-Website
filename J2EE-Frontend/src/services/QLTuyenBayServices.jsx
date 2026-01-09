import apiClient  from "./apiClient";

export const getAllTuyenBay = async () =>{
    try{
        const response = await apiClient.get("/admin/dashboard/tuyenbay");
        console.log(response.data);
        return response.data;
    }
    catch (error){
        console.error("Lỗi khi lấy danh sách tuyến bay", error);
        throw error;
    }
}

export const addTuyenBay = async (tuyenBayData) => {
    try{
        const response = await apiClient.post('/admin/dashboard/tuyenbay', tuyenBayData);
        return response.data;
    }
    catch(error){
        console.error(`Lỗi khi thêm tuyến bay`, error.message);
        // Lấy message từ response của backend
        const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi thêm tuyến bay';
        throw new Error(errorMessage);
    }
};

export const updateTuyenBay = async (maTuyenBay, tuyenBayData) => {
    try{
        tuyenBayData.maTuyenBay = maTuyenBay;
        const response = await apiClient.put(`/admin/dashboard/tuyenbay`, tuyenBayData);
        return response.data;
    }
    catch(error){
        console.error(`Lỗi khi cập nhật tuyến bay`, error);
        const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật tuyến bay';
        throw new Error(errorMessage);
    }
};

export const deleteTuyenBay = async (maTuyenBay) => {
    try{
        const response = await apiClient.delete(`/admin/dashboard/tuyenbay/${maTuyenBay}`);
        return response.data;
    }
    catch(error){
        console.error(`Lỗi khi xóa tuyến bay`, error);
        const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xóa tuyến bay';
        throw new Error(errorMessage);
    }
};
