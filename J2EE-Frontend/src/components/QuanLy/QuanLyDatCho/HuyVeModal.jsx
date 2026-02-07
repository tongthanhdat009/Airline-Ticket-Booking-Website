import { useState } from 'react';
import { FaTimesCircle, FaSpinner } from 'react-icons/fa';

const HuyVeModal = ({ isOpen, onClose, onConfirm, datCho, loading }) => {
  const [lyDo, setLyDo] = useState('');

  const lyDoOptions = [
    { value: '', label: '-- Chọn lý do --' },
    { value: 'Khách hàng yêu cầu hủy', label: 'Khách hàng yêu cầu hủy' },
    { value: 'Thay đổi lịch trình', label: 'Thay đổi lịch trình' },
    { value: 'Chuyến bay bị hủy', label: 'Chuyến bay bị hủy' },
    { value: 'Trùng chuyến bay', label: 'Trùng chuyến bay' },
    { value: 'Lý do khác', label: 'Lý do khác' },
  ];

  const handleConfirm = () => {
    if (lyDo) {
      onConfirm(lyDo);
    }
  };

  const handleClose = () => {
    setLyDo('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="rounded-t-xl bg-gradient-to-r from-red-500 to-rose-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <FaTimesCircle className="text-2xl text-white" />
            <h2 className="text-xl font-bold text-white">Xác nhận hủy vé</h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Passenger Info */}
          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <p className="mb-2 text-sm text-gray-600">
              <span className="font-medium">Hành khách:</span>{' '}
              <span className="font-semibold text-gray-800">
                {datCho?.hoVaTen || 'N/A'}
              </span>
            </p>
            <p className="mb-2 text-sm text-gray-600">
              <span className="font-medium">Mã đặt chỗ:</span>{' '}
              <span className="font-semibold text-gray-800">
                {datCho?.maDatCho || 'N/A'}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Chuyến bay:</span>{' '}
              <span className="font-semibold text-gray-800">
                {datCho?.soHieuChuyenBay || 'N/A'}
              </span>
            </p>
          </div>

          {/* Warning Message */}
          <div className="mb-6 rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              Lưu ý: Việc hủy vé không thể hoàn tác. Vui lòng chọn lý do hủy vé
              bên dưới.
            </p>
          </div>

          {/* Cancellation Reason */}
          <div className="mb-6">
            <label
              htmlFor="lyDoHuy"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Lý do hủy vé <span className="text-red-500">*</span>
            </label>
            <select
              id="lyDoHuy"
              value={lyDo}
              onChange={(e) => setLyDo(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              {lyDoOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="flex-1 rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Đóng
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || !lyDo}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <span>Xác nhận hủy</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HuyVeModal;
