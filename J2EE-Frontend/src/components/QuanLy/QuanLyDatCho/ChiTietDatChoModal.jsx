import React from 'react';
import {
  FaTicketAlt,
  FaUserCheck,
  FaPlane,
  FaChair,
  FaTimesCircle,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaCheckCircle,
  FaClock
} from 'react-icons/fa';

const ChiTietDatChoModal = ({
  isOpen,
  onClose,
  datCho,
  getCheckInStatus,
  getTrangThaiDatCho,
  formatDate,
  formatDateTime,
  formatCurrency
}) => {
  if (!isOpen || !datCho) return null;

  const checkInStatus = getCheckInStatus(datCho.checkInStatus);
  const bookingStatus = getTrangThaiDatCho(datCho.trangThai);

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>

      {/* Modal - Full screen on mobile, centered modal on desktop */}
      <div className="relative z-10 h-full w-full md:h-[85vh] md:max-w-4xl md:mx-auto md:my-8 md:rounded-2xl bg-white md:shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 md:px-8 py-3 md:py-5 flex justify-between items-center shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-white bg-opacity-20 rounded-full shrink-0">
                <FaTicketAlt className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg md:text-xl font-bold text-white truncate">Chi tiết đặt chỗ</h2>
                <p className="text-xs md:text-sm text-white text-opacity-80 mt-1 truncate">Mã đặt chỗ: {datCho.maDatCho}</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors p-1 hover:bg-white/10 rounded-lg ml-2 shrink-0"
          >
            <FaTimesCircle className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6">
          {/* Thông tin đặt chỗ */}
          <div className="p-4 md:p-5 border border-gray-200 rounded-xl bg-gray-50">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-200">
              <FaTicketAlt className="w-5 h-5 text-violet-600" />
              <h3 className="text-base md:text-lg font-semibold text-gray-800">Thông tin đặt chỗ</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Mã đặt chỗ</p>
                <p className="font-semibold text-gray-800">{datCho.maDatCho}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mã PNR</p>
                <p className="font-semibold text-gray-800">{datCho.pnr}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trạng thái đặt chỗ</p>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${bookingStatus.color}`}>
                  <FaCheckCircle className="w-3 h-3" />
                  {bookingStatus.text}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trạng thái check-in</p>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${checkInStatus.color}`}>
                  {checkInStatus.icon}
                  {checkInStatus.text}
                </span>
              </div>
            </div>
          </div>

          {/* Thông tin hành khách */}
          <div className="p-4 md:p-5 border border-gray-200 rounded-xl bg-gray-50">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-200">
              <FaUserCheck className="w-5 h-5 text-violet-600" />
              <h3 className="text-base md:text-lg font-semibold text-gray-800">Thông tin hành khách</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Họ và tên</p>
                <p className="font-semibold text-gray-800">{datCho.hoVaTen}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Giới tính</p>
                <p className="font-semibold text-gray-800">{datCho.gioiTinh}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Số CCCD/Passport</p>
                <div className="flex items-center gap-2">
                  <FaIdCard className="w-4 h-4 text-gray-400" />
                  <p className="font-semibold text-gray-800">{datCho.cccd}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ngày sinh</p>
                <p className="font-semibold text-gray-800">{formatDate(datCho.ngaySinh)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Số điện thoại</p>
                <div className="flex items-center gap-2">
                  <FaPhone className="w-4 h-4 text-gray-400" />
                  <p className="font-semibold text-gray-800">{datCho.soDienThoai}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <div className="flex items-center gap-2">
                  <FaEnvelope className="w-4 h-4 text-gray-400" />
                  <p className="font-semibold text-gray-800">{datCho.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin chuyến bay */}
          <div className="p-4 md:p-5 border border-gray-200 rounded-xl bg-gray-50">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-200">
              <FaPlane className="w-5 h-5 text-violet-600" />
              <h3 className="text-base md:text-lg font-semibold text-gray-800">Thông tin chuyến bay</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Số hiệu chuyến bay</p>
                <p className="font-semibold text-gray-800">{datCho.soHieuChuyenBay}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Thời gian khởi hành</p>
                <div className="flex items-center gap-2">
                  <FaClock className="w-4 h-4 text-gray-400" />
                  <p className="font-semibold text-gray-800">{formatDateTime(datCho.ngayGioDi)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sân bay đi</p>
                <p className="font-semibold text-gray-800">{datCho.sanBayDi}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sân bay đến</p>
                <p className="font-semibold text-gray-800">{datCho.sanBayDen}</p>
              </div>
            </div>
          </div>

          {/* Thông tin ghế */}
          <div className="p-4 md:p-5 border border-gray-200 rounded-xl bg-gray-50">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-200">
              <FaChair className="w-5 h-5 text-violet-600" />
              <h3 className="text-base md:text-lg font-semibold text-gray-800">Thông tin ghế</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Số ghế</p>
                <p className="font-semibold text-gray-800">{datCho.soGhe}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Hạng vé</p>
                <p className="font-semibold text-gray-800">{datCho.tenHangVe}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Giá vé</p>
                <p className="font-semibold text-violet-600">{formatCurrency(datCho.giaVe)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Hidden on mobile, shown on desktop */}
        <div className="hidden md:flex justify-end px-8 py-5 bg-gray-50 border-t border-gray-200 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChiTietDatChoModal;
