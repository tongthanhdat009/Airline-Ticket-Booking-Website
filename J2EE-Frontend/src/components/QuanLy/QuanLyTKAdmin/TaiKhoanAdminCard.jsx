import React, { memo } from 'react';
import { FaEye, FaEdit, FaTrash, FaUser, FaEnvelope, FaUserShield } from 'react-icons/fa';
import PropTypes from 'prop-types';

/**
 * TaiKhoanAdminCard - Card component for displaying admin account information
 *
 * Displays key admin account details in a responsive card format with action buttons.
 * Used in the card view of QuanLyTKAdmin page.
 */
const TaiKhoanAdminCard = memo(({
  data,
  onView,
  onEdit,
  onDelete,
  onAssignRoles
}) => {
  if (!data) {
    return null;
  }

  const {
    maTaiKhoan,
    hoVaTen,
    tenDangNhap,
    email,
    tenVaiTro
  } = data;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar icon */}
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <FaUser className="text-indigo-600" size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">{hoVaTen || 'Không có tên'}</h3>
            <p className="text-sm text-indigo-600 font-medium">#{maTaiKhoan}</p>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="space-y-2 text-sm">
        {/* Username */}
        {tenDangNhap && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaUser className="text-gray-400 flex-shrink-0" size={12} />
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
              {tenDangNhap}
            </span>
          </div>
        )}

        {/* Email */}
        {email && (
          <div className="flex items-start gap-2 text-gray-600">
            <FaEnvelope className="text-gray-400 mt-0.5 flex-shrink-0" size={12} />
            <span className="truncate">{email}</span>
          </div>
        )}

        {/* Roles */}
        <div className="flex items-start gap-2 text-gray-600">
          <FaUserShield className="text-gray-400 mt-0.5 flex-shrink-0" size={12} />
          <div className="flex flex-wrap gap-1">
            {tenVaiTro && tenVaiTro.length > 0 ? (
              tenVaiTro.map((role, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold"
                >
                  {role}
                </span>
              ))
            ) : (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                Chưa gán
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
        {onView && (
          <button
            onClick={() => onView?.(data)}
            className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5"
            title="Xem thông tin"
          >
            <FaEye size={14} />
            <span className="hidden sm:inline">Xem</span>
          </button>
        )}
        <button
          onClick={() => onEdit?.(data)}
          className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1.5"
          title="Chỉnh sửa"
        >
          <FaEdit size={14} />
          <span className="hidden sm:inline">Sửa</span>
        </button>
        {onAssignRoles && (
          <button
            onClick={() => onAssignRoles?.(data)}
            className="px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1.5"
            title="Gán vai trò"
          >
            <FaUserShield size={14} />
            <span className="hidden sm:inline">Vai trò</span>
          </button>
        )}
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

TaiKhoanAdminCard.displayName = 'TaiKhoanAdminCard';

TaiKhoanAdminCard.propTypes = {
  /**
   * Admin account data object
   */
  data: PropTypes.shape({
    maTaiKhoan: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    hoVaTen: PropTypes.string,
    tenDangNhap: PropTypes.string,
    email: PropTypes.string,
    tenVaiTro: PropTypes.arrayOf(PropTypes.string),
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
   * Callback when assign roles button is clicked
   */
  onAssignRoles: PropTypes.func,
};

TaiKhoanAdminCard.defaultProps = {
  data: null,
  onView: undefined,
  onEdit: undefined,
  onDelete: undefined,
  onAssignRoles: undefined,
};

export default TaiKhoanAdminCard;
