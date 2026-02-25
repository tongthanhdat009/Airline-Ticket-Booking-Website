import { useState, useEffect } from 'react';
import {
 FaSearch,
 FaServer,
 FaExclamationTriangle,
 FaCheckCircle,
 FaTimesCircle,
 FaClock,
 FaFilter,
 FaCalendar,
 FaInfoCircle,
 FaEye,
 FaCopy,
 FaCode,
 FaExchangeAlt,
 FaSpinner
} from 'react-icons/fa';
import Card from '../../components/QuanLy/CardChucNang';
import Toast from '../../components/common/Toast';
import ViewToggleButton from '../../components/common/ViewToggleButton';
import useViewToggle from '../../hooks/useViewToggle';
import vnPayTransactionLogService from '../../services/vnPayTransactionLogService';

// Mapping VNPay response codes
const vnpResponseCodes = {
 '00': { label: 'Thành công', color: 'text-green-600' },
 '07': { label: 'Trừ tiền thành công (nghi ngờ)', color: 'text-yellow-600' },
 '09': { label: 'Chưa đăng ký IB', color: 'text-red-600' },
 '10': { label: 'Xác thực sai >3 lần', color: 'text-red-600' },
 '11': { label: 'Hết hạn chờ', color: 'text-orange-600' },
 '12': { label: 'Thẻ bị khóa', color: 'text-red-600' },
 '13': { label: 'Sai OTP', color: 'text-red-600' },
 '24': { label: 'Khách hủy', color: 'text-gray-600' },
 '51': { label: 'Không đủ số dư', color: 'text-red-600' },
 '65': { label: 'Vượt hạn mức', color: 'text-red-600' },
 '75': { label: 'Ngân hàng bảo trì', color: 'text-orange-600' },
 '79': { label: 'Sai mật khẩu >số lần', color: 'text-red-600' },
 '99': { label: 'Lỗi khác', color: 'text-red-600' }
};

// Trạng thái xử lý config
const processingStatusConfig = {
 SUCCESS: { label: 'Thành công', color: 'bg-green-100 text-green-700', icon: FaCheckCircle },
 FAILED: { label: 'Thất bại', color: 'bg-red-100 text-red-700', icon: FaTimesCircle },
 CANCELLED: { label: 'Đã hủy', color: 'bg-gray-100 text-gray-700', icon: FaTimesCircle },
 DUPLICATE: { label: 'IPN trùng lặp', color: 'bg-yellow-100 text-yellow-700', icon: FaExclamationTriangle }
};

