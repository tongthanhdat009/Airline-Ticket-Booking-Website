import React, { useState } from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const HuyDonHangModal = ({ isVisible, maDonHang, onCancel, onConfirm }) => {
  const [lyDoHuy, setLyDoHuy] = useState('');

  const handleSubmit = () => {
    if (!lyDoHuy.trim()) {
      return;
    }
    onConfirm(lyDoHuy);
    setLyDoHuy('');
  };

  const handleClose = () => {
    setLyDoHuy('');
    onCancel();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose}></div>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle size={24} />
              <h2 className="text-xl font-bold">Xác nhận hủy đơn hàng</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-2">
              Mã đơn hàng: <span className="font-bold text-red-600">#{maDonHang}</span>
            </p>
            <p className="text-gray-600 text-sm">
              Đơn hàng sẽ bị hủy và không thể khôi phục. Vui lòng nhập lý do hủy.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Lý do hủy <span className="text-red-500">*</span>
            </label>
            <textarea
              value={lyDoHuy}
              onChange={(e) => setLyDoHuy(e.target.value)}
              placeholder="Nhập lý do hủy đơn hàng..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
            {!lyDoHuy.trim() && (
              <p className="text-red-500 text-xs mt-1">Vui lòng nhập lý do hủy</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!lyDoHuy.trim()}
            className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg hover:from-red-600 hover:to-orange-700 font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Xác nhận hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default HuyDonHangModal;
