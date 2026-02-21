import { useState } from 'react';
import {
  FaSearch,
  FaEnvelope,
  FaEnvelopeOpen,
  FaReply,
  FaEye,
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaUser,
  FaPhone,
  FaTag,
  FaFilter,
  FaInfoCircle,
  FaInbox,
  FaPaperPlane,
  FaTimes,
  FaExclamationCircle
} from 'react-icons/fa';
import Card from '../../components/QuanLy/CardChucNang';
import Toast from '../../components/common/Toast';
import ViewToggleButton from '../../components/common/ViewToggleButton';
import useViewToggle from '../../hooks/useViewToggle';

// Dữ liệu mẫu yêu cầu hỗ trợ
const mockSupportRequests = [
  {
    id: 1,
    hoTen: 'Nguyễn Văn An',
    email: 'nguyenvana@example.com',
    soDienThoai: '0909123456',
    chuDe: 'Không nhận được vé điện tử sau khi thanh toán',
    danhMuc: 'thanh_toan',
    noiDung: 'Tôi đã thanh toán đơn hàng PNR: ABC123 vào ngày 15/02/2026 nhưng chưa nhận được email xác nhận và vé điện tử. Số tiền đã bị trừ trong tài khoản ngân hàng. Vui lòng kiểm tra giúp tôi.',
    trangThai: 'moi',
    mucDoUuTien: 'cao',
    ngayGui: '2026-02-20 09:30:00',
    ngayCapNhat: '2026-02-20 09:30:00',
    nguoiXuLy: null,
    phanHoi: null,
    maDonHang: 'ABC123'
  },
  {
    id: 2,
    hoTen: 'Lê Thị Bình',
    email: 'lethibinh@example.com',
    soDienThoai: '0912345678',
    chuDe: 'Yêu cầu đổi tên hành khách trên vé',
    danhMuc: 'dat_ve',
    noiDung: 'Tôi đã đặt vé cho đơn hàng PNR: DEF456 nhưng nhập sai tên hành khách. Tên đúng phải là "Lê Thị Bình" thay vì "Lê Thị Binh". Xin hỗ trợ đổi tên.',
    trangThai: 'dang_xu_ly',
    mucDoUuTien: 'trung_binh',
    ngayGui: '2026-02-19 14:20:00',
    ngayCapNhat: '2026-02-20 10:00:00',
    nguoiXuLy: 'Nhân viên A',
    phanHoi: 'Chúng tôi đã nhận yêu cầu và đang xử lý. Vui lòng đợi 24h.',
    maDonHang: 'DEF456'
  },
  {
    id: 3,
    hoTen: 'Trần Văn Cường',
    email: 'tranvancuong@example.com',
    soDienThoai: '0987654321',
    chuDe: 'Hỏi về chính sách hành lý ký gửi',
    danhMuc: 'thong_tin',
    noiDung: 'Tôi muốn hỏi về chính sách hành lý ký gửi cho chuyến bay SGN-HAN. Mỗi hành khách được mang bao nhiêu kg? Có phí phụ trội không?',
    trangThai: 'da_tra_loi',
    mucDoUuTien: 'thap',
    ngayGui: '2026-02-18 11:00:00',
    ngayCapNhat: '2026-02-18 15:30:00',
    nguoiXuLy: 'Nhân viên B',
    phanHoi: 'Mỗi hành khách hạng Economy được mang 23kg hành lý ký gửi miễn phí. Hành lý vượt cân sẽ tính phí 50.000 VNĐ/kg. Hạng Business được 32kg. Chi tiết xem tại trang Hỗ trợ.',
    maDonHang: null
  },
  {
    id: 4,
    hoTen: 'Phạm Thị Dung',
    email: 'phamthidung@example.com',
    soDienThoai: '0976543210',
    chuDe: 'Yêu cầu hoàn tiền - chuyến bay bị hủy',
    danhMuc: 'hoan_tien',
    noiDung: 'Chuyến bay SG-HN ngày 25/02/2026 của tôi bị hủy. Tôi yêu cầu hoàn toàn bộ tiền vé. PNR: GHI789.',
    trangThai: 'moi',
    mucDoUuTien: 'cao',
    ngayGui: '2026-02-20 16:45:00',
    ngayCapNhat: '2026-02-20 16:45:00',
    nguoiXuLy: null,
    phanHoi: null,
    maDonHang: 'GHI789'
  },
  {
    id: 5,
    hoTen: 'Hoàng Minh Em',
    email: 'hoangminhem@example.com',
    soDienThoai: '0965432109',
    chuDe: 'Không thể check-in online',
    danhMuc: 'check_in',
    noiDung: 'Tôi cố gắng check-in online cho chuyến bay ngày mai nhưng hệ thống báo lỗi "Không tìm thấy đặt chỗ". PNR: JKL012, CCCD: 012345678901.',
    trangThai: 'dang_xu_ly',
    mucDoUuTien: 'cao',
    ngayGui: '2026-02-20 20:00:00',
    ngayCapNhat: '2026-02-21 08:00:00',
    nguoiXuLy: 'Nhân viên A',
    phanHoi: null,
    maDonHang: 'JKL012'
  },
  {
    id: 6,
    hoTen: 'Nguyễn Thị Fam',
    email: 'nguyenthifam@example.com',
    soDienThoai: '0909876543',
    chuDe: 'Cảm ơn dịch vụ tốt',
    danhMuc: 'gop_y',
    noiDung: 'Mình muốn gửi lời cảm ơn đến hãng vì dịch vụ rất tốt, nhân viên nhiệt tình. Sẽ tiếp tục sử dụng dịch vụ.',
    trangThai: 'da_dong',
    mucDoUuTien: 'thap',
    ngayGui: '2026-02-17 09:00:00',
    ngayCapNhat: '2026-02-17 10:00:00',
    nguoiXuLy: 'Admin',
    phanHoi: 'Cảm ơn bạn rất nhiều! Chúng tôi rất vui khi nhận được phản hồi tích cực từ bạn.',
    maDonHang: null
  }
];

