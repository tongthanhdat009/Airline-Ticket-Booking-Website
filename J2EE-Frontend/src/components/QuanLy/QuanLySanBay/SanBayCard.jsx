import React, { memo } from 'react';
import { FaEye, FaEdit, FaTrash, FaPlane, FaMapMarkerAlt } from 'react-icons/fa';
import PropTypes from 'prop-types';

/**
 * SanBayCard - Card component for displaying airport information
 *
 * Displays key airport details in a responsive card format with action buttons.
 * Used in the card view of QuanLySanBay page.
 */
const SanBayCard = memo(({
  data,
  onView,
  onEdit,
  onDelete
}) => {
  if (!data) {
    return null;
  }

  const {
    maSanBay,
    maIATA,
    maICAO,
    tenSanBay,
    thanhPhoSanBay,
    quocGiaSanBay,
    trangThaiHoatDong
  } = data;

  // Get status badge styling
  const getStatusBadge = () => {
    const isActive = trangThaiHoatDong === 'ACTIVE';
    return {
      className: isActive
        ? 'bg-green-100 text-green-700'
        : 'bg-red-100 text-red-700',
      text: isActive ? 'Hoạt động' : 'Vô hiệu'
    };
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar icon */}
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <FaPlane className="text-blue-600" size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">{tenSanBay || 'Không có tên'}</h3>
            <p className="text-sm text-blue-600 font-medium">#{maSanBay}</p>
          </div>
        </div>
        {/* Status badge */}
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge.className} flex-shrink-0`}>
          {statusBadge.text}
        </span>
      </div>

      {/* Card Body */}
      <div className="space-y-2 text-sm">
        {/* IATA Code */}
        {maIATA && (
          <div className="flex items-center gap-2 text-gray-600">
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold flex-shrink-0">
              {maIATA}
            </span>
            <span className="text-xs text-gray-400">IATA</span>
          </div>
        )}

        {/* ICAO Code */}
        {maICAO && (
          <div className="flex items-center gap-2 text-gray-600">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold flex-shrink-0">
              {maICAO}
            </span>
            <span className="text-xs text-gray-400">ICAO</span>
          </div>
        )}

        {/* City */}
        {thanhPhoSanBay && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaMapMarkerAlt className="text-gray-400 flex-shrink-0" size={12} />
            <span className="truncate">{thanhPhoSanBay}</span>
          </div>
        )}

        {/* Country */}
        {quocGiaSanBay && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaMapMarkerAlt className="text-gray-400 flex-shrink-0" size={12} />
            <span className="truncate">{quocGiaSanBay}</span>
          </div>
        )}

        {/* Location */}
        {thanhPhoSanBay && quocGiaSanBay && (
          <div className="flex items-start gap-2 text-gray-600">
            <FaMapMarkerAlt className="text-gray-400 mt-0.5 flex-shrink-0" size={12} />
            <span className="text-xs text-gray-500">
              {thanhPhoSanBay}, {quocGiaSanBay}
            </span>
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

SanBayCard.displayName = 'SanBayCard';

SanBayCard.propTypes = {
  /**
   * Airport data object
   */
  data: PropTypes.shape({
    maSanBay: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    maIATA: PropTypes.string,
    maICAO: PropTypes.string,
    tenSanBay: PropTypes.string,
    thanhPhoSanBay: PropTypes.string,
    quocGiaSanBay: PropTypes.string,
    trangThaiHoatDong: PropTypes.string,
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

SanBayCard.defaultProps = {
  data: null,
  onView: undefined,
  onEdit: undefined,
  onDelete: undefined,
};

export default SanBayCard;
