import { useState, useEffect, useCallback } from 'react';
import {
  FaSearch,
  FaExchangeAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaSyncAlt,
  FaCalendar,
  FaInfoCircle,
  FaEye,
  FaRedo,
  FaClock,
  FaFilter,
  FaDollarSign,
  FaFileExcel,
  FaDownload
} from 'react-icons/fa';
import Card from '../../components/QuanLy/CardChucNang';
import Toast from '../../components/common/Toast';
import ViewToggleButton from '../../components/common/ViewToggleButton';
import { useViewToggle } from '../../hooks/useViewToggle';
import doiSoatGiaoDichApi from '../../services/doiSoatGiaoDichApi';
import VNPayLogTimeline from '../../components/QuanLy/QuanLyDoiSoat/VNPayLogTimeline';
import ReconciliationNoteForm from '../../components/QuanLy/QuanLyDoiSoat/ReconciliationNoteForm';

// Helper function to map API status to UI status
const mapApiStatusToUiStatus = (apiStatus, hasInvoice, hasVnpay) => {
  if (apiStatus === 'MATCHED') return 'khop';
  if (apiStatus === 'UNMATCHED') {
    // Determine type of mismatch based on data
    if (!hasInvoice && hasVnpay) return 'chi_co_vnpay';
    if (hasInvoice && !hasVnpay) return 'chi_co_he_thong';
    return 'lech_so_tien'; // Default to amount mismatch
  }
  return 'lech_so_tien';
};

// Helper function to format API response for UI
const formatApiDataForUi = (apiData) => {
  if (!apiData) return [];
  return apiData.map((item, index) => ({
    id: item.maHoaDon || index + 1,
    maGiaoDich: item.vnpayTransactionId || null,
    madonhang: item.soHoaDon || null,
    pnr: item.pnr || null,
    soTienHeThong: item.invoiceAmount || 0,
    soTienVNPay: item.vnpayAmount || 0,
    trangThaiHeThong: item.invoiceAmount > 0 ? 'ĐÃ THANH TOÁN' : 'KHÔNG TÌM THẤY',
    trangThaiVNPay: item.vnpayAmount > 0 ? '00' : 'KHÔNG TÌM THẤY',
    trangThaiDoiSoat: mapApiStatusToUiStatus(item.status, item.invoiceAmount > 0, item.vnpayAmount > 0),
    ngayGiaoDich: item.ngayGiaoDich || item.createdAt || new Date().toISOString().slice(0, 19).replace('T', ' '),
    ngayDoiSoat: item.createdAt || new Date().toISOString().slice(0, 19).replace('T', ' '),
    ghiChu: item.amountDifference > 0 ? `Chênh lệch ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.amountDifference)}` : ''
  }));
};

// Hàm format tiền
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Trạng thái đối soát config
const trangThaiConfig = {
  khop: { label: 'Khớp', color: 'bg-green-100 text-green-700', icon: FaCheckCircle },
  lech_trang_thai: { label: 'Lệch trạng thái', color: 'bg-orange-100 text-orange-700', icon: FaExclamationTriangle },
  lech_so_tien: { label: 'Lệch số tiền', color: 'bg-red-100 text-red-700', icon: FaTimesCircle },
  chi_co_vnpay: { label: 'Chỉ có VNPay', color: 'bg-purple-100 text-purple-700', icon: FaExclamationTriangle },
  chi_co_he_thong: { label: 'Chỉ có hệ thống', color: 'bg-yellow-100 text-yellow-700', icon: FaExclamationTriangle }
};

