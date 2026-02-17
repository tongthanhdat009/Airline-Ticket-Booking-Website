const ModalDetailHoaDon = ({
  isVisible,
  onClose,
  selectedPayment,
  bookingDetails,
  onDownloadPDF,
  onPayment
}) => {
  if (!isVisible || !selectedPayment || !bookingDetails) return null;

  const getStatusBadge = (daThanhToan) => {
    if (daThanhToan === 'Y') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <span>✓</span>
          Đã thanh toán
        </span>
      );
    }
    if (daThanhToan === 'H') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <span>✗</span>
          Đã hủy
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <span>⏳</span>
        Chưa thanh toán
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1100] p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[95vh] overflow-auto flex flex-col relative z-10">
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center shrink-0">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Chi tiết hóa đơn</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Payment Status */}
          <div className="bg-gradient-to-r from-[#F5F7FA] to-[#E3F2FD] rounded-lg p-3 sm:p-4 border border-[#1E88E5]/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Mã giao dịch</p>
                <p className="text-xl sm:text-2xl font-bold text-[#1E88E5]">#{selectedPayment.maThanhToan}</p>
              </div>
              {getStatusBadge(selectedPayment.daThanhToan)}
            </div>
          </div>

          {/* Flight Details */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
              ✈️ Thông tin chuyến bay
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-sm text-gray-600">Số hiệu chuyến bay</p>
                <p className="font-semibold">{selectedPayment.datCho?.chiTietGhe?.chiTietChuyenBay?.soHieuChuyenBay}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trạng thái chuyến bay</p>
                <p className="font-semibold">{selectedPayment.datCho?.chiTietGhe?.chiTietChuyenBay?.trangThai}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Điểm khởi hành</p>
                <p className="font-semibold">{selectedPayment.datCho?.chiTietGhe?.chiTietChuyenBay?.tuyenBay?.sanBayDi?.tenSanBay}</p>
                <p className="text-sm text-gray-500">{selectedPayment.datCho?.chiTietGhe?.chiTietChuyenBay?.tuyenBay?.sanBayDi?.thanhPhoSanBay}</p>
                <p className="text-sm">{formatDate(selectedPayment.datCho?.chiTietGhe?.chiTietChuyenBay?.ngayDi)} - {formatTime(selectedPayment.datCho?.chiTietGhe?.chiTietChuyenBay?.gioDi)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Điểm đến</p>
                <p className="font-semibold">{selectedPayment.datCho?.chiTietGhe?.chiTietChuyenBay?.tuyenBay?.sanBayDen?.tenSanBay}</p>
                <p className="text-sm text-gray-500">{selectedPayment.datCho?.chiTietGhe?.chiTietChuyenBay?.tuyenBay?.sanBayDen?.thanhPhoSanBay}</p>
                <p className="text-sm">{formatDate(selectedPayment.datCho?.chiTietGhe?.chiTietChuyenBay?.ngayDen)} - {formatTime(selectedPayment.datCho?.chiTietGhe?.chiTietChuyenBay?.gioDen)}</p>
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
              🎫 Thông tin vé
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <p className="text-sm text-gray-600">Số ghế</p>
                <p className="font-semibold text-xl text-[#1E88E5]">{bookingDetails.chiTietGhe?.maGhe}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Hạng vé</p>
                <p className="font-semibold">{bookingDetails.chiTietGhe?.hangVe?.tenHangVe}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ngày đặt</p>
                <p className="font-semibold">{formatDate(bookingDetails.ngayDatCho)}</p>
              </div>
            </div>
          </div>

          {/* Passenger Info */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
              👤 Thông tin hành khách
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-sm text-gray-600">Họ và tên</p>
                <p className="font-semibold">{bookingDetails.hanhKhach?.hoVaTen}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Giới tính</p>
                <p className="font-semibold">{bookingDetails.hanhKhach?.gioiTinh}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ngày sinh</p>
                <p className="font-semibold">{formatDate(bookingDetails.hanhKhach?.ngaySinh)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Số điện thoại</p>
                <p className="font-semibold">{bookingDetails.hanhKhach?.soDienThoai || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Services */}
          {bookingDetails.danhSachDichVu && bookingDetails.danhSachDichVu.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
                🛎️ Dịch vụ đã đặt
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {bookingDetails.danhSachDichVu.map((service, index) => (
                  <div key={index} className="bg-white rounded-lg p-2 sm:p-3 border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">
                          {service.luaChonDichVu?.dichVuCungCap?.tenDichVu}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {service.luaChonDichVu?.tenLuaChon}
                        </p>
                        {service.luaChonDichVu?.moTa && (
                          <p className="text-xs text-gray-500 mt-1">
                            {service.luaChonDichVu.moTa}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xs sm:text-sm text-gray-600">SL: {service.soLuong}</p>
                        <p className="font-semibold text-[#1E88E5] text-sm sm:text-base">
                          {formatCurrency(service.donGia)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Tổng: {formatCurrency(service.donGia * service.soLuong)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 sm:p-4 border border-green-200">
            <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
              💰 Tổng thanh toán
            </h3>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className="text-gray-700 text-base sm:text-lg">Tổng số tiền:</span>
              <span className="text-xl sm:text-2xl font-bold text-green-600">
                {formatCurrency(selectedPayment.soTien)}
              </span>
            </div>
            {selectedPayment.ngayHetHan && (
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2 text-xs sm:text-sm gap-1">
                <span className="text-gray-600">Ngày hết hạn:</span>
                <span className="font-medium text-orange-600">
                  {formatDate(selectedPayment.ngayHetHan)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm sm:text-base"
          >
            Đóng
          </button>
          {selectedPayment.daThanhToan === 'Y' ? (
            <button
              onClick={() => onDownloadPDF(selectedPayment.maThanhToan)}
              className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm sm:text-base"
            >
              📄 Tải PDF
            </button>
          ) : selectedPayment.daThanhToan === 'H' ? null : (
            <button
              onClick={() => onPayment(selectedPayment.maThanhToan)}
              className="px-4 sm:px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm sm:text-base"
            >
              💳 Thanh toán VNPay
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalDetailHoaDon;
