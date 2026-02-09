import React, { memo } from 'react';
import { FaEye, FaCheck, FaTimes, FaUndo, FaUser, FaEnvelope, FaPhone, FaMoneyBillWave, FaCalendar, FaCreditCard } from 'react-icons/fa';
import PropTypes from 'prop-types';

/**
 * HoanTienCard - Card component for displaying refund information
 *
 * Displays key refund details in a responsive card format with action buttons.
 * Used in the card view of QuanLyHoanTien page.
 */
const HoanTienCard = memo(({
  data,
  onView,
  onApprove,
  onReject
}) => {
  if (!data) {
    return null;
  }

  const {
    maHoanTien,
    maHoaDon,
    hoTen,
    email,
    soDienThoai,
    ngayYeuCau,
    soTienHoan,
    phuongThucHoan,
    trangThai,
    lyDo
  } = data;

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return '0đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Format date time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  // Get status info
  const getTrangThaiInfo = (trangThai) => {
    switch (trangThai) {
      case 'DA_HOAN_TIEN':
        return { text: 'Đã hoàn tiền', bgColor: 'bg-green-100', textColor: 'text-green-700', icon: '✓' };
      case 'CHO_XU_LY':
        return { text: 'Chờ xử lý', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', icon: '⏱' };
      case 'TU_CHOI':
        return { text: 'Từ chối', bgColor: 'bg-red-100', textColor: 'text-red-700', icon: '✕' };
      default:
        return { text: trangThai || 'N/A', bgColor: 'bg-gray-100', textColor: 'text-gray-700', icon: '?' };
    }
  };

  // Get refund method text
  const getPhuongThucText = (phuongThuc) => {
    switch (phuongThuc) {
      case 'VNPAY': return 'VNPay';
      case 'CHUYEN_KHOAN': return 'Chuyển khoản';
      case 'TIEN_MAT': return 'Tiền mặt';
      default: return phuongThuc || 'N/A';
    }
  };

  const statusInfo = getTrangThaiInfo(trangThai);
  const canProcess = trangThai === 'CHO_XU_LY';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar icon */}
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <FaUndo className="text-amber-600" size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">#{maHoanTien}</h3>
            <p className="text-sm text-amber-600 font-medium">{maHoaDon || 'N/A'}</p>
          </div>
        </div>
        {/* Status badge */}
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.textColor} flex-shrink-0`}>
          {statusInfo.icon} {statusInfo.text}
        </span>
      </div>

      {/* Card Body */}
      <div className="space-y-2 text-sm">
        {/* Customer Name */}
        {hoTen && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaUser className="text-gray-400 flex-shrink-0" size={12} />
            <span className="truncate font-medium">{hoTen}</span>
          </div>
        )}

        {/* Email */}
        {email && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaEnvelope className="text-gray-400 flex-shrink-0" size={12} />
            <span className="truncate">{email}</span>
          </div>
        )}

        {/* Phone */}
        {soDienThoai && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaPhone className="text-gray-400 flex-shrink-0" size={12} />
            <span>{soDienThoai}</span>
          </div>
        )}

        {/* Request Date */}
        {ngayYeuCau && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaCalendar className="text-gray-400 flex-shrink-0" size={12} />
            <span className="text-xs">{formatDateTime(ngayYeuCau)}</span>
          </div>
        )}

        {/* Refund Amount - Highlighted */}
        <div className="flex items-center gap-2 pt-2 mt-2 border-t border-gray-100">
          <FaMoneyBillWave className="text-amber-600 flex-shrink-0" size={14} />
          <span className="font-bold text-amber-700">{formatCurrency(soTienHoan)}</span>
          <span className="text-xs text-gray-500 ml-auto">via {getPhuongThucText(phuongThucHoan)}</span>
        </div>

        {/* Reason (if exists) */}
        {lyDo && (
          <div className="flex items-start gap-2 text-gray-600 mt-2">
            <span className="text-xs text-gray-500 flex-shrink-0">Lý do:</span>
            <span className="line-clamp-2 text-xs italic">{lyDo}</span>
          </div>
        )}
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
        {canProcess && (
          <>
            <button
              onClick={() => onApprove?.(data)}
              className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1.5"
              title="Duyệt hoàn tiền"
            >
              <FaCheck size={14} />
              <span className="hidden sm:inline">Duyệt</span>
            </button>
            <button
              onClick={() => onReject?.(data)}
              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5"
              title="Từ chối"
            >
              <FaTimes size={14} />
              <span className="hidden sm:inline">Từ chối</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
});

HoanTienCard.displayName = 'HoanTienCard';

HoanTienCard.propTypes = {
  /**
   * Refund data object
   */
  data: PropTypes.shape({
    maHoanTien: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    maHoaDon: PropTypes.string,
    hoTen: PropTypes.string,
    email: PropTypes.string,
    soDienThoai: PropTypes.string,
    ngayYeuCau: PropTypes.oneOfType([PropTypes.string, PropTypes.date]),
    soTienHoan: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    phuongThucHoan: PropTypes.string,
    trangThai: PropTypes.string,
    lyDo: PropTypes.string,
    taiKhoanHoan: PropTypes.string,
    nguoiXuLy: PropTypes.string,
    ngayXuLy: PropTypes.oneOfType([PropTypes.string, PropTypes.date]),
    lyDoTuChoi: PropTypes.string,
  }),
  /**
   * Callback when view button is clicked
   */
  onView: PropTypes.func,
  /**
   * Callback when approve button is clicked
   */
  onApprove: PropTypes.func,
  /**
   * Callback when reject button is clicked
   */
  onReject: PropTypes.func,
};

HoanTienCard.defaultProps = {
  data: null,
  onView: undefined,
  onApprove: undefined,
  onReject: undefined,
};

export default HoanTienCard;
