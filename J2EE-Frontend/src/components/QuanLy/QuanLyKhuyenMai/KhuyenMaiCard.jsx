import React, { memo } from 'react';
import { FaEye, FaEdit, FaTrash, FaTags, FaCalendar, FaPercent, FaMoneyBill, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import PropTypes from 'prop-types';

/**
 * KhuyenMaiCard - Card component for displaying promotion information
 *
 * Displays key promotion details in a responsive card format with action buttons.
 * Used in the card view of QuanLyKhuyenMai page.
 */
const KhuyenMaiCard = memo(({
  data,
  onView,
  onEdit,
  onDelete
}) => {
  if (!data) {
    return null;
  }

  const {
    maKhuyenMai,
    tenKhuyenMai,
    maKM,
    loaiKhuyenMai,
    giaTriGiam,
    soLuong,
    soLuongDaDuocDung,
    ngayBatDau,
    ngayKetThuc,
    trangThai
  } = data;

  // Format currency for FIXED type discounts
  const formatCurrency = (value) => {
    if (!value) return '0đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Format dates
  const formatDate = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('vi-VN');
    } catch {
      return date;
    }
  };

  // Get promotion type text
  const getLoaiKhuyenMaiText = (loai) => {
    switch (loai) {
      case 'PERCENT': return 'Phần trăm';
      case 'FIXED': return 'Tiền mặt';
      default: return loai || '-';
    }
  };

  // Format discount value
  const formatDiscountValue = () => {
    if (loaiKhuyenMai === 'PERCENT') {
      return `${giaTriGiam || 0}%`;
    }
    return formatCurrency(giaTriGiam);
  };

  // Get status badge info
  const getStatusInfo = () => {
    if (trangThai === 'ACTIVE') {
      return {
        text: 'Hoạt động',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        icon: <FaCheckCircle size={12} />
      };
    }
    return {
      text: 'Vô hiệu',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      icon: <FaTimesCircle size={12} />
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar icon */}
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <FaTags className="text-blue-600" size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">{tenKhuyenMai || 'Không có tên'}</h3>
            <p className="text-sm text-blue-600 font-medium">#{maKhuyenMai}</p>
          </div>
        </div>
        {/* Status Badge */}
        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusInfo.bgColor} ${statusInfo.textColor}`}>
          {statusInfo.icon}
          <span>{statusInfo.text}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="space-y-2 text-sm">
        {/* Promotion Code */}
        {maKM && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaTags className="text-gray-400 flex-shrink-0" size={12} />
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
              {maKM}
            </span>
          </div>
        )}

        {/* Promotion Type */}
        <div className="flex items-center gap-2 text-gray-600">
          {loaiKhuyenMai === 'PERCENT' ? (
            <FaPercent className="text-gray-400 flex-shrink-0" size={12} />
          ) : (
            <FaMoneyBill className="text-gray-400 flex-shrink-0" size={12} />
          )}
          <span>{getLoaiKhuyenMaiText(loaiKhuyenMai)}</span>
        </div>

        {/* Discount Value */}
        <div className="flex items-center gap-2 text-gray-900 font-semibold">
          {loaiKhuyenMai === 'PERCENT' ? (
            <FaPercent className="text-rose-500 flex-shrink-0" size={12} />
          ) : (
            <FaMoneyBill className="text-rose-500 flex-shrink-0" size={12} />
          )}
          <span>Giảm: {formatDiscountValue()}</span>
        </div>

        {/* Quantity */}
        {soLuong !== null && soLuong !== undefined && (
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-gray-400">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
              </svg>
            </span>
            <span>Số lượng: {soLuongDaDuocDung || 0}/{soLuong === 0 ? '∞' : soLuong}</span>
          </div>
        )}

        {/* Start Date */}
        {ngayBatDau && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaCalendar className="text-gray-400 flex-shrink-0" size={12} />
            <span>Bắt đầu: {formatDate(ngayBatDau)}</span>
          </div>
        )}

        {/* End Date */}
        {ngayKetThuc && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaCalendar className="text-gray-400 flex-shrink-0" size={12} />
            <span>Kết thúc: {formatDate(ngayKetThuc)}</span>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => onView?.(data)}
          className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5"
          title="Xem thông tin"
        >
          <FaEye size={14} />
          <span className="hidden sm:inline">Xem</span>
        </button>
        <button
          onClick={() => onEdit?.(data)}
          disabled={trangThai !== 'INACTIVE'}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5 ${
            trangThai === 'INACTIVE'
              ? 'text-green-600 hover:bg-green-50'
              : 'text-gray-400 cursor-not-allowed'
          }`}
          title={trangThai === 'INACTIVE' ? 'Chỉnh sửa' : 'Chỉ sửa khi INACTIVE'}
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

KhuyenMaiCard.displayName = 'KhuyenMaiCard';

KhuyenMaiCard.propTypes = {
  /**
   * Promotion data object
   */
  data: PropTypes.shape({
    maKhuyenMai: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tenKhuyenMai: PropTypes.string,
    maKM: PropTypes.string,
    loaiKhuyenMai: PropTypes.string,
    giaTriGiam: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    soLuong: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    soLuongDaDuocDung: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ngayBatDau: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    ngayKetThuc: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
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

KhuyenMaiCard.defaultProps = {
  data: null,
  onView: undefined,
  onEdit: undefined,
  onDelete: undefined,
};

export default KhuyenMaiCard;
