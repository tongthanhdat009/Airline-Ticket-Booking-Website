import React from 'react';
import { FaTimes, FaBan } from 'react-icons/fa';

const CancelFlightModal = ({ isOpen, onClose, onSubmit, cancelData, onCancelDataChange }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-500 to-red-600 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                            <FaBan className="text-white text-xl" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Hủy chuyến bay</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={onSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Lý do hủy chuyến bay <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={cancelData.lyDoHuy}
                                onChange={(e) => onCancelDataChange({ ...cancelData, lyDoHuy: e.target.value })}
                                placeholder="Nhập lý do hủy chuyến bay..."
                                required
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Vui lòng cung cấp lý do chi tiết để thông báo cho hành khách
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                        >
                            Đóng
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                            Xác nhận hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CancelFlightModal;
