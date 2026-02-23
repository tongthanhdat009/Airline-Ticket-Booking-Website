import apiClient from './apiClient';

const DOI_SOAT_API_BASE = '/admin/dashboard/doisuatgiaoDich';

/**
 * Service API cho Đối soát giao dịch
 * Transaction Reconciliation API Service
 */
const doiSoatGiaoDichApi = {
  /**
   * Lấy danh sách đối soát với bộ lọc
   * @param {Object} filters - Bộ lọc (search, trangThai, tuNgay, denNgay, sort)
   * @returns {Promise} Danh sách đối soát
   */
  getDanhSachDoiSoat: async (filters = {}) => {
    const response = await apiClient.get(DOI_SOAT_API_BASE, { params: filters });
    return response.data;
  },

  /**
   * Lấy chi tiết đối soát theo ID
   * @param {number} id - Mã hóa đơn
   * @returns {Promise} Chi tiết đối soát
   */
  getChiTietDoiSoat: async (id) => {
    const response = await apiClient.get(`${DOI_SOAT_API_BASE}/${id}`);
    return response.data;
  },

  /**
   * Lấy thống kê đối soát
   * @returns {Promise} Thống kê đối soát
   */
  getThongKeDoiSoat: async () => {
    const response = await apiClient.get(`${DOI_SOAT_API_BASE}/thongke`);
    return response.data;
  },

  /**
   * Cập nhật ghi chú xử lý đối soát
   * @param {number} id - Mã hóa đơn
   * @param {Object} data - Dữ liệu ghi chú { ghiChu, nguoiXuLy, trangThai }
   * @returns {Promise} Kết quả cập nhật
   */
  updateReconciliationNote: async (id, data) => {
    const response = await apiClient.post(`${DOI_SOAT_API_BASE}/${id}/ghichu`, data);
    return response.data;
  },

  /**
   * Chạy đối soát thủ công
   * @param {Object} data - Dữ liệu request { tuNgay, denNgay, includeMatched }
   * @returns {Promise} Kết quả đối soát
   */
  runManualReconciliation: async (data) => {
    const response = await apiClient.post(`${DOI_SOAT_API_BASE}/chay-doi-soat`, data);
    return response.data;
  },

  /**
   * Lấy VNPay logs theo mã giao dịch
   * @param {string} txnRef - Mã giao dịch VNPay
   * @returns {Promise} Danh sách VNPay logs
   */
  getVNPayLogs: async (txnRef) => {
    const response = await apiClient.get(`${DOI_SOAT_API_BASE}/vnpay-log/${txnRef}`);
    return response.data;
  },

  /**
   * Lấy danh sách đối soát đang chờ xử lý
   * @returns {Promise} Danh sách đối soát PENDING
   */
  getPendingReconciliations: async () => {
    const response = await apiClient.get(`${DOI_SOAT_API_BASE}/pending`);
    return response.data;
  },

  /**
   * Xuất báo cáo đối soát
   * @param {Object} params - Query parameters { tuNgay, denNgay, format }
   * @returns {Promise} File blob (Excel/PDF)
   */
  exportReconciliationReport: async (params = {}) => {
    const response = await apiClient.get(`${DOI_SOAT_API_BASE}/xuat-bao-cao`, {
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};

export default doiSoatGiaoDichApi;
