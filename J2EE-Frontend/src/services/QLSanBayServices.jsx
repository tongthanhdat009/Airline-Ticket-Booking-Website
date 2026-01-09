import apiClient from "./apiClient";

export const getAllSanBay = async () =>{
    try{
        const response = await apiClient.get("/admin/dashboard/sanbay");
        return response.data;
    }
    catch (error){
        console.error("Lỗi khi lấy danh sách sân bay", error);
        throw error;
    }
}

export const thongTinSanBay = async (maICAO) => { 
    try{
        // 2. Sử dụng maSanBay để tạo URL động
        const response = await apiClient.get(`/admin/dashboard/sanbay/${maICAO}`); 
        return response.data; 
    } catch (error) {
        // 4. Thêm xử lý lỗi
        console.error(`Lỗi khi lấy thông tin sân bay ${maICAO}`, error);
        throw error;
    }
}

export const addSanBay = async (sanBayData) => {
    try{
        const response = await apiClient.post('/admin/dashboard/sanbay', sanBayData);
        return response.data;
    }
    catch(error){
        console.error(`Lỗi khi thêm sân bay`, error);
        throw error;
    }
};

export const updateTrangThaiSanBay = async (maSanBay, trangthai) => {
    try {
        const response = await apiClient.put(`/admin/dashboard/sanbay/trangthai?maSanBay=${maSanBay}&trangThai=${trangthai}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi cập nhật trạng thái sân bay ${maSanBay}`, error);
        throw error;
    }
};

export const deleteSanBay = async (maSanBay) => {
    try{
        const response = await apiClient.delete(`/admin/dashboard/sanbay/${maSanBay}`);
        return response.data;
    }
    catch(error){
        console.error(`Lỗi khi xóa sân bay`, error);
        throw error;
    }
};

export const getSanBayActive = async () => {
    try{
        const response = await apiClient.get("/admin/dashboard/sanbay");
        return response.data;
    }
    catch (error){
        console.error("Lỗi khi lấy danh sách sân bay hoạt động", error);
        throw error;
    }
}