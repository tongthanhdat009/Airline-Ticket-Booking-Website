import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaReceipt, FaCheck, FaTimes, FaFilePdf, FaCreditCard, FaTimesCircle, FaSearch, FaFilter } from 'react-icons/fa';
import Toast from '../../components/common/Toast';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ModalDetailHoaDon from '../../components/KhachHang/ModalDetailHoaDon';
import TaiKhoanService from '../../services/TaiKhoanService';
import DatChoService from '../../services/DatChoService';
import VNPayService from '../../services/VNPayService';
import { getClientUserEmail, getClientAccessToken } from '../../utils/cookieUtils';
import { getPdfUrl } from '../../config/api.config';
import ProfileCard from './CaNhan/ProfileCard';
import useTitle from '../../hooks/useTitle';

function LichSuGiaoDich() {
  const navigate = useNavigate();
  useTitle('Lịch sử giao dịch - Airline Booking');
  const [loading, setLoading] = useState(true);
  const [accountInfo, setAccountInfo] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  // Toast state
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  // ConfirmDialog state
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

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const showConfirm = (title, message, type, confirmText, onConfirm) => {
    setConfirmDialog({ isVisible: true, title, message, type, confirmText, onConfirm });
  };

  const hideConfirm = () => {
    setConfirmDialog(prev => ({ ...prev, isVisible: false }));
  };

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
    const fetchPaymentHistory = async () => {
      if (!accountInfo?.hanhKhach?.maHanhKhach) return;

      try {
        setHistoryLoading(true);
        const response = await DatChoService.getLichSuThanhToan(accountInfo.hanhKhach.maHanhKhach);
        setPaymentHistory(response.data || []);
      } catch (error) {
        console.error('Lỗi khi lấy lịch sử thanh toán:', error);
        setPaymentHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    if (accountInfo) {
      fetchPaymentHistory();
    }
  }, [accountInfo]);

  const handleViewDetail = async (payment) => {
    try {
      const response = await DatChoService.getDatChoById(payment.datCho.maDatCho);
      setBookingDetails(response.data);
      setSelectedPayment(payment);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết đặt chỗ:', error);
      showToast('Có lỗi khi tải chi tiết hóa đơn', 'error');
    }
  };

  const handleDownloadPDF = async (maThanhToan) => {
    try {
      const token = getClientAccessToken();
      const response = await fetch(getPdfUrl(`/client/invoice/pdf/${maThanhToan}`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Không thể tải PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${maThanhToan}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Lỗi khi tải PDF:', error);
      showToast('Có lỗi khi tải PDF hóa đơn', 'error');
    }
  };

  const handleCancelTransaction = (maDatCho) => {
    showConfirm(
      'Xác nhận hủy giao dịch',
      'Bạn có chắc chắn muốn hủy giao dịch này? Điều này sẽ hủy đặt chỗ và xóa toàn bộ thông tin liên quan.',
      'danger',
      'Hủy giao dịch',
      async () => {
        try {
          await DatChoService.huyDatCho(maDatCho);
          showToast('Hủy giao dịch thành công!', 'success');
          const response = await DatChoService.getLichSuThanhToan(accountInfo.hanhKhach.maHanhKhach);
          setPaymentHistory(response.data || []);
          hideConfirm();
        } catch (error) {
          console.error('Lỗi khi hủy giao dịch:', error);
          showToast('Có lỗi xảy ra khi hủy giao dịch', 'error');
        }
      }
    );
  };

  const handlePayment = async (maThanhToan) => {
    try {
      const response = await VNPayService.createPayment(maThanhToan);
      if (response.success && response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        showToast('Không thể tạo URL thanh toán: ' + response.message, 'error');
      }
    } catch (error) {
      console.error('Lỗi khi tạo thanh toán:', error);
      showToast('Có lỗi xảy ra khi tạo thanh toán', 'error');
    }
  };

  const getStatusBadge = (daThanhToan) => {
    if (daThanhToan === 'Y') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FaCheck className="w-3 h-3" />
          Đã thanh toán
        </span>
      );
    }
    if (daThanhToan === 'H') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <FaTimes className="w-3 h-3" />
          Đã hủy
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <FaCreditCard className="w-3 h-3" />
        Chưa thanh toán
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const filteredPayments = paymentHistory.filter(payment => {
    const matchStatus = filters.status === 'all' ||
      (filters.status === 'paid' && payment.daThanhToan === 'Y') ||
      (filters.status === 'unpaid' && payment.daThanhToan === 'N') ||
      (filters.status === 'cancelled' && payment.daThanhToan === 'H');

    const matchSearch = !filters.search ||
      payment.datCho?.chiTietGhe?.chiTietChuyenBay?.soHieuChuyenBay?.toLowerCase().includes(filters.search.toLowerCase()) ||
      payment.maThanhToan?.toString().includes(filters.search);

    return matchStatus && matchSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-green-500 mx-auto mb-6"></div>
          <p className="text-xl font-semibold text-gray-700">Đang tải thông tin...</p>
          <p className="text-gray-500 mt-2">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Left Sidebar - Profile Card */}
          <ProfileCard accountInfo={accountInfo} onNavigate={navigate} activePage="transactions" />

          {/* Right Content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 sm:px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <FaReceipt className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Lịch sử giao dịch</h1>
                    <p className="text-green-100 text-sm">Xem lại các giao dịch thanh toán của bạn</p>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <FaFilter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Bộ lọc</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="all">Tất cả</option>
                      <option value="paid">Đã thanh toán</option>
                      <option value="unpaid">Chưa thanh toán</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FaSearch className="w-4 h-4" />
                      Tìm kiếm
                    </label>
                    <input
                      type="text"
                      placeholder="Tìm theo mã giao dịch, số hiệu chuyến bay..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Payment History List */}
              <div className="p-6">
                {historyLoading ? (
                  <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải lịch sử giao dịch...</p>
                  </div>
                ) : filteredPayments.length === 0 ? (
                  <div className="bg-gray-50 rounded-2xl p-16 text-center border-2 border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaReceipt className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có giao dịch nào</h3>
                    <p className="text-gray-500 mb-6">Bạn chưa có giao dịch thanh toán nào hoặc không tìm thấy kết quả phù hợp</p>
                    <button
                      onClick={() => navigate('/')}
                      className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-medium"
                    >
                      <FaReceipt />
                      Đặt vé ngay
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPayments.map((payment) => (
                      <div key={payment.maThanhToan} className="bg-gray-50 rounded-xl hover:bg-gray-100 transition p-5 border border-gray-200">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          {/* Payment Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4 flex-wrap">
                              <span className="text-sm text-gray-500">Mã giao dịch:</span>
                              <span className="font-bold text-lg text-green-600">#{payment.maThanhToan}</span>
                              {getStatusBadge(payment.daThanhToan)}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              {/* Flight Info */}
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs text-gray-500">Chuyến bay</p>
                                  <p className="font-semibold text-gray-900">
                                    {payment.datCho?.chiTietGhe?.chiTietChuyenBay?.soHieuChuyenBay || 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Hành trình</p>
                                  <p className="text-sm text-gray-700">
                                    {payment.datCho?.chiTietGhe?.chiTietChuyenBay?.tuyenBay?.sanBayDi?.thanhPhoSanBay}
                                    {' → '}
                                    {payment.datCho?.chiTietGhe?.chiTietChuyenBay?.tuyenBay?.sanBayDen?.thanhPhoSanBay}
                                  </p>
                                </div>
                              </div>

                              {/* Amount & Date */}
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs text-gray-500">Số tiền</p>
                                  <p className="font-bold text-xl text-green-600">
                                    {formatCurrency(payment.soTien)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Ngày đặt</p>
                                  <p className="text-sm text-gray-700">
                                    {formatDate(payment.datCho?.ngayDatCho)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <span>Ghế: <span className="font-medium">{payment.datCho?.chiTietGhe?.maGhe || 'N/A'}</span></span>
                              <span>Hạng vé: <span className="font-medium">{payment.datCho?.chiTietGhe?.hangVe?.tenHangVe || 'N/A'}</span></span>
                              {payment.ngayHetHan && (
                                <span>Hết hạn: <span className="font-medium">{formatDate(payment.ngayHetHan)}</span></span>
                              )}
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="lg:ml-6 flex flex-col gap-2">
                            <button
                              onClick={() => handleViewDetail(payment)}
                              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                            >
                              Xem chi tiết
                            </button>
                            {payment.daThanhToan === 'Y' ? (
                              <button
                                onClick={() => handleDownloadPDF(payment.maThanhToan)}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
                              >
                                <FaFilePdf />
                                Tải PDF
                              </button>
                            ) : payment.daThanhToan === 'H' ? (
                              <div className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed font-medium">
                                <FaTimesCircle />
                                Đã hủy
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => handlePayment(payment.maThanhToan)}
                                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
                                >
                                  <FaCreditCard />
                                  Thanh toán VNPay
                                </button>
                                {payment.datCho?.chiTietGhe?.chiTietChuyenBay?.trangThai !== 'Đã bay' &&
                                 payment.datCho?.chiTietGhe?.chiTietChuyenBay?.trangThai !== 'Đã hủy' && (
                                  <button
                                    onClick={() => handleCancelTransaction(payment.datCho.maDatCho)}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
                                  >
                                    <FaTimes />
                                    Hủy giao dịch
                                  </button>
                                )}
                              </>
                            )}
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
      <ModalDetailHoaDon
        isVisible={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        selectedPayment={selectedPayment}
        bookingDetails={bookingDetails}
        onDownloadPDF={handleDownloadPDF}
        onPayment={handlePayment}
      />

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
    </div>
  );
};

export default LichSuGiaoDich;
