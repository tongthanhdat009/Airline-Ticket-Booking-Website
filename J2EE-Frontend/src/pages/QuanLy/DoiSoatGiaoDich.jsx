import { useState } from 'react';
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
  FaDollarSign
} from 'react-icons/fa';
import Card from '../../components/QuanLy/CardChucNang';
import Toast from '../../components/common/Toast';
import ViewToggleButton from '../../components/common/ViewToggleButton';
import { useViewToggle } from '../../hooks/useViewToggle';

// Dữ liệu mẫu đối soát giao dịch
const mockReconciliationData = [
  {
    id: 1,
    maGiaoDich: 'VNP-20260215-001',
    madonhang: 'ABC-2026-0215',
    pnr: 'PNR001',
    soTienHeThong: 2500000,
    soTienVNPay: 2500000,
    trangThaiHeThong: 'ĐÃ THANH TOÁN',
    trangThaiVNPay: '00',
    trangThaiDoiSoat: 'khop',
    ngayGiaoDich: '2026-02-15 10:30:00',
    ngayDoiSoat: '2026-02-16 02:00:00',
    ghiChu: ''
  },
  {
    id: 2,
    maGiaoDich: 'VNP-20260215-002',
    madonhang: 'DEF-2026-0215',
    pnr: 'PNR002',
    soTienHeThong: 3500000,
    soTienVNPay: 3500000,
    trangThaiHeThong: 'CHỜ THANH TOÁN',
    trangThaiVNPay: '00',
    trangThaiDoiSoat: 'lech_trang_thai',
    ngayGiaoDich: '2026-02-15 14:20:00',
    ngayDoiSoat: '2026-02-16 02:00:00',
    ghiChu: 'VNPay báo thành công nhưng hệ thống chưa cập nhật. Đã tự động xử lý.'
  },
  {
    id: 3,
    maGiaoDich: 'VNP-20260216-001',
    madonhang: 'GHI-2026-0216',
    pnr: 'PNR003',
    soTienHeThong: 1000000,
    soTienVNPay: 1050000,
    trangThaiHeThong: 'ĐÃ THANH TOÁN',
    trangThaiVNPay: '00',
    trangThaiDoiSoat: 'lech_so_tien',
    ngayGiaoDich: '2026-02-16 09:15:00',
    ngayDoiSoat: '2026-02-17 02:00:00',
    ghiChu: 'Chênh lệch 50,000 VNĐ - cần kiểm tra thủ công'
  },
  {
    id: 4,
    maGiaoDich: 'VNP-20260216-002',
    madonhang: null,
    pnr: null,
    soTienHeThong: 0,
    soTienVNPay: 5000000,
    trangThaiHeThong: 'KHÔNG TÌM THẤY',
    trangThaiVNPay: '00',
    trangThaiDoiSoat: 'chi_co_vnpay',
    ngayGiaoDich: '2026-02-16 11:30:00',
    ngayDoiSoat: '2026-02-17 02:00:00',
    ghiChu: 'Giao dịch tồn tại trên VNPay nhưng không có đơn hàng tương ứng trên hệ thống'
  },
  {
    id: 5,
    maGiaoDich: 'VNP-20260217-001',
    madonhang: 'JKL-2026-0217',
    pnr: 'PNR005',
    soTienHeThong: 1500000,
    soTienVNPay: 1500000,
    trangThaiHeThong: 'ĐÃ THANH TOÁN',
    trangThaiVNPay: '00',
    trangThaiDoiSoat: 'khop',
    ngayGiaoDich: '2026-02-17 16:45:00',
    ngayDoiSoat: '2026-02-18 02:00:00',
    ghiChu: ''
  },
  {
    id: 6,
    maGiaoDich: null,
    madonhang: 'MNO-2026-0218',
    pnr: 'PNR006',
    soTienHeThong: 2000000,
    soTienVNPay: 0,
    trangThaiHeThong: 'ĐÃ THANH TOÁN',
    trangThaiVNPay: 'KHÔNG TÌM THẤY',
    trangThaiDoiSoat: 'chi_co_he_thong',
    ngayGiaoDich: '2026-02-18 08:00:00',
    ngayDoiSoat: '2026-02-19 02:00:00',
    ghiChu: 'Đơn hàng có trạng thái thanh toán nhưng VNPay không ghi nhận. Cần kiểm tra IPN.'
  },
  {
    id: 7,
    maGiaoDich: 'VNP-20260219-001',
    madonhang: 'STU-2026-0219',
    pnr: 'PNR007',
    soTienHeThong: 4000000,
    soTienVNPay: 4000000,
    trangThaiHeThong: 'ĐÃ THANH TOÁN',
    trangThaiVNPay: '00',
    trangThaiDoiSoat: 'khop',
    ngayGiaoDich: '2026-02-19 13:10:00',
    ngayDoiSoat: '2026-02-20 02:00:00',
    ghiChu: ''
  },
  {
    id: 8,
    maGiaoDich: 'VNP-20260220-001',
    madonhang: 'VWX-2026-0220',
    pnr: 'PNR008',
    soTienHeThong: 3000000,
    soTienVNPay: 3000000,
    trangThaiHeThong: 'ĐÃ HỦY',
    trangThaiVNPay: '00',
    trangThaiDoiSoat: 'lech_trang_thai',
    ngayGiaoDich: '2026-02-20 10:15:00',
    ngayDoiSoat: '2026-02-21 02:00:00',
    ghiChu: 'Đơn hàng đã hủy nhưng VNPay báo thành công. Cần hoàn tiền.'
  }
];

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
  const [tuNgay, setTuNgay] = useState('2026-02-15');
  const [denNgay, setDenNgay] = useState('2026-02-21');
  const [isReconciling, setIsReconciling] = useState(false);
  const [data] = useState(mockReconciliationData);
  const [selectedItem, setSelectedItem] = useState(null);
  const { viewMode, setViewMode: handleViewChange } = useViewToggle('doi-soat-gd-view', 'table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Toast state
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  });

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  // Lọc dữ liệu
  const filteredData = data.filter(item => {
    const matchSearch =
      (item.maGiaoDich?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (item.madonhang?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (item.pnr?.toLowerCase() || '').includes(search.toLowerCase());
    const matchStatus = filterTrangThai === 'all' || item.trangThaiDoiSoat === filterTrangThai;
    return matchSearch && matchStatus;
  });

  // Thống kê
  const stats = {
    tongSo: data.length,
    khop: data.filter(d => d.trangThaiDoiSoat === 'khop').length,
    lech: data.filter(d => d.trangThaiDoiSoat !== 'khop').length,
    tongTienLech: data
      .filter(d => d.trangThaiDoiSoat !== 'khop')
      .reduce((sum, d) => sum + Math.abs(d.soTienHeThong - d.soTienVNPay), 0)
  };

  // Chạy đối soát (mock)
  const handleReconcile = () => {
    setIsReconciling(true);
    setTimeout(() => {
      setIsReconciling(false);
      showToast('Đối soát hoàn tất! Đã xử lý 8 giao dịch.', 'success');
    }, 3000);
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
              <p className="text-2xl font-bold text-blue-700">{stats.tongSo}</p>
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
              <p className="text-2xl font-bold text-green-700">{stats.khop}</p>
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
              <p className="text-2xl font-bold text-red-700">{stats.lech}</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FaDollarSign className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-orange-600">Tổng tiền lệch</p>
              <p className="text-2xl font-bold text-orange-700">{formatCurrency(stats.tongTienLech)}</p>
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
      </div>

      {/* Toggle view + Phân trang */}
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

      {/* Bảng đối soát - Table view */}
      {viewMode === 'table' ? (
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
                      onClick={() => setSelectedItem(item)}
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
                <button onClick={() => setSelectedItem(item)} className="flex items-center gap-1 px-3 py-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 font-medium transition-colors">
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
      )}

      {/* Phân trang phía dưới */}
      {filteredData.length > 0 && Math.ceil(filteredData.length / itemsPerPage) > 1 && (
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

      {filteredData.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FaExchangeAlt className="text-4xl mx-auto mb-3 text-gray-300" />
          <p>Không tìm thấy giao dịch nào phù hợp</p>
        </div>
      )}

      {/* Modal chi tiết */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Chi tiết đối soát</h3>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500">Mã GD VNPay</p>
                  <p className="font-mono font-medium">{selectedItem.maGiaoDich || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500">Mã đơn hàng</p>
                  <p className="font-mono font-medium">{selectedItem.madonhang || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500">Số tiền hệ thống</p>
                  <p className="font-medium text-blue-600">{formatCurrency(selectedItem.soTienHeThong)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500">Số tiền VNPay</p>
                  <p className="font-medium text-green-600">{formatCurrency(selectedItem.soTienVNPay)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500">Ngày giao dịch</p>
                  <p className="font-medium">{selectedItem.ngayGiaoDich}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500">Ngày đối soát</p>
                  <p className="font-medium">{selectedItem.ngayDoiSoat}</p>
                </div>
              </div>
              {selectedItem.ghiChu && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-600 font-semibold mb-1">Ghi chú</p>
                  <p className="text-sm text-yellow-800">{selectedItem.ghiChu}</p>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                {selectedItem.trangThaiDoiSoat !== 'khop' && (
                  <button
                    onClick={() => {
                      showToast('Đã đánh dấu xử lý thủ công', 'success');
                      setSelectedItem(null);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Đánh dấu đã xử lý
                  </button>
                )}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
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

export default DoiSoatGiaoDich;
