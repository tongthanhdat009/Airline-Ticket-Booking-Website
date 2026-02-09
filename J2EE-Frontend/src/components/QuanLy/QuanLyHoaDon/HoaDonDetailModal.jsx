import React from 'react';
import { FaTimes, FaFilePdf } from 'react-icons/fa';

/**
 * Modal hiển thị chi tiết hóa đơn
 * @param {Object} props
 * @param {boolean} props.isOpen - Trạng thái hiển thị modal
 * @param {Object} props.hoaDon - Dữ liệu hóa đơn
 * @param {boolean} props.exportLoading - Trạng thái đang export
 * @param {Function} props.onClose - Callback khi đóng modal
 * @param {Function} props.onExportPdf - Callback khi export PDF
 */
const HoaDonDetailModal = ({ 
  isOpen, 
  hoaDon, 
  exportLoading = false, 
  onClose, 
  onExportPdf 
}) => {
  if (!isOpen || !hoaDon) return null;

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format date time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  // Get status text and color
  const getStatusStyle = (status) => {
    switch (status) {
      case 'DA_PHAT_HANH':
        return { text: 'Đã phát hành', color: 'bg-green-100 text-green-700' };
      case 'DA_HUY':
        return { text: 'Đã hủy', color: 'bg-red-100 text-red-700' };
      case 'DIEU_CHINH':
        return { text: 'Điều chỉnh', color: 'bg-yellow-100 text-yellow-700' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  const status = getStatusStyle(hoaDon.trangThai);

  const handleExportPdf = () => {
    onClose();
    onExportPdf(hoaDon.maHoaDon);
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>

      {/* Modal - Full screen on mobile, centered modal on desktop */}
      <div className="relative z-10 h-full w-full md:h-[85vh] md:max-w-4xl md:mx-auto md:my-8 md:rounded-xl bg-white md:shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="[background:linear-gradient(to_right,rgb(37,99,235),rgb(29,78,216))] text-white px-4 md:px-6 py-3 md:py-4 flex justify-between items-center shrink-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg md:text-xl font-bold truncate">Chi tiết hóa đơn</h2>
            <p className="text-xs md:text-sm text-blue-100 mt-1 truncate">{hoaDon.soHoaDon}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors p-1 hover:bg-white/10 rounded-lg ml-2 shrink-0"
          >
            <FaTimes className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-white p-4 md:p-6">
          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
              <p className="text-xs text-gray-500 font-semibold">Số hóa đơn</p>
              <p className="font-bold text-base md:text-lg text-blue-600 truncate">{hoaDon.soHoaDon}</p>
            </div>
            <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
              <p className="text-xs text-gray-500 font-semibold">Mã đơn hàng</p>
              <p className="font-medium text-sm md:text-base text-gray-900 truncate">#{hoaDon.maDonHang}</p>
            </div>
            <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
              <p className="text-xs text-gray-500 font-semibold">PNR</p>
              <p className="font-medium text-sm md:text-base text-gray-900 truncate">{hoaDon.pnr || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
              <p className="text-xs text-gray-500 font-semibold">Ngày lập</p>
              <p className="font-medium text-sm md:text-base text-gray-900">{formatDateTime(hoaDon.ngayLap)}</p>
            </div>
          </div>

          {/* Thông tin khách hàng */}
          <div className="mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
              <div className="w-1 h-5 md:h-6 bg-blue-600 rounded-full"></div>
              Thông tin khách hàng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 bg-gray-50 p-3 md:p-4 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 font-semibold">Họ tên</p>
                <p className="font-medium text-sm md:text-base text-gray-900 break-words">{hoaDon.hoTenNguoiDat || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Email</p>
                <p className="font-medium text-sm md:text-base text-gray-900 break-words">{hoaDon.emailNguoiDat || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Số điện thoại</p>
                <p className="font-medium text-sm md:text-base text-gray-900 break-words">{hoaDon.soDienThoaiNguoiDat || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Thông tin tài chính */}
          <div className="mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
              <div className="w-1 h-5 md:h-6 bg-blue-600 rounded-full"></div>
              Thông tin tài chính
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 bg-gray-50 p-3 md:p-4 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 font-semibold">Tổng tiền</p>
                <p className="font-bold text-base md:text-lg text-gray-900">{formatCurrency(hoaDon.tongTien)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Thuế VAT</p>
                <p className="font-medium text-sm md:text-base text-gray-900">{formatCurrency(hoaDon.thueVAT)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Tổng thanh toán</p>
                <p className="font-bold text-base md:text-lg text-blue-600">{formatCurrency(hoaDon.tongThanhToan)}</p>
              </div>
            </div>
          </div>

          {/* Thông tin trạng thái */}
          <div className="mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
              <div className="w-1 h-5 md:h-6 bg-blue-600 rounded-full"></div>
              Trạng thái hóa đơn
            </h3>
            <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color} w-fit`}>
                  {status.text}
                </span>
                {hoaDon.nguoiLap && (
                  <span className="text-xs md:text-sm text-gray-600">
                    Người lập: <span className="font-medium">{hoaDon.nguoiLap}</span>
                  </span>
                )}
              </div>
              {hoaDon.ghiChu && (
                <div className="mt-2 md:mt-3">
                  <p className="text-xs text-gray-500 font-semibold">Ghi chú:</p>
                  <p className="text-xs md:text-sm text-gray-700 mt-1 break-words">{hoaDon.ghiChu}</p>
                </div>
              )}
            </div>
          </div>

          {/* Thông tin đơn hàng liên quan */}
          {hoaDon.trangThaiDonHang && (
            <div className="mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
                <div className="w-1 h-5 md:h-6 bg-blue-600 rounded-full"></div>
                Thông tin đơn hàng
              </h3>
              <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">Trạng thái đơn hàng</p>
                    <p className="font-medium text-sm md:text-base text-gray-900">{hoaDon.trangThaiDonHang}</p>
                  </div>
                  {hoaDon.tongGiaDonHang && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Tổng giá đơn hàng</p>
                      <p className="font-medium text-sm md:text-base text-gray-900">{formatCurrency(hoaDon.tongGiaDonHang)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Hidden on mobile, shown on desktop */}
        <div className="hidden md:flex justify-end gap-3 p-4 border-t bg-gray-50 shrink-0">
          {hoaDon.trangThai === 'DA_PHAT_HANH' && (
            <button
              onClick={handleExportPdf}
              disabled={exportLoading}
              className="[background:linear-gradient(to_right,rgb(239,68,68),rgb(225,29,72))] text-white px-6 py-2 rounded-lg hover:opacity-90 font-medium shadow-sm flex items-center gap-2 disabled:opacity-50 transition-opacity"
            >
              <FaFilePdf />
              Xuất PDF
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            Đóng
          </button>
        </div>

        {/* Mobile Footer - Shown only on mobile */}
        <div className="flex md:hidden justify-end gap-2 p-3 border-t bg-gray-50 shrink-0">
          {hoaDon.trangThai === 'DA_PHAT_HANH' && (
            <button
              onClick={handleExportPdf}
              disabled={exportLoading}
              className="[background:linear-gradient(to_right,rgb(239,68,68),rgb(225,29,72))] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 disabled:opacity-50"
            >
              <FaFilePdf className="text-sm" />
              PDF
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default HoaDonDetailModal;
