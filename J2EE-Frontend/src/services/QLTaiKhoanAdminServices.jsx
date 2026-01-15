import apiClient from "./apiClient";

// Lấy danh sách vai trò
export const getAllVaiTro = async () => {
    try {
        const response = await apiClient.get("/admin/dashboard/vai-tro");
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách vai trò", error);
        throw error;
    }
};

// Lấy danh sách tài khoản admin
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
        console.log('=== CALLING UPDATE API ===');
        console.log('URL:', `/admin/dashboard/tkadmin/update/${maTKadmin}`);
        console.log('Data sent:', JSON.stringify(updatedData, null, 2));
        const response = await apiClient.put(`/admin/dashboard/tkadmin/update/${maTKadmin}`, updatedData);
        console.log('Response:', response.data);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi cập nhật tài khoản admin ${maTKadmin}`, error);
        console.error('Error response:', error.response?.data);
        throw error;
    }
}

// Gán vai trò cho tài khoản admin
export const assignRolesToAccount = async (maTKadmin, vaiTroIds) => {
    try {
        const response = await apiClient.put(`/admin/dashboard/tkadmin/${maTKadmin}/assign-roles`, {
            vaiTroIds: vaiTroIds
        });
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi gán vai trò cho tài khoản admin ${maTKadmin}`, error);
        throw error;
    }
}

// Thêm một vai trò cho tài khoản admin
export const addRoleToAccount = async (maTKadmin, maVaiTro) => {
    try {
        const response = await apiClient.post(`/admin/dashboard/tkadmin/${maTKadmin}/roles/${maVaiTro}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi thêm vai trò cho tài khoản admin ${maTKadmin}`, error);
        throw error;
    }
}

// Xóa một vai trò khỏi tài khoản admin
export const removeRoleFromAccount = async (maTKadmin, maVaiTro) => {
    try {
        const response = await apiClient.delete(`/admin/dashboard/tkadmin/${maTKadmin}/roles/${maVaiTro}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi xóa vai trò khỏi tài khoản admin ${maTKadmin}`, error);
        throw error;
    }
}