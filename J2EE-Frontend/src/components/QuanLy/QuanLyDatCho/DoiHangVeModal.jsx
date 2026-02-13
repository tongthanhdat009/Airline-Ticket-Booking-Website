import React, { useState, useEffect } from 'react';
import { FaTicketAlt, FaSpinner, FaExchangeAlt, FaArrowUp, FaArrowDown, FaMoneyBillWave } from 'react-icons/fa';
import QLDatChoService from '../../../services/QLDatChoService';

const DoiHangVeModal = ({
  isOpen,
  onClose,
  onConfirm,
  datCho,
  loading
}) => {
  const [hangVeList, setHangVeList] = useState([]);
  const [selectedHangVe, setSelectedHangVe] = useState(null);
  const [phiDoiInfo, setPhiDoiInfo] = useState(null);
  const [loadingPhi, setLoadingPhi] = useState(false);
  const [loadingHangVe, setLoadingHangVe] = useState(false);

  // Reset state khi mở modal
  useEffect(() => {
    if (isOpen && datCho) {
      setSelectedHangVe(null);
      setPhiDoiInfo(null);
      loadHangVeList();
    }
  }, [isOpen, datCho]);

  // Load danh sách hạng vé
  const loadHangVeList = async () => {
    setLoadingHangVe(true);
    try {
      // Lấy danh sách hạng vé từ API
      const response = await QLDatChoService.getAvailableHangVe();
      if (response.success) {
        // Lọc bỏ hạng vé hiện tại
        const filtered = response.data.filter(hv => hv.tenHangVe !== datCho.tenHangVe);
        setHangVeList(filtered);
      }
    } catch (error) {
      console.error('Error loading hang ve:', error);
    } finally {
      setLoadingHangVe(false);
    }
  };

  // Tính phí khi chọn hạng vé
  const handleSelectHangVe = async (hangVe) => {
    setSelectedHangVe(hangVe);
    setLoadingPhi(true);
    try {
      const response = await QLDatChoService.tinhPhiDoiHangVe(datCho.maDatCho, hangVe.maHangVe);
      if (response.success) {
        setPhiDoiInfo(response.data);
      }
    } catch (error) {
      console.error('Error tinh phi:', error);
    } finally {
      setLoadingPhi(false);
    }
  };

  // Format tiền tệ
  const formatCurrency = (value) => {
    if (!value) return '0 đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  if (!isOpen || !datCho) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <FaExchangeAlt className="text-white text-2xl" />
            <h2 className="text-xl font-bold text-white">Đổi hạng vé</h2>
          </div>
        </div>

        <div className="p-6">
          {/* Thông tin hiện tại */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaTicketAlt className="text-indigo-600" />
              Thông tin hiện tại
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Hành khách:</span>
                <p className="font-medium">{datCho.hoVaTen}</p>
              </div>
              <div>
                <span className="text-gray-500">Chuyến bay:</span>
                <p className="font-medium">{datCho.soHieuChuyenBay}</p>
              </div>
              <div>
                <span className="text-gray-500">Hạng vé hiện tại:</span>
                <p className="font-medium text-indigo-600">{datCho.tenHangVe}</p>
              </div>
              <div>
                <span className="text-gray-500">Giá vé hiện tại:</span>
                <p className="font-medium">{formatCurrency(datCho.giaVe)}</p>
              </div>
            </div>
          </div>

          {/* Chọn hạng vé mới */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Chọn hạng vé mới</h3>
            
            {loadingHangVe ? (
              <div className="flex items-center justify-center py-4">
                <FaSpinner className="animate-spin text-indigo-600 text-2xl" />
              </div>
            ) : (
              <div className="space-y-2">
                {hangVeList.map((hangVe) => (
                  <button
                    key={hangVe.maHangVe}
                    onClick={() => handleSelectHangVe(hangVe)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      selectedHangVe?.maHangVe === hangVe.maHangVe
                        ? 'border-violet-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{hangVe.tenHangVe}</span>
                      {selectedHangVe?.maHangVe === hangVe.maHangVe && (
                        <span className="text-indigo-600">✓</span>
                      )}
                    </div>
                  </button>
                ))}
                {hangVeList.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Không có hạng vé khác để đổi</p>
                )}
              </div>
            )}
          </div>

          {/* Thông tin phí */}
          {loadingPhi ? (
            <div className="flex items-center justify-center py-4">
              <FaSpinner className="animate-spin text-indigo-600 text-2xl" />
              <span className="ml-2 text-gray-600">Đang tính phí...</span>
            </div>
          ) : phiDoiInfo ? (
            <div className="bg-indigo-50 rounded-lg p-4 mb-6 border border-indigo-200">
              <h3 className="font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                <FaMoneyBillWave />
                Chi tiết phí đổi hạng vé
              </h3>
              
              {/* Loại giao dịch */}
              <div className="flex items-center gap-2 mb-3">
                {phiDoiInfo.loaiGiaoDich === 'THU_THEM' ? (
                  <>
                    <FaArrowUp className="text-red-500" />
                    <span className="text-red-600 font-medium">Nâng hạng - Thu thêm tiền</span>
                  </>
                ) : phiDoiInfo.loaiGiaoDich === 'HOAN_TIEN' ? (
                  <>
                    <FaArrowDown className="text-orange-500" />
                    <span className="text-orange-600 font-medium">Hạ hạng - Phạt 20% chênh lệch</span>
                  </>
                ) : (
                  <span className="text-green-600 font-medium">Không chênh lệch</span>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá vé cũ:</span>
                  <span>{formatCurrency(phiDoiInfo.giaVeCu)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá vé mới:</span>
                  <span>{formatCurrency(phiDoiInfo.giaVeMoi)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chênh lệch:</span>
                  <span className={phiDoiInfo.loaiGiaoDich === 'THU_THEM' ? 'text-red-600' : 'text-green-600'}>
                    {phiDoiInfo.loaiGiaoDich === 'THU_THEM' ? '+' : '-'}
                    {formatCurrency(phiDoiInfo.chenhLech)}
                  </span>
                </div>
                {phiDoiInfo.phiDoi > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí đổi (20%):</span>
                    <span className="text-orange-600">+{formatCurrency(phiDoiInfo.phiDoi)}</span>
                  </div>
                )}
                <div className="border-t border-indigo-200 pt-2 mt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span className="text-indigo-800">
                      {phiDoiInfo.loaiGiaoDich === 'HOAN_TIEN' ? 'Hoàn tiền:' : 'Thanh toán thêm:'}
                    </span>
                    <span className={phiDoiInfo.loaiGiaoDich === 'HOAN_TIEN' ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(phiDoiInfo.tongThanhToan)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={() => selectedHangVe && onConfirm(selectedHangVe, phiDoiInfo)}
              disabled={!selectedHangVe || loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Xác nhận đổi hạng vé'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoiHangVeModal;
