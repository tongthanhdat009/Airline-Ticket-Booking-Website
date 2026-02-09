import React, { useState, useEffect } from 'react';
import { FaSearch, FaEye, FaHistory, FaFilter, FaSpinner, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import Card from '../../components/QuanLy/CardChucNang';
import Toast from '../../components/common/Toast';
import ViewToggleButton from '../../components/common/ViewToggleButton';
import CardView from '../../components/common/CardView';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import { useViewToggle } from '../../hooks/useViewToggle';
import AuditLogService from '../../services/AuditLogService';
import { useToast } from '../../hooks/useToast';
import LichSuCard from '../../components/QuanLy/QuanLyLichSuThaoTac/LichSuCard';

const QuanLyLichSuThaoTac = () => {
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [selectedLog, setSelectedLog] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [filterLoaiThaoTac, setFilterLoaiThaoTac] = useState('');
    const [filterBangAnhHuong, setFilterBangAnhHuong] = useState('');
    const [loaiThaoTacList, setLoaiThaoTacList] = useState([]);
    const [bangAnhHuongList, setBangAnhHuongList] = useState([]);
    const [statistics, setStatistics] = useState({
        totalLogs: 0,
        adminActions: 0,
        customerActions: 0,
        todayLogs: 0
    });
    
    const itemsPerPage = 10;
    const { showToast } = useToast();
    const { viewMode, setViewMode: handleViewChange } = useViewToggle('ql-lich-su-thao-tac-view', 'table');

    // Load dữ liệu khi component mount hoặc filter thay đổi
    useEffect(() => {
        loadAuditLogs();
        loadFilterOptions();
        loadStatistics();
    }, [currentPage, filterLoaiThaoTac, filterBangAnhHuong]);

    // Load audit logs từ API
    const loadAuditLogs = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                size: itemsPerPage,
                search: search || undefined,
                loaiThaoTac: filterLoaiThaoTac || undefined,
                bangAnhHuong: filterBangAnhHuong || undefined
            };
            
            const response = await AuditLogService.getAllAuditLogs(params);
            if (response.success) {
                setAuditLogs(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
                setTotalElements(response.data.totalElements || 0);
            } else {
                showToast(response.message || 'Không thể tải dữ liệu', 'error');
            }
        } catch (error) {
            console.error('Error loading audit logs:', error);
            showToast('Có lỗi xảy ra khi tải dữ liệu', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Load options cho filter
    const loadFilterOptions = async () => {
        try {
            const [loaiThaoTacRes, bangAnhHuongRes] = await Promise.all([
                AuditLogService.getLoaiThaoTacList(),
                AuditLogService.getBangAnhHuongList()
            ]);
            
            if (loaiThaoTacRes.success) {
                setLoaiThaoTacList(loaiThaoTacRes.data || []);
            }
            if (bangAnhHuongRes.success) {
                setBangAnhHuongList(bangAnhHuongRes.data || []);
            }
        } catch (error) {
            console.error('Error loading filter options:', error);
        }
    };

    // Load thống kê
    const loadStatistics = async () => {
        try {
            const response = await AuditLogService.getStatistics();
            if (response.success) {
                setStatistics(response.data || {
                    totalLogs: 0,
                    adminActions: 0,
                    customerActions: 0,
                    todayLogs: 0
                });
            }
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    };

    // Xử lý tìm kiếm
    const handleSearch = () => {
        setCurrentPage(0);
        loadAuditLogs();
    };

    // Xử lý phân trang
    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Xử lý xem chi tiết
    const handleViewDetail = (log) => {
        setSelectedLog(log);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedLog(null);
    };

    // Format date time
    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    // Get text và color cho loại thao tác
    const getLoaiThaoTacText = (loai) => {
        const mapping = {
            'THEM_MOI': { text: 'Thêm mới', color: 'bg-green-100 text-green-700' },
            'CREATE': { text: 'Thêm mới', color: 'bg-green-100 text-green-700' },
            'CAP_NHAT': { text: 'Cập nhật', color: 'bg-blue-100 text-blue-700' },
            'UPDATE': { text: 'Cập nhật', color: 'bg-blue-100 text-blue-700' },
            'XOA': { text: 'Xóa', color: 'bg-red-100 text-red-700' },
            'DELETE': { text: 'Xóa', color: 'bg-red-100 text-red-700' },
            'HUY_VE': { text: 'Hủy vé', color: 'bg-orange-100 text-orange-700' },
            'DOI_GIO_BAY': { text: 'Đổi giờ bay', color: 'bg-yellow-100 text-yellow-700' },
            'DOI_CHUYEN_BAY': { text: 'Đổi chuyến bay', color: 'bg-blue-100 text-blue-700' },
            'CHECK_IN': { text: 'Check-in', color: 'bg-teal-100 text-teal-700' },
            'HOAN_TIEN': { text: 'Hoàn tiền', color: 'bg-pink-100 text-pink-700' },
            'REFUND': { text: 'Hoàn tiền', color: 'bg-pink-100 text-pink-700' }
        };
        return mapping[loai] || { text: loai, color: 'bg-gray-100 text-gray-700' };
    };

    // Get text và color cho loại tài khoản
    const getLoaiTaiKhoanText = (loai) => {
        switch (loai) {
            case 'ADMIN': return { text: 'Admin', color: 'bg-blue-100 text-blue-700' };
            case 'CUSTOMER': return { text: 'Khách hàng', color: 'bg-cyan-100 text-cyan-700' };
            default: return { text: loai, color: 'bg-gray-100 text-gray-700' };
        }
    };

    // Format tên bảng
    const formatBangAnhHuong = (bang) => {
        const mapping = {
            'chuyenbay': 'Chuyến bay',
            'datcho': 'Đặt chỗ',
            'donhang': 'Đơn hàng',
            'sanbay': 'Sân bay',
            'maybay': 'Máy bay',
            'tuyenbay': 'Tuyến bay',
            'hanhkhach': 'Hành khách',
            'taikhoan': 'Tài khoản',
            'taikhoanadmin': 'TK Admin',
            'hoadon': 'Hóa đơn',
            'hoantien': 'Hoàn tiền',
            'khuyenmai': 'Khuyến mãi',
            'dichvu': 'Dịch vụ'
        };
        return mapping[bang] || bang;
    };

    const indexOfFirstItem = currentPage * itemsPerPage;
    const indexOfLastItem = Math.min(indexOfFirstItem + itemsPerPage, totalElements);

    // Xử lý export PDF
    const handleExportPdf = async () => {
        try {
            setLoading(true);
            const filters = {
                loaiThaoTac: filterLoaiThaoTac || undefined,
                bangAnhHuong: filterBangAnhHuong || undefined,
                search: search || undefined
            };
            const response = await AuditLogService.exportPdf(filters);
            
            // Tạo blob và download
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            link.setAttribute('download', `audit_log_report_${timestamp}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            showToast('Export PDF thành công', 'success');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            showToast('Có lỗi xảy ra khi export PDF', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Xử lý export Excel
    const handleExportExcel = async () => {
        try {
            setLoading(true);
            const filters = {
                loaiThaoTac: filterLoaiThaoTac || undefined,
                bangAnhHuong: filterBangAnhHuong || undefined,
                search: search || undefined
            };
            const response = await AuditLogService.exportExcel(filters);
            
            // Tạo blob và download
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            link.setAttribute('download', `audit_log_report_${timestamp}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            showToast('Export Excel thành công', 'success');
        } catch (error) {
            console.error('Error exporting Excel:', error);
            showToast('Có lỗi xảy ra khi export Excel', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Lịch sử thao tác">
            {/* Thống kê tổng quan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-linear-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Tổng thao tác</p>
                            <p className="text-3xl font-bold mt-2">{statistics.totalLogs}</p>
                        </div>
                        <FaHistory size={40} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-linear-to-br from-blue-500 to-cyan-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Thao tác Admin</p>
                            <p className="text-3xl font-bold mt-2">{statistics.adminActions}</p>
                        </div>
                        <FaHistory size={40} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Thao tác KH</p>
                            <p className="text-3xl font-bold mt-2">{statistics.customerActions}</p>
                        </div>
                        <FaHistory size={40} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-linear-to-br from-orange-500 to-red-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Hôm nay</p>
                            <p className="text-3xl font-bold mt-2">{statistics.todayLogs}</p>
                        </div>
                        <FaHistory size={40} className="opacity-80" />
                    </div>
                </div>
            </div>

            {/* Thanh công cụ */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mô tả, ngưởi thực hiện..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                        />
                        <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                    </div>
                    <select
                        value={filterLoaiThaoTac}
                        onChange={(e) => {
                            setFilterLoaiThaoTac(e.target.value);
                            setCurrentPage(0);
                        }}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                    >
                        <option value="">Tất cả thao tác</option>
                        {loaiThaoTacList.map((loai) => (
                            <option key={loai} value={loai}>
                                {getLoaiThaoTacText(loai).text}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filterBangAnhHuong}
                        onChange={(e) => {
                            setFilterBangAnhHuong(e.target.value);
                            setCurrentPage(0);
                        }}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                    >
                        <option value="">Tất cả bảng</option>
                        {bangAnhHuongList.map((bang) => (
                            <option key={bang} value={bang}>
                                {formatBangAnhHuong(bang)}
                            </option>
                        ))}
                    </select>
                </div>
                <ViewToggleButton
                    currentView={viewMode}
                    onViewChange={handleViewChange}
                    className="shrink-0"
                />
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="flex items-center gap-2 bg-linear-to-r from-green-500 to-emerald-600 text-white px-5 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl font-semibold w-full md:w-auto disabled:opacity-50"
                >
                    {loading ? <FaSpinner className="animate-spin" /> : <FaFilter />}
                    <span>Tìm kiếm</span>
                </button>
            </div>

            {/* Nút Export */}
            <div className="flex flex-wrap gap-3 mb-4">
                <button
                    onClick={handleExportPdf}
                    disabled={loading}
                    className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all shadow-md disabled:opacity-50"
                >
                    {loading ? <FaSpinner className="animate-spin" /> : <FaFilePdf />}
                    <span>Export PDF</span>
                </button>
                <button
                    onClick={handleExportExcel}
                    disabled={loading}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all shadow-md disabled:opacity-50"
                >
                    {loading ? <FaSpinner className="animate-spin" /> : <FaFileExcel />}
                    <span>Export Excel</span>
                </button>
            </div>

            {/* View Mode: Card or Table */}
            {viewMode === 'grid' ? (
                /* Card View */
                <CardView
                    items={auditLogs}
                    renderCard={(log) => (
                        <LichSuCard
                            key={log.maLog}
                            data={log}
                            onView={handleViewDetail}
                        />
                    )}
                    emptyMessage="Không tìm thấy lịch sử thao tác nào."
                    loading={loading}
                />
            ) : (
                /* Table View */
                <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200">
                    <div className="overflow-x-auto">
                        <ResponsiveTable>
                            <table className="w-full text-sm">
                                <thead className="bg-linear-to-r from-slate-700 to-slate-800 text-white">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-semibold">Mã Log</th>
                                        <th className="px-6 py-4 text-left font-semibold">Loại thao tác</th>
                                        <th className="px-6 py-4 text-left font-semibold">Bảng ảnh hưởng</th>
                                        <th className="px-6 py-4 text-left font-semibold">Người thực hiện</th>
                                        <th className="px-6 py-4 text-left font-semibold">Mô tả</th>
                                        <th className="px-6 py-4 text-left font-semibold">IP</th>
                                        <th className="px-6 py-4 text-left font-semibold">Thời gian</th>
                                        <th className="px-6 py-4 text-center font-semibold">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="8" className="text-center py-12">
                                                <div className="flex flex-col items-center gap-3">
                                                    <FaSpinner className="text-green-500 text-3xl animate-spin" />
                                                    <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : auditLogs.length > 0 ? (
                                        auditLogs.map((log, index) => {
                                            const loaiThaoTac = getLoaiThaoTacText(log.loaiThaoTac);
                                            const loaiTaiKhoan = getLoaiTaiKhoanText(log.loaiTaiKhoan);
                                            return (
                                                <tr key={log.maLog} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-green-50 transition-colors`}>
                                                    <td className="px-6 py-4 font-bold text-green-600">#{log.maLog}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${loaiThaoTac.color}`}>
                                                            {loaiThaoTac.text}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                                                            {formatBangAnhHuong(log.bangAnhHuong)}
                                                        </span>
                                                        <span className="text-xs text-gray-500 ml-1">#{log.maBanGhi}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{log.nguoiThucHien}</p>
                                                            <span className={`inline-block px-2 py-0.5 rounded text-xs mt-1 ${loaiTaiKhoan.color}`}>
                                                                {loaiTaiKhoan.text}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-700 max-w-xs truncate" title={log.moTa}>
                                                        {log.moTa}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-gray-500 font-mono">{log.diaChiIp || '-'}</td>
                                                    <td className="px-6 py-4 text-gray-700">{formatDateTime(log.thoiGian)}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-center items-center gap-2">
                                                            <button
                                                                onClick={() => handleViewDetail(log)}
                                                                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                                title="Xem chi tiết"
                                                            >
                                                                <FaEye />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center py-12">
                                                <div className="flex flex-col items-center gap-3">
                                                    <FaHistory className="text-gray-300 text-5xl" />
                                                    <p className="text-gray-500 font-medium">Không tìm thấy lịch sử thao tác nào.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </ResponsiveTable>
                    </div>
                </div>
            )}

            {/* Thanh phân trang */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                    <span className="text-sm text-gray-600 font-medium">
                        Hiển thị <span className="font-bold text-green-600">{auditLogs.length > 0 ? indexOfFirstItem + 1 : 0}</span> đến <span className="font-bold text-green-600">{Math.min(indexOfLastItem, totalElements)}</span> của <span className="font-bold text-green-600">{totalElements}</span> kết quả
                    </span>
                    <nav>
                        <ul className="flex gap-2">
                            <li>
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 0}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-sm"
                                >
                                    ← Trước
                                </button>
                            </li>
                            {[...Array(totalPages)].map((_, index) => (
                                <li key={index}>
                                    <button
                                        onClick={() => paginate(index)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                            currentPage === index
                                                ? 'bg-green-600 text-white shadow-lg'
                                                : 'bg-white border border-gray-300 hover:bg-gray-100'
                                        }`}
                                    >
                                        {index + 1}
                                    </button>
                                </li>
                            ))}
                            <li>
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages - 1}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-sm"
                                >
                                    Sau →
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}

            {/* Modal chi tiết */}
            {isDetailModalOpen && selectedLog && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="bg-linear-to-r from-green-600 to-emerald-700 text-white p-6 rounded-t-xl sticky top-0">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold">Chi tiết thao tác</h2>
                                    <p className="text-sm opacity-90 mt-1">Mã Log: #{selectedLog.maLog}</p>
                                </div>
                                <button
                                    onClick={handleCloseDetailModal}
                                    className="text-white hover:text-gray-200 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Thông tin cơ bản */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                                    Thông tin thao tác
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Loại thao tác</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${getLoaiThaoTacText(selectedLog.loaiThaoTac).color}`}>
                                            {getLoaiThaoTacText(selectedLog.loaiThaoTac).text}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Loại tài khoản</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${getLoaiTaiKhoanText(selectedLog.loaiTaiKhoan).color}`}>
                                            {getLoaiTaiKhoanText(selectedLog.loaiTaiKhoan).text}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Ngưởi thực hiện</p>
                                        <p className="font-medium text-gray-900">{selectedLog.nguoiThucHien}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Địa chỉ IP</p>
                                        <p className="font-mono text-sm text-gray-700">{selectedLog.diaChiIp || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Bảng ảnh hưởng</p>
                                        <p className="font-medium text-gray-900">
                                            {formatBangAnhHuong(selectedLog.bangAnhHuong)} 
                                            <span className="text-sm text-gray-500"> #{selectedLog.maBanGhi}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Thờ gian</p>
                                        <p className="font-medium text-gray-900">{formatDateTime(selectedLog.thoiGian)}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-xs text-gray-500 font-semibold">Mô tả</p>
                                        <p className="font-medium text-gray-900">{selectedLog.moTa || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Dữ liệu cũ */}
                            {selectedLog.duLieuCu && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <div className="w-1 h-6 bg-red-600 rounded-full"></div>
                                        Dữ liệu trước khi thay đổi
                                    </h3>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <pre className="text-xs overflow-x-auto text-gray-800">
                                            {JSON.stringify(JSON.parse(selectedLog.duLieuCu), null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {/* Dữ liệu mới */}
                            {selectedLog.duLieuMoi && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                                        Dữ liệu sau khi thay đổi
                                    </h3>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <pre className="text-xs overflow-x-auto text-gray-800">
                                            {JSON.stringify(JSON.parse(selectedLog.duLieuMoi), null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={handleCloseDetailModal}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default QuanLyLichSuThaoTac;
