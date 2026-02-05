import apiClient from "./apiClient";

/**
 * DonHang API Service
 * Base URL: /admin/dashboard/donhang
 *
 * Cung cấp các method để gọi API quản lý đơn hàng
 */

const DON_HANG_API_BASE = "/admin/dashboard/donhang";

/**
 * Lấy danh sách đơn hàng với bộ lọc và sắp xếp
 * @param {Object} filters - Bộ lọc
 * @param {string} filters.trangThai - Trạng thái đơn hàng
 * @param {string} filters.email - Email khách hàng
 * @param {string} filters.soDienThoai - Số điện thoại
 * @param {string} filters.pnr - Mã PNR
 * @param {string} filters.tuNgay - Từ ngày (ISO-8601 format)
 * @param {string} filters.denNgay - Đến ngày (ISO-8601 format)
 * @param {string} filters.tuGia - Từ giá
 * @param {string} filters.denGia - Đến giá
 * @param {string} filters.sort - Sắp xếp (field:asc hoặc field:desc)
 * @returns {Promise} Danh sách đơn hàng
 */
export const getDonHangList = async (filters = {}) => {
  const params = new URLSearchParams();

  // Thêm các bộ lọc vào params
  if (filters.trangThai) params.append("trangThai", filters.trangThai);
  if (filters.email) params.append("email", filters.email);
  if (filters.soDienThoai) params.append("soDienThoai", filters.soDienThoai);
  if (filters.pnr) params.append("pnr", filters.pnr);
  if (filters.tuNgay) params.append("tuNgay", filters.tuNgay);
  if (filters.denNgay) params.append("denNgay", filters.denNgay);
  if (filters.tuGia) params.append("tuGia", filters.tuGia);
  if (filters.denGia) params.append("denGia", filters.denGia);
  if (filters.sort) params.append("sort", filters.sort);

  const queryString = params.toString();
  const url = queryString ? `${DON_HANG_API_BASE}?${queryString}` : DON_HANG_API_BASE;

  const response = await apiClient.get(url);
  return response.data;
};

/**
 * Lấy chi tiết đơn hàng theo ID
 * @param {number} id - Mã đơn hàng
 * @returns {Promise} Chi tiết đơn hàng
 */
export const getDonHangById = async (id) => {
  const response = await apiClient.get(`${DON_HANG_API_BASE}/${id}`);
  return response.data;
};

/**
 * Tìm đơn hàng theo mã PNR
 * @param {string} pnr - Mã PNR
 * @returns {Promise} Chi tiết đơn hàng
 */
export const getDonHangByPnr = async (pnr) => {
  const response = await apiClient.get(`${DON_HANG_API_BASE}/pnr/${pnr}`);
  return response.data;
};

/**
 * Cập nhật trạng thái đơn hàng
 * @param {number} id - Mã đơn hàng
 * @param {string} trangThaiMoi - Trạng thái mới
 * @returns {Promise} Đơn hàng đã cập nhật
 */
export const updateTrangThaiDonHang = async (id, trangThai) => {
  const response = await apiClient.put(`${DON_HANG_API_BASE}/${id}/trangthai`, {
    trangThai,
  });
  return response.data;
};

/**
 * Hủy đơn hàng
 * @param {number} id - Mã đơn hàng
 * @param {string} lyDoHuy - Lý do hủy
 * @returns {Promise} Đơn hàng đã hủy
 */
export const huyDonHang = async (id, lyDoHuy) => {
  const response = await apiClient.put(`${DON_HANG_API_BASE}/${id}/huy`, {
    lyDoHuy,
  });
  return response.data;
};

/**
 * Lấy danh sách đơn hàng đã xóa (soft delete)
 * @param {Object} filters - Bộ lọc (giống getDonHangList)
 * @returns {Promise} Danh sách đơn hàng đã xóa
 */
export const getDeletedDonHangList = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.trangThai) params.append("trangThai", filters.trangThai);
  if (filters.email) params.append("email", filters.email);
  if (filters.soDienThoai) params.append("soDienThoai", filters.soDienThoai);
  if (filters.pnr) params.append("pnr", filters.pnr);
  if (filters.tuNgay) params.append("tuNgay", filters.tuNgay);
  if (filters.denNgay) params.append("denNgay", filters.denNgay);
  if (filters.tuGia) params.append("tuGia", filters.tuGia);
  if (filters.denGia) params.append("denGia", filters.denGia);
  if (filters.sort) params.append("sort", filters.sort);

  const queryString = params.toString();
  const url = queryString
    ? `${DON_HANG_API_BASE}/deleted?${queryString}`
    : `${DON_HANG_API_BASE}/deleted`;

  const response = await apiClient.get(url);
  return response.data;
};

/**
 * Khôi phục đơn hàng đã xóa
 * @param {number} id - Mã đơn hàng
 * @returns {Promise} Kết quả khôi phục
 */
export const restoreDonHang = async (id) => {
  const response = await apiClient.put(`${DON_HANG_API_BASE}/${id}/restore`);
  return response.data;
};

/**
 * Xóa mềm đơn hàng
 * @param {number} id - Mã đơn hàng
 * @returns {Promise} Kết quả xóa
 */
export const softDeleteDonHang = async (id) => {
  const response = await apiClient.delete(`${DON_HANG_API_BASE}/${id}`);
  return response.data;
};

/**
 * Duyệt thanh toán hàng loạt
 * @param {Array} maDonHangs - Mảng các mã đơn hàng cần duyệt
 * @returns {Promise} Kết quả duyệt
 */
export const batchApprovePayment = async (maDonHangs) => {
  const response = await apiClient.post(`${DON_HANG_API_BASE}/batch/approve`, {
    maDonHangs
  });
  return response.data;
};

/**
 * Hoàn tiền hàng loạt
 * @param {Array} maDonHangs - Mảng các mã đơn hàng cần hoàn tiền
 * @param {string} lyDoHoanTien - Lý do hoàn tiền
 * @returns {Promise} Kết quả hoàn tiền
 */
export const batchRefund = async (maDonHangs, lyDoHoanTien) => {
  const response = await apiClient.post(`${DON_HANG_API_BASE}/batch/refund`, {
    maDonHangs,
    lyDoHoanTien
  });
  return response.data;
};

export default {
  getDonHangList,
  getDonHangById,
  getDonHangByPnr,
  updateTrangThaiDonHang,
  huyDonHang,
  getDeletedDonHangList,
  restoreDonHang,
  softDeleteDonHang,
  batchApprovePayment,
  batchRefund,
};
