import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FaSearch,
  FaUserCheck,
  FaChair,
  FaExchangeAlt,
  FaTimesCircle,
  FaUsers,
  FaPlane,
  FaTicketAlt,
  FaCheckCircle,
  FaCalendar,
  FaMapMarkerAlt,
  FaEye,
  FaClock,
  FaSpinner,
} from 'react-icons/fa';
import Card from '../../components/QuanLy/CardChucNang';
import Toast from '../../components/common/Toast';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ViewToggleButton from '../../components/common/ViewToggleButton';
import CardView from '../../components/common/CardView';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import { useViewToggle } from '../../hooks/useViewToggle';
import QLDatChoService from '../../services/QLDatChoService';
import { getAllChuyenBay } from '../../services/QLChuyenBayService';
import useCheckInWebSocket from '../../hooks/useCheckInWebSocket';
import {
  ChiTietDatChoModal,
  CheckInModal,
  DoiGheModal,
  DoiChuyenModal,
  HuyVeModal,
  DoiHangVeModal,
} from '../../components/QuanLy/QuanLyDatCho';
import DatChoCard from '../../components/QuanLy/QuanLyDatCho/DatChoCard';

const QuanLyDatCho = () => {
  // Tab active
  const [activeTab, setActiveTab] = useState('quan-ly-dat-cho');

  // States cho dữ liệu
  const [datChoList, setDatChoList] = useState([]);
  const [filteredDatCho, setFilteredDatCho] = useState([]);
  const [chuyenBayList, setChuyenBayList] = useState([]);
  const [selectedChuyenBay, setSelectedChuyenBay] = useState(null);
  const [passengersOnFlight, setPassengersOnFlight] = useState([]);
  const [loading, setLoading] = useState(false);

  // States cho search
  const [search, setSearch] = useState('');
  const [flightSearch, setFlightSearch] = useState('');
  const [showAllFlights, setShowAllFlights] = useState(false);

  // States cho modal
  const [selectedDatCho, setSelectedDatCho] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isDoiGheModalOpen, setIsDoiGheModalOpen] = useState(false);
  const [isDoiChuyenModalOpen, setIsDoiChuyenModalOpen] = useState(false);
  const [isHuyVeModalOpen, setIsHuyVeModalOpen] = useState(false);
  const [isDoiHangVeModalOpen, setIsDoiHangVeModalOpen] = useState(false);

  // States cho đổi ghế và đổi chuyến
  const [availableFlights, setAvailableFlights] = useState([]);
  const [seatMap, setSeatMap] = useState(null);
  const [selectedNewSeat, setSelectedNewSeat] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);

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

  // States cho pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 8;

  // View toggle state
  const { viewMode, setViewMode: handleViewChange } = useViewToggle('ql-dat-cho-view', 'table');

  // Toast handler
  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // ConfirmDialog handlers
  const showConfirm = (title, message, type, confirmText, onConfirm) => {
    setConfirmDialog({
      isVisible: true,
      title,
      message,
      type,
      confirmText,
      onConfirm
    });
  };

  const hideConfirm = () => {
    setConfirmDialog(prev => ({ ...prev, isVisible: false }));
  };

  // WebSocket handler for check-in updates
  const handleCheckInUpdate = useCallback((event) => {
    console.log('Received check-in update:', event);
    // Update the booking in the list
    setDatChoList(prev => prev.map(dc => 
      dc.maDatCho === event.maDatCho 
        ? { ...dc, checkInStatus: true }
        : dc
    ));
    setFilteredDatCho(prev => prev.map(dc => 
      dc.maDatCho === event.maDatCho 
        ? { ...dc, checkInStatus: true }
        : dc
    ));
    // Show toast notification
    showToast(`Hành khách vừa check-in (Mã đặt chỗ: #${event.maDatCho})`, 'info');
  }, []);

  // Initialize WebSocket
  useCheckInWebSocket(handleCheckInUpdate);

  // Load dữ liệu đặt chỗ
  useEffect(() => {
    loadDatChoData();
  }, [currentPage, search]);
  
  // Load tất cả chuyến bay (chỉ một lần khi mount)
  useEffect(() => {
    loadAllFlights();
  }, []);

  const loadDatChoData = async () => {
    setLoading(true);
    try {
      const response = await QLDatChoService.getAllDatCho({
        page: currentPage,
        size: itemsPerPage,
        search: search || undefined
      });
      
      if (response.success) {
        const data = response.data;
        setDatChoList(data.content || []);
        setFilteredDatCho(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
        
        // Extract unique flights from bookings (backup)
      // Chỉ dùng khi chưa load được từ API chuyến bay
      if (chuyenBayList.length === 0) {
        const flights = extractFlights(data.content || []);
        setChuyenBayList(flights);
      }
      } else {
        showToast(response.message || 'Không thể tải dữ liệu', 'error');
      }
    } catch (error) {
      console.error('Error loading dat cho:', error);
      showToast('Có lỗi xảy ra khi tải dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load tất cả chuyến bay từ API
  const loadAllFlights = async () => {
    try {
      const response = await getAllChuyenBay();
      if (response.data) {
        // Transform dữ liệu từ API để khớp với format hiện tại
        const flights = response.data.map(cb => ({
          maChuyenBayId: cb.maChuyenBay,
          maChuyenBay: cb.soHieuChuyenBay || cb.maChuyenBay,
          sanBayDi: {
            maSanBay: cb.sanBayDi?.maSanBay || '',
            tenSanBay: cb.sanBayDi?.tenSanBay || '',
            thanhPho: cb.sanBayDi?.thanhPho || cb.sanBayDi?.tenSanBay || ''
          },
          sanBayDen: {
            maSanBay: cb.sanBayDen?.maSanBay || '',
            tenSanBay: cb.sanBayDen?.tenSanBay || '',
            thanhPho: cb.sanBayDen?.thanhPho || cb.sanBayDen?.tenSanBay || ''
          },
          ngayGio: cb.ngayGioDi || cb.ngayGio,
          trangThai: cb.trangThai || 'Chưa bay'
        }));
        setChuyenBayList(flights);
      }
    } catch (error) {
      console.error('Error loading all flights:', error);
      // Fallback: sử dụng extractFlights từ đặt chỗ nếu API lỗi
      const flights = extractFlights(datChoList);
      setChuyenBayList(flights);
    }
  };

  // Extract unique flights from bookings (fallback)
  const extractFlights = (bookings) => {
    const flightMap = new Map();
    bookings.forEach(booking => {
      if (booking.maChuyenBay && !flightMap.has(booking.maChuyenBay)) {
        flightMap.set(booking.maChuyenBay, {
          maChuyenBayId: booking.maChuyenBay, // Integer ID for API
          maChuyenBay: booking.soHieuChuyenBay || booking.maChuyenBay, // String display
          sanBayDi: { 
            maSanBay: booking.maSanBayDi || '', 
            tenSanBay: booking.sanBayDi || '', 
            thanhPho: booking.sanBayDi || '' 
          },
          sanBayDen: { 
            maSanBay: booking.maSanBayDen || '', 
            tenSanBay: booking.sanBayDen || '', 
            thanhPho: booking.sanBayDen || '' 
          },
          ngayGio: booking.ngayGioDi,
          trangThai: booking.trangThaiChuyenBay || 'Chưa bay'
        });
      }
    });
    return Array.from(flightMap.values());
  };

  // Filter theo search text (client-side filtering)
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredDatCho(datChoList);
    } else {
      const filtered = datChoList.filter(
        (dc) =>
          String(dc.maDatCho).toLowerCase().includes(search.toLowerCase()) ||
          (dc.hoVaTen && dc.hoVaTen.toLowerCase().includes(search.toLowerCase())) ||
          (dc.cccd && dc.cccd.includes(search)) ||
          (dc.soHieuChuyenBay && dc.soHieuChuyenBay.toLowerCase().includes(search.toLowerCase()))
      );
      setFilteredDatCho(filtered);
    }
  }, [datChoList]);

  // Reset page về 0 khi search thay đổi
  useEffect(() => {
    setCurrentPage(0);
  }, [search]);

  // Pagination logic
  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Handlers
  const handleViewDetail = (datCho) => {
    setSelectedDatCho(datCho);
    setIsDetailModalOpen(true);
  };

  const handleCheckIn = (datCho) => {
    setSelectedDatCho(datCho);
    setIsCheckInModalOpen(true);
  };

  const handleDoiGhe = async (datCho) => {
    setSelectedDatCho(datCho);
    setSelectedNewSeat(null);
    setSeatMap(null);
    setIsDoiGheModalOpen(true);
    
    // Fetch seat map từ API
    setLoadingModal(true);
    try {
      const response = await QLDatChoService.getSeatMap(datCho.maDatCho);
      if (response.success) {
        setSeatMap(response.data);
      } else {
        showToast(response.message || 'Không thể tải sơ đồ ghế', 'error');
      }
    } catch (error) {
      console.error('Error loading seat map:', error);
      showToast('Có lỗi xảy ra khi tải sơ đồ ghế', 'error');
    } finally {
      setLoadingModal(false);
    }
  };

  const handleDoiChuyen = async (datCho) => {
    // Kiểm tra đã check-in chưa
    if (datCho.checkInStatus) {
      showToast('Không thể đổi chuyến bay khi đã check-in', 'error');
      return;
    }
    setSelectedDatCho(datCho);
    setAvailableFlights([]);
    setIsDoiChuyenModalOpen(true);
    
    // Fetch available flights từ API
    setLoadingModal(true);
    try {
      const response = await QLDatChoService.getAvailableFlights(datCho.maDatCho);
      if (response.success) {
        setAvailableFlights(response.data || []);
      } else {
        showToast(response.message || 'Không thể tải danh sách chuyến bay', 'error');
      }
    } catch (error) {
      console.error('Error loading available flights:', error);
      showToast('Có lỗi xảy ra khi tải danh sách chuyến bay', 'error');
    } finally {
      setLoadingModal(false);
    }
  };

  const handleHuyVe = (datCho) => {
    setSelectedDatCho(datCho);
    setIsHuyVeModalOpen(true);
  };

  const handleDoiHangVe = (datCho) => {
    setSelectedDatCho(datCho);
    setIsDoiHangVeModalOpen(true);
  };

  const confirmDoiHangVe = async (hangVeMoi, phiDoiInfo) => {
    try {
      setLoading(true);
      const response = await QLDatChoService.doiHangVe(
        selectedDatCho.maDatCho,
        hangVeMoi.maHangVe,
        null, // Chưa chọn ghế mới
        'Đổi hạng vé theo yêu cầu'
      );
      if (response.success) {
        await loadDatChoData();
        setIsDoiHangVeModalOpen(false);
        const message = phiDoiInfo?.loaiGiaoDich === 'HOAN_TIEN' 
          ? `Đổi hạng vé thành công! Hoàn tiền: ${formatCurrency(phiDoiInfo.tongThanhToan)}`
          : `Đổi hạng vé thành công! ${phiDoiInfo?.tongThanhToan > 0 ? `Thanh toán thêm: ${formatCurrency(phiDoiInfo.tongThanhToan)}` : ''}`;
        showToast(message);
      } else {
        showToast(response.message || 'Đổi hạng vé thất bại', 'error');
      }
    } catch (error) {
      console.error('Error doi hang ve:', error);
      showToast('Có lỗi xảy ra khi đổi hạng vé', 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmCheckIn = async () => {
    try {
      setLoading(true);
      const response = await QLDatChoService.checkIn(selectedDatCho.maDatCho);
      if (response.success) {
        await loadDatChoData();
        setIsCheckInModalOpen(false);
        hideConfirm();
        showToast('Check-in thành công!');
      } else {
        showToast(response.message || 'Check-in thất bại', 'error');
      }
    } catch (error) {
      console.error('Error check-in:', error);
      showToast('Có lỗi xảy ra khi check-in', 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmDoiGhe = async () => {
    if (!selectedNewSeat) {
      showToast('Vui lòng chọn ghế mới', 'error');
      return;
    }
    
    try {
      setLoading(true);
      const response = await QLDatChoService.doiGhe(
        selectedDatCho.maDatCho, 
        selectedNewSeat.maGhe, 
        'Đổi ghế theo yêu cầu'
      );
      if (response.success) {
        await loadDatChoData();
        setIsDoiGheModalOpen(false);
        setSelectedNewSeat(null);
        showToast(`Đổi ghế thành công! Ghế mới: ${selectedNewSeat.soGhe}`);
      } else {
        showToast(response.message || 'Đổi ghế thất bại', 'error');
      }
    } catch (error) {
      console.error('Error doi ghe:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi đổi ghế';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmDoiChuyen = async (newChuyenBay) => {
    try {
      setLoading(true);
      // Kiểm tra trạng thái chuyến bay
      if (newChuyenBay.trangThai === 'Đã bay' || newChuyenBay.trangThai === 'Đang bay' || newChuyenBay.trangThai === 'Hủy') {
        showToast(`Không thể đổi sang chuyến bay đã ${newChuyenBay.trangThai.toLowerCase()}`, 'error');
        return;
      }
      // Sử dụng maChuyenBayId (Integer) thay vì maChuyenBay (String)
      const response = await QLDatChoService.doiChuyenBay(
        selectedDatCho.maDatCho, 
        newChuyenBay.maChuyenBayId, 
        selectedDatCho.maGhe,
        'Đổi chuyến theo yêu cầu'
      );
      
      if (response.success) {
        await loadDatChoData();
        setIsDoiChuyenModalOpen(false);
        hideConfirm();
        showToast(`Đổi sang chuyến ${newChuyenBay.maChuyenBay} thành công!`);
      } else {
        showToast(response.message || 'Đổi chuyến bay thất bại', 'error');
      }
    } catch (error) {
      console.error('Error doi chuyen:', error);
      // Hiển thị error message từ backend
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi đổi chuyến bay';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmHuyVe = async (lyDo) => {
    try {
      setLoading(true);
      const response = await QLDatChoService.huyDatCho(selectedDatCho.maDatCho, lyDo);
      if (response.success) {
        await loadDatChoData();
        setIsHuyVeModalOpen(false);
        hideConfirm();
        showToast('Hủy vé thành công!');
      } else {
        showToast(response.message || 'Hủy vé thất bại', 'error');
      }
    } catch (error) {
      console.error('Error huy ve:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi hủy vé';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Xem danh sách khách trên chuyến bay
  const handleViewPassengers = (chuyenBay) => {
    setSelectedChuyenBay(chuyenBay);
    const passengers = datChoList.filter(dc => dc.soHieuChuyenBay === chuyenBay.maChuyenBay);
    setPassengersOnFlight(passengers);
  };

  // Get status info
  const getCheckInStatus = (status) => {
    switch (status) {
      case true:
      case 'Đã check-in':
        return { text: 'Đã check-in', color: 'bg-green-100 text-green-700', icon: <FaCheckCircle /> };
      case false:
      case 'Chưa check-in':
        return { text: 'Chưa check-in', color: 'bg-yellow-100 text-yellow-700', icon: <FaClock /> };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-700', icon: <FaTicketAlt /> };
    }
  };

  const getTrangThaiDatCho = (status) => {
    switch (status) {
      case 'ACTIVE':
      case 'Đã đặt chỗ':
        return { text: 'Đã đặt chỗ', color: 'bg-blue-100 text-blue-700' };
      case 'CANCELLED':
      case 'Đã hủy':
        return { text: 'Đã hủy', color: 'bg-red-100 text-red-700' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  // Render tabs
  const renderTabs = () => (
    <div className="flex border-b border-gray-200 mb-6">
      <button
        onClick={() => setActiveTab('quan-ly-dat-cho')}
        className={`px-6 py-3 font-semibold transition-all ${
          activeTab === 'quan-ly-dat-cho'
            ? 'bg-violet-600 text-white border-t-2 border-violet-600'
            : 'text-gray-600 hover:text-violet-600 hover:bg-violet-50'
        }`}
      >
        <FaTicketAlt className="inline mr-2" />
        Quản lý đặt chỗ
      </button>
      <button
        onClick={() => setActiveTab('danh-sach-hanh-khach')}
        className={`px-6 py-3 font-semibold transition-all ${
          activeTab === 'danh-sach-hanh-khach'
            ? 'bg-violet-600 text-white border-t-2 border-violet-600'
            : 'text-gray-600 hover:text-violet-600 hover:bg-violet-50'
        }`}
      >
        <FaUsers className="inline mr-2" />
        Danh sách hành khách theo chuyến
      </button>
    </div>
  );

  // Render Quản lý đặt chỗ tab
  const renderQuanLyDatCho = () => (
    <div>
      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-linear-to-br from-violet-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Tổng đặt chỗ</p>
              <p className="text-3xl font-bold mt-2">{totalElements}</p>
            </div>
            <FaTicketAlt size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-linear-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Đã check-in</p>
              <p className="text-3xl font-bold mt-2">
                {datChoList.filter(dc => dc.checkInStatus).length}
              </p>
            </div>
            <FaUserCheck size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-linear-to-br from-yellow-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Chưa check-in</p>
              <p className="text-3xl font-bold mt-2">
                {datChoList.filter(dc => !dc.checkInStatus).length}
              </p>
            </div>
            <FaClock size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-linear-to-br from-blue-500 to-cyan-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Chuyến bay</p>
              <p className="text-3xl font-bold mt-2">{chuyenBayList.length}</p>
            </div>
            <FaPlane size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đặt chỗ, tên, CCCD..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm"
          />
          <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
        </div>
        <ViewToggleButton
          currentView={viewMode}
          onViewChange={handleViewChange}
          className="shrink-0"
        />
        <button
          onClick={loadDatChoData}
          disabled={loading}
          className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
        >
          {loading ? <FaSpinner className="animate-spin" /> : 'Tải lại'}
        </button>
      </div>

      {/* View Mode: Card or Table */}
      {viewMode === 'grid' ? (
        /* Card View */
        <CardView
          items={filteredDatCho}
          renderCard={(dc, index) => (
            <DatChoCard
              key={dc.maDatCho || index}
              data={dc}
              onCheckIn={handleCheckIn}
              onDoiGhe={handleDoiGhe}
              onDoiHangVe={handleDoiHangVe}
              onDoiChuyen={handleDoiChuyen}
              onHuyVe={handleHuyVe}
              onView={handleViewDetail}
            />
          )}
          emptyMessage="Không tìm thấy đặt chỗ nào."
        />
      ) : (
        /* Table View */
        <ResponsiveTable>
          <table className="w-full text-sm">
            <thead className="bg-linear-to-r from-slate-700 to-slate-800 text-white">
              <tr>
                <th className="px-4 py-4 text-left font-semibold">Mã Đặt Chỗ</th>
                <th className="px-4 py-4 text-left font-semibold">Hành khách</th>
                <th className="px-4 py-4 text-left font-semibold">Chuyến bay</th>
                <th className="px-4 py-4 text-left font-semibold">Ghế</th>
                <th className="px-4 py-4 text-center font-semibold">Check-in</th>
                <th className="px-4 py-4 text-right font-semibold">Giá vé</th>
                <th className="px-4 py-4 text-center font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <FaSpinner className="text-violet-600 text-3xl animate-spin" />
                      <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredDatCho.length > 0 ? (
                filteredDatCho.map((dc, index) => {
                  const checkInStatus = getCheckInStatus(dc.checkInStatus);
                  return (
                    <tr
                      key={dc.maDatCho}
                      className={`${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-violet-50 transition-colors`}
                    >
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-bold text-violet-600">#{dc.maDatCho}</p>
                          <p className="text-xs text-gray-500">PNR: {dc.pnr}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{dc.hoVaTen}</p>
                          <p className="text-xs text-gray-500">CCCD: {dc.cccd}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{dc.soHieuChuyenBay}</p>
                          <p className="text-xs text-gray-500">
                            {dc.sanBayDi} → {dc.sanBayDen}
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(dc.ngayGioDi)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          dc.tenHangVe?.includes('Thương gia') ? 'bg-purple-100 text-purple-700' :
                          dc.tenHangVe?.includes('Phổ thông đặc biệt') ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {dc.soGhe}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${checkInStatus.color}`}>
                          {checkInStatus.icon} {checkInStatus.text}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-gray-900">
                        {formatCurrency(dc.giaVe)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleCheckIn(dc)}
                            className={`p-2 rounded-lg transition-colors ${
                              dc.checkInStatus
                                ? 'bg-green-100 text-green-400 cursor-not-allowed'
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}
                            title="Check-in"
                            disabled={dc.checkInStatus}
                          >
                            <FaUserCheck />
                          </button>
                          <button
                            onClick={() => handleDoiGhe(dc)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Đổi ghế"
                          >
                            <FaChair />
                          </button>
                          <button
                            onClick={() => handleDoiHangVe(dc)}
                            className="p-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors"
                            title="Đổi hạng vé"
                          >
                            <FaTicketAlt />
                          </button>
                          <button
                            onClick={() => handleDoiChuyen(dc)}
                            className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                            title="Đổi chuyến"
                          >
                            <FaExchangeAlt />
                          </button>
                          <button
                            onClick={() => handleHuyVe(dc)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="Hủy vé"
                          >
                            <FaTimesCircle />
                          </button>
                          <button
                            onClick={() => handleViewDetail(dc)}
                            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
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
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <FaTicketAlt className="text-gray-300 text-5xl" />
                      <p className="text-gray-500 font-medium">
                        Không tìm thấy đặt chỗ nào.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </ResponsiveTable>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <span className="text-sm text-gray-600 font-medium">
            Hiển thị{' '}
            <span className="font-bold text-violet-600">{indexOfFirstItem + 1}</span> đến{' '}
            <span className="font-bold text-violet-600">
              {Math.min(indexOfLastItem, totalElements)}
            </span>{' '}
            của{' '}
            <span className="font-bold text-violet-600">{totalElements}</span> kết quả
          </span>
          <nav>
            <ul className="flex gap-2">
              <li>
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-sm"
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
                        ? 'bg-violet-600 text-white shadow-lg'
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
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-sm"
                >
                  Sau →
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );

  // Render Danh sách hành khách theo chuyến tab
  // Filter chuyến bay: theo tùy chọn hiển thị + từ khóa tìm kiếm
  const filteredChuyenBay = useMemo(() => {
    // Sử dụng timestamp để so sánh chính xác hơn
    const now = Date.now();
    
    let result = [...chuyenBayList];
    
    // Lọc chỉ chuyến bay trong tương lai nếu không chon hien thi tat ca
    if (!showAllFlights) {
      result = result.filter(cb => {
        if (!cb.ngayGio) return false;
        const flightTime = new Date(cb.ngayGio).getTime();
        return flightTime > now;
      });
    }
    
    // Lọc theo từ khóa tìm kiếm
    if (flightSearch.trim()) {
      const keyword = flightSearch.toLowerCase();
      result = result.filter(cb =>
        cb.maChuyenBay?.toLowerCase().includes(keyword) ||
        cb.sanBayDi?.thanhPho?.toLowerCase().includes(keyword) ||
        cb.sanBayDen?.thanhPho?.toLowerCase().includes(keyword) ||
        formatDateTime(cb.ngayGio)?.toLowerCase().includes(keyword)
      );
    }
    
    // Sắp xếp theo thờ gian khởi hành gần nhất
    result.sort((a, b) => new Date(a.ngayGio) - new Date(b.ngayGio));
    
    return result;
  }, [chuyenBayList, flightSearch, showAllFlights]);

  const renderDanhSachHanhKhach = () => (
    <div>
      {/* Danh sách chuyến bay */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          <FaPlane className="inline mr-2 text-violet-600" />
          Chọn chuyến bay
        </h3>
        
        {/* Thanh tìm kiếm va toggle chuyến bay */}
        <div className="mb-4 flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Tìm kiếm theo mã chuyến bay, sân bay..."
              value={flightSearch}
              onChange={(e) => setFlightSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm"
            />
            <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          </div>
          
          {/* Toggle Hien thi tat ca */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAllFlights(!showAllFlights)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${
                showAllFlights ? 'bg-violet-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showAllFlights ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm text-gray-600">
              {showAllFlights ? (
                <span className="flex items-center gap-1">
                  <FaPlane className="text-violet-500" />
                  Hiển thị tất cả chuyến bay
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <FaClock className="text-green-500" />
                  Chỉ chuyến bay trong tương lai
                </span>
              )}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChuyenBay.map((cb) => (
            <div
              key={cb.maChuyenBay}
              onClick={() => handleViewPassengers(cb)}
              className={`bg-white rounded-xl shadow-md border-2 p-4 cursor-pointer transition-all hover:shadow-xl ${
                selectedChuyenBay?.maChuyenBay === cb.maChuyenBay
                  ? 'border-violet-500 ring-2 ring-violet-200'
                  : 'border-gray-200 hover:border-violet-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-violet-600">{cb.maChuyenBay}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  cb.trangThai === 'Chưa bay' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {cb.trangThai}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <FaMapMarkerAlt className="text-blue-500" />
                <span>{cb.sanBayDi.thanhPho}</span>
                <span>→</span>
                <span>{cb.sanBayDen.thanhPho}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <FaCalendar className="text-orange-500" />
                <span>{formatDateTime(cb.ngayGio)}</span>
              </div>
            </div>
          ))}
          {filteredChuyenBay.length === 0 && (
            <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg">
              <FaPlane className="text-gray-300 text-4xl mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Không tìm thấy chuyến bay nào</p>
              <p className="text-sm text-gray-400 mt-1">
                {flightSearch 
                  ? 'Không có chuyến bay nào khớp với từ khóa tìm kiếm'
                  : showAllFlights 
                    ? 'Không có chuyến bay nào trong danh sách'
                    : 'Không có chuyến bay nào trong tương lai'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Danh sách hành khách của chuyến bay đã chọn */}
      {selectedChuyenBay && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-linear-to-r from-violet-600 to-purple-600 px-6 py-4">
            <h3 className="text-lg font-bold text-white">
              <FaUsers className="inline mr-2" />
              Danh sách hành khách - {selectedChuyenBay.maChuyenBay}
            </h3>
            <p className="text-violet-100 text-sm mt-1">
              {selectedChuyenBay.sanBayDi.thanhPho} → {selectedChuyenBay.sanBayDen.thanhPho} | {formatDateTime(selectedChuyenBay.ngayGio)}
            </p>
          </div>

          <div className="p-6">
            {/* Thống kê chuyến bay */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{passengersOnFlight.length}</p>
                <p className="text-sm text-blue-600">Tổng hành khách</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {passengersOnFlight.filter(p => p.checkInStatus).length}
                </p>
                <p className="text-sm text-green-600">Đã check-in</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {passengersOnFlight.filter(p => !p.checkInStatus).length}
                </p>
                <p className="text-sm text-yellow-600">Chưa check-in</p>
              </div>
            </div>

            {/* Bảng hành khách */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">STT</th>
                    <th className="px-4 py-3 text-left font-semibold">Họ tên</th>
                    <th className="px-4 py-3 text-left font-semibold">CCCD</th>
                    <th className="px-4 py-3 text-left font-semibold">Mã đặt chỗ</th>
                    <th className="px-4 py-3 text-left font-semibold">Ghế</th>
                    <th className="px-4 py-3 text-left font-semibold">Hạng vé</th>
                    <th className="px-4 py-3 text-center font-semibold">Check-in</th>
                    <th className="px-4 py-3 text-center font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {passengersOnFlight.length > 0 ? (
                    passengersOnFlight.map((passenger, index) => {
                      const checkInStatus = getCheckInStatus(passenger.checkInStatus);
                      return (
                        <tr
                          key={passenger.maDatCho}
                          className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-violet-50 transition-colors`}
                        >
                          <td className="px-4 py-3 font-medium">{index + 1}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{passenger.hoVaTen}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{passenger.cccd}</td>
                          <td className="px-4 py-3 font-mono text-violet-600">#{passenger.maDatCho}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              passenger.tenHangVe?.includes('Thương gia') ? 'bg-purple-100 text-purple-700' :
                              passenger.tenHangVe?.includes('Phổ thông đặc biệt') ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {passenger.soGhe}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{passenger.tenHangVe}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${checkInStatus.color}`}>
                              {checkInStatus.icon} {checkInStatus.text}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center items-center gap-2">
                              <button
                                onClick={() => handleCheckIn(passenger)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  passenger.checkInStatus
                                    ? 'bg-green-100 text-green-400 cursor-not-allowed'
                                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                                }`}
                                title="Check-in"
                                disabled={passenger.checkInStatus}
                              >
                                <FaUserCheck size={14} />
                              </button>
                              <button
                                onClick={() => handleViewDetail(passenger)}
                                className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                title="Xem chi tiết"
                              >
                                <FaEye size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">
                        Không có hành khách nào trên chuyến bay này
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Card title="Quản lý đặt chỗ">
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

      {/* Tabs */}
      {renderTabs()}

      {/* Tab Content */}
      {activeTab === 'quan-ly-dat-cho' && renderQuanLyDatCho()}
      {activeTab === 'danh-sach-hanh-khach' && renderDanhSachHanhKhach()}

      {/* Modals */}
      <ChiTietDatChoModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        datCho={selectedDatCho}
        getCheckInStatus={getCheckInStatus}
        getTrangThaiDatCho={getTrangThaiDatCho}
        formatDate={formatDate}
        formatDateTime={formatDateTime}
        formatCurrency={formatCurrency}
      />

      <CheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        onConfirm={confirmCheckIn}
        datCho={selectedDatCho}
        loading={loading}
      />

      <DoiGheModal
        isOpen={isDoiGheModalOpen}
        onClose={() => {
          setIsDoiGheModalOpen(false);
          setSelectedNewSeat(null);
        }}
        onConfirm={confirmDoiGhe}
        datCho={selectedDatCho}
        seatMap={seatMap}
        selectedNewSeat={selectedNewSeat}
        onSelectSeat={setSelectedNewSeat}
        loading={loading}
        loadingModal={loadingModal}
      />

      <DoiChuyenModal
        isOpen={isDoiChuyenModalOpen}
        onClose={() => setIsDoiChuyenModalOpen(false)}
        onSelectFlight={confirmDoiChuyen}
        datCho={selectedDatCho}
        availableFlights={availableFlights}
        loading={loading}
        loadingModal={loadingModal}
        formatDateTime={formatDateTime}
      />

      <HuyVeModal
        isOpen={isHuyVeModalOpen}
        onClose={() => setIsHuyVeModalOpen(false)}
        onConfirm={confirmHuyVe}
        datCho={selectedDatCho}
        loading={loading}
      />

      <DoiHangVeModal
        isOpen={isDoiHangVeModalOpen}
        onClose={() => setIsDoiHangVeModalOpen(false)}
        onConfirm={confirmDoiHangVe}
        datCho={selectedDatCho}
        loading={loading}
      />
    </Card>
  );
};

export default QuanLyDatCho;
