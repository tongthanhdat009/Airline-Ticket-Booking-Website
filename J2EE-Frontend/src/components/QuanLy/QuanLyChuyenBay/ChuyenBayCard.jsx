import React, { memo } from 'react';
import { FaEye, FaEdit, FaPlane, FaClock, FaCalendarAlt, FaMapMarkerAlt, FaPlaneDeparture, FaPlaneArrival } from 'react-icons/fa';
import PropTypes from 'prop-types';

/**
 * ChuyenBayCard - Card component for displaying flight information
 *
 * Displays key flight details in a responsive card format with action buttons.
 * Used in the card view of QuanLyChuyenBay page.
 */
const ChuyenBayCard = memo(({
  data,
  getRouteInfo,
  onView,
  onEdit
}) => {
  if (!data) {
    return null;
  }

  const {
    maChuyenBay,
    soHieuChuyenBay,
    tuyenBay,
    ngayDi,
    ngayDen,
    gioDi,
    gioDen,
    trangThai,
    lyDoDelay,
    lyDoHuy
  } = data;

  // Get status color
  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-700';

    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus.includes('hoàn thành') || normalizedStatus === 'completed') {
      return 'bg-green-100 text-green-700';
    }
    if (normalizedStatus.includes('đang bay') || normalizedStatus === 'in flight') {
      return 'bg-blue-100 text-blue-700';
    }
    if (normalizedStatus.includes('đã khởi hành') || normalizedStatus === 'departed') {
      return 'bg-indigo-100 text-indigo-700';
    }
    if (normalizedStatus.includes('trễ') || normalizedStatus === 'delayed') {
      return 'bg-yellow-100 text-yellow-700';
    }
    if (normalizedStatus.includes('hủy') || normalizedStatus === 'cancelled') {
      return 'bg-red-100 text-red-700';
    }
    if (normalizedStatus.includes('lên kế hoạch') || normalizedStatus === 'scheduled' || normalizedStatus === 'chưa bay') {
      return 'bg-purple-100 text-purple-700';
    }
    return 'bg-gray-100 text-gray-700';
  };

  // Format time display
  const formatTime = (time) => {
    if (!time) return '--:--';
    return time.substring(0, 5); // Extract HH:MM from HH:mm:ss
  };

  const routeInfo = getRouteInfo ? getRouteInfo(tuyenBay) : 'Không rõ';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Plane icon */}
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <FaPlane className="text-blue-600" size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">{soHieuChuyenBay || 'Không có số hiệu'}</h3>
            <p className="text-sm text-blue-600 font-medium">#{maChuyenBay}</p>
          </div>
        </div>
        {/* Status Badge */}
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(trangThai)} flex-shrink-0`}>
          {trangThai || 'Không rõ'}
        </span>
      </div>

      {/* Card Body */}
      <div className="space-y-2 text-sm">
        {/* Route */}
        <div className="flex items-start gap-2 text-gray-600">
          <FaMapMarkerAlt className="text-gray-400 mt-0.5 flex-shrink-0" size={12} />
          <span className="truncate font-medium">{routeInfo}</span>
        </div>

        {/* Full route names */}
        {tuyenBay?.sanBayDi?.tenSanBay && tuyenBay?.sanBayDen?.tenSanBay && (
          <div className="flex items-start gap-2 text-gray-500 text-xs">
            <div className="w-4 flex-shrink-0"></div>
            <span className="line-clamp-1">
              {tuyenBay.sanBayDi.tenSanBay} → {tuyenBay.sanBayDen.tenSanBay}
            </span>
          </div>
        )}

        {/* Departure Date & Time */}
        <div className="flex items-center gap-2 text-gray-600">
          <FaPlaneDeparture className="text-gray-400 flex-shrink-0" size={12} />
          <span className="text-gray-500">Khởi hành:</span>
          <span className="font-medium">
            {ngayDi || '--/--/----'}
          </span>
          {gioDi && (
            <span className="flex items-center gap-1 text-blue-600">
              <FaClock size={10} />
              {formatTime(gioDi)}
            </span>
          )}
        </div>

        {/* Arrival Date & Time */}
        <div className="flex items-center gap-2 text-gray-600">
          <FaPlaneArrival className="text-gray-400 flex-shrink-0" size={12} />
          <span className="text-gray-500">Đến:</span>
          <span className="font-medium">
            {ngayDen || '--/--/----'}
          </span>
          {gioDen && (
            <span className="flex items-center gap-1 text-blue-600">
              <FaClock size={10} />
              {formatTime(gioDen)}
            </span>
          )}
        </div>

        {/* Delay Reason */}
        {lyDoDelay && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs">
            <div className="font-semibold text-yellow-700 mb-1">Lý do trễ:</div>
            <div className="text-yellow-800 line-clamp-2">{lyDoDelay}</div>
          </div>
        )}

        {/* Cancel Reason */}
        {lyDoHuy && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs">
            <div className="font-semibold text-red-700 mb-1">Lý do hủy:</div>
            <div className="text-red-800 line-clamp-2">{lyDoHuy}</div>
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
        <button
          onClick={() => onEdit?.(data)}
          className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1.5"
          title="Chỉnh sửa"
        >
          <FaEdit size={14} />
          <span className="hidden sm:inline">Sửa</span>
        </button>
      </div>
    </div>
  );
});

ChuyenBayCard.displayName = 'ChuyenBayCard';

ChuyenBayCard.propTypes = {
  /**
   * Flight data object
   */
  data: PropTypes.shape({
    maChuyenBay: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    soHieuChuyenBay: PropTypes.string,
    tuyenBay: PropTypes.shape({
      maTuyenBay: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      sanBayDi: PropTypes.shape({
        maSanBay: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        tenSanBay: PropTypes.string,
        maIATA: PropTypes.string,
      }),
      sanBayDen: PropTypes.shape({
        maSanBay: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        tenSanBay: PropTypes.string,
        maIATA: PropTypes.string,
      }),
    }),
    ngayDi: PropTypes.string,
    ngayDen: PropTypes.string,
    gioDi: PropTypes.string,
    gioDen: PropTypes.string,
    trangThai: PropTypes.string,
    lyDoDelay: PropTypes.string,
    lyDoHuy: PropTypes.string,
  }),
  /**
   * Function to get route information display
   */
  getRouteInfo: PropTypes.func,
  /**
   * Callback when view button is clicked
   */
  onView: PropTypes.func,
  /**
   * Callback when edit button is clicked
   */
  onEdit: PropTypes.func,
};

ChuyenBayCard.defaultProps = {
  data: null,
  getRouteInfo: () => 'Không rõ',
  onView: undefined,
  onEdit: undefined,
};

export default ChuyenBayCard;
