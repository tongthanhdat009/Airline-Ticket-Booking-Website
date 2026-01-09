import apiClient from "./apiClient";

export const getAllSanBay = async () =>{
    try{
        const response = await apiClient.get("/api/sanbay");
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách sân bay", error);
        throw error;
    }
};

export const getSanBayByThanhPhoSanBay = async (thanhPhoSanBay) =>{
    try{
        const response = await apiClient.get(`/api/sanbay/${thanhPhoSanBay}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy sân bay theo thành phố", error);
        throw error;
    }
};

export const searchChuyenBay = async (sanBayDi, sanBayDen, ngayDi) => {
    try {
        const response = await apiClient.get(`/api/sanbay/${sanBayDi}/${sanBayDen}/${ngayDi}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tìm kiếm chuyến bay", error);
        throw error;
    }
};

export const getGiaVe = async (chuyenBayId, hangVeId) => {
    try {
        const response = await apiClient.get(`/api/sanbay/giave/${chuyenBayId}/${hangVeId}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy giá vé", error);
        throw error;
    }
};

export const getChiTietGheByGheId = async (gheId) => {
    try {
        const response = await apiClient.get(`/api/sanbay/chitiet/${gheId}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy chi tiết ghế", error);
        throw error;
    }
};

export const getAllDichVuCungCapByChuyenBay = async (maChuyenBay) => {
    try {
        const response = await apiClient.get(`/api/sanbay/dichvu/${maChuyenBay}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách dịch vụ cung cấp", error);
        throw error;
    }
};

export const getLuaChonByDichVuId = async (dichVuId) => {
    try {
        const response = await apiClient.get(`/api/sanbay/chitietdichvu/${dichVuId}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy lựa chọn dịch vụ theo dịch vụ ID", error);
        throw error;
    }
};

export const kiemTraConGhe = async (maChuyenBay, maHangVe, soLuongNguoi) => {
    try {
        const response = await apiClient.get(`/api/sanbay/${maChuyenBay}/hang-ve/${maHangVe}/${soLuongNguoi}`);
        console.log(response);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi kiểm tra còn ghế", error);
        throw error;
    }
};