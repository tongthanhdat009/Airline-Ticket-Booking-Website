import React from 'react';
import { FaTrash } from 'react-icons/fa';

const DeleteConfirmationModal = ({ onClose, onConfirm, serviceName }) => {
  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative">
        <div className="p-6">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <FaTrash className="text-red-600 text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Xác nhận xóa</h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            Bạn có chắc chắn muốn xóa dịch vụ <span className="font-semibold text-gray-900">"{serviceName}"</span>? Hành động này không thể hoàn tác.
          </p>
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
            >
              Hủy
            </button>
            <button 
              type="button" 
              onClick={onConfirm} 
              className="flex-1 px-6 py-3 bg-linear-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-semibold transition-all shadow-lg"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;