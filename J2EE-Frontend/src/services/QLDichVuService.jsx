import apiClient from "./apiClient";
export const getAllServices = async () => {
    try{
        const response = await apiClient.get('/admin/dashboard/dichvu');
        return response;
    }catch(error){
        console.error("Error fetching services:", error);
        throw error;
    }
}

export const fetchImageByName = async (imageName) => {
    try{
        const response = await apiClient.get(`/admin/dashboard/dichvu/anh/${imageName}`, {
            responseType: 'blob', // Đảm bảo nhận dữ liệu dưới dạng blob
        });
        return response;
    }
    catch(error){
        console.error("Error fetching image:", error);
        throw error;
    }
}

export const getServiceOptions = async (maDichVu) => {
    try{
        const response = await apiClient.get(`/admin/dashboard/dichvu/${maDichVu}/luachon`);
        return response;
    }catch(error){
        console.error("Error fetching service options:", error);
        throw error;
    }
}

export const createServiceOption = async (maDichVu, optionData) => {
    try{
        const response = await apiClient.post(`/admin/dashboard/dichvu/${maDichVu}/luachon`, optionData);
        return response;
    }catch(error){
        console.error("Error creating service option:", error);
        throw error;
    }
}

export const createService = async (serviceData) => {
    try{
        const response = await apiClient.post('/admin/dashboard/dichvu', serviceData);
        return response;
    }
    catch(error){
        console.error("Error creating service:", error);
        throw error;
    }
}

export const uploadImage = async (imageFile) => {
    try{
        const formData = new FormData();
        formData.append('file', imageFile);
        const response = await apiClient.post('/admin/dashboard/dichvu/anh/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    }
    catch(error){
        console.error("Error uploading image:", error);
        throw error;
    }
}

export const updateServiceImage = async (maDichVu, imageFile) => {
    try{
        const formData = new FormData();
        formData.append('anh', imageFile);
        const response = await apiClient.post(`/admin/dashboard/dichvu/${maDichVu}/anh`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    }
    catch(error){
        console.error("Error updating service image:", error);
        throw error;
    }
}

export const updateService = async (maDichVu, serviceData) => {
    try{
        const response = await apiClient.put(`/admin/dashboard/dichvu/${maDichVu}`, serviceData);
        return response;
    }catch(error){
        console.error("Error updating service:", error);
        throw error;
    }
}

export const deleteService = async (maDichVu) => {
    try{
        const response = await apiClient.delete(`/admin/dashboard/dichvu/${maDichVu}`);
        return response;
    }
    catch(error){
        console.error("Error deleting service:", error);
        throw error;
    }
}

export const updateOption = async (maDichVu, maLuaChon, optionData) => {
    try{
        const response = await apiClient.put(`/admin/dashboard/dichvu/${maDichVu}/luachon/${maLuaChon}`, optionData);
        return response;
    }catch(error){
        console.error("Error updating service option:", error);
        throw error;
    }
}

export const deleteOption = async (maDichVu, maLuaChon) => {
    try{
        const response = await apiClient.delete(`/admin/dashboard/dichvu/${maDichVu}/luachon/${maLuaChon}`);
        return response;
    }
    catch(error){
        console.error("Error deleting service option:", error);
        throw error;
    }
}

export const updateOptionImage = async (maDichVu, maLuaChon, imageFile) => {
    try{
        const formData = new FormData();
        formData.append('anh', imageFile);
        const response = await apiClient.post(`/admin/dashboard/dichvu/${maDichVu}/luachon/${maLuaChon}/anh`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    }
    catch(error){
        console.error("Error updating option image:", error);
        throw error;
    }
}

export const fetchOptionImageByName = async (imageName) => {
    try{
        const response = await apiClient.get(`/admin/dashboard/dichvu/luachon/anh/${imageName}`, {
            responseType: 'blob', // Đảm bảo nhận dữ liệu dưới dạng blob
        });
        return response;
    }
    catch(error){
        console.error("Error fetching option image:", error);
        throw error;
    }
}

// Lấy danh sách dịch vụ đã đặt theo mã đặt chỗ
export const getDichVuByMaDatCho = async (maDatCho) => {
    try{
        const response = await apiClient.get(`/admin/dashboard/datcho/${maDatCho}/dichvu`);
        return response;
    }
    catch(error){
        console.error("Error fetching booked services:", error);
        throw error;
    }
}

// Lấy ảnh dịch vụ cung cấp
export const fetchServiceImageByName = async (imageName) => {
    try{
        const response = await apiClient.get(`/admin/dashboard/dichvu/anh/${imageName}`, {
            responseType: 'blob',
        });
        return response;
    }
    catch(error){
        console.error("Error fetching service image:", error);
        throw error;
    }
}