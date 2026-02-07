import { FaExchangeAlt, FaSpinner, FaPlane } from 'react-icons/fa';

const DoiChuyenModal = ({
  isOpen,
  onClose,
  onSelectFlight,
  datCho,
  availableFlights,
  loading,
  loadingModal,
  formatDateTime
}) => {
  if (!isOpen) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'DANG_MO_BAN':
        return 'bg-green-100 text-green-800';
      case 'DA_KHOI_HANH':
        return 'bg-gray-100 text-gray-800';
      case 'DA_HUY':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'DANG_MO_BAN':
        return 'Đang mở bán';
      case 'DA_KHOI_HANH':
        return 'Đã khởi hành';
      case 'DA_HUY':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] mx-4 bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-4">
          <div className="flex items-center gap-2">
            <FaExchangeAlt className="text-white text-xl" />
            <h2 className="text-xl font-bold text-white">Đổi chuyến bay</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Current Flight Info */}
          {datCho && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Chuyến bay hiện tại</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500">Hành khách:</span>
                  <p className="font-medium text-gray-800">{datCho.hoVaTen}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Số hiệu chuyến bay:</span>
                  <p className="font-medium text-orange-600">{datCho.soHieuChuyenBay}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Từ:</span>
                  <p className="font-medium text-gray-800">{datCho.sanBayDi}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Đến:</span>
                  <p className="font-medium text-gray-800">{datCho.sanBayDen}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-gray-500">Thởi gian khởi hành:</span>
                  <p className="font-medium text-gray-800">
                    {formatDateTime ? formatDateTime(datCho.ngayGioDi) : datCho.ngayGioDi}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Available Flights */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Chuyến bay có sẵn</h3>
            
            {loadingModal ? (
              <div className="flex items-center justify-center py-8">
                <FaSpinner className="animate-spin text-orange-500 text-2xl" />
                <span className="ml-2 text-gray-600">Đang tải danh sách chuyến bay...</span>
              </div>
            ) : availableFlights && availableFlights.length > 0 ? (
              <div className="space-y-3">
                {availableFlights.map((flight) => (
                  <div
                    key={flight.maChuyenBayId}
                    className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 hover:bg-orange-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FaPlane className="text-orange-500" />
                          <span className="font-bold text-gray-800">{flight.maChuyenBay}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(flight.trangThai)}`}>
                            {getStatusLabel(flight.trangThai)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{flight.sanBayDi}</span>
                            <span className="text-gray-400">→</span>
                            <span className="font-medium">{flight.sanBayDen}</span>
                          </div>
                          <span className="text-gray-400">|</span>
                          <div>
                            {flight.ngayDi} {flight.gioDi}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onSelectFlight(flight)}
                        disabled={flight.trangThai !== 'DANG_MO_BAN' || loading}
                        className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                          flight.trangThai === 'DANG_MO_BAN'
                            ? 'bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {loading ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          'Chọn'
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FaPlane className="mx-auto text-gray-300 text-3xl mb-2" />
                <p className="text-gray-500">Không có chuyến bay nào khả dụng</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoiChuyenModal;
