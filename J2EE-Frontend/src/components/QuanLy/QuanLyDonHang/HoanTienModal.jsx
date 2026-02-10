import React, { useState, useEffect } from 'react';
import { FaUndo, FaTimes } from 'react-icons/fa';

const HoanTienModal = ({
  isVisible,
  donHangs = [],
  actionLoading,
  onClose,
  onConfirm
}) => {
  const [lyDoHoanTien, setLyDoHoanTien] = useState('');

  useEffect(() => {
    if (isVisible) {
      setLyDoHoanTien('');
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const handleSubmit = () => {
    if (!lyDoHoanTien.trim()) {
      alert('Vui lòng nhập lý do hoàn tiền');
      return;
    }
    onConfirm(lyDoHoanTien.trim());
  };

  const isMultiple = donHangs.length > 1;
  const totalRefund = donHangs.reduce((sum, dh) => sum + (dh.tongGia || 0), 0);

  return (
    <div className="fixed inset-0 flex justify-center items-center z-60 p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white p-5 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FaUndo size={24} />
              <div>
                <h2 className="text-xl font-bold">
                  {isMultiple ? 'Hoàn tiền hàng loạt' : 'Hoàn tiền đơn hàng'}
                </h2>
                <p className="text-sm opacity-90 mt-1">
                  {isMultiple
                    ? `Đã chọn ${donHangs.length} đơn hàng`
                    : `Mã ĐH: #${donHangs[0]?.maDonHang || 'N/A'}`
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              disabled={actionLoading}
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Danh sách đơn hàng */}
          {isMultiple && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Danh sách đơn hàng:</h3>
              <div className="max-h-32 overflow-y-auto bg-gray-50 rounded-lg p-3">
                {donHangs.map((dh) => (
                  <div key={dh.maDonHang} className="text-sm py-1 border-b border-gray-200 last:border-0">
                    <span className="font-medium text-violet-600">#{dh.maDonHang}</span>
                    <span className="text-gray-500 ml-2">
                      {dh.pnr ? `(${dh.pnr})` : ''} - {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(dh.tongGia || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form nhập lý do */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Lý do hoàn tiền <span className="text-red-500">*</span>
            </label>
            <textarea
              value={lyDoHoanTien}
              onChange={(e) => setLyDoHoanTien(e.target.value)}
              placeholder="Nhập lý do hoàn tiền..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              disabled={actionLoading}
            />
          </div>

          {/* Thông tin tổng tiền hoàn */}
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mb-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Tổng tiền hoàn:</span>
              <span className="text-xl font-bold text-orange-600">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(totalRefund)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={actionLoading || !lyDoHoanTien.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:from-orange-600 hover:to-amber-700 font-semibold transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaUndo />
              {actionLoading ? 'Đang xử lý...' : 'Xác nhận hoàn tiền'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoanTienModal;
