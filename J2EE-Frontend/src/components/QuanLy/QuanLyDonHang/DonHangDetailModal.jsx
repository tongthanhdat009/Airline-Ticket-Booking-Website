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
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

      {/* Modal - Full screen on mobile, centered modal on desktop */}
      <div className="relative z-10 h-full w-full md:h-[85vh] md:max-w-5xl md:mx-auto md:my-8 md:rounded-xl bg-white md:shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="[background:linear-gradient(to_right,rgb(124,58,237),rgb(109,40,217))] text-white px-4 md:px-6 py-3 md:py-4 flex justify-between items-center shrink-0">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg md:text-xl font-bold truncate">Chi tiết đơn hàng</h3>
            <p className="text-xs md:text-sm text-purple-100 mt-1 truncate">
              Mã ĐH: #{donHang.maDonHang} | PNR: {donHang.pnr}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors p-1 hover:bg-white/10 rounded-lg ml-2 shrink-0"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Thông tin khách hàng */}
          <div className="mb-6">
            <h3 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
              <div className="w-1 h-5 md:h-6 bg-violet-600 rounded-full"></div>
              Thông tin khách hàng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 bg-gray-50 p-3 md:p-4 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 font-semibold">Họ tên</p>
                <p className="text-sm md:text-base font-medium text-gray-900 break-words">
                  {donHang.hanhKhachNguoiDat?.hoVaTen || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Email</p>
                <p className="text-sm md:text-base font-medium text-gray-900 break-words">
                  {donHang.emailNguoiDat || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Số điện thoại</p>
                <p className="text-sm md:text-base font-medium text-gray-900">
                  {donHang.soDienThoaiNguoiDat || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Ngày đặt</p>
                <p className="text-sm md:text-base font-medium text-gray-900">
                  {formatDateTime(donHang.ngayDat)}
                </p>
              </div>
            </div>
          </div>

          {/* Danh sách đặt chỗ */}
          <div className="mb-6">
            <h3 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
              <div className="w-1 h-5 md:h-6 bg-violet-600 rounded-full"></div>
              Danh sách đặt chỗ ({donHang.danhSachDatCho?.length || 0})
            </h3>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              {/* Table wrapper for horizontal scroll on mobile */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs md:text-sm min-w-[600px]">
                  <thead className="[background:linear-gradient(to_right,rgb(51,65,85),rgb(30,41,59))] text-white">
                    <tr>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left font-semibold">Hành khách</th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-left font-semibold">Chuyến bay</th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-right font-semibold">Giá vé</th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-center font-semibold">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {donHang.danhSachDatCho?.map((datCho, index) => (
                      <tr key={index}>
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          <div>
                            <p className="font-medium text-xs md:text-sm">{datCho.hanhKhach?.hoVaTen}</p>
                            <p className="text-xs text-gray-500">
                              {datCho.hanhKhach?.soDienThoai || 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          <div>
                            <p className="font-medium text-xs md:text-sm">
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
                        <td className="px-3 md:px-4 py-2 md:py-3 text-right font-semibold text-xs md:text-sm">
                          {formatCurrency(datCho.giaVe)}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3 text-center">
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
          </div>

          {/* Ghi chú */}
          {donHang.ghiChu && (
            <div className="mb-6">
              <h3 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
                <div className="w-1 h-5 md:h-6 bg-violet-600 rounded-full"></div>
                Ghi chú
              </h3>
              <div className="bg-yellow-50 p-3 md:p-4 rounded-lg border border-yellow-200">
                <p className="text-xs md:text-sm text-gray-700 whitespace-pre-line break-words">{donHang.ghiChu}</p>
              </div>
            </div>
          )}

          {/* Tổng tiền */}
          <div className="[background:linear-gradient(to_right,rgb(237,233,254),rgb(245,243,255))] p-4 md:p-6 rounded-lg">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <span className="text-base md:text-xl font-bold text-gray-800">Tổng thanh toán:</span>
              <span className="text-2xl md:text-3xl font-bold text-violet-600">
                {formatCurrency(donHang.tongGia)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer - Hidden on mobile, shown on desktop */}
        <div className="hidden md:flex justify-end p-4 border-t bg-gray-50 shrink-0 gap-3">
          <button
            onClick={onClose}
            className="px-4 md:px-6 py-2 md:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors text-sm md:text-base"
          >
            Đóng
          </button>

          {donHang.trangThai === 'CHỜ THANH TOÁN' && (
            <button
              onClick={() => onHuyDonHang(donHang.maDonHang)}
              disabled={actionLoading}
              className="px-4 md:px-6 py-2 md:py-3 [background:linear-gradient(to_right,rgb(239,68,68),rgb(225,29,72))] text-white rounded-lg hover:from-red-600 hover:to-rose-700 font-semibold transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 text-sm md:text-base"
            >
              <FaTimesCircle />
              Hủy đơn hàng
            </button>
          )}

          {donHang.trangThai === 'ĐÃ THANH TOÁN' && (
            <button
              onClick={() => onHoanTien(donHang.maDonHang)}
              disabled={actionLoading}
              className="px-4 md:px-6 py-2 md:py-3 [background:linear-gradient(to_right,rgb(249,115,22),rgb(217,119,6))] text-white rounded-lg hover:from-orange-600 hover:to-amber-700 font-semibold transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 text-sm md:text-base"
            >
              <FaUndo />
              Hoàn tiền
            </button>
          )}
        </div>

        {/* Mobile Action Buttons - Shown on mobile only */}
        <div className="flex md:hidden flex-col gap-2 p-4 border-t bg-gray-50 shrink-0">
          {donHang.trangThai === 'CHỜ THANH TOÁN' && (
            <button
              onClick={() => onHuyDonHang(donHang.maDonHang)}
              disabled={actionLoading}
              className="w-full px-4 py-3 [background:linear-gradient(to_right,rgb(239,68,68),rgb(225,29,72))] text-white rounded-lg font-semibold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FaTimesCircle />
              Hủy đơn hàng
            </button>
          )}

          {donHang.trangThai === 'ĐÃ THANH TOÁN' && (
            <button
              onClick={() => onHoanTien(donHang.maDonHang)}
              disabled={actionLoading}
              className="w-full px-4 py-3 [background:linear-gradient(to_right,rgb(249,115,22),rgb(217,119,6))] text-white rounded-lg font-semibold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FaUndo />
              Hoàn tiền
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonHangDetailModal;
