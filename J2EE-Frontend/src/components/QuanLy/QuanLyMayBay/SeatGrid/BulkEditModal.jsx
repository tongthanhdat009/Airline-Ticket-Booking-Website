import React from 'react';
import { SEAT_POSITIONS } from '../../../../constants/aircraftConfig';

const BulkEditModal = ({ selectedCount, bulkEditData, setBulkEditData, hangVeList, onSave, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="bg-gradient-to-r from-sky-600 to-blue-700 text-white p-6 rounded-t-xl">
                    <h3 className="text-xl font-bold">Sửa hàng loạt</h3>
                    <p className="text-sky-100 text-sm mt-1">Đang chỉnh sửa {selectedCount} ghế</p>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Đổi hạng vé</label>
                        <select
                            value={bulkEditData.maHangVe}
                            onChange={(e) => setBulkEditData({ ...bulkEditData, maHangVe: e.target.value ? parseInt(e.target.value) : '' })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                        >
                            <option value="">-- Giữ nguyên --</option>
                            {hangVeList.map(hv => (
                                <option key={hv.maHangVe} value={hv.maHangVe}>{hv.tenHangVe}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Đổi vị trí ghế</label>
                        <select
                            value={bulkEditData.viTriGhe}
                            onChange={(e) => setBulkEditData({ ...bulkEditData, viTriGhe: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                        >
                            <option value="">-- Giữ nguyên --</option>
                            <option value={SEAT_POSITIONS.WINDOW}>Cửa sổ</option>
                            <option value={SEAT_POSITIONS.AISLE}>Lối đi</option>
                            <option value={SEAT_POSITIONS.MIDDLE}>Giữa</option>
                        </select>
                    </div>
                </div>

                <div className="border-t border-gray-200 p-4 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onSave}
                        disabled={!bulkEditData.maHangVe && !bulkEditData.viTriGhe}
                        className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-medium disabled:opacity-50"
                    >
                        Cập nhật {selectedCount} ghế
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkEditModal;
