import React from 'react';
import { FaTimesCircle, FaUndo } from 'react-icons/fa';

const DonHangDetailModal = ({
  isVisible,
  donHang,
  actionLoading,
  onClose,
  onHuyDonHang,
  onHoanTien
}) => {
  if (!isVisible || !donHang) return null;

  // Format functions
  const formatCurrency = (value) => {
    if (!value) return '0đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-linear-to-r from-violet-600 to-purple-700 text-white p-6 rounded-t-xl sticky top-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Chi tiết đơn hàng</h2>
              <p className="text-sm opacity-90 mt-1">
                Mã ĐH: #{donHang.maDonHang} | PNR: {donHang.pnr}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Thông tin khách hàng */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-violet-600 rounded-full"></div>
              Thông tin khách hàng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 font-semibold">Họ tên</p>
                <p className="font-medium text-gray-900">
                  {donHang.hanhKhachNguoiDat?.hoVaTen || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Email</p>
                <p className="font-medium text-gray-900">
                  {donHang.emailNguoiDat || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Số điện thoại</p>
                <p className="font-medium text-gray-900">
                  {donHang.soDienThoaiNguoiDat || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Ngày đặt</p>
                <p className="font-medium text-gray-900">
                  {formatDateTime(donHang.ngayDat)}
                </p>
              </div>
            </div>
          </div>

          {/* Danh sách đặt chỗ */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-violet-600 rounded-full"></div>
              Danh sách đặt chỗ ({donHang.danhSachDatCho?.length || 0})
            </h3>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-linear-to-r from-slate-700 to-slate-800 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Hành khách</th>
                    <th className="px-4 py-3 text-left font-semibold">Chuyến bay</th>
                    <th className="px-4 py-3 text-right font-semibold">Giá vé</th>
                    <th className="px-4 py-3 text-center font-semibold">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {donHang.danhSachDatCho?.map((datCho, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{datCho.hanhKhach?.hoVaTen}</p>
                          <p className="text-xs text-gray-500">
                            {datCho.hanhKhach?.soDienThoai || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">
                            {datCho.chuyenBay?.soHieuChuyenBay || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {datCho.chuyenBay?.tuyenBay?.sanBayDi?.maSanBay} → {datCho.chuyenBay?.tuyenBay?.sanBayDen?.maSanBay}
                          </p>
                          <p className="text-xs text-gray-500">
                            {datCho.chuyenBay?.ngayDi} {datCho.chuyenBay?.gioDi}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatCurrency(datCho.giaVe)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            datCho.trangThai === 'ACTIVE'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {datCho.trangThai}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ghi chú */}
          {donHang.ghiChu && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-violet-600 rounded-full"></div>
                Ghi chú
              </h3>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-gray-700 whitespace-pre-line">{donHang.ghiChu}</p>
              </div>
            </div>
          )}

          {/* Tổng tiền */}
          <div className="bg-linear-to-r from-violet-100 to-purple-100 p-6 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800">Tổng thanh toán:</span>
              <span className="text-3xl font-bold text-violet-600">
                {formatCurrency(donHang.tongGia)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
            >
              Đóng
            </button>

            {donHang.trangThai === 'CHỜ THANH TOÁN' && (
              <button
                onClick={() => onHuyDonHang(donHang.maDonHang)}
                disabled={actionLoading}
                className="px-6 py-3 bg-linear-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 font-semibold transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                <FaTimesCircle />
                Hủy đơn hàng
              </button>
            )}

            {donHang.trangThai === 'ĐÃ THANH TOÁN' && (
              <button
                onClick={() => onHoanTien(donHang.maDonHang)}
                disabled={actionLoading}
                className="px-6 py-3 bg-linear-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:from-orange-600 hover:to-amber-700 font-semibold transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                <FaUndo />
                Hoàn tiền
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonHangDetailModal;