// Format VNPay amount (x100)
const formatAmount = (vnpAmount) => {
 const amount = vnpAmount / 100;
 return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Format VNPay pay date
const formatVnpDate = (vnpDate) => {
 if (!vnpDate || vnpDate.length !== 14) return vnpDate;
 return `${vnpDate.slice(0, 4)}-${vnpDate.slice(4, 6)}-${vnpDate.slice(6, 8)} ${vnpDate.slice(8, 10)}:${vnpDate.slice(10, 12)}:${vnpDate.slice(12, 14)}`;
};


const LichSuGiaoDichVNPay = () => {
 const [search, setSearch] = useState('');
 const [filterResult, setFilterResult] = useState('all');
 const [tuNgay, setTuNgay] = useState('');
 const [denNgay, setDenNgay] = useState('');
 const [logs, setLogs] = useState([]);
 const [selectedLog, setSelectedLog] = useState(null);
 const [showRawData, setShowRawData] = useState(false);
 const { viewMode, setViewMode } = useViewToggle('lich-su-gd-vnpay-view', 'table');
 const [currentPage, setCurrentPage] = useState(0);
 const [itemsPerPage, setItemsPerPage] = useState(10);
 const [totalPages, setTotalPages] = useState(0);
 const [totalElements, setTotalElements] = useState(0);
 const [loading, setLoading] = useState(false);

 // Toast
 const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
 const showToast = (message, type = 'success') => {
 setToast({ isVisible: true, message, type });
 };

 // Thống kê
 const [stats, setStats] = useState({
 total: 0,
 success: 0,
 failed: 0,
 cancelled: 0,
 duplicate: 0,
 others: 0
 });

 // Load dữ liệu transaction logs từ API
 const loadTransactionLogs = async () => {
 setLoading(true);
 try {
 const params = {
 page: currentPage,
 size: itemsPerPage,
 search: search || undefined,
 processingResult: filterResult !== 'all' ? filterResult : undefined,
 tuNgay: tuNgay || undefined,
 denNgay: denNgay || undefined
 };

 const response = await vnPayTransactionLogService.getTransactionLogs(params);
 if (response.success) {
 setLogs(response.data.content || []);
 setTotalPages(response.data.totalPages || 0);
 setTotalElements(response.data.totalElements || 0);
 } else {
 showToast(response.message || 'Không thể tải dữ liệu', 'error');
 setLogs([]);
 setTotalPages(0);
 setTotalElements(0);
 }
 } catch (error) {
 console.error('Error loading transaction logs:', error);
 showToast('Có lỗi xảy ra khi tải dữ liệu', 'error');
 setLogs([]);
 setTotalPages(0);
 setTotalElements(0);
 } finally {
 setLoading(false);
 }
 };

 // Load thống kê từ API
 const loadStatistics = async () => {
 try {
 const params = {
 tuNgay: tuNgay || undefined,
 denNgay: denNgay || undefined
 };
 const response = await vnPayTransactionLogService.getStatistics(params);
 if (response.success) {
 const data = response.data || {};
 setStats({
 total: data.total || 0,
 success: data.success || 0,
 failed: data.failed || 0,
 cancelled: data.cancelled || 0,
 duplicate: data.duplicate || 0,
 others: (data.cancelled || 0) + (data.duplicate || 0)
 });
 }
 } catch (error) {
 console.error('Error loading statistics:', error);
 }
 };

 // Load dữ liệu khi component mount hoặc filter/page thay đổi
 useEffect(() => {
 loadTransactionLogs();
 }, [currentPage, itemsPerPage]);

 // Load thống kê khi component mount hoặc filter thay đổi
 useEffect(() => {
 loadStatistics();
 }, [filterResult, tuNgay, denNgay]);

 // Xử lý tìm kiếm
 const handleSearch = () => {
 setCurrentPage(0);
 loadTransactionLogs();
 };

 // Xử lý khi Enter trong ô tìm kiếm
 const handleSearchKeyPress = (e) => {
 if (e.key === 'Enter') {
 handleSearch();
 }
 };

 // Xử lý khi filter thay đổi
 const handleFilterChange = (key, value) => {
 if (key === 'filterResult') {
 setFilterResult(value);
 } else if (key === 'tuNgay') {
 setTuNgay(value);
 } else if (key === 'denNgay') {
 setDenNgay(value);
 }
 setCurrentPage(0);
 loadTransactionLogs();
 };

 // Xử lý phân trang
 const paginate = (pageNumber) => {
 setCurrentPage(pageNumber);
 };

 const handleItemsPerPageChange = (e) => {
 const newValue = parseInt(e.target.value);
 setItemsPerPage(newValue);
 setCurrentPage(0);
 };

 // Copy raw data
 const copyRawData = (data) => {
 navigator.clipboard.writeText(data);
 showToast('Đã copy raw data vào clipboard');
 };

 return (
 <Card title="Lịch sử giao dịch VNPay (Transaction Logs)">
 <Toast
 message={toast.message}
 type={toast.type}
 isVisible={toast.isVisible}
 onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
 />

 {/* Thông tin cảnh báo */}
 <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
 <FaInfoCircle className="text-amber-500 mt-0.5 shrink-0" />
 <div className="text-xs sm:text-sm text-amber-700">
 <p className="font-semibold mb-1">Dành cho Developer / Vận hành</p>
 <p>Đây là dữ liệu"thô" (raw data) mà VNPay trả về qua IPN (Instant Payment Notification). Sử dụng màn hình này để debug khi có khách khiếu nại"Bị trừ tiền nhưng web báo lỗi".</p>
 </div>
 </div>

 {/* Thống kê */}
 <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
 <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
 <div className="flex items-center gap-2 sm:gap-3">
 <FaServer className="text-blue-600 shrink-0" size={18} />
 <div className="min-w-0">
 <p className="text-xs text-blue-600">Tổng IPN</p>
 <p className="text-lg sm:text-xl font-bold text-blue-700">{stats.total}</p>
 </div>
 </div>
 </div>
 <div className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4">
 <div className="flex items-center gap-2 sm:gap-3">
 <FaCheckCircle className="text-green-600 shrink-0" size={18} />
 <div className="min-w-0">
 <p className="text-xs text-green-600">Thành công</p>
 <p className="text-lg sm:text-xl font-bold text-green-700">{stats.success}</p>
 </div>
 </div>
 </div>
 <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
 <div className="flex items-center gap-2 sm:gap-3">
 <FaTimesCircle className="text-red-600 shrink-0" size={18} />
 <div className="min-w-0">
 <p className="text-xs text-red-600">Thất bại</p>
 <p className="text-lg sm:text-xl font-bold text-red-700">{stats.failed}</p>
 </div>
 </div>
 </div>
 <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 sm:p-4">
 <div className="flex items-center gap-2 sm:gap-3">
 <FaExclamationTriangle className="text-yellow-600 shrink-0" size={18} />
 <div className="min-w-0">
 <p className="text-xs text-yellow-600">Hủy/Trùng lặp</p>
 <p className="text-lg sm:text-xl font-bold text-yellow-700">{stats.others}</p>
 </div>
 </div>
 </div>
 </div>

 {/* Bộ lọc */}
 <div className="flex flex-col lg:flex-row flex-wrap items-stretch lg:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
 <div className="relative flex-1 min-w-0 lg:min-w-[200px]">
 <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
 <input
 type="text"
 placeholder="Tìm theo vnp_TxnRef, TransactionNo, BankCode..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 onKeyPress={handleSearchKeyPress}
 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
 />
 </div>
 <button
 onClick={handleSearch}
 disabled={loading}
 className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
 >
 <FaFilter /> <span className="hidden sm:inline">Tìm kiếm</span>
 </button>
 <div className="flex items-center gap-2">
 <FaFilter className="text-gray-400 shrink-0" />
 <select
 value={filterResult}
 onChange={(e) => handleFilterChange('filterResult', e.target.value)}
 className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-auto"
 >
 <option value="all">Tất cả kết quả</option>
 <option value="SUCCESS">Thành công</option>
 <option value="FAILED">Thất bại</option>
 <option value="CANCELLED">Đã hủy</option>
 <option value="DUPLICATE">Trùng lặp</option>
 </select>
 </div>
 <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
 <FaCalendar className="text-gray-400 shrink-0" />
 <input 
 type="date" 
 value={tuNgay} 
 onChange={(e) => handleFilterChange('tuNgay', e.target.value)}
 className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 sm:flex-none" 
 />
 <span className="text-gray-400 hidden sm:inline">-</span>
 <input 
 type="date" 
 value={denNgay} 
 onChange={(e) => handleFilterChange('denNgay', e.target.value)}
 className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 sm:flex-none" 
 />
 </div>
 <ViewToggleButton currentView={viewMode} onViewChange={(v) => { setViewMode(v); setCurrentPage(0); }} />
 </div>

 {/* Pagination header */}
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
 <p className="text-sm text-gray-500">
 Hiển thị {logs.length > 0 ? currentPage * itemsPerPage + 1 : 0} đến {Math.min((currentPage + 1) * itemsPerPage, totalElements)} / {totalElements} bản ghi
 </p>
 <select 
 value={itemsPerPage} 
 onChange={handleItemsPerPageChange} 
 className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
 >
 <option value={5}>5 / trang</option>
 <option value={10}>10 / trang</option>
 <option value={20}>20 / trang</option>
 </select>
 </div>

 {/* Bảng logs / Card view */}
 {loading ? (
 <div className="text-center py-12 text-gray-500">
 <FaSpinner className="text-4xl mx-auto mb-3 text-blue-500 animate-spin" />
 <p>Đang tải dữ liệu...</p>
 </div>
 ) : logs.length === 0 ? (
 <div className="text-center py-12 text-gray-500">
 <FaServer className="text-4xl mx-auto mb-3 text-gray-300" />
 <p>Không tìm thấy log giao dịch nào</p>
 </div>
 ) : viewMode === 'grid' ? (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {logs.map((log) => {
 const statusConfig = processingStatusConfig[log.processingResult] || processingStatusConfig.FAILED;
 const StatusIcon = statusConfig.icon;
 const responseInfo = vnpResponseCodes[log.vnpResponseCode] || { label: `Code ${log.vnpResponseCode}`, color: 'text-gray-600' };
 return (
 <div key={log.id} className={`bg-white rounded-xl border hover:shadow-lg transition-shadow p-4 ${
 log.processingResult === 'SUCCESS' ? 'border-l-4 border-l-green-500' :
 log.processingResult === 'FAILED' ? 'border-l-4 border-l-red-500' :
 'border-l-4 border-l-yellow-500'
 }`}>
 <div className="flex items-start justify-between mb-3">
 <div className="min-w-0">
 <p className="font-mono font-semibold text-sm text-gray-800 truncate">{log.vnpTxnRef}</p>
 <p className="font-mono text-xs text-gray-400">TXN: {log.vnpTransactionNo}</p>
 </div>
 <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color} shrink-0 ml-2`}>
 <StatusIcon className="text-xs" />
 <span className="hidden sm:inline">{statusConfig.label}</span>
 </span>
 </div>
 <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
 <div className="bg-blue-50 rounded-lg p-2">
 <p className="text-xs text-gray-500">Số tiền</p>
 <p className="font-medium text-blue-700">{formatAmount(log.vnpAmount)}</p>
 </div>
 <div className="bg-gray-50 rounded-lg p-2">
 <p className="text-xs text-gray-500">Ngân hàng</p>
 <p className="font-mono font-medium text-gray-700">{log.vnpBankCode}</p>
 </div>
 </div>
 <div className="text-xs space-y-1 mb-3">
 <div className="flex justify-between flex-wrap gap-1">
 <span className="text-gray-500">VNPay Code:</span>
 <span className={`font-medium ${responseInfo.color}`}>{log.vnpResponseCode} - <span className="hidden sm:inline">{responseInfo.label}</span></span>
 </div>
 <div className="flex justify-between flex-wrap gap-1">
 <span className="text-gray-500">IPN nhận lúc:</span>
 <span className="font-mono text-gray-600">{log.ipnReceivedAt}</span>
 </div>
 </div>
 <p className="text-xs text-gray-500 line-clamp-2 mb-3 bg-gray-50 rounded p-2">{log.processingMessage}</p>
 <div className="flex justify-end">
 <button 
 onClick={() => { setSelectedLog(log); setShowRawData(false); }} 
 className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
 >
 <FaEye /> Xem chi tiết
 </button>
 </div>
 </div>
 );
 })}
 </div>
 ) : (
 <div className="overflow-x-auto -mx-4 sm:mx-0">
 <div className="min-w-[900px] px-4 sm:px-0">
 <table className="w-full border-collapse">
 <thead>
 <tr className="bg-gray-50 text-gray-600">
 <th className="px-2 sm:px-3 py-3 text-left text-xs font-semibold whitespace-nowrap">#</th>
 <th className="px-2 sm:px-3 py-3 text-left text-xs font-semibold whitespace-nowrap">vnp_TxnRef</th>
 <th className="px-2 sm:px-3 py-3 text-left text-xs font-semibold whitespace-nowrap">TransactionNo</th>
 <th className="px-2 sm:px-3 py-3 text-right text-xs font-semibold whitespace-nowrap">Số tiền</th>
 <th className="px-2 sm:px-3 py-3 text-left text-xs font-semibold whitespace-nowrap">Ngân hàng</th>
 <th className="px-2 sm:px-3 py-3 text-left text-xs font-semibold whitespace-nowrap">VNPay Code</th>
 <th className="px-2 sm:px-3 py-3 text-center text-xs font-semibold whitespace-nowrap">Kết quả XL</th>
 <th className="px-2 sm:px-3 py-3 text-left text-xs font-semibold whitespace-nowrap hidden md:table-cell">IPN nhận lúc</th>
 <th className="px-2 sm:px-3 py-3 text-center text-xs font-semibold whitespace-nowrap">Chi tiết</th>
 </tr>
 </thead>
 <tbody>
 {logs.map((log, index) => {
 const statusConfig = processingStatusConfig[log.processingResult] || processingStatusConfig.FAILED;
 const StatusIcon = statusConfig.icon;
 const responseInfo = vnpResponseCodes[log.vnpResponseCode] || { label: `Code ${log.vnpResponseCode}`, color: 'text-gray-600' };

 return (
 <tr key={log.id} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
 <td className="px-2 sm:px-3 py-3 text-sm text-gray-500 whitespace-nowrap">{log.id}</td>
 <td className="px-2 sm:px-3 py-3 text-sm font-mono text-gray-700 font-medium whitespace-nowrap">{log.vnpTxnRef}</td>
 <td className="px-2 sm:px-3 py-3 text-sm font-mono text-gray-600 whitespace-nowrap">{log.vnpTransactionNo}</td>
 <td className="px-2 sm:px-3 py-3 text-sm text-right font-medium text-gray-800 whitespace-nowrap">{formatAmount(log.vnpAmount)}</td>
 <td className="px-2 sm:px-3 py-3 whitespace-nowrap">
 <span className="px-2 py-0.5 rounded bg-gray-100 text-xs font-mono font-medium text-gray-700">
 {log.vnpBankCode}
 </span>
 </td>
 <td className="px-2 sm:px-3 py-3 text-xs whitespace-nowrap">
 <span className={`font-medium ${responseInfo.color}`}>
 {log.vnpResponseCode} - <span className="hidden lg:inline">{responseInfo.label}</span>
 </span>
 </td>
 <td className="px-2 sm:px-3 py-3 text-center whitespace-nowrap">
 <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
 <StatusIcon className="text-xs" />
 <span className="hidden sm:inline">{statusConfig.label}</span>
 </span>
 </td>
 <td className="px-2 sm:px-3 py-3 text-xs text-gray-500 font-mono hidden md:table-cell whitespace-nowrap">{log.ipnReceivedAt}</td>
 <td className="px-2 sm:px-3 py-3 text-center whitespace-nowrap">
 <button
 onClick={() => { setSelectedLog(log); setShowRawData(false); }}
 className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
 title="Xem chi tiết"
 >
 <FaEye />
 </button>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* Pagination */}
 {totalPages > 1 && (
 <div className="flex items-center justify-center gap-1 sm:gap-2 mt-6 overflow-x-auto">
 <button 
 onClick={() => paginate(currentPage - 1)} 
 disabled={currentPage === 0} 
 className="px-2 sm:px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-100 whitespace-nowrap"
 >
 ← Trước
 </button>
 {(() => {
 // Hiển thị tối đa 5 trang, căn giữa trang hiện tại
 const maxVisible = 5;
 let startPage = Math.max(0, currentPage - Math.floor(maxVisible / 2));
 let endPage = Math.min(totalPages, startPage + maxVisible);
 if (endPage - startPage < maxVisible) {
 startPage = Math.max(0, endPage - maxVisible);
 }
 return Array.from({ length: endPage - startPage }, (_, i) => startPage + i).map((page) => (
 <button 
 key={page} 
 onClick={() => paginate(page)} 
 className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-sm font-medium ${
 page === currentPage ? 'bg-blue-600 text-white' : 'border hover:bg-gray-100'
 }`}
 >
 {page + 1}
 </button>
 ));
 })()}
 <button 
 onClick={() => paginate(currentPage + 1)} 
 disabled={currentPage === totalPages - 1} 
 className="px-2 sm:px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-100 whitespace-nowrap"
 >
 Sau →
 </button>
 </div>
 )}

 {/* Modal chi tiết log */}
 {selectedLog && (
 <div 
 className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" 
 onClick={() => setSelectedLog(null)}
 >
 <div 
 className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto" 
 onClick={(e) => e.stopPropagation()}
 >
 <div className="flex justify-between items-center p-4 sm:p-6 border-b sticky top-0 bg-white rounded-t-2xl z-10">
 <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
 <FaCode className="text-blue-600" />
 <span className="truncate">Chi tiết IPN Log #{selectedLog.id}</span>
 </h3>
 <button 
 onClick={() => setSelectedLog(null)} 
 className="text-gray-400 hover:text-gray-600 p-1 shrink-0"
 >
 ✕
 </button>
 </div>
 <div className="p-4 sm:p-6">
 {/* Thông tin giao dịch */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
 <div className="bg-gray-50 rounded-lg p-3">
 <p className="text-xs text-gray-500">vnp_TxnRef</p>
 <p className="font-mono font-medium text-sm break-all">{selectedLog.vnpTxnRef}</p>
 </div>
 <div className="bg-gray-50 rounded-lg p-3">
 <p className="text-xs text-gray-500">vnp_TransactionNo</p>
 <p className="font-mono font-medium text-sm break-all">{selectedLog.vnpTransactionNo}</p>
 </div>
 <div className="bg-gray-50 rounded-lg p-3">
 <p className="text-xs text-gray-500">Số tiền</p>
 <p className="font-medium text-sm text-blue-600">{formatAmount(selectedLog.vnpAmount)}</p>
 </div>
 <div className="bg-gray-50 rounded-lg p-3">
 <p className="text-xs text-gray-500">Ngân hàng</p>
 <p className="font-mono font-medium text-sm">{selectedLog.vnpBankCode}</p>
 </div>
 <div className="bg-gray-50 rounded-lg p-3">
 <p className="text-xs text-gray-500">vnp_ResponseCode</p>
 <p className="font-mono font-medium text-sm">
 {selectedLog.vnpResponseCode} - {(vnpResponseCodes[selectedLog.vnpResponseCode] || {}).label}
 </p>
 </div>
 <div className="bg-gray-50 rounded-lg p-3">
 <p className="text-xs text-gray-500">vnp_PayDate</p>
 <p className="font-mono font-medium text-sm">{formatVnpDate(selectedLog.vnpPayDate)}</p>
 </div>
 <div className="bg-gray-50 rounded-lg p-3">
 <p className="text-xs text-gray-500">IPN nhận lúc</p>
 <p className="font-mono font-medium text-sm">{selectedLog.ipnReceivedAt}</p>
 </div>
 <div className="bg-gray-50 rounded-lg p-3">
 <p className="text-xs text-gray-500">Source IP</p>
 <p className="font-mono font-medium text-sm break-all">{selectedLog.sourceIp}</p>
 </div>
 </div>

 {/* Kết quả xử lý */}
 <div className={`rounded-lg p-3 sm:p-4 mb-4 ${
 selectedLog.processingResult === 'SUCCESS' ? 'bg-green-50 border border-green-200' :
 selectedLog.processingResult === 'FAILED' ? 'bg-red-50 border border-red-200' :
 'bg-yellow-50 border border-yellow-200'
 }`}>
 <p className="text-xs font-semibold mb-1">Kết quả xử lý</p>
 <p className="text-sm">{selectedLog.processingMessage}</p>
 </div>

 {/* Raw data */}
 <div>
 <button
 onClick={() => setShowRawData(!showRawData)}
 className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-2"
 >
 <FaCode />
 {showRawData ? 'Ẩn Raw Data' : 'Xem Raw Data'}
 </button>
 {showRawData && (
 <div className="relative">
 <button
 onClick={() => copyRawData(selectedLog.rawData)}
 className="absolute top-2 right-2 p-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-600"
 title="Copy"
 >
 <FaCopy />
 </button>
 <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto font-mono whitespace-pre-wrap break-all">
 {JSON.stringify(JSON.parse(selectedLog.rawData), null, 2)}
 </pre>
 </div>
 )}
 </div>
 </div>
 <div className="flex justify-end p-4 sm:p-6 border-t">
 <button
 onClick={() => setSelectedLog(null)}
 className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
 >
 Đóng
 </button>
 </div>
 </div>
 </div>
 )}
 </Card>
 );
};

export default LichSuGiaoDichVNPay;
