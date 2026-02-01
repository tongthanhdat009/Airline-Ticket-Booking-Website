import apiClient from './apiClient';

const BASE_URL = '/api/admin/audit-logs';

/**
 * Service cho Audit Log (Lịch sử thao tác)
 */
const AuditLogService = {
    /**
     * Lấy danh sách tất cả audit log
     * @param {Object} params - Tham số tìm kiếm và phân trang
     * @returns {Promise} - Promise chứa response từ server
     */
    getAllAuditLogs: async (params = {}) => {
        const defaultParams = {
            page: 0,
            size: 20,
            ...params
        };
        const response = await apiClient.get(BASE_URL, { params: defaultParams });
        return response.data;
    },

    /**
     * Lấy chi tiết audit log theo ID
     * @param {number} id - ID của audit log
     * @returns {Promise} - Promise chứa response từ server
     */
    getAuditLogById: async (id) => {
        const response = await apiClient.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    /**
     * Lấy danh sách các loại thao tác
     * @returns {Promise} - Promise chứa danh sách loại thao tác
     */
    getLoaiThaoTacList: async () => {
        const response = await apiClient.get(`${BASE_URL}/loai-thao-tac`);
        return response.data;
    },

    /**
     * Lấy danh sách các bảng ảnh hưởng
     * @returns {Promise} - Promise chứa danh sách bảng ảnh hưởng
     */
    getBangAnhHuongList: async () => {
        const response = await apiClient.get(`${BASE_URL}/bang-anh-huong`);
        return response.data;
    },

    /**
     * Lấy thống kê audit log
     * @returns {Promise} - Promise chứa thống kê
     */
    getStatistics: async () => {
        const response = await apiClient.get(`${BASE_URL}/statistics`);
        return response.data;
    },

    /**
     * Tạo mới audit log
     * @param {Object} auditLog - Dữ liệu audit log
     * @returns {Promise} - Promise chứa response từ server
     */
    createAuditLog: async (auditLog) => {
        const response = await apiClient.post(BASE_URL, auditLog);
        return response.data;
    },

    /**
     * Xóa audit log
     * @param {number} id - ID của audit log
     * @returns {Promise} - Promise chứa response từ server
     */
    deleteAuditLog: async (id) => {
        const response = await apiClient.delete(`${BASE_URL}/${id}`);
        return response.data;
    },

    /**
     * Tìm kiếm audit log với filter
     * @param {Object} filters - Các điều kiện lọc
     * @returns {Promise} - Promise chứa kết quả tìm kiếm
     */
    searchAuditLogs: async (filters = {}) => {
        const response = await apiClient.get(BASE_URL, { params: filters });
        return response.data;
    },

    /**
     * Export audit log ra PDF
     * @param {Object} filters - Các điều kiện lọc
     * @returns {Promise} - Promise chứa file PDF
     */
    exportPdf: async (filters = {}) => {
        const response = await apiClient.get(`${BASE_URL}/export-pdf`, { 
            params: filters,
            responseType: 'blob'
        });
        return response;
    },

    /**
     * Export audit log ra Excel
     * @param {Object} filters - Các điều kiện lọc
     * @returns {Promise} - Promise chứa file Excel
     */
    exportExcel: async (filters = {}) => {
        const response = await apiClient.get(`${BASE_URL}/export-excel`, { 
            params: filters,
            responseType: 'blob'
        });
        return response;
    }
};

export default AuditLogService;
