import { FaUserCheck, FaSpinner } from 'react-icons/fa';

const CheckInModal = ({ isOpen, onClose, onConfirm, datCho, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <FaUserCheck className="text-white text-xl" />
            <h2 className="text-white text-lg font-semibold">
              Xác nhận Check-in
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Bạn có chắc chắn muốn thực hiện check-in cho đặt chỗ này?
          </p>

          {/* Passenger Info Box */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="text-gray-500">Mã đặt chỗ:</div>
              <div className="font-medium text-gray-900">{datCho?.maDatCho}</div>

              <div className="text-gray-500">Hành khách:</div>
              <div className="font-medium text-gray-900">{datCho?.hoVaTen}</div>

              <div className="text-gray-500">Chuyến bay:</div>
              <div className="font-medium text-gray-900">{datCho?.soHieuChuyenBay}</div>

              <div className="text-gray-500">Hành trình:</div>
              <div className="font-medium text-gray-900">
                {datCho?.sanBayDi} → {datCho?.sanBayDen}
              </div>

              <div className="text-gray-500">Ghế:</div>
              <div className="font-medium text-gray-900">{datCho?.soGhe}</div>

              <div className="text-gray-500">Hạng vé:</div>
              <div className="font-medium text-gray-900">{datCho?.tenHangVe}</div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Xác nhận Check-in'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInModal;
