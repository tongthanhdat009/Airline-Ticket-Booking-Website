import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { SEAT_POSITIONS } from '../../../../constants/aircraftConfig';

const AddSeatModal = ({ initialData, hangVeList, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        soGhe: initialData?.soGhe || '',
        maHangVe: initialData?.maHangVe || '',
        viTriGhe: initialData?.viTriGhe || SEAT_POSITIONS.MIDDLE,
        hang: initialData?.hang || 1,
        cot: initialData?.cot || 'A'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const positionButtons = [
        { value: SEAT_POSITIONS.WINDOW, icon: '🪟', label: 'Cửa sổ' },
        { value: SEAT_POSITIONS.AISLE, icon: '🚶', label: 'Lối đi' },
        { value: SEAT_POSITIONS.MIDDLE, icon: '📍', label: 'Giữa' }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6 rounded-t-xl">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <FaPlus />
                        Thêm ghế mới
                    </h3>
                    <p className="text-green-100 text-sm mt-1">Tạo ghế mới cho máy bay</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Số ghế <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.soGhe}
                                onChange={(e) => setFormData({ ...formData, soGhe: e.target.value.toUpperCase() })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="VD: 1A"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Hạng vé <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.maHangVe}
                                onChange={(e) => setFormData({ ...formData, maHangVe: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                required
                            >
                                <option value="">Chọn hạng vé</option>
                                {hangVeList.map(hv => (
                                    <option key={hv.maHangVe} value={hv.maHangVe}>{hv.tenHangVe}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Hàng <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={formData.hang}
                                onChange={(e) => setFormData({ ...formData, hang: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                min="1"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Cột <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.cot}
                                onChange={(e) => setFormData({ ...formData, cot: e.target.value.toUpperCase() })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="A"
                                maxLength="2"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Vị trí ghế <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {positionButtons.map(pos => (
                                <button
                                    key={pos.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, viTriGhe: pos.value })}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        formData.viTriGhe === pos.value
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {pos.icon} {pos.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800">
                            💡 <strong>Mẹo:</strong> Số ghế thường được tạo tự động theo định dạng "Hàng + Cột" (VD: 1A, 2B)
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                        >
                            <FaPlus className="inline mr-2" />
                            Thêm ghế
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSeatModal;
