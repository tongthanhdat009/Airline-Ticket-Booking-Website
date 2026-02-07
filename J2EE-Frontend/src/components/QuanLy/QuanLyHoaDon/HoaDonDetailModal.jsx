import React from 'react';
import { FaTimes, FaFilePdf } from 'react-icons/fa';

/**
 * Modal hiển thị chi tiết hóa đơn
 * @param {Object} props
 * @param {boolean} props.isOpen - Trạng thái hiển thị modal
 * @param {Object} props.hoaDon - Dữ liệu hóa đơn
 * @param {boolean} props.exportLoading - Trạng thái đang export
 * @param {Function} props.onClose - Callback khi đóng modal
 * @param {Function} props.onExportPdf - Callback khi export PDF
 */
const HoaDonDetailModal = ({ 
  isOpen, 
  hoaDon, 
  exportLoading = false, 
  onClose, 
  onExportPdf 
}) => {
  if (!isOpen || !hoaDon) return null;

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format date time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  // Get status text and color
  const getStatusStyle = (status) => {
    switch (status) {
      case 'DA_PHAT_HANH':
        return { text: 'Đã phát hành', color: 'bg-green-100 text-green-700' };
      case 'DA_HUY':
        return { text: 'Đã hủy', color: 'bg-red-100 text-red-700' };
      case 'DIEU_CHINH':
        return { text: 'Điều chỉnh', color: 'bg-yellow-100 text-yellow-700' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  const status = getStatusStyle(hoaDon.trangThai);

  const handleExportPdf = () => {
    onClose();
    onExportPdf(hoaDon.maHoaDon);
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Chi tiết hóa đơn</h2>
              <p className="text-sm opacity-90 mt-1">{hoaDon.soHoaDon}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FaTimes size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 font-semibold">Số hóa đơn</p>
              <p className="font-bold text-lg text-blue-600">{hoaDon.soHoaDon}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 font-semibold">Mã đơn hàng</p>
              <p className="font-medium text-gray-900">#{hoaDon.maDonHang}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 font-semibold">PNR</p>
              <p className="font-medium text-gray-900">{hoaDon.pnr || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 font-semibold">Ngày lập</p>
              <p className="font-medium text-gray-900">{formatDateTime(hoaDon.ngayLap)}</p>
            </div>
          </div>

          {/* Thông tin khách hàng */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
              Thông tin khách hàng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 font-semibold">Họ tên</p>
                <p className="font-medium text-gray-900">{hoaDon.hoTenNguoiDat || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Email</p>
                <p className="font-medium text-gray-900">{hoaDon.emailNguoiDat || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Số điện thoại</p>
                <p className="font-medium text-gray-900">{hoaDon.soDienThoaiNguoiDat || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Thông tin tài chính */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
              Thông tin tài chính
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 font-semibold">Tổng tiền</p>
                <p className="font-bold text-lg text-gray-900">{formatCurrency(hoaDon.tongTien)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Thuế VAT</p>
                <p className="font-medium text-gray-900">{formatCurrency(hoaDon.thueVAT)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Tổng thanh toán</p>
                <p className="font-bold text-lg text-blue-600">{formatCurrency(hoaDon.tongThanhToan)}</p>
              </div>
            </div>
          </div>

          {/* Thông tin trạng thái */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
              Trạng thái hóa đơn
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                  {status.text}
                </span>
                {hoaDon.nguoiLap && (
                  <span className="text-sm text-gray-600">
                    Người lập: <span className="font-medium">{hoaDon.nguoiLap}</span>
                  </span>
                )}
              </div>
              {hoaDon.ghiChu && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 font-semibold">Ghi chú:</p>
                  <p className="text-sm text-gray-700 mt-1">{hoaDon.ghiChu}</p>
                </div>
              )}
            </div>
          </div>

          {/* Thông tin đơn hàng liên quan */}
          {hoaDon.trangThaiDonHang && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                Thông tin đơn hàng
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">Trạng thái đơn hàng</p>
                    <p className="font-medium text-gray-900">{hoaDon.trangThaiDonHang}</p>
                  </div>
                  {hoaDon.tongGiaDonHang && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Tổng giá đơn hàng</p>
                      <p className="font-medium text-gray-900">{formatCurrency(hoaDon.tongGiaDonHang)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Nút thao tác */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            {hoaDon.trangThai === 'DA_PHAT_HANH' && (
              <button
                onClick={handleExportPdf}
                disabled={exportLoading}
                className="px-6 py-3 bg-linear-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 font-semibold transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                <FaFilePdf />
                Xuất PDF
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoaDonDetailModal;
