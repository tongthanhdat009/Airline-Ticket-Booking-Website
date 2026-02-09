import React, { memo } from 'react';
import { FaEye, FaEdit, FaTrash, FaTicketAlt, FaRecycle } from 'react-icons/fa';
import PropTypes from 'prop-types';

/**
 * HangVeCard - Card component for displaying ticket class information
 *
 * Displays key ticket class details in a responsive card format with action buttons.
 * Used in the card view of QuanLyHangVe page.
 */
const HangVeCard = memo(({
  data,
  onView,
  onEdit,
  onDelete,
  onRestore,
  showDeleted = false
}) => {
  if (!data) {
    return null;
  }

  const {
    maHangVe,
    tenHangVe,
    deletedAt
  } = data;

  // Format deletion date
  const formatDeletedDate = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleString('vi-VN');
    } catch {
      return date;
    }
  };

  // Check if item is marked as deleted
  const isDeleted = tenHangVe?.includes('_deleted_') || deletedAt;

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
            <h3 className="font-semibold text-gray-900 truncate">{tenHangVe || 'Không có tên'}</h3>
            <p className="text-sm text-blue-600 font-medium">#{maHangVe}</p>
          </div>
        </div>
        {/* Status badge */}
        {isDeleted && (
          <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full flex-shrink-0">
            Đã xóa
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="space-y-2 text-sm">
        {/* Class name highlight */}
        <div className="flex items-center gap-2 text-gray-700">
          <FaTicketAlt className="text-blue-500 flex-shrink-0" size={12} />
          <span className="font-medium">{tenHangVe || '-'}</span>
        </div>

        {/* Deleted date (for deleted items) */}
        {showDeleted && deletedAt && (
          <div className="flex items-start gap-2 text-gray-600">
            <span className="text-gray-400 mt-0.5 flex-shrink-0 text-xs w-3">🗑️</span>
            <span className="text-xs">Ngày xóa: {formatDeletedDate(deletedAt)}</span>
          </div>
        )}

        {/* Features/info section - placeholder for potential future features */}
        <div className="pt-2">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <p className="text-xs text-blue-700 font-medium mb-1">Thông tin hạng vé</p>
            <p className="text-xs text-blue-600">
              Mã: <span className="font-semibold">{maHangVe}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
        {showDeleted ? (
          // Deleted view: only show restore button
          <button
            onClick={() => onRestore?.(data)}
            className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1.5"
            title="Khôi phục hạng vé"
          >
            <FaRecycle size={14} />
            <span className="hidden sm:inline">Khôi phục</span>
          </button>
        ) : (
          // Active view: show view, edit, delete buttons
          <>
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
          </>
        )}
      </div>
    </div>
  );
});

HangVeCard.displayName = 'HangVeCard';

HangVeCard.propTypes = {
  /**
   * Ticket class data object
   */
  data: PropTypes.shape({
    maHangVe: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tenHangVe: PropTypes.string,
    deletedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.date]),
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
   * Callback when restore button is clicked (for deleted items)
   */
  onRestore: PropTypes.func,
  /**
   * Whether to show deleted items (affects which action buttons are displayed)
   */
  showDeleted: PropTypes.bool,
};

HangVeCard.defaultProps = {
  data: null,
  onView: undefined,
  onEdit: undefined,
  onDelete: undefined,
  onRestore: undefined,
  showDeleted: false,
};

export default HangVeCard;
