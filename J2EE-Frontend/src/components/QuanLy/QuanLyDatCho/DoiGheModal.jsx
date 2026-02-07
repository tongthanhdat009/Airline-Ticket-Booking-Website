import React from 'react';
import { FaChair, FaSpinner, FaTimesCircle, FaWindowMaximize, FaWalking, FaSquare } from 'react-icons/fa';

const DoiGheModal = ({
  isOpen,
  onClose,
  onConfirm,
  datCho,
  seatMap,
  selectedNewSeat,
  onSelectSeat,
  loading,
  loadingModal
}) => {
  if (!isOpen) return null;

  // Helper function to get seat color based on status
  const getSeatColor = (seat) => {
    if (seat.isCurrentSeat) return 'bg-yellow-400 border-yellow-500 text-yellow-900';
    if (seat.isBooked) return 'bg-red-500 border-red-600 text-white';
    if (selectedNewSeat?.maGhe === seat.maGhe) return 'bg-blue-500 border-blue-600 text-white';
    return 'bg-white border-gray-300 text-gray-700 hover:bg-blue-50';
  };

  // Helper function to get position icon
  const getPositionIcon = (loaiViTri) => {
    switch (loaiViTri) {
      case 'WINDOW':
        return <FaWindowMaximize className="w-3 h-3" />;
      case 'AISLE':
        return <FaWalking className="w-3 h-3" />;
      case 'MIDDLE':
        return <FaSquare className="w-3 h-3" />;
      default:
        return null;
    }
  };

  // Group seats by row
  const seatsByRow = seatMap?.seats?.reduce((acc, seat) => {
    if (!acc[seat.hang]) acc[seat.hang] = [];
    acc[seat.hang].push(seat);
    return acc;
  }, {}) || {};

  // Sort rows numerically
  const sortedRows = Object.keys(seatsByRow).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaChair className="text-white text-2xl" />
            <h2 className="text-xl font-bold text-white">Đổi ghế</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <FaTimesCircle className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loadingModal ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
              <p className="text-gray-600">Đang tải sơ đồ ghế...</p>
            </div>
          ) : (
            <>
              {/* Current Booking Info */}
              {datCho && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">Thông tin đặt chỗ</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Hành khách:</span>
                      <p className="font-medium text-gray-800">{datCho.hoVaTen}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Ghế hiện tại:</span>
                      <p className="font-medium text-gray-800">{datCho.soGhe}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Hạng vé:</span>
                      <p className="font-medium text-gray-800">{datCho.tenHangVe}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-400 border border-yellow-500 rounded"></div>
                  <span className="text-sm text-gray-600">Ghế hiện tại</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-500 border border-red-600 rounded"></div>
                  <span className="text-sm text-gray-600">Đã đặt</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 border border-blue-600 rounded"></div>
                  <span className="text-sm text-gray-600">Đang chọn</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white border border-gray-300 rounded"></div>
                  <span className="text-sm text-gray-600">Còn trống</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaWindowMaximize className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Cửa sổ</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaWalking className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">Lối đi</span>
                </div>
              </div>

              {/* Seat Grid */}
              <div className="bg-gray-100 rounded-xl p-6">
                {/* Column headers */}
                <div className="grid grid-cols-7 gap-2 mb-4 text-center">
                  <div className="font-semibold text-gray-600">A</div>
                  <div className="font-semibold text-gray-600">B</div>
                  <div className="font-semibold text-gray-600">C</div>
                  <div className="font-semibold text-gray-400"></div>
                  <div className="font-semibold text-gray-600">D</div>
                  <div className="font-semibold text-gray-600">E</div>
                  <div className="font-semibold text-gray-600">F</div>
                </div>

                {/* Seat rows */}
                <div className="space-y-2">
                  {sortedRows.map((rowNum) => {
                    const rowSeats = seatsByRow[rowNum];
                    const seatA = rowSeats.find(s => s.cot === 'A');
                    const seatB = rowSeats.find(s => s.cot === 'B');
                    const seatC = rowSeats.find(s => s.cot === 'C');
                    const seatD = rowSeats.find(s => s.cot === 'D');
                    const seatE = rowSeats.find(s => s.cot === 'E');
                    const seatF = rowSeats.find(s => s.cot === 'F');

                    return (
                      <div key={rowNum} className="grid grid-cols-7 gap-2 items-center">
                        {/* Left side seats (A, B, C) */}
                        {[seatA, seatB, seatC].map((seat, idx) => (
                          <div key={idx}>
                            {seat ? (
                              <button
                                onClick={() => !seat.isBooked && !seat.isCurrentSeat && onSelectSeat(seat)}
                                disabled={seat.isBooked || seat.isCurrentSeat}
                                className={`w-full py-2 px-1 border rounded-lg text-sm font-medium transition-all ${getSeatColor(seat)} ${
                                  seat.isBooked || seat.isCurrentSeat ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-md'
                                }`}
                                title={`${seat.soGhe} - ${seat.tenHangVe} - ${seat.loaiViTri}`}
                              >
                                <div className="flex flex-col items-center gap-1">
                                  <span>{seat.soGhe}</span>
                                  {getPositionIcon(seat.loaiViTri)}
                                </div>
                              </button>
                            ) : (
                              <div className="w-full py-2"></div>
                            )}
                          </div>
                        ))}

                        {/* Row number / Aisle */}
                        <div className="text-center font-semibold text-gray-400 text-sm">
                          {rowNum}
                        </div>

                        {/* Right side seats (D, E, F) */}
                        {[seatD, seatE, seatF].map((seat, idx) => (
                          <div key={idx}>
                            {seat ? (
                              <button
                                onClick={() => !seat.isBooked && !seat.isCurrentSeat && onSelectSeat(seat)}
                                disabled={seat.isBooked || seat.isCurrentSeat}
                                className={`w-full py-2 px-1 border rounded-lg text-sm font-medium transition-all ${getSeatColor(seat)} ${
                                  seat.isBooked || seat.isCurrentSeat ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-md'
                                }`}
                                title={`${seat.soGhe} - ${seat.tenHangVe} - ${seat.loaiViTri}`}
                              >
                                <div className="flex flex-col items-center gap-1">
                                  <span>{seat.soGhe}</span>
                                  {getPositionIcon(seat.loaiViTri)}
                                </div>
                              </button>
                            ) : (
                              <div className="w-full py-2"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>

                {/* Cockpit indicator */}
                <div className="mt-6 text-center">
                  <div className="inline-block px-8 py-2 bg-gray-300 rounded-full text-gray-600 text-sm font-medium">
                    ← Phía trước máy bay
                  </div>
                </div>
              </div>

              {/* Selected Seat Info */}
              {selectedNewSeat && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Ghế đã chọn</h4>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-blue-600">{selectedNewSeat.soGhe}</div>
                    <div className="text-sm text-gray-600">
                      <p><span className="font-medium">Hạng vé:</span> {selectedNewSeat.tenHangVe}</p>
                      <p><span className="font-medium">Vị trí:</span> {selectedNewSeat.loaiViTri === 'WINDOW' ? 'Cửa sổ' : selectedNewSeat.loaiViTri === 'AISLE' ? 'Lối đi' : 'Giữa'}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || !selectedNewSeat}
            className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <FaSpinner className="animate-spin" />}
            Xác nhận đổi ghế
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoiGheModal;
