import React, { memo } from 'react';
import { FaEye, FaHistory, FaUser, FaClock, FaDatabase, FaClipboard } from 'react-icons/fa';
import PropTypes from 'prop-types';

/**
 * LichSuCard - Card component for displaying audit log information
 *
 * Displays key audit log details in a responsive card format with action button.
 * Used in the card view of QuanLyLichSuThaoTac page.
 */
const LichSuCard = memo(({
  data,
  onView
}) => {
  if (!data) {
    return null;
  }

  const {
    maLog,
    loaiThaoTac,
    bangAnhHuong,
    maBanGhi,
    nguoiThucHien,
    loaiTaiKhoan,
    moTa,
    diaChiIp,
    thoiGian
  } = data;

  // Format date time
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('vi-VN');
    } catch {
      return dateString;
    }
  };

  // Get text and color for action type
  const getLoaiThaoTacText = (loai) => {
    const mapping = {
      'THEM_MOI': { text: 'Thêm mới', color: 'bg-green-100 text-green-700' },
      'CREATE': { text: 'Thêm mới', color: 'bg-green-100 text-green-700' },
      'CAP_NHAT': { text: 'Cập nhật', color: 'bg-blue-100 text-blue-700' },
      'UPDATE': { text: 'Cập nhật', color: 'bg-blue-100 text-blue-700' },
      'XOA': { text: 'Xóa', color: 'bg-red-100 text-red-700' },
      'DELETE': { text: 'Xóa', color: 'bg-red-100 text-red-700' },
      'HUY_VE': { text: 'Hủy vé', color: 'bg-orange-100 text-orange-700' },
      'DOI_GIO_BAY': { text: 'Đổi giờ bay', color: 'bg-yellow-100 text-yellow-700' },
      'DOI_CHUYEN_BAY': { text: 'Đổi chuyến bay', color: 'bg-purple-100 text-purple-700' },
      'CHECK_IN': { text: 'Check-in', color: 'bg-teal-100 text-teal-700' },
      'HOAN_TIEN': { text: 'Hoàn tiền', color: 'bg-pink-100 text-pink-700' },
      'REFUND': { text: 'Hoàn tiền', color: 'bg-pink-100 text-pink-700' }
    };
    return mapping[loai] || { text: loai, color: 'bg-gray-100 text-gray-700' };
  };

  // Get text and color for account type
  const getLoaiTaiKhoanText = (loai) => {
    switch (loai) {
      case 'ADMIN': return { text: 'Admin', color: 'bg-indigo-100 text-indigo-700' };
      case 'CUSTOMER': return { text: 'Khách hàng', color: 'bg-cyan-100 text-cyan-700' };
      default: return { text: loai, color: 'bg-gray-100 text-gray-700' };
    }
  };

  // Format table name
  const formatBangAnhHuong = (bang) => {
    const mapping = {
      'chuyenbay': 'Chuyến bay',
      'datcho': 'Đặt chỗ',
      'donhang': 'Đơn hàng',
      'sanbay': 'Sân bay',
      'maybay': 'Máy bay',
      'tuyenbay': 'Tuyến bay',
      'hanhkhach': 'Hành khách',
      'taikhoan': 'Tài khoản',
      'taikhoanadmin': 'TK Admin',
      'hoadon': 'Hóa đơn',
      'hoantien': 'Hoàn tiền',
      'khuyenmai': 'Khuyến mãi',
      'dichvu': 'Dịch vụ'
    };
    return mapping[bang] || bang;
  };

  const loaiThaoTacStyle = getLoaiThaoTacText(loaiThaoTac);
  const loaiTaiKhoanStyle = getLoaiTaiKhoanText(loaiTaiKhoan);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* History icon */}
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <FaHistory className="text-green-600" size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">#{maLog}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${loaiThaoTacStyle.color}`}>
                {loaiThaoTacStyle.text}
              </span>
            </div>
            <p className="text-sm text-gray-500">{formatDateTime(thoiGian)}</p>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="space-y-2 text-sm">
        {/* Description */}
        {moTa && (
          <div className="flex items-start gap-2 text-gray-700">
            <FaClipboard className="text-gray-400 mt-0.5 flex-shrink-0" size={12} />
            <span className="line-clamp-2">{moTa}</span>
          </div>
        )}

        {/* Person who performed the action */}
        <div className="flex items-start gap-2 text-gray-600">
          <FaUser className="text-gray-400 mt-0.5 flex-shrink-0" size={12} />
          <div className="flex items-center gap-2">
            <span>{nguoiThucHien || '-'}</span>
            {loaiTaiKhoan && (
              <span className={`px-2 py-0.5 rounded text-xs ${loaiTaiKhoanStyle.color}`}>
                {loaiTaiKhoanStyle.text}
              </span>
            )}
          </div>
        </div>

        {/* Affected table */}
        <div className="flex items-start gap-2 text-gray-600">
          <FaDatabase className="text-gray-400 mt-0.5 flex-shrink-0" size={12} />
          <span>{formatBangAnhHuong(bangAnhHuong) || '-'}</span>
          {maBanGhi && (
            <span className="text-xs text-gray-500 font-mono">#{maBanGhi}</span>
          )}
        </div>

        {/* IP Address */}
        {diaChiIp && (
          <div className="flex items-start gap-2 text-gray-600">
            <FaClock className="text-gray-400 mt-0.5 flex-shrink-0" size={12} />
            <span className="text-xs font-mono">{diaChiIp}</span>
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
      </div>
    </div>
  );
});

LichSuCard.displayName = 'LichSuCard';

LichSuCard.propTypes = {
  /**
   * Audit log data object
   */
  data: PropTypes.shape({
    maLog: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    loaiThaoTac: PropTypes.string,
    bangAnhHuong: PropTypes.string,
    maBanGhi: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nguoiThucHien: PropTypes.string,
    loaiTaiKhoan: PropTypes.string,
    moTa: PropTypes.string,
    diaChiIp: PropTypes.string,
    thoiGian: PropTypes.oneOfType([PropTypes.string, PropTypes.date]),
    duLieuCu: PropTypes.string,
    duLieuMoi: PropTypes.string,
  }),
  /**
   * Callback when view button is clicked
   */
  onView: PropTypes.func,
};

LichSuCard.defaultProps = {
  data: null,
  onView: undefined,
};

export default LichSuCard;
