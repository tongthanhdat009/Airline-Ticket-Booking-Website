import apiClient from './apiClient';

const ThongKeService = {
    // ========================================
    // CAC API CO SAN
    // ========================================

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

    // Lấy thống kê trong ngày hôm nay
    getThongKeNgay: async () => {
        try {
            const response = await apiClient.get('/admin/dashboard/thongke/trong-ngay');
            return response.data;
        } catch (error) {
            console.error('Error fetching daily statistics:', error);
            throw error;
        }
    },

    // Lấy thống kê so sánh giữa các kỳ
    // kyTruoc: 'WEEK' | 'MONTH' | 'YEAR'
    getThongKeSoSanh: async (tuNgay, denNgay, kyTruoc = 'WEEK') => {
        try {
            const params = {
                tuNgay,
                denNgay,
                kyTruoc
            };
            const response = await apiClient.get('/admin/dashboard/thongke/so-sanh', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching comparison statistics:', error);
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
    },

    // ========================================
    // CAC API MOI - BO SUNG
    // ========================================

    /**
     * Top chặng bay phổ biến nhất
     * Horizontal Bar Chart
     */
    getTopChangBay: async (startDate, endDate, limit = 10) => {
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            params.limit = limit;
            const response = await apiClient.get('/admin/dashboard/thongke/top-chang-bay', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching top routes:', error);
            throw error;
        }
    },

    /**
     * Thống kê tỷ lệ trạng thái đơn hàng
     * Pie Chart
     */
    getThongKeTrangThaiDonHang: async (startDate, endDate) => {
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            const response = await apiClient.get('/admin/dashboard/thongke/trang-thai-don-hang', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching order status statistics:', error);
            throw error;
        }
    },

    /**
     * Thống kê khung giờ đặt vé cao điểm
     * Heatmap Chart
     */
    getThongKeKhungGio: async (startDate, endDate) => {
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            const response = await apiClient.get('/admin/dashboard/thongke/khung-gio', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching hourly statistics:', error);
            throw error;
        }
    },

    /**
     * Thống kê tỷ lệ chuyển đổi đặt vé
     * Funnel Chart
     */
    getThongKeTyLeChuyenDoi: async (startDate, endDate) => {
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            const response = await apiClient.get('/admin/dashboard/thongke/ty-le-chuyen-doi', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching conversion rate statistics:', error);
            throw error;
        }
    },

    /**
     * So sánh cùng kỳ
     * Grouped Bar Chart
     * loaiKy: 'MONTH' | 'YEAR' | 'WEEK'
     */
    getSoSanhCungKy: async (startDate, endDate, loaiKy = 'MONTH') => {
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            params.loaiKy = loaiKy;
            const response = await apiClient.get('/admin/dashboard/thongke/so-sanh-cung-ky', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching period comparison statistics:', error);
            throw error;
        }
    }
};

export default ThongKeService;