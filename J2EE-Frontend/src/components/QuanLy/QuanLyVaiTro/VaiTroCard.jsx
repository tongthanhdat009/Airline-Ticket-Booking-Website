import React, { memo } from 'react';
import { FaEye, FaEdit, FaTrash, FaUserShield, FaInfoCircle, FaCheck, FaTimes } from 'react-icons/fa';
import PropTypes from 'prop-types';

/**
 * VaiTroCard - Card component for displaying role information
 *
 * Displays key role details in a responsive card format with action buttons.
 * Used in the card view of QuanLyVaiTro page.
 */
const VaiTroCard = memo(({
  data,
  onView,
  onEdit,
  onDelete
}) => {
  if (!data) {
    return null;
  }

  const {
    maVaiTro,
    tenVaiTro,
    moTa,
    trangThai,
    soAdmin
  } = data;

  // Format created date
  const formatCreatedDate = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('vi-VN');
    } catch {
      return date;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar icon */}
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <FaUserShield className="text-blue-600" size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">{tenVaiTro || 'Không có tên'}</h3>
            <p className="text-sm text-blue-600 font-medium">#{maVaiTro}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`flex-shrink-0`}>
          {trangThai ? (
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
              <FaCheck size={10} />
              Hoạt động
            </span>
          ) : (
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold flex items-center gap-1">
              <FaTimes size={10} />
              Ngừng
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="space-y-2 text-sm">
        {/* Description */}
        {moTa && (
          <div className="flex items-start gap-2 text-gray-600">
            <FaInfoCircle className="text-gray-400 mt-0.5 flex-shrink-0" size={12} />
            <span className="line-clamp-2">{moTa}</span>
          </div>
        )}

        {/* Admin Count */}
        <div className="flex items-center gap-2 text-gray-600">
          <FaUserShield className="text-gray-400 flex-shrink-0" size={12} />
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
            {soAdmin || 0} admin
          </span>
        </div>

        {/* Created Date */}
        {data.createdAt && (
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-gray-400 text-xs">Ngày tạo: {formatCreatedDate(data.createdAt)}</span>
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
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5 ${
            (soAdmin || 0) > 0
              ? 'text-slate-400 cursor-not-allowed'
              : 'text-red-600 hover:bg-red-50'
          }`}
          title={(soAdmin || 0) > 0 ? 'Không thể xóa' : 'Xóa'}
          disabled={(soAdmin || 0) > 0}
        >
          <FaTrash size={14} />
          <span className="hidden sm:inline">Xóa</span>
        </button>
      </div>
    </div>
  );
});

VaiTroCard.displayName = 'VaiTroCard';

VaiTroCard.propTypes = {
  /**
   * Role data object
   */
  data: PropTypes.shape({
    maVaiTro: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tenVaiTro: PropTypes.string,
    moTa: PropTypes.string,
    trangThai: PropTypes.bool,
    soAdmin: PropTypes.number,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
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

VaiTroCard.defaultProps = {
  data: null,
  onView: undefined,
  onEdit: undefined,
  onDelete: undefined,
};

export default VaiTroCard;
