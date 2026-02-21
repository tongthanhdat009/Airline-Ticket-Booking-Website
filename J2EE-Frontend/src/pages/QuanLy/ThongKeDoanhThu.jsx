import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { FaCalendarAlt, FaDollarSign, FaTicketAlt, FaPlane, FaChartLine, FaSync, FaFilePdf, FaUsers, FaClock, FaRoad, FaCalendarDay } from 'react-icons/fa';
import Card from '../../components/QuanLy/CardChucNang';
import ThongKeService from '../../services/ThongKeService';
import Toast from '../../components/common/Toast';
import StatCard from '../../components/QuanLy/ThongKe/StatCard';
import CustomTooltip from '../../components/QuanLy/ThongKe/CustomTooltip';
import HorizontalBarChart from '../../components/QuanLy/ThongKe/HorizontalBarChart';
import HeatmapChart from '../../components/QuanLy/ThongKe/HeatmapChart';
import FunnelChart from '../../components/QuanLy/ThongKe/FunnelChart';
import GroupedBarChart from '../../components/QuanLy/ThongKe/GroupedBarChart';

const ThongKeDoanhThu = () => {
    // State cho dữ liệu thống kê
    const [overviewData, setOverviewData] = useState(null);
    const [dailyRevenueData, setDailyRevenueData] = useState([]);
    const [serviceRevenueData, setServiceRevenueData] = useState([]);
    const [ticketClassRevenueData, setTicketClassRevenueData] = useState([]);
    const [topRoutesData, setTopRoutesData] = useState([]);
    const [orderStatusData, setOrderStatusData] = useState([]);
    const [hourlyData, setHourlyData] = useState([]);
    const [conversionData, setConversionData] = useState([]);
    const [comparisonData, setComparisonData] = useState([]);
    const [todayStats, setTodayStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

    // State cho bộ lọc thời gian
    const [timeRange, setTimeRange] = useState('30days');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [activeTab, setActiveTab] = useState('today');

    // Format currencies
    const formatCurrency = useCallback((value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    }, []);

    const formatShortCurrency = useCallback((value) => {
        if (value >= 1000000000) {
            return `${(value / 1000000000).toFixed(1)}tỷ`;
        } else if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}tr`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(0)}k`;
        }
        return value.toLocaleString('vi-VN');
    }, []);

    // Colors
    const COLORS = useMemo(() => ({
        class: ['#3B82F6', '#10B981'],
        service: ['#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6'],
        status: ['#10B981', '#F59E0B', '#EF4444', '#6B7280'],
        route: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#06B6D4', '#84CC16', '#F97316']
    }), []);

    // Date range calculator
    const getDateRange = useCallback(() => {
        const today = new Date();
        let start, end;

        switch (timeRange) {
            case '7days':
                start = new Date(today);
                start.setDate(today.getDate() - 6);
                end = new Date(today);
                break;
            case '30days':
                start = new Date(today);
                start.setDate(today.getDate() - 29);
                end = new Date(today);
                break;
            case 'thisMonth':
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                end = new Date(today);
                break;
            case 'lastMonth':
                start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                end = new Date(today.getFullYear(), today.getMonth(), 0);
                break;
            case 'thisYear':
                start = new Date(today.getFullYear(), 0, 1);
                end = new Date(today);
                break;
            case 'custom':
                if (startDate && endDate) {
                    start = new Date(startDate);
                    end = new Date(endDate);
                } else {
                    return null;
                }
                break;
            default:
                start = new Date(today);
                start.setDate(today.getDate() - 29);
                end = new Date(today);
        }

        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        return { startDate: formatDate(start), endDate: formatDate(end) };
    }, [timeRange, startDate, endDate]);

    const showToast = useCallback((message, type = 'success') => {
        setToast({ isVisible: true, message, type });
    }, []);

    const hideToast = useCallback(() => {
        setToast(prev => ({ ...prev, isVisible: false }));
    }, []);

    // Fetch all statistics
    const fetchAllStatistics = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const dateRange = getDateRange();
            if (!dateRange) {
                setError('Vui lòng chọn ngày bắt đầu và ngày kết thúc');
                setLoading(false);
                return;
            }

            const { startDate: start, endDate: end } = dateRange;

            // Fetch all APIs in parallel (bỏ airlineRes)
            const [
                overviewRes,
                dailyRes,
                serviceRes,
                ticketClassRes,
                topRoutesRes,
                orderStatusRes,
                hourlyRes,
                conversionRes,
                comparisonRes,
                todayRes
            ] = await Promise.allSettled([
                ThongKeService.getThongKeTongQuan(start, end),
                ThongKeService.getDoanhThuTheoNgay(start, end),
                ThongKeService.getDoanhThuTheoDichVu(start, end),
                ThongKeService.getDoanhThuTheoHangVe(start, end),
                ThongKeService.getTopChangBay(start, end, 10),
                ThongKeService.getThongKeTrangThaiDonHang(start, end),
                ThongKeService.getThongKeKhungGio(start, end),
                ThongKeService.getThongKeTyLeChuyenDoi(start, end),
                ThongKeService.getSoSanhCungKy(start, end, 'MONTH'),
                ThongKeService.getThongKeNgay()
            ]);

            // Process results
            if (overviewRes.status === 'fulfilled' && overviewRes.value.success) {
                setOverviewData(overviewRes.value.data);
            }

            if (dailyRes.status === 'fulfilled' && dailyRes.value.success) {
                const formatted = dailyRes.value.data.map(item => ({
                    date: new Date(item.ngay).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                    "Doanh thu": parseFloat(item.doanhThu)
                }));
                setDailyRevenueData(formatted);
            }

            if (serviceRes.status === 'fulfilled' && serviceRes.value.success) {
                const formatted = serviceRes.value.data.map(item => ({
                    name: item.tenDichVu,
                    "Doanh thu": parseFloat(item.tongDoanhThu)
                }));
                setServiceRevenueData(formatted);
            }

            if (ticketClassRes.status === 'fulfilled' && ticketClassRes.value.success) {
                const formatted = ticketClassRes.value.data.map(item => ({
                    name: item.nhomHangVe,
                    value: parseFloat(item.doanhThuTheoHangVe)
                }));
                setTicketClassRevenueData(formatted);
            }

            if (topRoutesRes.status === 'fulfilled' && topRoutesRes.value.success) {
                setTopRoutesData(topRoutesRes.value.data);
            }

            if (orderStatusRes.status === 'fulfilled' && orderStatusRes.value.success) {
                const formatted = orderStatusRes.value.data.map(item => ({
                    name: item.moTa || item.trangThai,
                    value: item.soDonHang
                }));
                setOrderStatusData(formatted);
            }

            if (hourlyRes.status === 'fulfilled' && hourlyRes.value.success) {
                setHourlyData(hourlyRes.value.data);
            }

            if (conversionRes.status === 'fulfilled' && conversionRes.value.success) {
                setConversionData(conversionRes.value.data);
            }

            if (comparisonRes.status === 'fulfilled' && comparisonRes.value.success) {
                setComparisonData(comparisonRes.value.data);
            }

            if (todayRes.status === 'fulfilled' && todayRes.value.success) {
                setTodayStats(todayRes.value.data);
            }

            showToast('Tải dữ liệu thống kê thành công!', 'success');

        } catch (err) {
            console.error('Error fetching statistics:', err);
            setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
            showToast('Không thể tải dữ liệu thống kê!', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast, getDateRange]);

    useEffect(() => {
        if (timeRange === 'custom' && (!startDate || !endDate)) {
            setLoading(false);
            return;
        }
        fetchAllStatistics();
    }, [fetchAllStatistics, timeRange, startDate, endDate]);

    // Export PDF
    const exportToPDF = useCallback(async () => {
        try {
            showToast('Đang tạo báo cáo PDF...', 'info');
            const dateRange = getDateRange();
            if (!dateRange) {
                showToast('Vui lòng chọn khoảng thời gian hợp lệ!', 'error');
                return;
            }

            const { startDate: start, endDate: end } = dateRange;
            const pdfBlob = await ThongKeService.exportPdf(start, end);

            const url = window.URL.createObjectURL(new Blob([pdfBlob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `bao-cao-thong-ke-${new Date().toISOString().split('T')[0]}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

            showToast('Xuất PDF thành công!', 'success');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            showToast('Có lỗi khi xuất PDF. Vui lòng thử lại.', 'error');
        }
    }, [showToast, getDateRange]);

    // Tab content renderers với responsive tốt hơn
    const renderFinanceTab = () => (
        <div className="space-y-4 sm:space-y-6">
            {/* KPI Cards - Responsive grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                    title="Tổng doanh thu"
                    value={overviewData ? formatShortCurrency(overviewData.tongDoanhThu) : '0đ'}
                    icon={<FaDollarSign size={20} className="sm:size-6" />}
                    color="green"
                />
                <StatCard
                    title="Doanh thu bán vé"
                    value={overviewData ? formatShortCurrency(overviewData.doanhThuBanVe) : '0đ'}
                    icon={<FaTicketAlt size={20} className="sm:size-6" />}
                    color="blue"
                />
                <StatCard
                    title="Doanh thu dịch vụ"
                    value={overviewData ? formatShortCurrency(overviewData.doanhThuDichVu) : '0đ'}
                    icon={<FaUsers size={20} className="sm:size-6" />}
                    color="indigo"
                />
                <StatCard
                    title="Khách hàng mới"
                    value={overviewData ? overviewData.khachHangMoi : '0'}
                    icon={<FaUsers size={20} className="sm:size-6" />}
                    color="orange"
                />
            </div>

            {/* Line Chart - Xu hướng doanh thu */}
            <div className="bg-white p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-gray-100">
                <div className="mb-3 sm:mb-4">
                    <h4 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                        <div className="w-1 h-5 sm:h-6 bg-blue-600 rounded-full"></div>
                        Xu hướng doanh thu
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Biểu đồ doanh thu theo thời gian</p>
                </div>
                <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dailyRevenueData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="hidden sm:stroke" />
                            <XAxis dataKey="date" fontSize={10} className="hidden sm:block" stroke="#6B7280" />
                            <YAxis tickFormatter={formatShortCurrency} fontSize={10} className="hidden sm:block" stroke="#6B7280" />
                            <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                            <Legend className="hidden sm:block" />
                            <Line
                                type="monotone"
                                dataKey="Doanh thu"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                dot={{ fill: '#3B82F6', r: 3 }}
                                activeDot={{ r: 5 }}
                                fill="url(#colorRevenue)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Grouped Bar Chart - So sánh cùng kỳ */}
            <div className="bg-white p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-gray-100">
                <div className="mb-3 sm:mb-4">
                    <h4 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                        <div className="w-1 h-5 sm:h-6 bg-purple-600 rounded-full"></div>
                        So sánh cùng kỳ
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">So sánh tháng này với tháng trước</p>
                </div>
                <div className="h-56 sm:h-72">
                    <GroupedBarChart
                        data={comparisonData}
                        dataKeys={[
                            { key: 'doanhThu', name: 'Doanh thu' },
                            { key: 'soVe', name: 'Số vé' }
                        ]}
                        colors={['#3B82F6', '#10B981']}
                        formatValue={formatShortCurrency}
                    />
                </div>
            </div>
        </div>
    );

    const renderProductsTab = () => (
        <div className="space-y-4 sm:space-y-6">
            {/* Horizontal Bar Chart - Top chặng bay */}
            <div className="bg-white p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-gray-100">
                <div className="mb-3 sm:mb-4">
                    <h4 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                        <div className="w-1 h-5 sm:h-6 bg-green-600 rounded-full"></div>
                        Top 10 chặng bay phổ biến
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Số lượng vé bán theo từng chặng bay</p>
                </div>
                <div className="h-72 sm:h-96">
                    <HorizontalBarChart
                        data={topRoutesData}
                        dataKey="soVeBan"
                        nameKey="changBay"
                        formatValue={(val) => val?.toLocaleString('vi-VN')}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Pie Chart - Cơ cấu hạng vé */}
                <div className="bg-white p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-gray-100">
                    <div className="mb-3 sm:mb-4">
                        <h4 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                            <div className="w-1 h-5 sm:h-6 bg-blue-600 rounded-full"></div>
                            Cơ cấu doanh thu hạng vé
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">Phân bổ theo hạng vé</p>
                    </div>
                    <div className="h-56 sm:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={ticketClassRevenueData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={window.innerWidth < 640 ? 60 : 80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={window.innerWidth < 640 ? false : ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    labelFontSize={10}
                                >
                                    {ticketClassRevenueData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS.class[index % COLORS.class.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                                <Legend className="hidden sm:block" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bar Chart - Doanh thu dịch vụ */}
                <div className="bg-white p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-gray-100">
                    <div className="mb-3 sm:mb-4">
                        <h4 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                            <div className="w-1 h-5 sm:h-6 bg-teal-600 rounded-full"></div>
                            Doanh thu dịch vụ
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">Doanh thu từ dịch vụ bổ sung</p>
                    </div>
                    <div className="h-56 sm:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={serviceRevenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="hidden sm:stroke" />
                                <XAxis dataKey="name" fontSize={9} angle={-15} textAnchor="end" height={40} />
                                <YAxis tickFormatter={formatShortCurrency} fontSize={9} width={50} />
                                <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                                <Bar dataKey="Doanh thu" radius={[6, 6, 0, 0]}>
                                    {serviceRevenueData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS.service[index % COLORS.service.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderOrdersTab = () => (
        <div className="space-y-4 sm:space-y-6">
            {/* Pie Chart - Trạng thái đơn hàng */}
            <div className="bg-white p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-gray-100">
                <div className="mb-3 sm:mb-4">
                    <h4 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                        <div className="w-1 h-5 sm:h-6 bg-orange-600 rounded-full"></div>
                        Tỷ lệ trạng thái đơn hàng
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Phân bổ theo trạng thái đơn hàng</p>
                </div>
                <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={orderStatusData}
                                cx="50%"
                                cy="50%"
                                outerRadius={window.innerWidth < 640 ? 80 : 100}
                                fill="#8884d8"
                                dataKey="value"
                                label={false}
                                labelFontSize={10}
                            >
                                {orderStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS.status[index % COLORS.status.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip formatter={(val) => val?.toLocaleString('vi-VN')} />} />
                            <Legend
                                formatter={(value, entry) => `${entry.payload.name}: ${value}`}
                                className="text-xs sm:text-sm"
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );

    const renderCustomersTab = () => (
        <div className="space-y-4 sm:space-y-6">
            {/* Heatmap Chart - Khung giờ đặt vé */}
            <div className="bg-white p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-gray-100">
                <div className="mb-3 sm:mb-4">
                    <h4 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                        <div className="w-1 h-5 sm:h-6 bg-red-600 rounded-full"></div>
                        Khung giờ đặt vé cao điểm
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500">
                        <FaClock className="inline mr-1" />
                        Thời gian khách hàng thường đặt vé nhất trong tuần
                    </p>
                </div>
                <HeatmapChart data={hourlyData} />
            </div>

            {/* Funnel Chart - Tỷ lệ chuyển đổi */}
            <div className="bg-white p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-gray-100">
                <div className="mb-3 sm:mb-4">
                    <h4 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                        <div className="w-1 h-5 sm:h-6 bg-yellow-600 rounded-full"></div>
                        Tỷ lệ chuyển đổi đặt vé
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Phễu chuyển đổi từ tìm kiếm đến hoàn tất</p>
                </div>
                <FunnelChart data={conversionData} colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444']} />
            </div>
        </div>
    );

    const renderTodayTab = () => {
        if (!todayStats) {
            return (
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-500">Không có dữ liệu hôm nay</p>
                </div>
            );
        }

        // Dữ liệu cho biểu đồ trạng thái đơn hàng trong ngày
        const statusData = [
            { name: 'Thành công', value: todayStats.soDonHangHomNay - (todayStats.soDonHangHomNay * todayStats.tyLeHuyHomNay / 100) || 0 },
            { name: 'Đã hủy', value: todayStats.soDonHangHomNay * todayStats.tyLeHuyHomNay / 100 || 0 }
        ];

        return (
            <div className="space-y-4 sm:space-y-6">
                {/* Thông tin thời gian thực */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg text-white">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                                <FaCalendarDay className="text-xl sm:text-2xl" />
                                Thống kê hôm nay
                            </h3>
                            <p className="text-blue-100 text-xs sm:text-sm mt-1">
                                Cập nhật: {new Date().toLocaleString('vi-VN')}
                            </p>
                        </div>
                        <button
                            onClick={fetchAllStatistics}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                        >
                            <FaSync className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* KPI Cards trong ngày */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                    <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <FaDollarSign className="text-green-600 text-sm sm:text-base" />
                            </div>
                            <span className="text-xs sm:text-sm text-gray-500 font-medium">Doanh thu</span>
                        </div>
                        <p className="text-base sm:text-lg font-bold text-gray-800">
                            {formatShortCurrency(todayStats.doanhThuHomNay)}
                        </p>
                    </div>

                    <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FaTicketAlt className="text-blue-600 text-sm sm:text-base" />
                            </div>
                            <span className="text-xs sm:text-sm text-gray-500 font-medium">Đơn hàng</span>
                        </div>
                        <p className="text-base sm:text-lg font-bold text-gray-800">
                            {todayStats.soDonHangHomNay?.toLocaleString('vi-VN') || '0'}
                        </p>
                    </div>

                    <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <FaTicketAlt className="text-purple-600 text-sm sm:text-base" />
                            </div>
                            <span className="text-xs sm:text-sm text-gray-500 font-medium">Vé bán</span>
                        </div>
                        <p className="text-base sm:text-lg font-bold text-gray-800">
                            {todayStats.soVeDaBanHomNay?.toLocaleString('vi-VN') || '0'}
                        </p>
                    </div>

                    <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <FaUsers className="text-orange-600 text-sm sm:text-base" />
                            </div>
                            <span className="text-xs sm:text-sm text-gray-500 font-medium">Check-in</span>
                        </div>
                        <p className="text-base sm:text-lg font-bold text-gray-800">
                            {todayStats.soKhachCheckInHomNay?.toLocaleString('vi-VN') || '0'}
                        </p>
                    </div>

                    <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <FaSync className="text-red-600 text-sm sm:text-base" />
                            </div>
                            <span className="text-xs sm:text-sm text-gray-500 font-medium">Tỷ lệ hủy</span>
                        </div>
                        <p className={`text-base sm:text-lg font-bold ${parseFloat(todayStats.tyLeHuyHomNay || 0) > 10 ? 'text-red-600' : 'text-green-600'}`}>
                            {todayStats.tyLeHuyHomNay || '0'}%
                        </p>
                    </div>

                    <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-teal-100 rounded-lg">
                                <FaFilePdf className="text-teal-600 text-sm sm:text-base" />
                            </div>
                            <span className="text-xs sm:text-sm text-gray-500 font-medium">Hóa đơn</span>
                        </div>
                        <p className="text-base sm:text-lg font-bold text-gray-800">
                            {todayStats.soHoaDonHomNay?.toLocaleString('vi-VN') || '0'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Pie Chart - Tỷ lệ trạng thái đơn hàng */}
                    <div className="bg-white p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-gray-100">
                        <div className="mb-3 sm:mb-4">
                            <h4 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                                <div className="w-1 h-5 sm:h-6 bg-blue-600 rounded-full"></div>
                                Tỷ lệ trạng thái đơn hàng
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">Thành công vs Đã hủy</p>
                        </div>
                        <div className="h-48 sm:h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={window.innerWidth < 640 ? 60 : 80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        labelFontSize={10}
                                    >
                                        <Cell fill="#10B981" key="success" />
                                        <Cell fill="#EF4444" key="cancelled" />
                                    </Pie>
                                    <Tooltip content={<CustomTooltip formatter={(val) => val?.toLocaleString('vi-VN')} />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Thanh tiến đơn hàng */}
                    <div className="bg-white p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-gray-100">
                        <div className="mb-3 sm:mb-4">
                            <h4 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                                <div className="w-1 h-5 sm:h-6 bg-purple-600 rounded-full"></div>
                                Thanh tiến xử lý
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">Số lượng theo trạng thái</p>
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                            {[
                                { label: 'Tổng đơn hàng', value: todayStats.soDonHangHomNay || 0, total: todayStats.soDonHangHomNay || 1, color: 'bg-blue-500' },
                                { label: 'Vé đã bán', value: todayStats.soVeDaBanHomNay || 0, total: Math.max(todayStats.soDonHangHomNay || 1, 1), color: 'bg-green-500' },
                                { label: 'Khách check-in', value: todayStats.soKhachCheckInHomNay || 0, total: Math.max(todayStats.soVeDaBanHomNay || 1, 1), color: 'bg-purple-500' },
                                { label: 'Hóa đơn phát hành', value: todayStats.soHoaDonHomNay || 0, total: Math.max(todayStats.soDonHangHomNay || 1, 1), color: 'bg-orange-500' }
                            ].map((item, index) => (
                                <div key={index} className="space-y-1">
                                    <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-gray-600 font-medium">{item.label}</span>
                                        <span className="font-bold text-gray-800">{item.value.toLocaleString('vi-VN')}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                                        <div
                                            className={`${item.color} h-2 sm:h-2.5 rounded-full transition-all duration-500`}
                                            style={{ width: `${Math.min((item.value / item.total) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bản tóm tắt */}
                <div className="bg-white p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-gray-100">
                    <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Tóm tắt hoạt động hôm nay</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-500">Tổng doanh thu</span>
                            <p className="font-bold text-gray-800 text-sm sm:text-base">{formatCurrency(todayStats.doanhThuHomNay || 0)}</p>
                        </div>
                        <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-500">Trung bình/đơn</span>
                            <p className="font-bold text-gray-800 text-sm sm:text-base">
                                {formatCurrency((todayStats.doanhThuHomNay || 0) / Math.max(todayStats.soDonHangHomNay || 1, 1))}
                            </p>
                        </div>
                        <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-500">Tỷ lệ hủy</span>
                            <p className={`font-bold text-sm sm:text-base ${parseFloat(todayStats.tyLeHuyHomNay || 0) > 10 ? 'text-red-600' : 'text-green-600'}`}>
                                {todayStats.tyLeHuyHomNay || '0'}%
                            </p>
                        </div>
                        <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-500">Tỷ lệ check-in</span>
                            <p className="font-bold text-gray-800 text-sm sm:text-base">
                                {((todayStats.soKhachCheckInHomNay || 0) / Math.max(todayStats.soVeDaBanHomNay || 1, 1) * 100).toFixed(1)}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Card title="Thống kê & Phân tích">
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
                duration={3000}
            />

            {/* Header */}
            <div className="mb-4 sm:mb-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                            <FaChartLine className="text-white text-xl sm:text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Báo cáo tổng hợp</h2>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Phân tích dữ liệu kinh doanh</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
                        <button
                            onClick={fetchAllStatistics}
                            disabled={loading}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-all disabled:opacity-50 font-medium text-sm"
                        >
                            <FaSync className={`text-xs sm:text-sm ${loading ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Làm mới</span>
                        </button>
                        <button
                            onClick={exportToPDF}
                            disabled={loading || !overviewData}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md font-medium text-sm"
                        >
                            <FaFilePdf className="text-xs sm:text-sm" />
                            <span className="hidden sm:inline">Xuất PDF</span>
                        </button>
                    </div>
                </div>

                {/* Time filter */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-5 rounded-xl border border-blue-100">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 min-w-[120px] sm:min-w-[140px]">
                            <FaCalendarAlt className="text-blue-600 text-sm sm:text-base" />
                            <label className="text-xs sm:text-sm font-semibold text-gray-700">Khoảng thời gian:</label>
                        </div>
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-blue-200 rounded-lg text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                        >
                            <option value="7days">7 ngày qua</option>
                            <option value="30days">30 ngày qua</option>
                            <option value="thisMonth">Tháng này</option>
                            <option value="lastMonth">Tháng trước</option>
                            <option value="thisYear">Năm nay</option>
                            <option value="custom">Tùy chỉnh</option>
                        </select>

                        {timeRange === 'custom' && (
                            <div className="flex gap-2 mt-2 sm:mt-0">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-blue-200 rounded-lg text-xs sm:text-sm"
                                />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate}
                                    className="px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-blue-200 rounded-lg text-xs sm:text-sm"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-4 sm:mb-6">
                <div className="flex flex-nowrap overflow-x-auto gap-1 sm:gap-2 border-b border-gray-200 -mx-2 sm:mx-0 px-2 sm:px-0">
                    {[
                        { id: 'today', label: 'Hôm nay', icon: <FaCalendarDay /> },
                        { id: 'finance', label: 'Doanh thu', icon: <FaDollarSign /> },
                        { id: 'products', label: 'Chặng bay', icon: <FaRoad /> },
                        { id: 'orders', label: 'Đơn hàng', icon: <FaTicketAlt /> },
                        { id: 'customers', label: 'Hành vi', icon: <FaUsers /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm transition-colors border-b-2 -mb-px whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'text-blue-600 border-blue-600 bg-blue-50'
                                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <span className="text-xs sm:text-sm">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center items-center h-64 sm:h-96">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-200 border-t-blue-600 mb-3 sm:mb-4"></div>
                        <p className="text-xs sm:text-sm text-gray-600 font-medium">Đang tải dữ liệu...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="flex justify-center items-center h-64 sm:h-96">
                    <div className="text-center">
                        <p className="text-sm sm:text-base text-red-500 mb-3 sm:mb-4">{error}</p>
                        <button onClick={fetchAllStatistics} className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm">
                            Thử lại
                        </button>
                    </div>
                </div>
            ) : (
                <div className="min-h-[400px] sm:min-h-0">
                    {activeTab === 'today' && renderTodayTab()}
                    {activeTab === 'finance' && renderFinanceTab()}
                    {activeTab === 'products' && renderProductsTab()}
                    {activeTab === 'orders' && renderOrdersTab()}
                    {activeTab === 'customers' && renderCustomersTab()}
                </div>
            )}
        </Card>
    );
};

export default ThongKeDoanhThu;
