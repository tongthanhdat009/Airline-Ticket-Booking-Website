import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import Card from '../../components/QuanLy/CardChucNang';
import { FaCalendarAlt, FaDollarSign, FaTicketAlt, FaConciergeBell, FaUsers, FaFilePdf, FaChartLine, FaSync } from 'react-icons/fa';
import ThongKeService from '../../services/ThongKeService';
import Toast from '../../components/common/Toast';
import StatCard from '../../components/QuanLy/ThongKe/StatCard';
import CustomTooltip from '../../components/QuanLy/ThongKe/CustomTooltip';

const ThongKeDoanhThu = () => {
    // State cho dữ liệu thống kê
    const [overviewData, setOverviewData] = useState(null);
    const [dailyRevenueData, setDailyRevenueData] = useState([]);
    const [serviceRevenueData, setServiceRevenueData] = useState([]);
    const [ticketClassRevenueData, setTicketClassRevenueData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

    // State cho bộ lọc thời gian
    const [timeRange, setTimeRange] = useState('30days'); // Mặc định 30 ngày qua
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Memoize các hàm format để tránh tạo lại mỗi lần render
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

    // Memoize màu sắc cho charts
    const COLORS_CLASS = useMemo(() => ['#3B82F6', '#10B981'], []);
    const COLORS_SERVICE = useMemo(() => ['#F59E0B', '#EF4444', '#8B5CF6'], []);

    // Tính toán ngày bắt đầu và kết thúc dựa trên timeRange
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
                start.setDate(today.getDate() - 6);
                end = new Date(today);
        }

        // Format dates to YYYY-MM-DD
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        return { startDate: formatDate(start), endDate: formatDate(end) };
    }, [timeRange, startDate, endDate]);

    // Lấy tên hiển thị của khoảng thời gian
    const getTimeRangeLabel = useCallback(() => {
        const dateRange = getDateRange();
        if (!dateRange || (!dateRange.startDate && !dateRange.endDate)) return 'Chọn khoảng thời gian';
        
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        
        return `${start.toLocaleDateString('vi-VN')} - ${end.toLocaleDateString('vi-VN')}`;
    }, [getDateRange]);

    const showToast = useCallback((message, type = 'success') => {
        setToast({ isVisible: true, message, type });
    }, []);

    const hideToast = useCallback(() => {
        setToast(prev => ({ ...prev, isVisible: false }));
    }, []);

    // Fetch dữ liệu với error handling tốt hơn
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

            // Fetch từng API riêng biệt để tránh block lẫn nhau
            const overviewPromise = ThongKeService.getThongKeTongQuan(start, end);
            const dailyPromise = ThongKeService.getDoanhThuTheoNgay(start, end);
            const servicePromise = ThongKeService.getDoanhThuTheoDichVu(start, end);
            const ticketClassPromise = ThongKeService.getDoanhThuTheoHangVe(start, end);

            // Đợi tất cả promises hoàn thành
            const [overviewRes, dailyRes, serviceRes, ticketClassRes] = await Promise.allSettled([
                overviewPromise, dailyPromise, servicePromise, ticketClassPromise
            ]);

            // Xử lý kết quả từng API
            if (overviewRes.status === 'fulfilled' && overviewRes.value.success) {
                setOverviewData(overviewRes.value.data);
            } else {
                setOverviewData(null);
            }

            if (dailyRes.status === 'fulfilled' && dailyRes.value.success) {
                const formattedDailyData = dailyRes.value.data.map(item => ({
                    date: new Date(item.ngay).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                    "Doanh thu": parseFloat(item.doanhThu)
                }));
                setDailyRevenueData(formattedDailyData);
            } else {
                setDailyRevenueData([]);
            }

            if (serviceRes.status === 'fulfilled' && serviceRes.value.success) {
                const formattedServiceData = serviceRes.value.data.map(item => ({
                    name: item.tenDichVu,
                    "Doanh thu": parseFloat(item.tongDoanhThu)
                }));
                setServiceRevenueData(formattedServiceData);
            } else {
                setServiceRevenueData([]);
            }

            if (ticketClassRes.status === 'fulfilled' && ticketClassRes.value.success) {
                const formattedTicketClassData = ticketClassRes.value.data.map(item => ({
                    name: item.nhomHangVe,
                    value: parseFloat(item.doanhThuTheoHangVe)
                }));
                setTicketClassRevenueData(formattedTicketClassData);
            } else {
                setTicketClassRevenueData([]);
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

    // Debounce fetch function để tránh gọi quá nhiều lần
    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            // Không tự động load khi chọn custom mà chưa có ngày
            if (timeRange === 'custom' && (!startDate || !endDate)) {
                setLoading(false);
                return;
            }

            if (isMounted) {
                await fetchAllStatistics();
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [fetchAllStatistics, timeRange, startDate, endDate]);

    // Hàm export PDF - Gọi API backend
    const exportToPDF = useCallback(async () => {
        try {
            showToast('Đang tạo báo cáo PDF...', 'info');

            const dateRange = getDateRange();
            if (!dateRange) {
                showToast('Vui lòng chọn khoảng thời gian hợp lệ!', 'error');
                return;
            }

            const { startDate: start, endDate: end } = dateRange;

            // Gọi API backend để tạo PDF
            const pdfBlob = await ThongKeService.exportPdf(start, end);

            // Tạo URL từ blob và tải xuống
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

    return (
        <Card title="Thống kê doanh thu">
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
                duration={3000}
            />

            {/* Header Section - Luôn hiển thị */}
            <div className="mb-6">
                {/* Title và Actions */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                            <FaChartLine className="text-white text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Phân tích doanh thu</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {getTimeRangeLabel()}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <button
                            onClick={fetchAllStatistics}
                            disabled={loading || (timeRange === 'custom' && (!startDate || !endDate))}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md font-medium"
                        >
                            <FaSync className={`text-sm ${loading ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Làm mới</span>
                        </button>
                        <button
                            onClick={exportToPDF}
                            disabled={loading || !overviewData}
                            className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            <FaFilePdf className="text-sm" />
                            <span className="hidden sm:inline">Xuất PDF</span>
                        </button>
                    </div>
                </div>

                {/* Bộ lọc thời gian - Redesigned */}
                <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 shadow-sm">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <div className="flex items-center gap-2 min-w-[140px]">
                                <FaCalendarAlt className="text-blue-600 text-lg" />
                                <label className="text-sm font-semibold text-gray-700">
                                    Khoảng thời gian:
                                </label>
                            </div>
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className="flex-1 px-4 py-2.5 border-2 border-blue-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer hover:border-blue-300 transition-all shadow-sm"
                            >
                                <option value="7days">7 ngày qua</option>
                                <option value="30days">30 ngày qua</option>
                                <option value="thisMonth">Tháng này</option>
                                <option value="lastMonth">Tháng trước</option>
                                <option value="thisYear">Năm nay</option>
                                <option value="custom">Tùy chỉnh</option>
                            </select>
                        </div>

                        {/* Custom date range picker */}
                        {timeRange === 'custom' && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 pl-0 sm:pl-[152px] pt-3 border-t border-blue-200">
                                <div className="w-full sm:w-auto">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Từ ngày</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        max={endDate || undefined}
                                        className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                    />
                                </div>
                                <div className="w-full sm:w-auto">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Đến ngày</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        min={startDate || undefined}
                                        className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                    />
                                </div>
                                <button
                                    onClick={fetchAllStatistics}
                                    disabled={!startDate || !endDate}
                                    className="w-full sm:w-auto px-5 py-2 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg"
                                >
                                    Áp dụng
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-96">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
                        <p className="text-gray-600 font-medium">Đang tải dữ liệu thống kê...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="flex justify-center items-center h-96">
                    <div className="text-center max-w-md">
                        <div className="bg-red-100 rounded-full p-4 inline-block mb-4">
                            <svg className="h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Không thể tải dữ liệu</h3>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={fetchAllStatistics}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Các thẻ số liệu - Improved */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <StatCard
                            title="Tổng doanh thu"
                            value={overviewData ? formatShortCurrency(overviewData.tongDoanhThu) : '0đ'}
                            icon={<FaDollarSign size={24}/>}
                            color="green"
                        />
                        <StatCard
                            title="Doanh thu bán vé"
                            value={overviewData ? formatShortCurrency(overviewData.doanhThuBanVe) : '0đ'}
                            icon={<FaTicketAlt size={24}/>}
                            color="blue"
                        />
                        <StatCard
                            title="Doanh thu dịch vụ"
                            value={overviewData ? formatShortCurrency(overviewData.doanhThuDichVu) : '0đ'}
                            icon={<FaConciergeBell size={24}/>}
                            color="purple"
                        />
                        <StatCard
                            title="Khách hàng mới"
                            value={overviewData ? overviewData.khachHangMoi : '0'}
                            icon={<FaUsers size={24}/>}
                            color="orange"
                        />
                    </div>

                    {/* Biểu đồ đường - Enhanced */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6 hover:shadow-xl transition-shadow">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                                    Xu hướng doanh thu
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">Biểu đồ doanh thu theo từng ngày</p>
                            </div>
                        </div>
                        {dailyRevenueData.length > 0 ? (
                            <ResponsiveContainer id="line-chart" width="100%" height={380} debounce={150}>
                                <LineChart data={dailyRevenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis dataKey="date" fontSize={12} stroke="#6B7280" />
                                    <YAxis tickFormatter={formatShortCurrency} fontSize={12} stroke="#6B7280" />
                                    <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Line
                                        type="monotone"
                                        dataKey="Doanh thu"
                                        stroke="#3B82F6"
                                        strokeWidth={3}
                                        dot={{ fill: '#3B82F6', r: 5, strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 7, fill: '#1D4ED8', stroke: '#fff', strokeWidth: 2 }}
                                        isAnimationActive={true}
                                        fill="url(#colorRevenue)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col justify-center items-center h-80 text-gray-400">
                                <FaChartLine className="text-6xl mb-4 opacity-30" />
                                <p className="font-medium">Không có dữ liệu doanh thu theo ngày</p>
                            </div>
                        )}
                    </div>

                    {/* Biểu đồ tròn và cột - Grid Layout */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Biểu đồ tròn - Enhanced */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="mb-6">
                                <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                                    Cơ cấu doanh thu vé
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">Phân bổ theo hạng vé</p>
                            </div>
                            {ticketClassRevenueData.length > 0 ? (
                                <ResponsiveContainer id="pie-chart" width="100%" height={340} debounce={150}>
                                    <PieChart>
                                        <Pie
                                            data={ticketClassRevenueData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={120}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            isAnimationActive={true}
                                        >
                                            {ticketClassRevenueData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS_CLASS[index % COLORS_CLASS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col justify-center items-center h-80 text-gray-400">
                                    <FaTicketAlt className="text-6xl mb-4 opacity-30" />
                                    <p className="font-medium">Không có dữ liệu doanh thu theo hạng vé</p>
                                </div>
                            )}
                        </div>

                        {/* Biểu đồ cột - Enhanced */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="mb-6">
                                <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
                                    Cơ cấu doanh thu dịch vụ
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">So sánh các dịch vụ</p>
                            </div>
                            {serviceRevenueData.length > 0 ? (
                                <ResponsiveContainer id="bar-chart" width="100%" height={340} debounce={150}>
                                    <BarChart data={serviceRevenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                        <XAxis dataKey="name" fontSize={12} stroke="#6B7280" />
                                        <YAxis tickFormatter={formatShortCurrency} fontSize={12} stroke="#6B7280" />
                                        <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                                        <Legend />
                                        <Bar dataKey="Doanh thu" fill="#8884d8" radius={[10, 10, 0, 0]} isAnimationActive={true}>
                                            {serviceRevenueData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS_SERVICE[index % COLORS_SERVICE.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col justify-center items-center h-80 text-gray-400">
                                    <FaConciergeBell className="text-6xl mb-4 opacity-30" />
                                    <p className="font-medium">Không có dữ liệu doanh thu theo dịch vụ</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </Card>
    );
};

export default ThongKeDoanhThu;