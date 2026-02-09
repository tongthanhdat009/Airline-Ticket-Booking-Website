import React, { memo } from 'react';
import { FaEye, FaFilePdf, FaFileInvoice, FaCalendar, FaUser, FaMoneyBillWave, FaHashtag } from 'react-icons/fa';

/**
 * HoaDonCard - Card component for displaying invoice information
 *
 * Displays key invoice details in a responsive card format with action buttons.
 * Used in the card view of QuanLyHoaDon page.
 */
const HoaDonCard = memo(({
  data,
  onView,
  onExportPdf
}) => {
  if (!data) {
    return null;
  }

  const {
    maHoaDon,
    soHoaDon,
    maDonHang,
    pnr,
    ngayLap,
    hoTenNguoiDat,
    emailNguoiDat,
    soDienThoaiNguoiDat,
    tongTien,
    thueVAT,
    tongThanhToan,
    trangThai
  } = data;

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  // Get status style
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

  const status = getStatusStyle(trangThai);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Invoice icon */}
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <FaFileInvoice className="text-blue-600" size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">{soHoaDon || 'Không có số HĐ'}</h3>
            <p className="text-sm text-blue-600 font-medium">#{maHoaDon}</p>
          </div>
        </div>
        {/* Status Badge */}
        <span className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${status.color}`}>
          {status.text}
        </span>
      </div>

      {/* Card Body */}
      <div className="space-y-2 text-sm">
        {/* PNR Code */}
        {pnr && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaHashtag className="text-gray-400 flex-shrink-0" size={12} />
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
              {pnr}
            </span>
          </div>
        )}

        {/* Order ID */}
        <div className="flex items-center gap-2 text-gray-600">
          <FaHashtag className="text-gray-400 flex-shrink-0" size={12} />
          <span className="truncate">Đơn hàng: #{maDonHang}</span>
        </div>

        {/* Customer Name */}
        <div className="flex items-center gap-2 text-gray-600">
          <FaUser className="text-gray-400 flex-shrink-0" size={12} />
          <span className="truncate font-medium text-gray-900">{hoTenNguoiDat || 'N/A'}</span>
        </div>

        {/* Email */}
        {emailNguoiDat && (
          <div className="flex items-start gap-2 text-gray-600">
            <span className="text-gray-400 mt-0.5 flex-shrink-0">@</span>
            <span className="truncate">{emailNguoiDat}</span>
          </div>
        )}

        {/* Phone */}
        {soDienThoaiNguoiDat && (
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-gray-400 flex-shrink-0">📞</span>
            <span className="truncate">{soDienThoaiNguoiDat}</span>
          </div>
        )}

        {/* Issue Date */}
        {ngayLap && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaCalendar className="text-gray-400 flex-shrink-0" size={12} />
            <span>Ngày lập: {formatDate(ngayLap)}</span>
          </div>
        )}

        {/* Financial Info */}
        <div className="pt-2 mt-2 border-t border-gray-100 space-y-1">
          {/* Total Amount */}
          <div className="flex justify-between items-center text-gray-700">
            <span className="text-xs text-gray-500">Tổng tiền:</span>
            <span className="font-medium">{formatCurrency(tongTien)}</span>
          </div>
          {/* VAT */}
          {thueVAT && thueVAT > 0 && (
            <div className="flex justify-between items-center text-gray-700">
              <span className="text-xs text-gray-500">Thuế VAT:</span>
              <span className="text-xs">{formatCurrency(thueVAT)}</span>
            </div>
          )}
          {/* Total Payment */}
          <div className="flex justify-between items-center text-blue-700">
            <span className="text-xs text-blue-600 font-semibold">Tổng thanh toán:</span>
            <span className="font-bold text-blue-700">{formatCurrency(tongThanhToan)}</span>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => onView?.(data)}
          className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5"
          title="Xem chi tiết"
        >
          <FaEye size={14} />
          <span className="hidden sm:inline">Xem</span>
        </button>
        {trangThai === 'DA_PHAT_HANH' && (
          <button
            onClick={() => onExportPdf?.(maHoaDon)}
            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5"
            title="Xuất PDF"
          >
            <FaFilePdf size={14} />
            <span className="hidden sm:inline">PDF</span>
          </button>
        )}
      </div>
    </div>
  );
});

HoaDonCard.displayName = 'HoaDonCard';

export default HoaDonCard;
