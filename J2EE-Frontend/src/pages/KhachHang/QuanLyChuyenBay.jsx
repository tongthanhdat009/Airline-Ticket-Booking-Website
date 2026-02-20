import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlane, FaCheck, FaTimes, FaExclamationTriangle, FaSearch, FaFilter, FaWifi, FaArrowRight } from 'react-icons/fa';
import TaiKhoanService from '../../services/TaiKhoanService';
import DatChoService from '../../services/DatChoService';
import { getClientUserEmail, getClientAccessToken } from '../../utils/cookieUtils';
import useWebSocket from '../../hooks/useWebSocket';
import ProfileCard from './CaNhan/ProfileCard';
import useTitle from '../../hooks/useTitle';

function QuanLyChuyenBay() {
  const navigate = useNavigate();
  useTitle('Chuyến bay của tôi - Airline Booking');
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

    const updatedFlight = flights.find(f => f.chiTietGhe?.chiTietChuyenBay?.maChuyenBay === latestUpdate.maChuyenBay);
    if (updatedFlight) {
      const flightNumber = updatedFlight.chiTietGhe?.chiTietChuyenBay?.soHieuChuyenBay || `#${latestUpdate.maChuyenBay}`;
      setUpdateMessage(`Chuyến bay ${flightNumber} đã cập nhật: ${latestUpdate.oldStatus} → ${latestUpdate.newStatus}`);
      setShowUpdateNotification(true);

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
      'Đã bay': { bg: 'bg-green-100', text: 'text-green-800', icon: <FaCheck className="w-3 h-3" /> },
      'Đang chờ': { bg: 'bg-blue-100', text: 'text-blue-800', icon: <FaPlane className="w-3 h-3" /> },
      'Đã hủy': { bg: 'bg-red-100', text: 'text-red-800', icon: <FaTimes className="w-3 h-3" /> },
      'Delay': { bg: 'bg-orange-100', text: 'text-orange-800', icon: <FaExclamationTriangle className="w-3 h-3" /> }
    };

    const config = statusConfig[status] || statusConfig['Đang chờ'];

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icon}
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

  const filteredFlights = flights.filter(flight => {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-red-500 mx-auto mb-6"></div>
          <p className="text-xl font-semibold text-gray-700">Đang tải thông tin...</p>
          <p className="text-gray-500 mt-2">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Left Sidebar - Profile Card */}
          <ProfileCard accountInfo={accountInfo} onNavigate={navigate} activePage="flights" />

          {/* Right Content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 sm:px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <FaPlane className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white">Chuyến bay của tôi</h1>
                      <p className="text-red-100 text-sm">Xem và quản lý các chuyến bay đã đặt của bạn</p>
                    </div>
                  </div>

                  {/* WebSocket Status */}
                  <div className="hidden sm:flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className={`text-sm font-medium ${isConnected ? 'text-white' : 'text-white/70'}`}>
                      {isConnected ? 'Real-time' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>

              {/* WebSocket Update Notification */}
              {showUpdateNotification && (
                <div className="mx-6 mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaPlane className="text-blue-500 text-xl animate-pulse" />
                    <span className="text-blue-800 font-medium">{updateMessage}</span>
                  </div>
                  <button
                    onClick={() => setShowUpdateNotification(false)}
                    className="text-blue-500 hover:text-blue-700 font-bold text-xl"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Filters */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <FaFilter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Bộ lọc</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="all">Tất cả</option>
                      <option value="Đã bay">Đã bay</option>
                      <option value="Đang chờ">Đang chờ</option>
                      <option value="Đã hủy">Đã hủy</option>
                      <option value="Delay">Delay</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FaSearch className="w-4 h-4" />
                      Tìm kiếm
                    </label>
                    <input
                      type="text"
                      placeholder="Tìm theo số hiệu, điểm đi, điểm đến..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Flight List */}
              <div className="p-6">
                {flightsLoading ? (
                  <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-red-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải danh sách chuyến bay...</p>
                  </div>
                ) : filteredFlights.length === 0 ? (
                  <div className="bg-gray-50 rounded-2xl p-16 text-center border-2 border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaPlane className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có chuyến bay nào</h3>
                    <p className="text-gray-500 mb-6">Bạn chưa đặt chuyến bay nào hoặc không tìm thấy kết quả phù hợp</p>
                    <button
                      onClick={() => navigate('/')}
                      className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition font-medium"
                    >
                      <FaPlane />
                      Đặt vé ngay
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredFlights.map((flight) => (
                      <div key={flight.maDatCho} className="bg-gray-50 rounded-xl hover:bg-gray-100 transition p-5 border border-gray-200">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          {/* Flight Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4 flex-wrap">
                              <span className="text-lg font-bold text-red-600">
                                {flight.chiTietGhe?.chiTietChuyenBay?.soHieuChuyenBay || 'N/A'}
                              </span>
                              {getStatusBadge(flight.chiTietGhe?.chiTietChuyenBay?.trangThai || 'Đang chờ')}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                                <div className="flex flex-col items-center">
                                  <div className="w-16 h-0.5 bg-red-300 relative">
                                    <FaArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                                  </div>
                                </div>
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

                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <span>Hạng vé: <span className="font-medium">{flight.chiTietGhe?.hangVe?.tenHangVe || 'N/A'}</span></span>
                              <span>Ghế: <span className="font-medium">{flight.chiTietGhe?.maGhe || 'N/A'}</span></span>
                              <span>Ngày đặt: <span className="font-medium">{formatDate(flight.ngayDatCho)}</span></span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2 lg:ml-6">
                            <button
                              onClick={() => handleViewDetail(flight)}
                              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
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
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedFlight && (
        <div className="fixed inset-0 flex items-center justify-center z-[1100] p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetailModal(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[95vh] overflow-hidden flex flex-col relative z-10">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FaPlane />
                Chi tiết chuyến bay
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-white/80 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Flight Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-600">
                    <FaPlane />
                    Thông tin chuyến bay
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-gray-600">Số hiệu</p>
                      <p className="font-semibold">{selectedFlight.chiTietGhe?.chiTietChuyenBay?.soHieuChuyenBay}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Trạng thái</p>
                      {getStatusBadge(selectedFlight.chiTietGhe?.chiTietChuyenBay?.trangThai)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Điểm đi</p>
                      <p className="font-semibold">{selectedFlight.chiTietGhe?.chiTietChuyenBay?.tuyenBay?.sanBayDi?.tenSanBay}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Điểm đến</p>
                      <p className="font-semibold">{selectedFlight.chiTietGhe?.chiTietChuyenBay?.tuyenBay?.sanBayDen?.tenSanBay}</p>
                    </div>
                  </div>
                </div>

                {/* Seat Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-600">
                    <FaCheck />
                    Thông tin ghế
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
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

                {/* Passenger Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-600">
                    <FaCheck />
                    Thông tin hành khách
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-gray-600">Họ tên</p>
                      <p className="font-semibold">{selectedFlight.hanhKhach?.hoVaTen}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Giới tính</p>
                      <p className="font-semibold">{selectedFlight.hanhKhach?.gioiTinh}</p>
                    </div>
                  </div>
                </div>

                {/* Booking Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-600">
                    <FaCheck />
                    Thông tin đặt chỗ
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
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
            </div>

            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuanLyChuyenBay;
