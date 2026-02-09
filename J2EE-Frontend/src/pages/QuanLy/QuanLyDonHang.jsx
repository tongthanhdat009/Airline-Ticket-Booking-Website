import React, { useState, useEffect, useCallback } from 'react';
import {
  FaSearch,
  FaEye,
  FaShoppingCart,
  FaCalendar,
  FaFilter,
  FaCheckSquare,
  FaSquare,
  FaUndo,
  FaCheck,
} from 'react-icons/fa';
import Card from '../../components/QuanLy/CardChucNang';
import donHangApi from '../../services/donHangApi';
import Toast from '../../components/common/Toast';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ViewToggleButton from '../../components/common/ViewToggleButton';
import CardView from '../../components/common/CardView';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import { useViewToggle } from '../../hooks/useViewToggle';
import DonHangDetailModal from '../../components/QuanLy/QuanLyDonHang/DonHangDetailModal';
import FilterModal from '../../components/QuanLy/QuanLyDonHang/FilterModal';
import HoanTienModal from '../../components/QuanLy/QuanLyDonHang/HoanTienModal';
import HuyDonHangModal from '../../components/QuanLy/QuanLyDonHang/HuyDonHangModal';
import DonHangCard from '../../components/QuanLy/QuanLyDonHang/DonHangCard';

