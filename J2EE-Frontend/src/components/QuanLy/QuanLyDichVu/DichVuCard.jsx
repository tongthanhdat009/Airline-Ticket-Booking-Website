import React, { memo } from 'react';
import { FaEye, FaEdit, FaTrash, FaConciergeBell } from 'react-icons/fa';
import PropTypes from 'prop-types';

/**
 * DichVuCard - Card component for displaying service information
 *
 * Displays key service details in a responsive card format with action buttons.
 * Used in the card view of QuanLyDichVu page.
 */
const DichVuCard = memo(({
  data,
  imageSrc,
  onView,
  onEdit,
  onDelete
}) => {
  if (!data) {
    return null;
  }

  const {
    maDichVu,
    tenDichVu,
    moTa,
    anh
  } = data;

  const getImageUrl = () => {
    if (imageSrc) {
      return imageSrc;
    }
    if (!anh || anh.trim() === '') {
      return '/no-product.png';
    }
    return anh;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <FaConciergeBell className="text-purple-600" size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">{tenDichVu || 'Không có tên'}</h3>
            <p className="text-sm text-purple-600 font-medium">#{maDichVu}</p>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="space-y-3 text-sm">
        {/* Description */}
        {moTa && (
          <div className="text-gray-600">
            <p className="line-clamp-3">{moTa}</p>
          </div>
        )}

        {/* Service Image */}
        <div className="flex justify-center">
          <img
            src={getImageUrl()}
            alt={tenDichVu || 'Dịch vụ'}
            className="w-24 h-24 object-contain border border-gray-200 rounded-lg bg-white"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/no-product.png';
            }}
          />
        </div>
      </div>

      {/* Card Actions */}
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => onView?.(data)}
          className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1.5"
          title="Xem chi tiết"
        >
          <FaEye size={14} />
          <span className="hidden sm:inline">Xem</span>
        </button>
        <button
          onClick={() => onEdit?.(data)}
          className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5"
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

DichVuCard.displayName = 'DichVuCard';

DichVuCard.propTypes = {
  /**
   * Service data object
   */
  data: PropTypes.shape({
    maDichVu: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tenDichVu: PropTypes.string,
    moTa: PropTypes.string,
    anh: PropTypes.string,
  }),
  /**
   * Image source URL (preloaded/cached)
   */
  imageSrc: PropTypes.string,
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

DichVuCard.defaultProps = {
  data: null,
  imageSrc: null,
  onView: undefined,
  onEdit: undefined,
  onDelete: undefined,
};

export default DichVuCard;
