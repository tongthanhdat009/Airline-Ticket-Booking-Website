import apiClient from './apiClient';

/**
 * Service cho client kiểm tra mã khuyến mãi
 */
const KhuyenMaiClientService = {
    /**
     * Kiểm tra mã khuyến mãi
     * @param {string} maKM - Mã khuyến mãi
     * @param {number} tongGiaDonHang - Tổng giá đơn hàng
     * @param {number} soLuongVe - Số lượng vé
     * @returns {Promise} Response với thông tin khuyến mãi
     */
    validateCoupon: async (maKM, tongGiaDonHang, soLuongVe) => {
        const response = await apiClient.post('/client/khuyenmai/validate', {
            maKM,
            tongGiaDonHang,
            soLuongVe
        });
        return response.data;
    }
};

export default KhuyenMaiClientService;
