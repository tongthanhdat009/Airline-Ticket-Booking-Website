import apiClient from "./apiClient";

/**
 * HoanTien API Service
 * Base URL: /admin/dashboard/hoantien
 *
 * Cung cấp các method để gọi API quản lý hoàn tiền
 */

const HOAN_TIEN_API_BASE = "/admin/dashboard/hoantien";

/**
 * Lấy danh sách yêu cầu hoàn tiền với bộ lọc và tìm kiếm
 * @param {Object} filters - Bộ lọc
 * @param {string} filters.search - Tìm kiếm theo tên, email, lý do
 * @param {string} filters.trangThai - Trạng thái (CHO_XU_LY, DA_HOAN_TIEN, TU_CHOI)
 * @param {string} filters.tuNgay - Từ ngày (ISO-8601 format)
 * @param {string} filters.denNgay - Đến ngày (ISO-8601 format)
 * @returns {Promise} Danh sách yêu cầu hoàn tiền
 */
export const getHoanTienList = async (filters = {}) => {
  const params = new URLSearchParams();

  // Thêm các bộ lọc vào params
  if (filters.search) params.append("search", filters.search);
  if (filters.trangThai) params.append("trangThai", filters.trangThai);
  if (filters.tuNgay) params.append("tuNgay", filters.tuNgay);
  if (filters.denNgay) params.append("denNgay", filters.denNgay);

  const queryString = params.toString();
  const url = queryString ? `${HOAN_TIEN_API_BASE}?${queryString}` : HOAN_TIEN_API_BASE;

  const response = await apiClient.get(url);
  return response.data;
};

/**
 * Lấy chi tiết yêu cầu hoàn tiền theo ID
 * @param {number} id - Mã hoàn tiền
 * @returns {Promise} Chi tiết yêu cầu hoàn tiền
 */
export const getHoanTienById = async (id) => {
  const response = await apiClient.get(`${HOAN_TIEN_API_BASE}/${id}`);
  return response.data;
};

/**
 * Duyệt yêu cầu hoàn tiền
 * @param {number} id - Mã hoàn tiền
 * @param {string} nguoiXuLy - Ngưởi xử lý
 * @param {string} ghiChu - Ghi chú (tùy chọn)
 * @returns {Promise} Yêu cầu hoàn tiền đã duyệt
 */
export const duyetHoanTien = async (id, nguoiXuLy, ghiChu = "") => {
  const response = await apiClient.put(`${HOAN_TIEN_API_BASE}/${id}/duyet`, {
    maHoanTien: id,
    nguoiXuLy,
    ghiChu,
  });
  return response.data;
};

/**
 * Từ chối yêu cầu hoàn tiền
 * @param {number} id - Mã hoàn tiền
 * @param {string} nguoiXuLy - Ngưởi xử lý
 * @param {string} lyDoTuChoi - Lý do từ chối
 * @param {string} ghiChu - Ghi chú (tùy chọn)
 * @returns {Promise} Yêu cầu hoàn tiền đã từ chối
 */
export const tuChoiHoanTien = async (id, nguoiXuLy, lyDoTuChoi, ghiChu = "") => {
  const response = await apiClient.put(`${HOAN_TIEN_API_BASE}/${id}/tuchoi`, {
    maHoanTien: id,
    nguoiXuLy,
    lyDoTuChoi,
    ghiChu,
  });
  return response.data;
};

/**
 * Lấy thống kê hoàn tiền
 * @returns {Promise} Thống kê hoàn tiền
 */
export const getThongKeHoanTien = async () => {
  const response = await apiClient.get(`${HOAN_TIEN_API_BASE}/thongke`);
  return response.data;
};

export default {
  getHoanTienList,
  getHoanTienById,
  duyetHoanTien,
  tuChoiHoanTien,
  getThongKeHoanTien,
};
