import { useState } from 'react';
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaImage,
  FaNewspaper,
  FaEye,
  FaEyeSlash,
  FaCalendar,
  FaInfoCircle,
  FaArrowUp,
  FaArrowDown,
  FaLink,
  FaTimes,
  FaSave
} from 'react-icons/fa';
import Card from '../../components/QuanLy/CardChucNang';
import Toast from '../../components/common/Toast';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ViewToggleButton from '../../components/common/ViewToggleButton';
import { useViewToggle } from '../../hooks/useViewToggle';

// Dữ liệu mẫu Banner
const mockBanners = [
  {
    id: 1,
    tieuDe: 'Khuyến mãi Tết 2026 - Giảm đến 30%',
    moTa: 'Đặt vé sớm nhận ngay ưu đãi khủng cho Tết Nguyên Đán 2026',
    hinhAnh: 'https://placehold.co/1200x400/2563eb/ffffff?text=Khuyen+Mai+Tet+2026',
    linkUrl: '/khuyen-mai',
    viTri: 'hero',
    thuTu: 1,
    trangThai: true,
    ngayBatDau: '2026-01-15',
    ngayKetThuc: '2026-02-28',
    ngayTao: '2026-01-10 09:00:00'
  },
  {
    id: 2,
    tieuDe: 'Chính sách hành lý mới 2026',
    moTa: 'Cập nhật quy định hành lý xách tay và ký gửi áp dụng từ 01/03/2026',
    hinhAnh: 'https://placehold.co/1200x400/059669/ffffff?text=Chinh+Sach+Hanh+Ly+Moi',
    linkUrl: '/ho-tro',
    viTri: 'hero',
    thuTu: 2,
    trangThai: true,
    ngayBatDau: '2026-02-01',
    ngayKetThuc: '2026-04-30',
    ngayTao: '2026-01-25 14:00:00'
  },
  {
    id: 3,
    tieuDe: 'Bay đến Đà Nẵng chỉ từ 990K',
    moTa: 'Đặt vé ngay để khám phá thành phố đáng sống nhất Việt Nam',
    hinhAnh: 'https://placehold.co/1200x400/d97706/ffffff?text=Da+Nang+990K',
    linkUrl: '/chon-chuyen-bay',
    viTri: 'hero',
    thuTu: 3,
    trangThai: false,
    ngayBatDau: '2026-02-15',
    ngayKetThuc: '2026-03-15',
    ngayTao: '2026-02-10 10:00:00'
  },
  {
    id: 4,
    tieuDe: 'Online Check-in mở cửa 24h trước giờ bay',
    moTa: 'Tiết kiệm thời gian với check-in trực tuyến tiện lợi',
    hinhAnh: 'https://placehold.co/600x300/7c3aed/ffffff?text=Online+Check-in',
    linkUrl: '/online-check-in',
    viTri: 'sidebar',
    thuTu: 1,
    trangThai: true,
    ngayBatDau: '2026-01-01',
    ngayKetThuc: '2026-12-31',
    ngayTao: '2026-01-01 08:00:00'
  }
];

// Dữ liệu mẫu Tin tức
const mockTinTuc = [
  {
    id: 1,
    tieuDe: 'JadT Airlines khai trương đường bay mới Hà Nội - Phú Quốc',
    tomTat: 'Từ ngày 15/03/2026, JadT Airlines chính thức khai thác đường bay thẳng Hà Nội - Phú Quốc với tần suất 2 chuyến/ngày.',
    noiDung: 'Nội dung chi tiết bài viết...',
    hinhAnh: 'https://placehold.co/800x400/0ea5e9/ffffff?text=Duong+Bay+Moi',
    danhMuc: 'Tin tức',
    trangThai: 'da_xuat_ban',
    ngayDang: '2026-02-20 10:00:00',
    luotXem: 1250,
    tacGia: 'Admin'
  },
  {
    id: 2,
    tieuDe: 'Cập nhật quy định mang hành lý xách tay',
    tomTat: 'Kể từ 01/03/2026, hành khách được mang theo 01 kiện hành lý xách tay tối đa 7kg và 01 túi cá nhân.',
    noiDung: 'Nội dung chi tiết bài viết...',
    hinhAnh: 'https://placehold.co/800x400/f59e0b/ffffff?text=Hanh+Ly',
    danhMuc: 'Thông báo',
    trangThai: 'da_xuat_ban',
    ngayDang: '2026-02-18 14:30:00',
    luotXem: 890,
    tacGia: 'Marketing'
  },
  {
    id: 3,
    tieuDe: 'Chương trình thành viên JadT Rewards ra mắt',
    tomTat: 'Tích điểm mỗi chuyến bay, đổi vé miễn phí và nhận nhiều ưu đãi hấp dẫn.',
    noiDung: 'Nội dung chi tiết bài viết...',
    hinhAnh: 'https://placehold.co/800x400/8b5cf6/ffffff?text=JadT+Rewards',
    danhMuc: 'Khuyến mãi',
    trangThai: 'ban_nhap',
    ngayDang: null,
    luotXem: 0,
    tacGia: 'Marketing'
  }
];