// Config trạng thái
const trangThaiConfig = {
  moi: { label: 'Mới', color: 'bg-blue-100 text-blue-700', icon: FaEnvelope },
  dang_xu_ly: { label: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-700', icon: FaSpinner },
  da_tra_loi: { label: 'Đã trả lời', color: 'bg-green-100 text-green-700', icon: FaReply },
  da_dong: { label: 'Đã đóng', color: 'bg-gray-100 text-gray-600', icon: FaCheckCircle }
};

// Config mức độ ưu tiên
const mucDoConfig = {
  cao: { label: 'Cao', color: 'bg-red-100 text-red-700' },
  trung_binh: { label: 'Trung bình', color: 'bg-yellow-100 text-yellow-700' },
  thap: { label: 'Thấp', color: 'bg-green-100 text-green-700' }
};

// Config danh mục
const danhMucConfig = {
  thanh_toan: { label: 'Thanh toán', color: 'text-orange-600' },
  dat_ve: { label: 'Đặt vé', color: 'text-blue-600' },
  hoan_tien: { label: 'Hoàn tiền', color: 'text-red-600' },
  check_in: { label: 'Check-in', color: 'text-purple-600' },
  thong_tin: { label: 'Thông tin chung', color: 'text-gray-600' },
  gop_y: { label: 'Góp ý', color: 'text-green-600' }
};

const HoTroLienHe = () => {
  const [search, setSearch] = useState('');
  const [filterTrangThai, setFilterTrangThai] = useState('all');
  const [filterDanhMuc, setFilterDanhMuc] = useState('all');
  const [requests] = useState(mockSupportRequests);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [replyText, setReplyText] = useState('');
  const { viewMode, setViewMode } = useViewToggle('ho-tro-lien-he-view', 'grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isSending, setIsSending] = useState(false);

  // Toast
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  // Lọc
  const filteredRequests = requests.filter(req => {
    const matchSearch =
      req.hoTen.toLowerCase().includes(search.toLowerCase()) ||
      req.email.toLowerCase().includes(search.toLowerCase()) ||
      req.chuDe.toLowerCase().includes(search.toLowerCase()) ||
      (req.maDonHang?.toLowerCase() || '').includes(search.toLowerCase());
    const matchTrangThai = filterTrangThai === 'all' || req.trangThai === filterTrangThai;
    const matchDanhMuc = filterDanhMuc === 'all' || req.danhMuc === filterDanhMuc;
    return matchSearch && matchTrangThai && matchDanhMuc;
  });

  // Thống kê
  const stats = {
    tongSo: requests.length,
    moi: requests.filter(r => r.trangThai === 'moi').length,
    dangXuLy: requests.filter(r => r.trangThai === 'dang_xu_ly').length,
    daTraLoi: requests.filter(r => r.trangThai === 'da_tra_loi').length,
    daDong: requests.filter(r => r.trangThai === 'da_dong').length
  };

  // Gửi phản hồi (mock)
  const handleReply = () => {
    if (!replyText.trim()) {
      showToast('Vui lòng nhập nội dung phản hồi', 'error');
      return;
    }
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      showToast('Đã gửi phản hồi thành công! Email đã được gửi cho khách hàng.');
      setReplyText('');
      setSelectedRequest(null);
    }, 1500);
  };

  return (
    <Card title="Hỗ trợ / Liên hệ">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />

      {/* Thống kê */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <FaInbox className="text-blue-600 text-xl mx-auto mb-1" />
          <p className="text-2xl font-bold text-blue-700">{stats.tongSo}</p>
          <p className="text-xs text-blue-600">Tổng yêu cầu</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
          <FaEnvelope className="text-indigo-600 text-xl mx-auto mb-1" />
          <p className="text-2xl font-bold text-indigo-700">{stats.moi}</p>
          <p className="text-xs text-indigo-600">Mới</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <FaClock className="text-yellow-600 text-xl mx-auto mb-1" />
          <p className="text-2xl font-bold text-yellow-700">{stats.dangXuLy}</p>
          <p className="text-xs text-yellow-600">Đang xử lý</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <FaReply className="text-green-600 text-xl mx-auto mb-1" />
          <p className="text-2xl font-bold text-green-700">{stats.daTraLoi}</p>
          <p className="text-xs text-green-600">Đã trả lời</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <FaCheckCircle className="text-gray-500 text-xl mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-700">{stats.daDong}</p>
          <p className="text-xs text-gray-500">Đã đóng</p>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, chủ đề, mã đơn hàng..."
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
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="moi">Mới</option>
            <option value="dang_xu_ly">Đang xử lý</option>
            <option value="da_tra_loi">Đã trả lời</option>
            <option value="da_dong">Đã đóng</option>
          </select>
          <select
            value={filterDanhMuc}
            onChange={(e) => setFilterDanhMuc(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Tất cả danh mục</option>
            <option value="thanh_toan">Thanh toán</option>
            <option value="dat_ve">Đặt vé</option>
            <option value="hoan_tien">Hoàn tiền</option>
            <option value="check_in">Check-in</option>
            <option value="thong_tin">Thông tin chung</option>
            <option value="gop_y">Góp ý</option>
          </select>
        </div>
        <ViewToggleButton currentView={viewMode} onViewChange={(v) => { setViewMode(v); setCurrentPage(1); }} />
      </div>

      {/* Pagination header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">Hiển thị {Math.min(filteredRequests.length, itemsPerPage)} / {filteredRequests.length} yêu cầu</p>
        <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
          <option value={5}>5 / trang</option>
          <option value={10}>10 / trang</option>
          <option value={20}>20 / trang</option>
        </select>
      </div>

      {/* Danh sách yêu cầu */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FaInbox className="text-4xl mx-auto mb-3 text-gray-300" />
          <p>Không có yêu cầu hỗ trợ nào</p>
        </div>
      ) : viewMode === 'grid' ? (
      <div className="space-y-3">
          {filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((req) => {
            const trangThai = trangThaiConfig[req.trangThai];
            const mucDo = mucDoConfig[req.mucDoUuTien];
            const danhMuc = danhMucConfig[req.danhMuc];
            const StatusIcon = trangThai.icon;

            return (
              <div
                key={req.id}
                className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                  req.trangThai === 'moi'
                    ? 'border-blue-200 bg-blue-50/50'
                    : req.trangThai === 'dang_xu_ly'
                    ? 'border-yellow-200 bg-yellow-50/30'
                    : 'border-gray-200 bg-white'
                }`}
                onClick={() => setSelectedRequest(req)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {req.trangThai === 'moi' && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                      )}
                      <h4 className="font-semibold text-gray-800 truncate">{req.chuDe}</h4>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <FaUser className="text-gray-400" />
                        {req.hoTen}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaEnvelope className="text-gray-400" />
                        {req.email}
                      </span>
                      {req.maDonHang && (
                        <span className="flex items-center gap-1 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                          PNR: {req.maDonHang}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{req.noiDung}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${trangThai.color}`}>
                      <StatusIcon className={`text-xs ${req.trangThai === 'dang_xu_ly' ? 'animate-spin' : ''}`} />
                      {trangThai.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${mucDo.color}`}>
                      {mucDo.label}
                    </span>
                    <span className={`text-xs font-medium ${danhMuc.color}`}>
                      {danhMuc.label}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <FaClock />
                      {req.ngayGui.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Khách hàng</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Chủ đề</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Danh mục</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Ưu tiên</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Trạng thái</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Ngày gửi</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((req, index) => {
                const trangThai = trangThaiConfig[req.trangThai];
                const mucDo = mucDoConfig[req.mucDoUuTien];
                const danhMuc = danhMucConfig[req.danhMuc];
                const StatusIcon = trangThai.icon;
                return (
                  <tr key={req.id} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50`}>
                    <td className="px-4 py-3 text-sm text-gray-600">{req.id}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">{req.hoTen}</p>
                      <p className="text-xs text-gray-500">{req.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-800 line-clamp-1">{req.chuDe}</p>
                      {req.maDonHang && <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">PNR: {req.maDonHang}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${danhMuc.color}`}>{danhMuc.label}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${mucDo.color}`}>{mucDo.label}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${trangThai.color}`}>
                        <StatusIcon className={`text-xs ${req.trangThai === 'dang_xu_ly' ? 'animate-spin' : ''}`} />
                        {trangThai.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{req.ngayGui.split(' ')[0]}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => setSelectedRequest(req)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg" title="Xem chi tiết">
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {(() => {
        const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
        if (totalPages <= 1) return null;
        return (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-100">← Trước</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 rounded-lg text-sm font-medium ${page === currentPage ? 'bg-blue-600 text-white' : 'border hover:bg-gray-100'}`}>{page}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-100">Sau →</button>
          </div>
        );
      })()}

      {/* Modal chi tiết yêu cầu */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setSelectedRequest(null); setReplyText(''); }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-bold text-gray-800">
                Chi tiết yêu cầu hỗ trợ #{selectedRequest.id}
              </h3>
              <button onClick={() => { setSelectedRequest(null); setReplyText(''); }} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              {/* Thông tin khách hàng */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Thông tin khách hàng</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-gray-400" />
                    <span>{selectedRequest.hoTen}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-gray-400" />
                    <span className="text-blue-600">{selectedRequest.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-gray-400" />
                    <span>{selectedRequest.soDienThoai}</span>
                  </div>
                  {selectedRequest.maDonHang && (
                    <div className="flex items-center gap-2">
                      <FaTag className="text-gray-400" />
                      <span className="font-mono">PNR: {selectedRequest.maDonHang}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Nội dung yêu cầu */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-sm font-semibold text-gray-700">Chủ đề:</h4>
                  <span className="text-sm">{selectedRequest.chuDe}</span>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-gray-700">
                  {selectedRequest.noiDung}
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>Gửi lúc: {selectedRequest.ngayGui}</span>
                  {selectedRequest.nguoiXuLy && (
                    <span>Người xử lý: {selectedRequest.nguoiXuLy}</span>
                  )}
                </div>
              </div>

              {/* Phản hồi đã có */}
              {selectedRequest.phanHoi && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Phản hồi</h4>
                  <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-sm text-gray-700">
                    <div className="flex items-center gap-2 text-xs text-green-600 mb-2">
                      <FaReply />
                      <span>{selectedRequest.nguoiXuLy} - {selectedRequest.ngayCapNhat}</span>
                    </div>
                    {selectedRequest.phanHoi}
                  </div>
                </div>
              )}

              {/* Form trả lời */}
              {selectedRequest.trangThai !== 'da_dong' && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    {selectedRequest.phanHoi ? 'Trả lời thêm' : 'Trả lời'}
                  </h4>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                    placeholder="Nhập nội dung phản hồi cho khách hàng..."
                  />
                  <div className="flex justify-end gap-3 mt-3">
                    <button
                      onClick={() => { setSelectedRequest(null); setReplyText(''); }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium"
                    >
                      Đóng
                    </button>
                    <button
                      onClick={handleReply}
                      disabled={isSending}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium ${
                        isSending ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isSending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                      {isSending ? 'Đang gửi...' : 'Gửi phản hồi'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default HoTroLienHe;