const DoiSoatGiaoDich = () => {
  const [search, setSearch] = useState('');
  const [filterTrangThai, setFilterTrangThai] = useState('all');
  const [tuNgay, setTuNgay] = useState('');
  const [denNgay, setDenNgay] = useState('');
  const [isReconciling, setIsReconciling] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemDetail, setSelectedItemDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const { viewMode, setViewMode: handleViewChange } = useViewToggle('doi-soat-gd-view', 'table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Thống kê từ API
  const [stats, setStats] = useState({
    tongSoGiaoDich: 0,
    soGiaoDichKhop: 0,
    soGiaoDichKhongKhop: 0,
    tongTienHoaDon: 0,
    tongTienVNPAY: 0,
    chenhLech: 0
  });

  // Toast state
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  });

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  // Load thống kê từ API
  const loadThongKe = async () => {
    try {
      const response = await doiSoatGiaoDichApi.getThongKeDoiSoat();
      if (response.success && response.data) {
        setStats({
          tongSoGiaoDich: response.data.tongSoGiaoDich || 0,
          soGiaoDichKhop: response.data.soGiaoDichKhop || 0,
          soGiaoDichKhongKhop: response.data.soGiaoDichKhongKhop || 0,
          tongTienHoaDon: response.data.tongTienHoaDon || 0,
          tongTienVNPAY: response.data.tongTienVNPAY || 0,
          chenhLech: response.data.chenhLech || 0
        });
      }
    } catch (err) {
      console.error('Lỗi khi tải thống kê:', err);
    }
  };

  // Load dữ liệu từ API
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (search) filters.search = search;
      if (filterTrangThai !== 'all') {
        // Map UI status to API status
        filters.trangThai = filterTrangThai === 'khop' ? 'MATCHED' : 'UNMATCHED';
      }
      if (tuNgay) filters.tuNgay = tuNgay;
      if (denNgay) filters.denNgay = denNgay;

      const response = await doiSoatGiaoDichApi.getDanhSachDoiSoat(filters);

      if (response.success && response.data) {
        const formattedData = formatApiDataForUi(response.data);
        setData(formattedData);
      } else if (Array.isArray(response)) {
        // Handle direct array response
        const formattedData = formatApiDataForUi(response);
        setData(formattedData);
      } else {
        setError(response.message || 'Không thể tải dữ liệu');
        showToast(response.message || 'Không thể tải dữ liệu', 'error');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Lỗi khi tải dữ liệu đối soát';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }, [search, filterTrangThai, tuNgay, denNgay]);

  // Load dữ liệu khi component mount hoặc filters thay đổi
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load thống kê khi component mount
  useEffect(() => {
    loadThongKe();
  }, []);

  // Lọc dữ liệu (client-side filter cho search text)
  // Server-side filter already applied for search, trangThai, tuNgay, denNgay
  const filteredData = data;

  // Chạy đối soát - gọi API thực sự
  const handleReconcile = async () => {
    setIsReconciling(true);
    try {
      // Lấy ngày mặc định nếu không chọn
      const defaultTuNgay = tuNgay || new Date().toISOString().split('T')[0];
      const defaultDenNgay = denNgay || new Date().toISOString().split('T')[0];

      const response = await doiSoatGiaoDichApi.runManualReconciliation({
        tuNgay: defaultTuNgay,
        denNgay: defaultDenNgay,
        includeMatched: false
      });

      if (response.success || response.data) {
        // Refresh lại data
        await loadData();
        await loadThongKe();
        showToast(response.message || 'Đối soát hoàn tất!', 'success');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Lỗi khi đối soát giao dịch';
      showToast(errorMsg, 'error');
    } finally {
      setIsReconciling(false);
    }
  };

  // Xuất báo cáo Excel
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const defaultTuNgay = tuNgay || new Date().toISOString().split('T')[0];
      const defaultDenNgay = denNgay || new Date().toISOString().split('T')[0];

      const blob = await doiSoatGiaoDichApi.exportReconciliationReport({
        tuNgay: defaultTuNgay,
        denNgay: defaultDenNgay
      });

      // Tạo link download
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `doi-soat-giao-dich_${defaultTuNgay}_den_${defaultDenNgay}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast('Xuất báo cáo thành công!', 'success');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Lỗi khi xuất báo cáo';
      showToast(errorMsg, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Load chi tiết đối soát
  const loadDetail = async (item) => {
    setSelectedItem(item);
    setLoadingDetail(true);
    setSelectedItemDetail(null);
    try {
      const response = await doiSoatGiaoDichApi.getChiTietDoiSoat(item.id);
      if (response.success && response.data) {
        setSelectedItemDetail(response.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải chi tiết:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <Card title="Đối soát giao dịch">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />

      {/* Thông tin */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
        <FaInfoCircle className="text-amber-500 mt-0.5 shrink-0" />
        <div className="text-sm text-amber-700">
          <p className="font-semibold mb-1">Về đối soát giao dịch</p>
          <p>Hệ thống tự động đối soát giao dịch với VNPay mỗi ngày lúc 2:00 AM. Các giao dịch lệch pha sẽ được đánh dấu và xử lý tự động nếu có thể. Các trường hợp phức tạp cần xử lý thủ công.</p>
        </div>
      </div>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaExchangeAlt className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600">Tổng giao dịch</p>
              <p className="text-2xl font-bold text-blue-700">{stats.tongSoGiaoDich}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaCheckCircle className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600">Khớp</p>
              <p className="text-2xl font-bold text-green-700">{stats.soGiaoDichKhop}</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <FaTimesCircle className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-red-600">Lệch</p>
              <p className="text-2xl font-bold text-red-700">{stats.soGiaoDichKhongKhop}</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FaDollarSign className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-orange-600">Chênh lệch</p>
              <p className="text-2xl font-bold text-orange-700">{formatCurrency(Math.abs(stats.chenhLech))}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bộ lọc và tìm kiếm */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo mã giao dịch, mã đơn hàng, PNR..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-400" />
          <select
            value={filterTrangThai}
            onChange={(e) => setFilterTrangThai(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="khop">Khớp</option>
            <option value="lech_trang_thai">Lệch trạng thái</option>
            <option value="lech_so_tien">Lệch số tiền</option>
            <option value="chi_co_vnpay">Chỉ có VNPay</option>
            <option value="chi_co_he_thong">Chỉ có hệ thống</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <FaCalendar className="text-gray-400" />
          <input type="date" value={tuNgay} onChange={(e) => setTuNgay(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <span className="text-gray-400">-</span>
          <input type="date" value={denNgay} onChange={(e) => setDenNgay(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button
          onClick={handleReconcile}
          disabled={isReconciling}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all ${
            isReconciling ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isReconciling ? <FaSyncAlt className="animate-spin" /> : <FaRedo />}
          {isReconciling ? 'Đang đối soát...' : 'Chạy đối soát'}
        </button>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all ${
            isExporting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isExporting ? <FaSyncAlt className="animate-spin" /> : <FaFileExcel />}
          {isExporting ? 'Đang xuất...' : 'Xuất Excel'}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <FaSyncAlt className="text-4xl text-blue-600 animate-spin" />
            <p className="text-gray-600">Đang tải dữ liệu đối soát...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 text-center">{error}</p>
        </div>
      )}

      {/* Toggle view + Phân trang */}
      {!loading && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Hiển thị <span className="font-bold text-blue-600">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)}</span> đến <span className="font-bold text-blue-600">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> của <span className="font-bold text-blue-600">{filteredData.length}</span>
            </span>
            <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white">
              <option value={5}>5 / trang</option>
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
            </select>
          </div>
          <ViewToggleButton currentView={viewMode} onViewChange={handleViewChange} />
        </div>
      )}

      {/* Bảng đối soát - Table view */}
      {!loading && viewMode === 'table' ? (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="px-3 py-3 text-left text-xs font-semibold">#</th>
              <th className="px-3 py-3 text-left text-xs font-semibold">Mã GD VNPay</th>
              <th className="px-3 py-3 text-left text-xs font-semibold">Mã đơn hàng</th>
              <th className="px-3 py-3 text-right text-xs font-semibold">Số tiền HT</th>
              <th className="px-3 py-3 text-right text-xs font-semibold">Số tiền VNPay</th>
              <th className="px-3 py-3 text-left text-xs font-semibold">TT Hệ thống</th>
              <th className="px-3 py-3 text-left text-xs font-semibold">TT VNPay</th>
              <th className="px-3 py-3 text-center text-xs font-semibold">Kết quả</th>
              <th className="px-3 py-3 text-left text-xs font-semibold">Ngày GD</th>
              <th className="px-3 py-3 text-center text-xs font-semibold">Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, index) => {
              const config = trangThaiConfig[item.trangThaiDoiSoat];
              const StatusIcon = config.icon;
              return (
                <tr key={item.id} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                  <td className="px-3 py-3 text-sm text-gray-600">{item.id}</td>
                  <td className="px-3 py-3 text-sm font-mono text-gray-700">{item.maGiaoDich || <span className="text-gray-400 italic">N/A</span>}</td>
                  <td className="px-3 py-3 text-sm font-mono text-gray-700">{item.madonhang || <span className="text-gray-400 italic">N/A</span>}</td>
                  <td className="px-3 py-3 text-sm text-right font-medium text-gray-800">{formatCurrency(item.soTienHeThong)}</td>
                  <td className="px-3 py-3 text-sm text-right font-medium text-gray-800">{formatCurrency(item.soTienVNPay)}</td>
                  <td className="px-3 py-3 text-xs">{item.trangThaiHeThong}</td>
                  <td className="px-3 py-3 text-xs">
                    {item.trangThaiVNPay === '00' ? (
                      <span className="text-green-600">Thành công (00)</span>
                    ) : (
                      <span className="text-gray-400">{item.trangThaiVNPay}</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                      <StatusIcon className="text-xs" />
                      {config.label}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500">{item.ngayGiaoDich}</td>
                  <td className="px-3 py-3 text-center">
                    <button
                      onClick={() => loadDetail(item)}
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
      ) : (
      /* Card view */
      !loading && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => {
          const config = trangThaiConfig[item.trangThaiDoiSoat];
          const StatusIcon = config.icon;
          const chenhLech = Math.abs(item.soTienHeThong - item.soTienVNPay);
          return (
            <div key={item.id} className={`border rounded-xl p-4 hover:shadow-md transition-all bg-white ${
              item.trangThaiDoiSoat === 'khop' ? 'border-green-200' : 'border-red-200'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono text-sm font-medium text-gray-800">{item.maGiaoDich || 'N/A'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Đơn hàng: {item.madonhang || 'N/A'}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
                  <StatusIcon className="text-xs" />
                  {config.label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-blue-50 rounded-lg p-2.5">
                  <p className="text-xs text-blue-600">Số tiền HT</p>
                  <p className="font-medium text-sm text-blue-700">{formatCurrency(item.soTienHeThong)}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-2.5">
                  <p className="text-xs text-green-600">Số tiền VNPay</p>
                  <p className="font-medium text-sm text-green-700">{formatCurrency(item.soTienVNPay)}</p>
                </div>
              </div>
              {chenhLech > 0 && (
                <div className="bg-red-50 rounded-lg p-2 mb-3">
                  <p className="text-xs text-red-600 font-medium">Chênh lệch: {formatCurrency(chenhLech)}</p>
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <FaCalendar className="text-gray-400" />
                  <span>{item.ngayGiaoDich}</span>
                </div>
                <button onClick={() => loadDetail(item)} className="flex items-center gap-1 px-3 py-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 font-medium transition-colors">
                  <FaEye /> Chi tiết
                </button>
              </div>
              {item.ghiChu && (
                <p className="text-xs text-yellow-700 bg-yellow-50 rounded-lg p-2 mt-2 line-clamp-2">{item.ghiChu}</p>
              )}
            </div>
          );
        })}
        </div>
      )
      )}

      {/* Phân trang phía dưới */}
      {!loading && filteredData.length > 0 && Math.ceil(filteredData.length / itemsPerPage) > 1 && (
        <div className="flex justify-center mt-4">
          <nav>
            <ul className="flex gap-2">
              <li><button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium">← Trước</button></li>
              {[...Array(Math.ceil(filteredData.length / itemsPerPage))].map((_, i) => (
                <li key={i}><button onClick={() => setCurrentPage(i + 1)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}>{i + 1}</button></li>
              ))}
              <li><button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)} className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium">Sau →</button></li>
            </ul>
          </nav>
        </div>
      )}

      {!loading && filteredData.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FaExchangeAlt className="text-4xl mx-auto mb-3 text-gray-300" />
          <p>Không tìm thấy giao dịch nào phù hợp</p>
        </div>
      )}

      {/* Modal chi tiết */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-10" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 p-6 my-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Chi tiết đối soát</h3>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            
            {loadingDetail ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Đang tải...</span>
              </div>
            ) : (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {/* Thông tin cơ bản */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Mã GD VNPay</p>
                    <p className="font-mono font-medium">{selectedItem.maGiaoDich || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Mã đơn hàng</p>
                    <p className="font-mono font-medium">{selectedItem.madonhang || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">PNR</p>
                    <p className="font-mono font-medium">{selectedItemDetail?.pnr || selectedItem.pnr || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Trạng thái đối soát</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      trangThaiConfig[selectedItem.trangThaiDoiSoat]?.color || 'bg-gray-100 text-gray-700'
                    }`}>
                      {trangThaiConfig[selectedItem.trangThaiDoiSoat]?.label || 'Không xác định'}
                    </span>
                  </div>
                </div>

                {/* So sánh số tiền */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-600 text-xs font-medium mb-1">Số tiền hệ thống</p>
                    <p className="text-lg font-bold text-blue-700">{formatCurrency(selectedItem.soTienHeThong)}</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-600 text-xs font-medium mb-1">Số tiền VNPay</p>
                    <p className="text-lg font-bold text-green-700">{formatCurrency(selectedItem.soTienVNPay)}</p>
                  </div>
                </div>

                {Math.abs(selectedItem.soTienHeThong - selectedItem.soTienVNPay) > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-xs font-medium mb-1">Chênh lệch</p>
                    <p className="text-lg font-bold text-red-700">
                      {formatCurrency(Math.abs(selectedItem.soTienHeThong - selectedItem.soTienVNPay))}
                    </p>
                  </div>
                )}

                {/* Thông tin khác */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Ngày giao dịch</p>
                    <p className="font-medium">{selectedItem.ngayGiaoDich}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Email người đặt</p>
                    <p className="font-medium">{selectedItemDetail?.emailNguoiDat || 'N/A'}</p>
                  </div>
                </div>

                {/* VNPay Logs Timeline */}
                {selectedItem.maGiaoDich && (
                  <div className="border-t pt-4">
                    <VNPayLogTimeline txnRef={selectedItem.maGiaoDich} />
                  </div>
                )}

                {/* Ghi chú xử lý */}
                {selectedItem.ghiChu && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-yellow-600 font-semibold mb-1">Ghi chú hiện tại</p>
                    <p className="text-sm text-yellow-800">{selectedItem.ghiChu}</p>
                  </div>
                )}

                {/* Form cập nhật ghi chú */}
                {selectedItem.trangThaiDoiSoat !== 'khop' && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Cập nhật xử lý</p>
                    <ReconciliationNoteForm 
                      itemId={selectedItem.id}
                      onSuccess={() => {
                        loadData();
                        loadThongKe();
                        setSelectedItem(null);
                        showToast('Đã cập nhật ghi chú xử lý', 'success');
                      }}
                      onCancel={() => setSelectedItem(null)}
                    />
                  </div>
                )}

                {/* Nút đóng */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default DoiSoatGiaoDich;
