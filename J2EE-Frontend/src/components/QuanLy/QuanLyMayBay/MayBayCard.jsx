import React, { memo } from 'react';
import { FaEye, FaEdit, FaTrash, FaFighterJet, FaIndustry, FaHashtag, FaCalendar, FaChair, FaWrench } from 'react-icons/fa';
import PropTypes from 'prop-types';

/**
 * MayBayCard - Card component for displaying aircraft information
 *
 * Displays key aircraft details in a responsive card format with action buttons.
 * Used in the card view of QuanLyMayBay page.
 */
const MayBayCard = memo(({
  data,
  onView,
  onEdit,
  onDelete,
  onViewSeatMap,
  onEditSeatMap
}) => {
  if (!data) {
    return null;
  }

  const {
    maMayBay,
    tenMayBay,
    hangMayBay,
    loaiMayBay,
    soHieu,
    tongSoGhe,
    namKhaiThac,
    trangThai
  } = data;

  // Get status info
  const getTrangThaiInfo = (trangThai) => {
    switch (trangThai) {
      case 'Active':
        return { text: 'Hoạt động', color: 'bg-green-100 text-green-700', icon: '✓' };
      case 'Maintenance':
        return { text: 'Bảo trì', color: 'bg-yellow-100 text-yellow-700', icon: '🔧' };
      case 'Inactive':
        return { text: 'Vô hiệu', color: 'bg-red-100 text-red-700', icon: '✗' };
      default:
        return { text: trangThai, color: 'bg-gray-100 text-gray-700', icon: '?' };
    }
  };

  const status = getTrangThaiInfo(trangThai);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Plane icon */}
          <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
            <FaFighterJet className="text-sky-600" size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">{tenMayBay || 'Không có tên'}</h3>
            <p className="text-sm text-sky-600 font-medium">#{maMayBay}</p>
          </div>
        </div>
        {/* Status Badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color} flex-shrink-0`}>
          {status.icon} {status.text}
        </span>
      </div>

      {/* Card Body */}
      <div className="space-y-2 text-sm">
        {/* Manufacturer */}
        {hangMayBay && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaIndustry className="text-gray-400 flex-shrink-0" size={12} />
            <span>{hangMayBay}</span>
          </div>
        )}

        {/* Type */}
        {loaiMayBay && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaFighterJet className="text-gray-400 flex-shrink-0" size={12} />
            <span>{loaiMayBay}</span>
          </div>
        )}

        {/* Registration Number */}
        {soHieu && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaHashtag className="text-gray-400 flex-shrink-0" size={12} />
            <span className="font-medium">{soHieu}</span>
          </div>
        )}

        {/* Year of Operation */}
        {namKhaiThac && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaCalendar className="text-gray-400 flex-shrink-0" size={12} />
            <span>{namKhaiThac}</span>
          </div>
        )}

        {/* Total Seats */}
        <div className="flex items-center gap-2 text-gray-900 font-semibold">
          <FaChair className="text-sky-600 flex-shrink-0" size={12} />
          <span>{tongSoGhe || 0} ghế</span>
        </div>
      </div>

      {/* Card Actions */}
      <div className="flex flex-wrap justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => onView?.(data)}
          className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5"
          title="Xem thông tin"
        >
          <FaEye size={14} />
          <span className="hidden sm:inline">Xem</span>
        </button>
        <button
          onClick={() => onViewSeatMap?.(data)}
          className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1.5"
          title="Xem sơ đồ ghế"
        >
          <FaChair size={14} />
          <span className="hidden sm:inline">Sơ đồ ghế</span>
        </button>
        <button
          onClick={() => onEditSeatMap?.(data)}
          className="px-3 py-1.5 text-sm text-sky-600 hover:bg-sky-50 rounded-lg transition-colors flex items-center gap-1.5"
          title="Chỉnh sửa sơ đồ ghế"
        >
          <FaWrench size={14} />
          <span className="hidden sm:inline">Chỉnh SDG</span>
        </button>
        <button
          onClick={() => onEdit?.(data)}
          className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5"
          title="Chỉnh sửa thông tin"
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

MayBayCard.displayName = 'MayBayCard';

MayBayCard.propTypes = {
  /**
   * Aircraft data object
   */
  data: PropTypes.shape({
    maMayBay: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tenMayBay: PropTypes.string,
    hangMayBay: PropTypes.string,
    loaiMayBay: PropTypes.string,
    soHieu: PropTypes.string,
    tongSoGhe: PropTypes.number,
    namKhaiThac: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
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
  /**
   * Callback when view seat map button is clicked
   */
  onViewSeatMap: PropTypes.func,
  /**
   * Callback when edit seat map button is clicked
   */
  onEditSeatMap: PropTypes.func,
};

MayBayCard.defaultProps = {
  data: null,
  onView: undefined,
  onEdit: undefined,
  onDelete: undefined,
  onViewSeatMap: undefined,
  onEditSeatMap: undefined,
};

export default MayBayCard;
