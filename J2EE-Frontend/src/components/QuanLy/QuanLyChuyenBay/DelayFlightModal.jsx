import React from 'react';

const DelayFlightModal = ({ isOpen, onClose, onSubmit, delayData, onDelayDataChange }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
                <div className="sticky top-0 bg-linear-to-r from-red-600 to-red-700 text-white p-6 rounded-t-xl">
                    <h2 className="text-2xl font-bold">Cập nhật Delay</h2>
                </div>
                <form onSubmit={onSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Lý do delay</label>
                            <textarea
                                value={delayData.lyDoDelay}
                                onChange={(e) => onDelayDataChange({ ...delayData, lyDoDelay: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                rows="3"
                                required
                                placeholder="Nhập lý do delay..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Thời gian đi thực tế</label>
                            <input
                                type="datetime-local"
                                value={delayData.thoiGianDiThucTe}
                                onChange={(e) => onDelayDataChange({ ...delayData, thoiGianDiThucTe: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Thời gian đến thực tế</label>
                            <input
                                type="datetime-local"
                                value={delayData.thoiGianDenThucTe}
                                onChange={(e) => onDelayDataChange({ ...delayData, thoiGianDenThucTe: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-linear-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-semibold transition-all shadow-lg"
                        >
                            Cập nhật Delay
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DelayFlightModal;