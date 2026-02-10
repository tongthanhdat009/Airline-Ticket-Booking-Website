import React, { memo } from 'react';
import { FaEye, FaEdit, FaTrash, FaUser, FaEnvelope, FaPhone, FaVenusMars, FaBirthdayCake, FaIdCard, FaMapMarkerAlt } from 'react-icons/fa';
import PropTypes from 'prop-types';

/**
 * KhachHangCard - Card component for displaying customer information
 *
 * Displays key customer details in a responsive card format with action buttons.
 * Used in the card view of QuanLyKhachHang page.
 */
const KhachHangCard = memo(({
  data,
  onView,
  onEdit,
  onDelete
}) => {
  if (!data) {
    return null;
  }

  const {
    maHanhKhach,
    hoVaTen,
    email,
    soDienThoai,
    gioiTinh,
    ngaySinh,
    quocGia,
    maDinhDanh,
    diaChi
  } = data;

  // Format date of birth
  const formatNgaySinh = (date) => {
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
            <FaUser className="text-blue-600" size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">{hoVaTen || 'Không có tên'}</h3>
            <p className="text-sm text-blue-600 font-medium">#{maHanhKhach}</p>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="space-y-2 text-sm">
        {/* Email */}
        {email && (
          <div className="flex items-start gap-2 text-gray-600">
            <FaEnvelope className="text-gray-400 mt-0.5 flex-shrink-0" size={12} />
            <span className="truncate">{email}</span>
          </div>
        )}

        {/* Phone */}
        {soDienThoai && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaPhone className="text-gray-400 flex-shrink-0" size={12} />
            <span>{soDienThoai}</span>
          </div>
        )}

        {/* Gender */}
        <div className="flex items-center gap-2 text-gray-600">
          <FaVenusMars className="text-gray-400 flex-shrink-0" size={12} />
          <span>{gioiTinh || '-'}</span>
        </div>

        {/* Date of Birth */}
        {ngaySinh && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaBirthdayCake className="text-gray-400 flex-shrink-0" size={12} />
            <span>{formatNgaySinh(ngaySinh)}</span>
          </div>
        )}

        {/* National ID */}
        {maDinhDanh && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaIdCard className="text-gray-400 flex-shrink-0" size={12} />
            <span className="truncate">{maDinhDanh}</span>
          </div>
        )}

        {/* Country */}
        {quocGia && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaMapMarkerAlt className="text-gray-400 flex-shrink-0" size={12} />
            <span className="truncate">{quocGia}</span>
          </div>
        )}

        {/* Address */}
        {diaChi && (
          <div className="flex items-start gap-2 text-gray-600">
            <FaMapMarkerAlt className="text-gray-400 mt-0.5 flex-shrink-0" size={12} />
            <span className="line-clamp-2">{diaChi}</span>
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

KhachHangCard.displayName = 'KhachHangCard';

KhachHangCard.propTypes = {
  /**
   * Customer data object
   */
  data: PropTypes.shape({
    maHanhKhach: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    hoVaTen: PropTypes.string,
    email: PropTypes.string,
    soDienThoai: PropTypes.string,
    gioiTinh: PropTypes.string,
    ngaySinh: PropTypes.oneOfType([PropTypes.string, PropTypes.date]),
    quocGia: PropTypes.string,
    maDinhDanh: PropTypes.string,
    diaChi: PropTypes.string,
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

KhachHangCard.defaultProps = {
  data: null,
  onView: undefined,
  onEdit: undefined,
  onDelete: undefined,
};

export default KhachHangCard;
