import apiClient from './apiClient';

/**
 * AuditLogService - Service quản lý Lịch sử thao tác
 * Base URL: /internal/audit-logs
 */

const BASE_URL = '/internal/audit-logs';

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
    getActionTypes: async () => {
        const response = await apiClient.get(`${BASE_URL}/action-types`);
        return response.data;
    },

    /**
     * Lấy danh sách các bảng ảnh hưởng
     * @returns {Promise} - Promise chứa danh sách bảng ảnh hưởng
     */
    getTables: async () => {
        const response = await apiClient.get(`${BASE_URL}/tables`);
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
        const response = await apiClient.get(`${BASE_URL}/export/pdf`, { 
            params: filters,
            responseType: 'blob'
        });
        return response.data;
    },

    /**
     * Export audit log ra Excel
     * @param {Object} filters - Các điều kiện lọc
     * @returns {Promise} - Promise chứa file Excel
     */
    exportExcel: async (filters = {}) => {
        const response = await apiClient.get(`${BASE_URL}/export/excel`, { 
            params: filters,
            responseType: 'blob'
        });
        return response.data;
    }
};

// ==================== BACKWARD COMPATIBILITY ALIASES ====================
// Named exports cho tương thích ngược với AuditLogService cũ
export const getAllAuditLogs = AuditLogService.getAllAuditLogs;
export const getAuditLogById = AuditLogService.getAuditLogById;
export const getLoaiThaoTacList = AuditLogService.getActionTypes;
export const getBangAnhHuongList = AuditLogService.getTables;
export const getStatistics = AuditLogService.getStatistics;
export const createAuditLog = AuditLogService.createAuditLog;
export const deleteAuditLog = AuditLogService.deleteAuditLog;
export const searchAuditLogs = AuditLogService.searchAuditLogs;
export const exportPdf = AuditLogService.exportPdf;
export const exportExcel = AuditLogService.exportExcel;

// Default export với tất cả aliases để tương thích ngược
export default {
    ...AuditLogService,
    // Backward compatibility aliases
    getLoaiThaoTacList: AuditLogService.getActionTypes,
    getBangAnhHuongList: AuditLogService.getTables,
};
