import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/common/Footer';
import TaiKhoanService from '../../services/TaiKhoanService';
import DatChoService from '../../services/DatChoService';
import { getClientUserEmail, getClientAccessToken } from '../../utils/cookieUtils';
import useWebSocket from '../../hooks/useWebSocket';

function QuanLyChuyenBay() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accountInfo, setAccountInfo] = useState(null);
  const [flights, setFlights] = useState([]);
  const [flightsLoading, setFlightsLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  // WebSocket hook
  const { latestUpdate, isConnected, clearLatestUpdate } = useWebSocket();

  useEffect(() => {
    const fetchAccountInfo = async () => {
      try {
        const email = getClientUserEmail();
        const token = getClientAccessToken();
        
        if (!email || !token) {
          navigate('/dang-nhap-client');
          return;
        }

        const response = await TaiKhoanService.getTaiKhoanByEmail(email);
        setAccountInfo(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi lấy thông tin tài khoản:', error);
        navigate('/dang-nhap-client');
      }
    };

  
    fetchAccountInfo();
  }, [navigate]);

  useEffect(() => {
    const fetchFlights = async () => {
      if (!accountInfo?.hanhKhach?.maHanhKhach) return;
      
      try {
        setFlightsLoading(true);
        const response = await DatChoService.getDatChoByHanhKhach(accountInfo.hanhKhach.maHanhKhach);
        setFlights(response.data || []);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách chuyến bay:', error);
        setFlights([]);
      } finally {
        setFlightsLoading(false);
      }
    };

    if (accountInfo) {
      fetchFlights();
    }
  }, [accountInfo]);

  // WebSocket update handler
  useEffect(() => {
    if (!latestUpdate) return;

    console.log('Received flight update:', latestUpdate);

    // Cập nhật trạng thái chuyến bay trong danh sách
    setFlights(prevFlights =>
      prevFlights.map(flight => {
        if (flight.chiTietGhe?.chiTietChuyenBay?.maChuyenBay === latestUpdate.maChuyenBay) {
          return {
            ...flight,
            chiTietGhe: {
              ...flight.chiTietGhe,
              chiTietChuyenBay: {
                ...flight.chiTietGhe.chiTietChuyenBay,
                trangThai: latestUpdate.newStatus,
                thoiGianDiThucTe: latestUpdate.thoiGianDiThucTe,
                thoiGianDenThucTe: latestUpdate.thoiGianDenThucTe,
                lyDoDelay: latestUpdate.lyDoDelay,
                lyDoHuy: latestUpdate.lyDoHuy
              }
            }
          };
        }
        return flight;
      })
    );

    // Hiển thị thông báo
    const updatedFlight = flights.find(f => f.chiTietGhe?.chiTietChuyenBay?.maChuyenBay === latestUpdate.maChuyenBay);
    if (updatedFlight) {
      const flightNumber = updatedFlight.chiTietGhe?.chiTietChuyenBay?.soHieuChuyenBay || `#${latestUpdate.maChuyenBay}`;
      setUpdateMessage(`Chuyến bay ${flightNumber} đã cập nhật: ${latestUpdate.oldStatus} → ${latestUpdate.newStatus}`);
      setShowUpdateNotification(true);

      // Tự động ẩn sau 5 giây
      setTimeout(() => {
        setShowUpdateNotification(false);
      }, 5000);
    }

    clearLatestUpdate();
  }, [latestUpdate, flights, clearLatestUpdate]);

  const handleViewDetail = (flight) => {
    setSelectedFlight(flight);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Đã bay': { bg: 'bg-green-100', text: 'text-green-800', icon: '✓' },
      'Đang chờ': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏱' },
      'Đã hủy': { bg: 'bg-red-100', text: 'text-red-800', icon: '✕' },
      'Delay': { bg: 'bg-orange-100', text: 'text-orange-800', icon: '⚠' }
    };
    
    const config = statusConfig[status] || statusConfig['Đang chờ'];
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span>{config.icon}</span>
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  // const formatCurrency = (amount) => {
  //   return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  // };

  const filteredFlights = flights.filter(flight => {
    // Loại bỏ những flight không có thông tin (N/A)
    if (!flight.chiTietGhe?.chiTietChuyenBay?.soHieuChuyenBay || 
        !flight.chiTietGhe?.chiTietChuyenBay?.tuyenBay?.sanBayDi?.thanhPhoSanBay ||
        !flight.chiTietGhe?.chiTietChuyenBay?.tuyenBay?.sanBayDen?.thanhPhoSanBay) {
      return false;
    }
    
    const matchStatus = filters.status === 'all' || flight.chiTietGhe?.chiTietChuyenBay?.trangThai === filters.status;
    const matchSearch = !filters.search || 
      flight.chiTietGhe?.chiTietChuyenBay?.soHieuChuyenBay?.toLowerCase().includes(filters.search.toLowerCase()) ||
      flight.chiTietGhe?.chiTietChuyenBay?.tuyenBay?.sanBayDi?.thanhPhoSanBay?.toLowerCase().includes(filters.search.toLowerCase()) ||
      flight.chiTietGhe?.chiTietChuyenBay?.tuyenBay?.sanBayDen?.thanhPhoSanBay?.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchStatus && matchSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" 
         style={{ backgroundImage: 'url(/background/home/bgBannerHomePage.72a61446.webp)' }}>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-red-600">
              {/* Profile Header */}
              <div className="relative bg-gradient-to-br from-red-500 via-red-600 to-orange-600 h-32">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)`
                  }}></div>
                </div>
              </div>
              
              {/* Avatar */}
              <div className="relative px-6 pb-6">
                <div className="flex flex-col items-center -mt-16">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-white p-1 shadow-xl">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-5xl">
                        👤
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {accountInfo?.hanhKhach?.hoVaTen || 'Chưa cập nhật'}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {accountInfo?.oauth2Provider ? (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
                          🔐 {accountInfo.oauth2Provider}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                          Hành khách thường xuyên
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => navigate('/ca-nhan')}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition shadow-md"
                  >
                    <span className="text-xl">👤</span>
                    <div className="text-left flex-1">
                      <p className="font-semibold">Thông tin cá nhân</p>
                      <p className="text-xs opacity-90">Quản lý tài khoản</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => navigate('/lich-su-giao-dich')}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition shadow-md"
                  >
                    <span className="text-xl">💳</span>
                    <div className="text-left flex-1">
                      <p className="font-semibold">Lịch sử giao dịch</p>
                      <p className="text-xs opacity-90">Xem hóa đơn</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => navigate('/dat-ve')}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition shadow-md"
                  >
                    <span className="text-xl">🎫</span>
                    <div className="text-left flex-1">
                      <p className="font-semibold">Đặt vé mới</p>
                      <p className="text-xs opacity-90">Tìm chuyến bay</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Quản lý chuyến bay</h1>
              <p className="text-white drop-shadow-md">Xem và quản lý các chuyến bay đã đặt của bạn</p>
            </div>

            {/* WebSocket Update Notification */}
            {showUpdateNotification && (
              <div className="mb-4 p-4 bg-blue-600 border-l-4 border-blue-800 rounded-lg shadow-lg flex items-center justify-between animate-slide-in">
                <div className="flex items-center gap-3">
                  <span className="text-2xl animate-bounce">✈️</span>
                  <span className="text-white font-semibold">{updateMessage}</span>
                </div>
                <button
                  onClick={() => setShowUpdateNotification(false)}
                  className="text-white hover:text-blue-200 font-bold text-xl"
                >
                  ×
                </button>
              </div>
            )}

            {/* WebSocket Connection Status */}
            <div className="mb-4 flex items-center gap-2 text-sm bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 w-fit shadow-md">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className={isConnected ? 'text-green-700 font-medium' : 'text-gray-500'}>
                {isConnected ? '🟢 Đang cập nhật real-time' : '⚫ Không có kết nối real-time'}
              </span>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="all">Tất cả</option>
                    <option value="Đã bay">Đã bay</option>
                    <option value="Đang chờ">Đang chờ</option>
                    <option value="Đã hủy">Đã hủy</option>
                    <option value="Delay">Delay</option>
                  </select>
                </div>
                
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
                  <input
                    type="text"
                    placeholder="Tìm theo số hiệu, điểm đi, điểm đến..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Flight List */}
            {flightsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải danh sách chuyến bay...</p>
              </div>
            ) : filteredFlights.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">✈️</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có chuyến bay nào</h3>
                <p className="text-gray-500 mb-6">Bạn chưa đặt chuyến bay nào hoặc không tìm thấy kết quả phù hợp</p>
                <button
                  onClick={() => navigate('/dat-ve')}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
                >
                  Đặt vé ngay
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFlights.map((flight) => (
                  <div key={flight.maDatCho} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Flight Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-lg font-bold text-red-600">
                        {flight.chiTietGhe?.chiTietChuyenBay?.soHieuChuyenBay || 'N/A'}
                      </span>
                      {getStatusBadge(flight.chiTietGhe?.chiTietChuyenBay?.trangThai || 'Đang chờ')}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Departure */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Điểm khởi hành</p>
                        <p className="font-semibold text-gray-900">
                          {flight.chiTietGhe?.chiTietChuyenBay?.tuyenBay?.sanBayDi?.thanhPhoSanBay || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(flight.chiTietGhe?.chiTietChuyenBay?.ngayDi)} - {formatTime(flight.chiTietGhe?.chiTietChuyenBay?.gioDi)}
                        </p>
                      </div>
                      
                      {/* Arrow */}
                      <div className="flex items-center justify-center">
                        <div className="text-red-600 text-2xl">→</div>
                      </div>
                      
                      {/* Arrival */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Điểm đến</p>
                        <p className="font-semibold text-gray-900">
                          {flight.chiTietGhe?.chiTietChuyenBay?.tuyenBay?.sanBayDen?.thanhPhoSanBay || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(flight.chiTietGhe?.chiTietChuyenBay?.ngayDen)} - {formatTime(flight.chiTietGhe?.chiTietChuyenBay?.gioDen)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex gap-4 text-sm text-gray-600">
                      <span>Hạng vé: <span className="font-medium">{flight.chiTietGhe?.hangVe?.tenHangVe || 'N/A'}</span></span>
                      <span>Ghế: <span className="font-medium">{flight.chiTietGhe?.maGhe || 'N/A'}</span></span>
                      <span>Ngày đặt: <span className="font-medium">{formatDate(flight.ngayDatCho)}</span></span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:ml-6">
                    <button
                      onClick={() => handleViewDetail(flight)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>

      {/* Detail Modal */}
      {showDetailModal && selectedFlight && (
        <div className="fixed inset-0 flex items-center justify-center z-[1100] p-2 sm:p-4">
          <div className="absolute inset-0" onClick={() => setShowDetailModal(false)}></div>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[95vh] overflow-hidden flex flex-col relative z-10">
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center flex-shrink-0">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Chi tiết chuyến bay</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Flight Info */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
                  ✈️ Thông tin chuyến bay
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Số hiệu chuyến bay</p>
                    <p className="font-semibold">{selectedFlight.chiTietGhe?.chiTietChuyenBay?.soHieuChuyenBay}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Trạng thái</p>
                    {getStatusBadge(selectedFlight.chiTietGhe?.chiTietChuyenBay?.trangThai)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Điểm khởi hành</p>
                    <p className="font-semibold">{selectedFlight.chiTietGhe?.chiTietChuyenBay?.tuyenBay?.sanBayDi?.tenSanBay}</p>
                    <p className="text-sm text-gray-500">{selectedFlight.chiTietGhe?.chiTietChuyenBay?.tuyenBay?.sanBayDi?.thanhPhoSanBay}</p>
                    <p className="text-sm">{formatDate(selectedFlight.chiTietGhe?.chiTietChuyenBay?.ngayDi)} - {formatTime(selectedFlight.chiTietGhe?.chiTietChuyenBay?.gioDi)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Điểm đến</p>
                    <p className="font-semibold">{selectedFlight.chiTietGhe?.chiTietChuyenBay?.tuyenBay?.sanBayDen?.tenSanBay}</p>
                    <p className="text-sm text-gray-500">{selectedFlight.chiTietGhe?.chiTietChuyenBay?.tuyenBay?.sanBayDen?.thanhPhoSanBay}</p>
                    <p className="text-sm">{formatDate(selectedFlight.chiTietGhe?.chiTietChuyenBay?.ngayDen)} - {formatTime(selectedFlight.chiTietGhe?.chiTietChuyenBay?.gioDen)}</p>
                  </div>
                </div>
              </div>

              {/* Passenger Info */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
                  👤 Thông tin hành khách
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Họ và tên</p>
                    <p className="font-semibold">{selectedFlight.hanhKhach?.hoVaTen}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Giới tính</p>
                    <p className="font-semibold">{selectedFlight.hanhKhach?.gioiTinh}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày sinh</p>
                    <p className="font-semibold">{formatDate(selectedFlight.hanhKhach?.ngaySinh)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Số điện thoại</p>
                    <p className="font-semibold">{selectedFlight.hanhKhach?.soDienThoai || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Seat Info */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
                  🪑 Thông tin ghế ngồi
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Số ghế</p>
                    <p className="font-semibold text-xl text-red-600">{selectedFlight.chiTietGhe?.maGhe}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Hạng vé</p>
                    <p className="font-semibold">{selectedFlight.chiTietGhe?.hangVe?.tenHangVe}</p>
                  </div>
                </div>
              </div>

              {/* Booking Info */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
                  📋 Thông tin đặt chỗ
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Mã đặt chỗ</p>
                    <p className="font-semibold">#{selectedFlight.maDatCho}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày đặt</p>
                    <p className="font-semibold">{formatDate(selectedFlight.ngayDatCho)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-end flex-shrink-0">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 sm:px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm sm:text-base"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default QuanLyChuyenBay;