const QuanLyDonHang = () => {
  // States cho dữ liệu
  const [donHangList, setDonHangList] = useState([]);
  const [filteredDonHang, setFilteredDonHang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States cho checkbox chọn nhiều
  const [selectedDonHangs, setSelectedDonHangs] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  // States cho pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // States cho search và filters
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    trangThai: '',
    tuNgay: '',
    denNgay: '',
    tuGia: '',
    denGia: '',
  });

  // States cho modal
  const [selectedDonHang, setSelectedDonHang] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isHoanTienModalOpen, setIsHoanTienModalOpen] = useState(false);
  const [isHuyDonHangModalOpen, setIsHuyDonHangModalOpen] = useState(false);
  const [selectedDonHangToHuy, setSelectedDonHangToHuy] = useState(null);
  const [batchActionLoading, setBatchActionLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // States cho Toast
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  });

  // States cho ConfirmDialog
  const [confirmDialog, setConfirmDialog] = useState({
    isVisible: false,
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'Xác nhận',
    onConfirm: null
  });

  // View toggle hook
  const { viewMode, setViewMode: handleViewChange } = useViewToggle('ql-don-hang-view', 'table');

  // Toast handler
  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // ConfirmDialog handlers
  const hideConfirm = () => {
    setConfirmDialog(prev => ({ ...prev, isVisible: false }));
  };

  // Load dữ liệu từ API
  const loadDonHang = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await donHangApi.getDonHangList(filters);
      if (response.success && response.data) {
        setDonHangList(response.data);
        setFilteredDonHang(response.data);
      } else {
        setError(response.message || 'Không thể tải dữ liệu');
        showToast(response.message || 'Không thể tải dữ liệu', 'error');
      }
    } catch (err) {
      console.error('Error loading don hang:', err);
      const errorMsg = err.response?.data?.message || 'Lỗi khi tải dữ liệu';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load dữ liệu khi component mount hoặc filters thay đổi
  useEffect(() => {
    loadDonHang();
  }, [loadDonHang]);

  // Filter theo search text
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredDonHang(donHangList);
    } else {
      const filtered = donHangList.filter(
        (dh) =>
          String(dh.maDonHang).includes(search) ||
          dh.pnr?.toLowerCase().includes(search.toLowerCase()) ||
          dh.emailNguoiDat?.toLowerCase().includes(search.toLowerCase()) ||
          dh.soDienThoaiNguoiDat?.includes(search) ||
          dh.hanhKhachNguoiDat?.hoVaTen?.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredDonHang(filtered);
    }
    setCurrentPage(1);
  }, [search, donHangList]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDonHang.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDonHang.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handlers
  const handleViewDetail = async (donHang) => {
    // Load chi tiết đầy đủ từ API
    try {
      const response = await donHangApi.getDonHangById(donHang.maDonHang);
      if (response.success && response.data) {
        setSelectedDonHang(response.data);
        setIsDetailModalOpen(true);
      } else {
        showToast('Không thể tải chi tiết đơn hàng', 'error');
      }
    } catch (err) {
      console.error('Error loading detail:', err);
      showToast('Lỗi khi tải chi tiết đơn hàng', 'error');
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDonHang(null);
  };

  const handleHuyDonHang = async (maDonHang, lyDoHuy) => {
    hideConfirm();
    setActionLoading(true);
    try {
      await donHangApi.huyDonHang(maDonHang, lyDoHuy);
      await loadDonHang();
      showToast('Hủy đơn hàng thành công');
      handleCloseDetailModal();
    } catch (err) {
      console.error('Error cancelling don hang:', err);
      const errorMsg = err.response?.data?.message || 'Lỗi khi hủy đơn hàng';
      showToast(errorMsg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleHuyDonHangConfirm = (maDonHang) => {
    setSelectedDonHangToHuy(maDonHang);
    setIsHuyDonHangModalOpen(true);
  };

  const handleHuyDonHangConfirmFromModal = async (lyDoHuy) => {
    setIsHuyDonHangModalOpen(false);
    await handleHuyDonHang(selectedDonHangToHuy, lyDoHuy);
    setSelectedDonHangToHuy(null);
  };

  const handleCloseHuyDonHangModal = () => {
    setIsHuyDonHangModalOpen(false);
    setSelectedDonHangToHuy(null);
  };

  const handleHoanTienConfirm = async (maDonHang) => {
    // Mở modal hoàn tiền cho đơn hàng đơn lẻ
    const donHang = donHangList.find(dh => dh.maDonHang === maDonHang);
    if (donHang) {
      // Kiểm tra trạng thái chuyến bay trước khi hoàn tiền
      try {
        const response = await donHangApi.getDonHangById(maDonHang);
        if (response.success && response.data && response.data.danhSachDatCho) {
          const blockedStatuses = ['Đang bay', 'Đã bay', 'Đã hạ cánh'];
          const hasBlockedFlight = response.data.danhSachDatCho.some(datCho =>
            datCho.chuyenBay && blockedStatuses.includes(datCho.chuyenBay.trangThai)
          );

          if (hasBlockedFlight) {
            showToast('Không thể hoàn tiền cho đơn hàng có chuyến bay đã bay, đang bay hoặc đã hạ cánh!', 'error');
            return;
          }
        }
      } catch (err) {
        console.error('Error checking flight status:', err);
      }

      setSelectedDonHangs([donHang]);
      setIsHoanTienModalOpen(true);
    }
  };

  // Handlers cho checkbox selection
  const handleSelectDonHang = (donHang) => {
    setSelectedDonHangs(prev => {
      const isSelected = prev.some(dh => dh.maDonHang === donHang.maDonHang);
      if (isSelected) {
        return prev.filter(dh => dh.maDonHang !== donHang.maDonHang);
      } else {
        return [...prev, donHang];
      }
    });
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedDonHangs([]);
      setIsAllSelected(false);
    } else {
      setSelectedDonHangs([...currentItems]);
      setIsAllSelected(true);
    }
  };

  // Handler cho batch refund
  const handleBatchRefund = async (lyDoHoanTien) => {
    hideConfirm();
    setIsHoanTienModalOpen(false);
    setBatchActionLoading(true);
    try {
      const daThanhToanList = selectedDonHangs.filter(dh => dh.trangThai === 'ĐÃ THANH TOÁN');
      if (daThanhToanList.length === 0) {
        showToast('Không có đơn hàng nào đã thanh toán trong danh sách đã chọn', 'warning');
        return;
      }

      const maDonHangs = daThanhToanList.map(dh => dh.maDonHang);
      await donHangApi.batchRefund(maDonHangs, lyDoHoanTien);
      await loadDonHang();
      setSelectedDonHangs([]);
      setIsAllSelected(false);
      showToast(`Đã hoàn tiền thành công ${daThanhToanList.length} đơn hàng`);
    } catch (err) {
      console.error('Error batch refund:', err);
      const errorMsg = err.response?.data?.message || 'Lỗi khi hoàn tiền hàng loạt';
      showToast(errorMsg, 'error');
    } finally {
      setBatchActionLoading(false);
    }
  };

  const handleOpenBatchRefundModal = async () => {
    const daThanhToanList = selectedDonHangs.filter(dh => dh.trangThai === 'ĐÃ THANH TOÁN');
    if (daThanhToanList.length === 0) {
      showToast('Không có đơn hàng nào đã thanh toán trong danh sách đã chọn', 'warning');
      return;
    }

    // Kiểm tra trạng thái chuyến bay của các đơn hàng đã thanh toán
    const blockedStatuses = ['Đang bay', 'Đã bay', 'Đã hạ cánh'];
    let hasBlockedFlight = false;

    for (const dh of daThanhToanList) {
      try {
        const response = await donHangApi.getDonHangById(dh.maDonHang);
        if (response.success && response.data && response.data.danhSachDatCho) {
          const flightBlocked = response.data.danhSachDatCho.some(datCho =>
            datCho.chuyenBay && blockedStatuses.includes(datCho.chuyenBay.trangThai)
          );
          if (flightBlocked) {
            hasBlockedFlight = true;
            break;
          }
        }
      } catch (err) {
        console.error('Error checking flight status:', err);
      }
    }

    if (hasBlockedFlight) {
      showToast('Không thể hoàn tiền cho đơn hàng có chuyến bay đã bay, đang bay hoặc đã hạ cánh!', 'error');
      return;
    }

    setSelectedDonHangs(daThanhToanList);
    setIsHoanTienModalOpen(true);
  };

  const handleApplyFilters = () => {
    setIsFilterModalOpen(false);
    loadDonHang();
  };

  const handleClearFilters = () => {
    setFilters({
      trangThai: '',
      tuNgay: '',
      denNgay: '',
      tuGia: '',
      denGia: '',
    });
    setIsFilterModalOpen(false);
  };

  // Format functions
  const formatCurrency = (value) => {
    if (!value) return '0đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getTrangThaiInfo = (trangThai) => {
    switch (trangThai) {
      case 'ĐÃ THANH TOÁN':
        return { text: 'Đã thanh toán', color: 'bg-green-100 text-green-700', icon: '✓' };
      case 'CHỜ THANH TOÁN':
        return { text: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-700', icon: '⏱' };
      case 'ĐÃ HỦY':
        return { text: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: '✗' };
      default:
        return { text: trangThai, color: 'bg-gray-100 text-gray-700', icon: '?' };
    }
  };

  // Tính toán thống kê
  const totalRevenue = donHangList
    .filter((dh) => dh.trangThai === 'ĐÃ THANH TOÁN')
    .reduce((sum, dh) => sum + (dh.tongGia || 0), 0);

  return (
    <Card title="Quản lý đơn hàng">
      {/* Toast Component */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />

      {/* ConfirmDialog Component */}
      <ConfirmDialog
        isVisible={confirmDialog.isVisible}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText={confirmDialog.confirmText}
        onConfirm={confirmDialog.onConfirm}
        onCancel={hideConfirm}
      />

      {/* DonHangDetailModal Component */}
      <DonHangDetailModal
        isVisible={isDetailModalOpen}
        donHang={selectedDonHang}
        actionLoading={actionLoading}
        onClose={handleCloseDetailModal}
        onHuyDonHang={handleHuyDonHangConfirm}
        onHoanTien={handleHoanTienConfirm}
      />

      {/* FilterModal Component */}
      <FilterModal
        isVisible={isFilterModalOpen}
        filters={filters}
        onFilterChange={setFilters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onClose={() => setIsFilterModalOpen(false)}
      />

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Tổng đơn hàng</p>
              <p className="text-3xl font-bold mt-2">{donHangList.length}</p>
            </div>
            <FaShoppingCart size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-linear-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Đã thanh toán</p>
              <p className="text-3xl font-bold mt-2">
                {donHangList.filter((dh) => dh.trangThai === 'ĐÃ THANH TOÁN').length}
              </p>
            </div>
            <FaCheck size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-linear-to-br from-yellow-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Chờ thanh toán</p>
              <p className="text-3xl font-bold mt-2">
                {donHangList.filter((dh) => dh.trangThai === 'CHỜ THANH TOÁN').length}
              </p>
            </div>
            <FaCalendar size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-linear-to-br from-blue-500 to-cyan-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Tổng doanh thu</p>
              <p className="text-xl font-bold mt-2">
                {(totalRevenue / 1000000).toFixed(1)}M
              </p>
            </div>
            <FaShoppingCart size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Thanh công cụ */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn, PNR, tên, email, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
          <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
        </div>
        <ViewToggleButton
          currentView={viewMode}
          onViewChange={handleViewChange}
          className="shrink-0"
        />
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-2 bg-linear-to-r from-blue-500 to-cyan-600 text-white px-5 py-3 rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl font-semibold"
          >
            <FaFilter />
            <span className="hidden sm:inline">Bộ lọc</span>
          </button>
          <button
            onClick={() => loadDonHang()}
            className="flex items-center gap-2 bg-linear-to-r from-blue-500 to-blue-600 text-white px-5 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold"
          >
            <FaCalendar />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        </div>
      </div>

      {/* Batch action buttons */}
      {selectedDonHangs.length > 0 && (
        <div className="bg-linear-to-r from-blue-50 to-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-blue-700 font-semibold">
              Đã chọn {selectedDonHangs.length} đơn hàng
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleOpenBatchRefundModal}
              disabled={batchActionLoading}
              className="flex items-center gap-2 bg-linear-to-r from-orange-500 to-amber-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-amber-700 font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaUndo />
              {batchActionLoading ? 'Đang xử lý...' : 'Hoàn tiền'}
            </button>
            <button
              onClick={() => {
                setSelectedDonHangs([]);
                setIsAllSelected(false);
              }}
              disabled={batchActionLoading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors disabled:opacity-50"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-semibold">Lỗi:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Bảng dữ liệu */}
      {!loading && !error && (
        <>
          {viewMode === 'grid' ? (
            /* Card View */
            <CardView
              items={currentItems}
              renderCard={(donHang) => (
                <DonHangCard
                  key={donHang.maDonHang}
                  data={donHang}
                  onView={handleViewDetail}
                  onEdit={() => {/* Edit functionality can be added later */}}
                  onDelete={() => {/* Delete functionality can be added later */}}
                />
              )}
              emptyMessage="Không tìm thấy đơn hàng nào."
            />
          ) : (
            /* Table View */
            <ResponsiveTable>
              <table className="w-full text-sm">
                <thead className="bg-linear-to-r from-slate-700 to-slate-800 text-white">
                  <tr>
                    <th className="px-4 py-4 text-center font-semibold w-12">
                      <button
                        onClick={handleSelectAll}
                        className="text-white hover:text-gray-200 transition-colors"
                        title={isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                      >
                        {isAllSelected ? <FaCheckSquare size={18} /> : <FaSquare size={18} />}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">Mã ĐH</th>
                    <th className="px-6 py-4 text-left font-semibold">PNR</th>
                    <th className="px-6 py-4 text-left font-semibold">Khách hàng</th>
                    <th className="px-6 py-4 text-left font-semibold">Ngày đặt</th>
                    <th className="px-6 py-4 text-right font-semibold">Tổng tiền</th>
                    <th className="px-6 py-4 text-center font-semibold">Trạng thái</th>
                    <th className="px-6 py-4 text-center font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.length > 0 ? (
                    currentItems.map((dh, index) => {
                      const status = getTrangThaiInfo(dh.trangThai);
                      const isSelected = selectedDonHangs.some(item => item.maDonHang === dh.maDonHang);
                      return (
                        <tr
                          key={dh.maDonHang}
                          className={`${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          } ${isSelected ? 'bg-blue-100' : ''} hover:bg-blue-50 transition-colors`}
                        >
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() => handleSelectDonHang(dh)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title={isSelected ? 'Bỏ chọn' : 'Chọn'}
                            >
                              {isSelected ? <FaCheckSquare size={18} /> : <FaSquare size={18} />}
                            </button>
                          </td>
                          <td className="px-6 py-4 font-bold text-blue-600">
                            #{dh.maDonHang}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                              {dh.pnr || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {dh.hanhKhachNguoiDat?.hoVaTen || 'N/A'}
                              </p>
                              <p className="text-xs text-gray-500">{dh.emailNguoiDat || 'N/A'}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {formatDateTime(dh.ngayDat)}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-gray-900">
                            {formatCurrency(dh.tongGia)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}
                            >
                              {status.icon} {status.text}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center items-center gap-2">
                              <button
                                onClick={() => handleViewDetail(dh)}
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
                      <td colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <FaShoppingCart className="text-gray-300 text-5xl" />
                          <p className="text-gray-500 font-medium">
                            Không tìm thấy đơn hàng nào.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </ResponsiveTable>
          )}
        </>
      )}

      {/* Thanh phân trang */}
      {!loading && !error && filteredDonHang.length > itemsPerPage && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <span className="text-sm text-gray-600 font-medium">
            Hiển thị{' '}
            <span className="font-bold text-blue-600">{indexOfFirstItem + 1}</span> đến{' '}
            <span className="font-bold text-blue-600">
              {Math.min(indexOfLastItem, filteredDonHang.length)}
            </span>{' '}
            của{' '}
            <span className="font-bold text-blue-600">{filteredDonHang.length}</span> kết
            quả
          </span>
          <nav>
            <ul className="flex gap-2">
              <li>
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-sm"
                >
                  ← Trước
                </button>
              </li>
              {[...Array(totalPages)].map((_, index) => (
                <li key={index}>
                  <button
                    onClick={() => paginate(index + 1)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === index + 1
                        ? 'bg-blue-600 text-white shadow-lg'
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
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-sm"
                >
                  Sau →
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* HoanTienModal Component */}
      <HoanTienModal
        isVisible={isHoanTienModalOpen}
        donHangs={selectedDonHangs}
        actionLoading={batchActionLoading}
        onClose={() => setIsHoanTienModalOpen(false)}
        onConfirm={handleBatchRefund}
      />

      {/* HuyDonHangModal Component */}
      <HuyDonHangModal
        isVisible={isHuyDonHangModalOpen}
        maDonHang={selectedDonHangToHuy}
        onCancel={handleCloseHuyDonHangModal}
        onConfirm={handleHuyDonHangConfirmFromModal}
      />
    </Card>
  );
};

export default QuanLyDonHang;
