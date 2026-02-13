import React, { memo } from 'react';
import { FaEye, FaEdit, FaKey, FaShieldAlt, FaCheckCircle, FaLock, FaList, FaUserCog } from 'react-icons/fa';
import PropTypes from 'prop-types';

/**
 * PhanQuyenCard - Card component for displaying permission information for a role
 *
 * Displays key permission details for a role in a responsive card format with action buttons.
 * Used in the card view of QuanLyPhanQuyen page.
 */
const PhanQuyenCard = memo(({
  data,
  onView,
  onEdit
}) => {
  if (!data) {
    return null;
  }

  const {
    maVaiTro,
    tenVaiTro,
    moTa,
    trangThai,
    isSuperAdmin,
    tongQuyen,
    tenChucNang,
    soAdmin
  } = data;

  // Format permission count
  const formatPermissionCount = (count) => {
    if (!count && count !== 0) return '-';
    return `${count} quyền`;
  };

  // Format feature list for display
  const formatFeatureList = (features) => {
    if (!features || features.length === 0) return 'Chưa có quyền nào';
    if (features.length <= 3) {
      return features.join(', ');
    }
    return `${features.slice(0, 3).join(', ')} +${features.length - 3} khác`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar icon */}
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            {isSuperAdmin ? (
              <FaShieldAlt className="text-blue-600" size={18} />
            ) : (
              <FaKey className="text-blue-600" size={18} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">{tenVaiTro || 'Không có tên'}</h3>
            <p className="text-sm text-blue-600 font-medium">#{maVaiTro}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex-shrink-0">
          {trangThai ? (
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
              <FaCheckCircle size={10} />
              Hoạt động
            </span>
          ) : (
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold flex items-center gap-1">
              <FaLock size={10} />
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
            <span className="line-clamp-2">{moTa}</span>
          </div>
        )}

        {/* Super Admin Badge */}
        {isSuperAdmin && (
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1">
              <FaShieldAlt size={10} />
              Super Admin
            </span>
          </div>
        )}

        {/* Permission Count */}
        <div className="flex items-center gap-2 text-gray-600">
          <FaKey className="text-gray-400 flex-shrink-0" size={12} />
          <span className="font-medium">{formatPermissionCount(tongQuyen)}</span>
        </div>

        {/* Admin Count */}
        {soAdmin !== undefined && soAdmin !== null && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaUserCog className="text-gray-400 flex-shrink-0" size={12} />
            <span>{soAdmin} admin</span>
          </div>
        )}

        {/* Feature List */}
        {tenChucNang && Array.isArray(tenChucNang) && tenChucNang.length > 0 && (
          <div className="flex items-start gap-2 text-gray-600">
            <FaList className="text-gray-400 mt-0.5 flex-shrink-0" size={12} />
            <span className="text-xs text-gray-500">{formatFeatureList(tenChucNang)}</span>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => onView?.(data)}
          className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5"
          title="Xem chi tiết quyền"
        >
          <FaEye size={14} />
          <span className="hidden sm:inline">Xem</span>
        </button>
        {!isSuperAdmin && (
          <button
            onClick={() => onEdit?.(data)}
            className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1.5"
            title="Chỉnh sửa quyền"
          >
            <FaEdit size={14} />
            <span className="hidden sm:inline">Sửa</span>
          </button>
        )}
      </div>
    </div>
  );
});

PhanQuyenCard.displayName = 'PhanQuyenCard';

PhanQuyenCard.propTypes = {
  /**
   * Permission/Role data object
   */
  data: PropTypes.shape({
    maVaiTro: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tenVaiTro: PropTypes.string,
    moTa: PropTypes.string,
    trangThai: PropTypes.bool,
    isSuperAdmin: PropTypes.bool,
    tongQuyen: PropTypes.number,
    tenChucNang: PropTypes.arrayOf(PropTypes.string),
    soAdmin: PropTypes.number,
  }),
  /**
   * Callback when view button is clicked
   */
  onView: PropTypes.func,
  /**
   * Callback when edit button is clicked
   */
  onEdit: PropTypes.func,
};

PhanQuyenCard.defaultProps = {
  data: null,
  onView: undefined,
  onEdit: undefined,
};

export default PhanQuyenCard;
