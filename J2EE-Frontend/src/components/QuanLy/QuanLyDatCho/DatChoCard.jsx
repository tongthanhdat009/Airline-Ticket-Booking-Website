import React, { memo } from 'react';
import {
  FaUserCheck,
  FaChair,
  FaExchangeAlt,
  FaTimesCircle,
  FaTicketAlt,
  FaPlane,
  FaUser,
  FaCalendar,
  FaMapMarkerAlt,
  FaIdCard,
  FaEye,
} from 'react-icons/fa';

/**
 * DatChoCard - Card component for displaying booking information
 *
 * Displays key booking details in a responsive card format with action buttons.
 * Used in the card view of QuanLyDatCho page.
 */
const DatChoCard = memo(({
  data,
  onCheckIn,
  onDoiGhe,
  onDoiHangVe,
  onDoiChuyen,
  onHuyVe,
  onView,
}) => {
  if (!data) {
    return null;
  }

  const {
    maDatCho,
    pnr,
    hoVaTen,
    cccd,
    soHieuChuyenBay,
    sanBayDi,
    sanBayDen,
    ngayGioDi,
    soGhe,
    tenHangVe,
    giaVe,
    checkInStatus,
  } = data;

  // Format date
  const formatNgayGioDi = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleString('vi-VN');
    } catch {
      return date;
    }
  };

  // Format currency
  const formatGiaVe = (value) => {
    if (!value) return '0đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  // Get check-in status
  const getCheckInStatus = (status) => {
    if (status === true || status === 'Đã check-in') {
      return {
        text: 'Đã check-in',
        color: 'bg-green-100 text-green-700',
        icon: <FaUserCheck size={12} />,
      };
    }
    return {
      text: 'Chưa check-in',
      color: 'bg-yellow-100 text-yellow-700',
      icon: <FaTicketAlt size={12} />,
    };
  };

  // Get seat color based on ticket class
  const getSeatColor = (hangVe) => {
    if (hangVe?.includes('Thương gia')) {
      return 'bg-blue-100 text-blue-700';
    }
    if (hangVe?.includes('Phổ thông đặc biệt')) {
      return 'bg-blue-100 text-blue-700';
    }
    return 'bg-gray-100 text-gray-700';
  };

  const checkInInfo = getCheckInStatus(checkInStatus);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar icon */}
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <FaTicketAlt className="text-blue-600" size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">{hoVaTen || 'Không có tên'}</h3>
            <p className="text-sm text-blue-600 font-medium">#{maDatCho}</p>
            {pnr && (
              <p className="text-xs text-gray-500">PNR: {pnr}</p>
            )}
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${checkInInfo.color}`}>
          {checkInInfo.icon}
          <span className="hidden sm:inline">{checkInInfo.text}</span>
        </span>
      </div>

      {/* Card Body */}
      <div className="space-y-2 text-sm">
        {/* Flight Info */}
        <div className="flex items-start gap-2 text-gray-600">
          <FaPlane className="text-gray-400 mt-0.5 flex-shrink-0" size={12} />
          <div>
            <p className="font-medium text-gray-900">{soHieuChuyenBay || '-'}</p>
            <p className="text-xs">
              {sanBayDi} → {sanBayDen}
            </p>
          </div>
        </div>

        {/* Departure Date/Time */}
        {ngayGioDi && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaCalendar className="text-gray-400 flex-shrink-0" size={12} />
            <span>{formatNgayGioDi(ngayGioDi)}</span>
          </div>
        )}

        {/* Seat Info */}
        {soGhe && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaChair className="text-gray-400 flex-shrink-0" size={12} />
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getSeatColor(tenHangVe)}`}>
              {soGhe}
              {tenHangVe && ` - ${tenHangVe}`}
            </span>
          </div>
        )}

        {/* ID Card */}
        {cccd && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaIdCard className="text-gray-400 flex-shrink-0" size={12} />
            <span className="truncate">{cccd}</span>
          </div>
        )}

        {/* Ticket Price */}
        {giaVe && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaTicketAlt className="text-gray-400 flex-shrink-0" size={12} />
            <span className="font-bold text-gray-900">{formatGiaVe(giaVe)}</span>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="flex justify-end gap-1.5 mt-4 pt-4 border-t border-gray-100 flex-wrap">
        <button
          onClick={() => onCheckIn?.(data)}
          disabled={checkInStatus === true}
          className={`p-1.5 rounded-lg transition-colors ${
            checkInStatus
              ? 'bg-green-50 text-green-400 cursor-not-allowed'
              : 'bg-green-100 text-green-600 hover:bg-green-200'
          }`}
          title="Check-in"
        >
          <FaUserCheck size={14} />
        </button>
        <button
          onClick={() => onDoiGhe?.(data)}
          className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
          title="Đổi ghế"
        >
          <FaChair size={14} />
        </button>
        <button
          onClick={() => onDoiHangVe?.(data)}
          className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
          title="Đổi hạng vé"
        >
          <FaTicketAlt size={14} />
        </button>
        <button
          onClick={() => onDoiChuyen?.(data)}
          className="p-1.5 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
          title="Đổi chuyến"
        >
          <FaExchangeAlt size={14} />
        </button>
        <button
          onClick={() => onHuyVe?.(data)}
          className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
          title="Hủy vé"
        >
          <FaTimesCircle size={14} />
        </button>
        <button
          onClick={() => onView?.(data)}
          className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          title="Xem chi tiết"
        >
          <FaEye size={14} />
        </button>
      </div>
    </div>
  );
});

DatChoCard.displayName = 'DatChoCard';

export default DatChoCard;
