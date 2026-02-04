import apiClient from './apiClient';

/**
 * ReportService - Service quản lý Thống Kê
 * Base URL: /internal/reports
 */

const BASE_URL = '/internal/reports';

const ReportService = {
    /**
     * Lấy thống kê tổng quan (KPI cards)
     * @param {string} startDate - Ngày bắt đầu
     * @param {string} endDate - Ngày kết thúc
     * @returns {Promise} - Promise chứa thống kê tổng quan
     */
    getOverviewStats: async (startDate, endDate) => {
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            const response = await apiClient.get(`${BASE_URL}/overview`, { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching overview statistics:', error);
            throw error;
        }
    },

    /**
     * Lấy xu hướng doanh thu theo ngày (Line chart)
     * @param {string} startDate - Ngày bắt đầu
     * @param {string} endDate - Ngày kết thúc
     * @returns {Promise} - Promise chứa dữ liệu doanh thu theo ngày
     */
    getDailyRevenue: async (startDate, endDate) => {
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            const response = await apiClient.get(`${BASE_URL}/revenue/daily`, { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching daily revenue:', error);
            throw error;
        }
    },

    /**
     * Lấy cơ cấu doanh thu dịch vụ (Bar chart)
     * @param {string} startDate - Ngày bắt đầu
     * @param {string} endDate - Ngày kết thúc
     * @returns {Promise} - Promise chứa dữ liệu doanh thu theo dịch vụ
     */
    getServiceRevenue: async (startDate, endDate) => {
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            const response = await apiClient.get(`${BASE_URL}/revenue/services`, { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching service revenue:', error);
            throw error;
        }
    },

    /**
     * Lấy cơ cấu doanh thu theo hạng vé (Pie chart)
     * @param {string} startDate - Ngày bắt đầu
     * @param {string} endDate - Ngày kết thúc
     * @returns {Promise} - Promise chứa dữ liệu doanh thu theo hạng vé
     */
    getTicketClassRevenue: async (startDate, endDate) => {
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            const response = await apiClient.get(`${BASE_URL}/revenue/ticket-classes`, { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching ticket class revenue:', error);
            throw error;
        }
    },

    /**
     * Lấy thống kê trong ngày hôm nay
     * @returns {Promise} - Promise chứa thống kê trong ngày
     */
    getTodayStats: async () => {
        try {
            const response = await apiClient.get(`${BASE_URL}/today`);
            return response.data;
        } catch (error) {
            console.error('Error fetching daily statistics:', error);
            throw error;
        }
    },

    /**
     * Lấy thống kê so sánh giữa các kỳ
     * @param {string} tuNgay - Từ ngày
     * @param {string} denNgay - Đến ngày
     * @param {string} kyTruoc - Kỳ trước ('WEEK' | 'MONTH' | 'YEAR')
     * @returns {Promise} - Promise chứa thống kê so sánh
     */
    getComparisonStats: async (tuNgay, denNgay, kyTruoc = 'WEEK') => {
        try {
            const params = {
                tuNgay,
                denNgay,
                kyTruoc
            };
            const response = await apiClient.get(`${BASE_URL}/compare`, { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching comparison statistics:', error);
            throw error;
        }
    },

    /**
     * Xuất báo cáo PDF từ backend
     * @param {string} startDate - Ngày bắt đầu
     * @param {string} endDate - Ngày kết thúc
     * @returns {Promise<Blob>} - Promise chứa file PDF
     */
    exportPdf: async (startDate, endDate) => {
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            
            const response = await apiClient.get(`${BASE_URL}/export/pdf`, {
                params,
                responseType: 'blob'
            });
            
            return response.data;
        } catch (error) {
            console.error('Error exporting PDF:', error);
            throw error;
        }
    }
};

// ==================== BACKWARD COMPATIBILITY ALIASES ====================
// Các hàm alias để tương thích ngược với code cũ (ThongKeService)
export const getThongKeTongQuan = ReportService.getOverviewStats;
export const getDoanhThuTheoNgay = ReportService.getDailyRevenue;
export const getDoanhThuTheoDichVu = ReportService.getServiceRevenue;
export const getDoanhThuTheoHangVe = ReportService.getTicketClassRevenue;
export const getThongKeNgay = ReportService.getTodayStats;
export const getThongKeSoSanh = ReportService.getComparisonStats;
export const exportPdf = ReportService.exportPdf;

// Default export với tất cả aliases để tương thích ngược
export default {
    ...ReportService,
    // Backward compatibility aliases
    getThongKeTongQuan: ReportService.getOverviewStats,
    getDoanhThuTheoNgay: ReportService.getDailyRevenue,
    getDoanhThuTheoDichVu: ReportService.getServiceRevenue,
    getDoanhThuTheoHangVe: ReportService.getTicketClassRevenue,
    getThongKeNgay: ReportService.getTodayStats,
    getThongKeSoSanh: ReportService.getComparisonStats,
    exportPdf: ReportService.exportPdf,
};
