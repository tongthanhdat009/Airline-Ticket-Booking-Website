import React, { memo } from 'react';
import { FaEye, FaEdit, FaTrash, FaPlane, FaArrowRight } from 'react-icons/fa';
import PropTypes from 'prop-types';

/**
 * TuyenBayCard - Card component for displaying flight route information
 *
 * Displays key route details in a responsive card format with action buttons.
 * Used in the card view of QuanLyTuyenBay page.
 */
const TuyenBayCard = memo(({
  data,
  onView,
  onEdit,
  onDelete
}) => {
  if (!data) {
    return null;
  }

  const {
    maTuyenBay,
    sanBayDi,
    sanBayDen
  } = data;

  // Get airport name safely
  const getSanBayTen = (sanBay) => {
    return sanBay?.tenSanBay || 'Không có tên';
  };

  // Get IATA code safely
  const getIATACode = (sanBay) => {
    return sanBay?.maIATA || '-';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Route icon */}
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <FaPlane className="text-blue-600" size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">Tuyến bay #{maTuyenBay}</h3>
            <p className="text-sm text-blue-600 font-medium">
              {getIATACode(sanBayDi)} → {getIATACode(sanBayDen)}
            </p>
          </div>
        </div>
      </div>

      {/* Card Body - Route Display */}
      <div className="space-y-2 text-sm">
        {/* Route with Origin → Destination */}
        <div className="flex items-center justify-between text-gray-600">
          {/* Origin Airport */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <FaPlane className="text-green-600 transform -rotate-45" size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 truncate">{getSanBayTen(sanBayDi)}</p>
              <p className="text-xs text-gray-500">{getIATACode(sanBayDi)}</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="px-2 flex-shrink-0">
            <FaArrowRight className="text-gray-400" size={14} />
          </div>

          {/* Destination Airport */}
          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end text-right">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 truncate">{getSanBayTen(sanBayDen)}</p>
              <p className="text-xs text-gray-500">{getIATACode(sanBayDen)}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <FaPlane className="text-blue-600 transform rotate-45" size={14} />
            </div>
          </div>
        </div>
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

TuyenBayCard.displayName = 'TuyenBayCard';

TuyenBayCard.propTypes = {
  /**
   * Route data object
   */
  data: PropTypes.shape({
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

TuyenBayCard.defaultProps = {
  data: null,
  onView: undefined,
  onEdit: undefined,
  onDelete: undefined,
};

export default TuyenBayCard;