const QuanLyBannerTinTuc = () => {
  const [activeTab, setActiveTab] = useState('banner');
  const [banners, setBanners] = useState(mockBanners);
  const [tinTuc] = useState(mockTinTuc);
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { viewMode, setViewMode: handleViewChange } = useViewToggle('banner-tin-tuc-view', 'grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Form state cho Banner
  const [bannerForm, setBannerForm] = useState({
    tieuDe: '',
    moTa: '',
    hinhAnh: '',
    linkUrl: '',
    viTri: 'hero',
    ngayBatDau: '',
    ngayKetThuc: '',
    trangThai: true
  });

  // Toast & Confirm
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({
    isVisible: false,
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'Xác nhận',
    onConfirm: null
  });

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  // Lọc dữ liệu
  const filteredBanners = banners.filter(b =>
    b.tieuDe.toLowerCase().includes(search.toLowerCase())
  );
  const filteredTinTuc = tinTuc.filter(t =>
    t.tieuDe.toLowerCase().includes(search.toLowerCase())
  );

  // Mở form tạo/sửa banner
  const openBannerForm = (banner = null) => {
    if (banner) {
      setEditingItem(banner);
      setBannerForm({
        tieuDe: banner.tieuDe,
        moTa: banner.moTa,
        hinhAnh: banner.hinhAnh,
        linkUrl: banner.linkUrl,
        viTri: banner.viTri,
        ngayBatDau: banner.ngayBatDau,
        ngayKetThuc: banner.ngayKetThuc,
        trangThai: banner.trangThai
      });
    } else {
      setEditingItem(null);
      setBannerForm({
        tieuDe: '',
        moTa: '',
        hinhAnh: '',
        linkUrl: '',
        viTri: 'hero',
        ngayBatDau: '',
        ngayKetThuc: '',
        trangThai: true
      });
    }
    setIsFormOpen(true);
  };

  // Lưu banner
  const handleSaveBanner = () => {
    if (!bannerForm.tieuDe.trim()) {
      showToast('Vui lòng nhập tiêu đề banner', 'error');
      return;
    }
    if (editingItem) {
      setBanners(prev => prev.map(b =>
        b.id === editingItem.id ? { ...b, ...bannerForm } : b
      ));
      showToast('Cập nhật banner thành công!');
    } else {
      const newBanner = {
        ...bannerForm,
        id: Date.now(),
        thuTu: banners.length + 1,
        ngayTao: new Date().toISOString()
      };
      setBanners(prev => [...prev, newBanner]);
      showToast('Thêm banner mới thành công!');
    }
    setIsFormOpen(false);
  };

  // Toggle trạng thái banner
  const toggleBannerStatus = (id) => {
    setBanners(prev => prev.map(b =>
      b.id === id ? { ...b, trangThai: !b.trangThai } : b
    ));
    showToast('Đã cập nhật trạng thái banner');
  };

  // Xóa banner
  const handleDeleteBanner = (id) => {
    setConfirmDialog({
      isVisible: true,
      title: 'Xóa banner',
      message: 'Bạn có chắc chắn muốn xóa banner này?',
      type: 'danger',
      confirmText: 'Xóa',
      onConfirm: () => {
        setBanners(prev => prev.filter(b => b.id !== id));
        showToast('Đã xóa banner thành công');
        setConfirmDialog(prev => ({ ...prev, isVisible: false }));
      }
    });
  };

  // Di chuyển thứ tự banner
  const moveBanner = (id, direction) => {
    const idx = banners.findIndex(b => b.id === id);
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === banners.length - 1)) return;
    const newBanners = [...banners];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newBanners[idx], newBanners[swapIdx]] = [newBanners[swapIdx], newBanners[idx]];
    newBanners.forEach((b, i) => (b.thuTu = i + 1));
    setBanners(newBanners);
  };

  return (
    <Card title="Quản lý Banner & Tin tức">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
      <ConfirmDialog
        isVisible={confirmDialog.isVisible}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText={confirmDialog.confirmText}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isVisible: false }))}
      />

      {/* Tab navigation */}
      <div className="flex border-b mb-6">
        {[
          { key: 'banner', label: 'Banner', icon: FaImage },
          { key: 'tin_tuc', label: 'Tin tức / Thông báo', icon: FaNewspaper }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Thanh tìm kiếm + toggle + nút thêm */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={activeTab === 'banner' ? 'Tìm banner...' : 'Tìm tin tức...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        <ViewToggleButton currentView={viewMode} onViewChange={handleViewChange} />
        <button
          onClick={() => activeTab === 'banner' ? openBannerForm() : showToast('Chức năng thêm tin tức đang phát triển', 'info')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
        >
          <FaPlus />
          {activeTab === 'banner' ? 'Thêm banner' : 'Thêm tin tức'}
        </button>
      </div>

      {/* Phân trang header */}
      {(() => {
        const currentData = activeTab === 'banner' ? filteredBanners : filteredTinTuc;
        const totalPages = Math.ceil(currentData.length / itemsPerPage);
        return currentData.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Hiển thị <span className="font-bold text-blue-600">{Math.min((currentPage - 1) * itemsPerPage + 1, currentData.length)}</span> đến <span className="font-bold text-blue-600">{Math.min(currentPage * itemsPerPage, currentData.length)}</span> của <span className="font-bold text-blue-600">{currentData.length}</span>
              </span>
              <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white">
                <option value={5}>5 / trang</option>
                <option value={10}>10 / trang</option>
                <option value={20}>20 / trang</option>
              </select>
            </div>
            {totalPages > 1 && (
              <nav>
                <ul className="flex gap-2">
                  <li><button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium">← Trước</button></li>
                  {[...Array(totalPages)].map((_, i) => (
                    <li key={i}><button onClick={() => setCurrentPage(i + 1)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}>{i + 1}</button></li>
                  ))}
                  <li><button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium">Sau →</button></li>
                </ul>
              </nav>
            )}
          </div>
        );
      })()}

      {/* Tab Banner */}
      {activeTab === 'banner' && (
        <>
          {filteredBanners.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FaImage className="text-4xl mx-auto mb-3 text-gray-300" />
              <p>Chưa có banner nào</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="space-y-4">
              {filteredBanners.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((banner) => (
              <div key={banner.id} className={`border rounded-xl overflow-hidden transition-all hover:shadow-md ${
                banner.trangThai ? 'border-green-200 bg-white' : 'border-gray-200 bg-gray-50 opacity-75'
              }`}>
                <div className="flex flex-col lg:flex-row">
                  {/* Preview hình */}
                  <div className="lg:w-80 h-48 lg:h-auto bg-gray-100 flex-shrink-0">
                    <img
                      src={banner.hinhAnh}
                      alt={banner.tieuDe}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://placehold.co/400x200/e5e7eb/9ca3af?text=No+Image'; }}
                    />
                  </div>
                  {/* Thông tin */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg">{banner.tieuDe}</h4>
                        <p className="text-sm text-gray-500 mt-1">{banner.moTa}</p>
                      </div>
                      <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${
                        banner.trangThai ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {banner.trangThai ? 'Đang hiển thị' : 'Đã ẩn'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-3">
                      <span className="flex items-center gap-1">
                        <FaCalendar />
                        {banner.ngayBatDau} → {banner.ngayKetThuc}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaLink />
                        {banner.linkUrl}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">
                        Vị trí: {banner.viTri === 'hero' ? 'Hero slider' : 'Sidebar'}
                      </span>
                      <span className="text-gray-400">Thứ tự: {banner.thuTu}</span>
                    </div>
                    {/* Nút thao tác */}
                    <div className="flex items-center gap-2 mt-4">
                      <button onClick={() => toggleBannerStatus(banner.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          banner.trangThai
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}>
                        {banner.trangThai ? <><FaEyeSlash /> Ẩn</> : <><FaEye /> Hiện</>}
                      </button>
                      <button onClick={() => openBannerForm(banner)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-600 hover:bg-blue-200">
                        <FaEdit /> Sửa
                      </button>
                      <button onClick={() => moveBanner(banner.id, 'up')}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <FaArrowUp />
                      </button>
                      <button onClick={() => moveBanner(banner.id, 'down')}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <FaArrowDown />
                      </button>
                      <button onClick={() => handleDeleteBanner(banner.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-600 hover:bg-red-200 ml-auto">
                        <FaTrash /> Xóa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          ) : (
            /* Table view for Banners */
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Hình ảnh</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Tiêu đề</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Vị trí</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Thời gian</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Trạng thái</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBanners.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((banner, index) => (
                    <tr key={banner.id} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50`}>
                      <td className="px-4 py-3 text-sm text-gray-600">{banner.thuTu}</td>
                      <td className="px-4 py-3">
                        <img src={banner.hinhAnh} alt="" className="w-20 h-12 rounded object-cover" onError={(e) => { e.target.src = 'https://placehold.co/80x48/e5e7eb/9ca3af?text=No'; }} />
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{banner.tieuDe}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{banner.moTa}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-xs font-medium">{banner.viTri === 'hero' ? 'Hero' : 'Sidebar'}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{banner.ngayBatDau} → {banner.ngayKetThuc}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${banner.trangThai ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {banner.trangThai ? 'Hiển thị' : 'Đã ẩn'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => toggleBannerStatus(banner.id)} className="p-1.5 rounded-lg hover:bg-gray-100" title={banner.trangThai ? 'Ẩn' : 'Hiện'}>
                            {banner.trangThai ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-green-500" />}
                          </button>
                          <button onClick={() => openBannerForm(banner)} className="p-1.5 text-blue-600 rounded-lg hover:bg-blue-100" title="Sửa"><FaEdit /></button>
                          <button onClick={() => handleDeleteBanner(banner.id)} className="p-1.5 text-red-600 rounded-lg hover:bg-red-100" title="Xóa"><FaTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Tab Tin tức */}
      {activeTab === 'tin_tuc' && (
        <>
          {filteredTinTuc.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FaNewspaper className="text-4xl mx-auto mb-3 text-gray-300" />
              <p>Chưa có tin tức nào</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTinTuc.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
                <div key={item.id} className="bg-white rounded-xl border hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="flex">
                    <img src={item.hinhAnh} alt="" className="w-32 h-full object-cover flex-shrink-0" onError={(e) => { e.target.src = 'https://placehold.co/128x96/e5e7eb/9ca3af?text=No'; }} />
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">{item.tieuDe}</h4>
                        <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.trangThai === 'da_xuat_ban' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {item.trangThai === 'da_xuat_ban' ? 'Đã xuất bản' : 'Bản nháp'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{item.tomTat}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">{item.danhMuc}</span>
                          <span>{item.tacGia}</span>
                          <span>{item.ngayDang || '-'}</span>
                        </div>
                        <span className="flex items-center gap-1"><FaEye className="text-gray-400" /> {item.luotXem.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t">
                        <button className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg" title="Xem"><FaEye /></button>
                        <button className="p-1.5 text-yellow-600 hover:bg-yellow-100 rounded-lg" title="Sửa"><FaEdit /></button>
                        <button className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg" title="Xóa"><FaTrash /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Tiêu đề</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Danh mục</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Ngày đăng</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Lượt xem</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Tác giả</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTinTuc.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, index) => (
                    <tr key={item.id} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50`}>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={item.hinhAnh} alt="" className="w-16 h-10 rounded object-cover" />
                          <div>
                            <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.tieuDe}</p>
                            <p className="text-xs text-gray-500 line-clamp-1">{item.tomTat}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {item.danhMuc}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          item.trangThai === 'da_xuat_ban'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {item.trangThai === 'da_xuat_ban' ? 'Đã xuất bản' : 'Bản nháp'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.ngayDang || '-'}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">{item.luotXem.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.tacGia}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg" title="Xem">
                            <FaEye />
                          </button>
                          <button className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg" title="Sửa">
                            <FaEdit />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg" title="Xóa">
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {(() => {
        const currentData = activeTab === 'banner' ? filteredBanners : filteredTinTuc;
        const totalPages = Math.ceil(currentData.length / itemsPerPage);
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

      {/* Modal form Banner */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsFormOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-bold text-gray-800">
                {editingItem ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
                <input
                  type="text"
                  value={bannerForm.tieuDe}
                  onChange={(e) => setBannerForm(prev => ({ ...prev, tieuDe: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Khuyến mãi hè 2026..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={bannerForm.moTa}
                  onChange={(e) => setBannerForm(prev => ({ ...prev, moTa: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Mô tả ngắn cho banner..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL hình ảnh *</label>
                <input
                  type="url"
                  value={bannerForm.hinhAnh}
                  onChange={(e) => setBannerForm(prev => ({ ...prev, hinhAnh: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
                {bannerForm.hinhAnh && (
                  <img
                    src={bannerForm.hinhAnh}
                    alt="Preview"
                    className="mt-2 w-full h-40 object-cover rounded-lg border"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                  <input
                    type="text"
                    value={bannerForm.linkUrl}
                    onChange={(e) => setBannerForm(prev => ({ ...prev, linkUrl: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="/khuyen-mai"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí</label>
                  <select
                    value={bannerForm.viTri}
                    onChange={(e) => setBannerForm(prev => ({ ...prev, viTri: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="hero">Hero Slider (trang chủ)</option>
                    <option value="sidebar">Sidebar</option>
                    <option value="popup">Popup</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={bannerForm.ngayBatDau}
                    onChange={(e) => setBannerForm(prev => ({ ...prev, ngayBatDau: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={bannerForm.ngayKetThuc}
                    onChange={(e) => setBannerForm(prev => ({ ...prev, ngayKetThuc: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="trangThai"
                  checked={bannerForm.trangThai}
                  onChange={(e) => setBannerForm(prev => ({ ...prev, trangThai: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="trangThai" className="text-sm text-gray-700">Hiển thị ngay</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveBanner}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                <FaSave />
                {editingItem ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default QuanLyBannerTinTuc;
