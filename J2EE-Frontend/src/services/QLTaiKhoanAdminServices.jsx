import apiClient from "./apiClient";

export const getAllTKadmin = async () =>{
    try{
        const response = await apiClient.get("/admin/dashboard/tkadmin");
        console.log(response.data);
        return response.data;
    }
    catch (error){
        console.error("Lỗi khi lấy danh sách tài khoản admin", error);
        throw error;
    }
}

export const thongTinTKadmin = async (maTKadmin) => { // 1. Thêm tham số maTKadmin
    try{
        // 2. Sử dụng maTKadmin để tạo URL động
        const response = await apiClient.get(`/admin/dashboard/tkadmin/${maTKadmin}`); 
        return response.data; // 3. Trả về dữ liệu từ response
    } catch (error) {
        // 4. Thêm xử lý lỗi
        console.error(`Lỗi khi lấy thông tin tài khoản admin ${maTKadmin}`, error);
        throw error;
    }
}

export const addTKadmin = async (TKadminData) => {
    try{
        const response = await apiClient.post('/admin/dashboard/tkadmin', TKadminData);
        return response.data;
    }
    catch(error){
        console.error(`Lỗi khi thêm tài khoản admin`, error);
        throw error;
    }
};

export const deleteTKadmin = async (maTKadmin) => {
    try{
        const response = await apiClient.delete(`/admin/dashboard/tkadmin/${maTKadmin}`);
        return response.data;
    }
    catch(error){
        console.error(`Lỗi khi xóa tài khoản admin`, error);
        throw error;
    }
};

export const updateTKadmin = async (maTKadmin, updatedData) => {
    try {
        const response = await apiClient.put(`/admin/dashboard/tkadmin/update/${maTKadmin}`, updatedData);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi cập nhật tài khoản admin ${maTKadmin}`, error);
        throw error;
    }
}