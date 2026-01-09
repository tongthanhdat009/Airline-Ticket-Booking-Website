import apiClient from './apiClient';

const ThongKeService = {
    // Lấy thống kê tổng quan (KPI cards)
    getThongKeTongQuan: async (startDate, endDate) => {
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            const response = await apiClient.get('/admin/dashboard/thongke/tongquan', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching overview statistics:', error);
            throw error;
        }
    },

    // Lấy xu hướng doanh thu theo ngày (Line chart)
    getDoanhThuTheoNgay: async (startDate, endDate) => {
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            const response = await apiClient.get('/admin/dashboard/thongke/doanhthu-ngay', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching daily revenue:', error);
            throw error;
        }
    },

    // Lấy cơ cấu doanh thu dịch vụ (Bar chart)
    getDoanhThuTheoDichVu: async (startDate, endDate) => {
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            const response = await apiClient.get('/admin/dashboard/thongke/doanhthu-dichvu', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching service revenue:', error);
            throw error;
        }
    },

    // Lấy cơ cấu doanh thu theo hạng vé (Pie chart)
    getDoanhThuTheoHangVe: async (startDate, endDate) => {
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            const response = await apiClient.get('/admin/dashboard/thongke/doanhthu-hangve', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching ticket class revenue:', error);
            throw error;
        }
    },

    // Xuất báo cáo PDF từ backend
    exportPdf: async (startDate, endDate) => {
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            
            const response = await apiClient.get('/admin/dashboard/thongke/export-pdf', {
                params,
                responseType: 'blob' // Quan trọng: để nhận file binary
            });
            
            return response.data;
        } catch (error) {
            console.error('Error exporting PDF:', error);
            throw error;
        }
    }
};

export default ThongKeService;