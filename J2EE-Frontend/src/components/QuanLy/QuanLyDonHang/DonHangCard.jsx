import React, { memo } from 'react';
import { FaEye, FaEdit, FaTrash, FaShoppingCart, FaEnvelope, FaCalendar, FaMoneyBillWave, FaTicketAlt } from 'react-icons/fa';
import PropTypes from 'prop-types';

/**
 * DonHangCard - Card component for displaying order information
 *
 * Displays key order details in a responsive card format with action buttons.
 * Used in the card view of QuanLyDonHang page.
 */
const DonHangCard = memo(({
  data,
  onView,
  onEdit,
  onDelete
}) => {
  if (!data) {
    return null;
  }

  const {
    maDonHang,
    pnr,
    hanhKhachNguoiDat,
    emailNguoiDat,
    ngayDat,
    tongGia,
    trangThai
  } = data;

  // Format date
  const formatNgayDat = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('vi-VN');
    } catch {
      return date;
    }
  };

  // Format currency
  const formatTongGia = (value) => {
    if (!value) return '0đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  // Get status info
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

  const status = getTrangThaiInfo(trangThai);
  const customerName = hanhKhachNguoiDat?.hoVaTen || 'Không có tên';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar icon */}
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <FaShoppingCart className="text-indigo-600" size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">#{maDonHang}</h3>
            <p className="text-sm text-indigo-600 font-medium">{pnr || 'N/A'}</p>
          </div>
        </div>
        {/* Status Badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color} flex-shrink-0`}>
          {status.icon} {status.text}
        </span>
      </div>

      {/* Card Body */}
      <div className="space-y-2 text-sm">
        {/* Customer Name */}
        <div className="flex items-start gap-2 text-gray-600">
          <FaTicketAlt className="text-gray-400 mt-0.5 flex-shrink-0" size={12} />
          <span className="truncate font-medium">{customerName}</span>
        </div>

        {/* Email */}
        {emailNguoiDat && (
          <div className="flex items-start gap-2 text-gray-600">
            <FaEnvelope className="text-gray-400 mt-0.5 flex-shrink-0" size={12} />
            <span className="truncate">{emailNguoiDat}</span>
          </div>
        )}

        {/* Order Date */}
        {ngayDat && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaCalendar className="text-gray-400 flex-shrink-0" size={12} />
            <span>{formatNgayDat(ngayDat)}</span>
          </div>
        )}

        {/* Total Price */}
        <div className="flex items-center gap-2 text-gray-900 font-semibold">
          <FaMoneyBillWave className="text-green-600 flex-shrink-0" size={12} />
          <span>{formatTongGia(tongGia)}</span>
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
        <button
          onClick={() => onEdit?.(data)}
          className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1.5"
          title="Chỉnh sửa"
        >
          <FaEdit size={14} />
          <span className="hidden sm:inline">Sửa</span>
        </button>
        <button
          onClick={() => onDelete?.(data)}
          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5"
          title="Xóa"
        >
          <FaTrash size={14} />
          <span className="hidden sm:inline">Xóa</span>
        </button>
      </div>
    </div>
  );
});

DonHangCard.displayName = 'DonHangCard';

DonHangCard.propTypes = {
  /**
   * Order data object
   */
  data: PropTypes.shape({
    maDonHang: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    pnr: PropTypes.string,
    hanhKhachNguoiDat: PropTypes.shape({
      hoVaTen: PropTypes.string,
    }),
    emailNguoiDat: PropTypes.string,
    ngayDat: PropTypes.oneOfType([PropTypes.string, PropTypes.date]),
    tongGia: PropTypes.number,
    trangThai: PropTypes.string,
  }),
  /**
   * Callback when view button is clicked
   */
  onView: PropTypes.func,
  /**
   * Callback when edit button is clicked
   */
  onEdit: PropTypes.func,
  /**
   * Callback when delete button is clicked
   */
  onDelete: PropTypes.func,
};

DonHangCard.defaultProps = {
  data: null,
  onView: undefined,
  onEdit: undefined,
  onDelete: undefined,
};

export default DonHangCard;
