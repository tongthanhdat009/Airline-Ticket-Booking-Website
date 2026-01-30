import apiClient from "./apiClient";

/**
 * HoaDon API Service
 * Base URL: /admin/dashboard/hoadon
 *
 * Cung cấp các method để gọi API quản lý hóa đơn
 */

const HOA_DON_API_BASE = "/admin/dashboard/hoadon";

/**
 * Lấy danh sách hóa đơn với bộ lọc
 * @param {Object} filters - Bộ lọc
 * @param {string} filters.search - Tìm kiếm
 * @param {string} filters.trangThai - Trạng thái
 * @param {string} filters.tuNgay - Từ ngày
 * @param {string} filters.denNgay - Đến ngày
 * @param {string} filters.sort - Sắp xếp
 * @returns {Promise} Danh sách hóa đơn
 */
export const getHoaDonList = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.search) params.append("search", filters.search);
  if (filters.trangThai) params.append("trangThai", filters.trangThai);
  if (filters.tuNgay) params.append("tuNgay", filters.tuNgay);
  if (filters.denNgay) params.append("denNgay", filters.denNgay);
  if (filters.sort) params.append("sort", filters.sort);

  const queryString = params.toString();
  const url = queryString ? `${HOA_DON_API_BASE}?${queryString}` : HOA_DON_API_BASE;

  const response = await apiClient.get(url);
  return response.data;
};

/**
 * Lấy chi tiết hóa đơn theo ID
 * @param {number} id - Mã hóa đơn
 * @returns {Promise} Chi tiết hóa đơn
 */
export const getHoaDonById = async (id) => {
  const response = await apiClient.get(`${HOA_DON_API_BASE}/${id}`);
  return response.data;
};

/**
 * Tìm hóa đơn theo số hóa đơn
 * @param {string} soHoaDon - Số hóa đơn
 * @returns {Promise} Chi tiết hóa đơn
 */
export const getHoaDonBySoHoaDon = async (soHoaDon) => {
  const response = await apiClient.get(`${HOA_DON_API_BASE}/sohoadon/${soHoaDon}`);
  return response.data;
};

/**
 * Tạo hóa đơn mới
 * @param {Object} data - Dữ liệu hóa đơn
 * @returns {Promise} Hóa đơn đã tạo
 */
export const createHoaDon = async (data) => {
  const response = await apiClient.post(HOA_DON_API_BASE, data);
  return response.data;
};

/**
 * Cập nhật hóa đơn
 * @param {number} id - Mã hóa đơn
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Promise} Hóa đơn đã cập nhật
 */
export const updateHoaDon = async (id, data) => {
  const response = await apiClient.put(`${HOA_DON_API_BASE}/${id}`, data);
  return response.data;
};

/**
 * Hủy hóa đơn
 * @param {number} id - Mã hóa đơn
 * @param {Object} data - { lyDoHuy, nguoiThucHien }
 * @returns {Promise} Hóa đơn đã hủy
 */
export const huyHoaDon = async (id, data) => {
  const response = await apiClient.put(`${HOA_DON_API_BASE}/${id}/huy`, data);
  return response.data;
};

/**
 * Xóa mềm hóa đơn
 * @param {number} id - Mã hóa đơn
 * @returns {Promise} Kết quả xóa
 */
export const softDeleteHoaDon = async (id) => {
  const response = await apiClient.delete(`${HOA_DON_API_BASE}/${id}`);
  return response.data;
};

/**
 * Khôi phục hóa đơn đã xóa
 * @param {number} id - Mã hóa đơn
 * @returns {Promise} Kết quả khôi phục
 */
export const restoreHoaDon = async (id) => {
  const response = await apiClient.put(`${HOA_DON_API_BASE}/${id}/restore`);
  return response.data;
};

/**
 * Tạo số hóa đơn tự động
 * @returns {Promise} Số hóa đơn mới
 */
export const generateSoHoaDon = async () => {
  const response = await apiClient.get(`${HOA_DON_API_BASE}/generate-sohoadon`);
  return response.data;
};

/**
 * Lấy thống kê hóa đơn
 * @returns {Promise} Thống kê
 */
export const getThongKeHoaDon = async () => {
  const response = await apiClient.get(`${HOA_DON_API_BASE}/thongke`);
  return response.data;
};

/**
 * Export hóa đơn ra PDF
 * @param {number} id - Mã hóa đơn
 * @returns {Promise<Blob>} PDF file blob
 */
export const exportHoaDonPdf = async (id) => {
  const response = await apiClient.get(`${HOA_DON_API_BASE}/${id}/pdf`, {
    responseType: 'blob'
  });
  return response.data;
};

/**
 * Export danh sách hóa đơn ra Excel
 * @param {Object} filters - Bộ lọc
 * @returns {Promise<Blob>} Excel file blob
 */
export const exportHoaDonExcel = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.search) params.append("search", filters.search);
  if (filters.trangThai) params.append("trangThai", filters.trangThai);
  if (filters.tuNgay) params.append("tuNgay", filters.tuNgay);
  if (filters.denNgay) params.append("denNgay", filters.denNgay);

  const queryString = params.toString();
  const url = queryString 
    ? `${HOA_DON_API_BASE}/excel?${queryString}` 
    : `${HOA_DON_API_BASE}/excel`;

  const response = await apiClient.get(url, {
    responseType: 'blob'
  });
  return response.data;
};

export default {
  getHoaDonList,
  getHoaDonById,
  getHoaDonBySoHoaDon,
  createHoaDon,
  updateHoaDon,
  huyHoaDon,
  softDeleteHoaDon,
  restoreHoaDon,
  generateSoHoaDon,
  getThongKeHoaDon,
  exportHoaDonPdf,
  exportHoaDonExcel,
};
