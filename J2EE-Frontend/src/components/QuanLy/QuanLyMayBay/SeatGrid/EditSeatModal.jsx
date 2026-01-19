import React, { useState, useEffect } from 'react';
import { FaEdit, FaSave, FaWindowMaximize, FaArrowsAltH, FaDotCircle } from 'react-icons/fa';
import { SEAT_POSITIONS } from '../../../../constants/aircraftConfig';
import * as QLHangVeService from '../../../../services/QLHangVeService';
import Toast from '../../../common/Toast';

const EditSeatModal = ({ seat, seats, onSave, onClose }) => {
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'error' });
    const [hangVeList, setHangVeList] = useState([]);
    const [loadingHangVe, setLoadingHangVe] = useState(true);

    const [formData, setFormData] = useState({
        soGhe: seat.soGhe || '',
        maHangVe: seat.maHangVe || '',
        viTriGhe: seat.viTriGhe || SEAT_POSITIONS.MIDDLE,
        hang: seat.hang || 1,
        cot: seat.cot || 'A'
    });

    // Load all ticket classes when modal opens
    useEffect(() => {
        const loadHangVe = async () => {
            try {
                setLoadingHangVe(true);
                const response = await QLHangVeService.getAllHangVeAdmin();
                setHangVeList(response.data || []);
            } catch (error) {
                console.error('Lỗi khi tải danh sách hạng vé:', error);
            } finally {
                setLoadingHangVe(false);
            }
        };

        loadHangVe();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Check for duplicate seat number in current aircraft (database constraint: UK_maybay_soghe)
        // In the same aircraft, seat number must be unique regardless of ticket class
        // Exclude current seat from check (editing same seat is allowed)
        if (seats && seats.some(s =>
            s.soGhe === formData.soGhe &&
            s.maGhe !== seat.maGhe // Different seat
        )) {
            setToast({
                isVisible: true,
                message: `Ghế ${formData.soGhe} đã tồn tại trong máy bay này! Mỗi số ghế chỉ được sử dụng một lần.`,
                type: 'error'
            });
            return;
        }

        onSave(seat.maGhe, formData);
    };

    const hideToast = () => {
        setToast({ ...toast, isVisible: false });
    };

    const positionButtons = [
        { value: SEAT_POSITIONS.WINDOW, icon: <FaWindowMaximize />, label: 'Cửa sổ' },
        { value: SEAT_POSITIONS.AISLE, icon: <FaArrowsAltH />, label: 'Lối đi' },
        { value: SEAT_POSITIONS.MIDDLE, icon: <FaDotCircle />, label: 'Giữa' }
    ];

    return (
        <>
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />
            <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-xl">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <FaEdit />
                            Chỉnh sửa ghế {seat.soGhe}
                        </h3>
                        <p className="text-blue-100 text-sm mt-1">Cập nhật thông tin chi tiết ghế</p>
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="VD: 1A"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Hạng vé <span className="text-red-500">*</span>
                            </label>
                            {loadingHangVe ? (
                                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm">
                                    Đang tải danh sách hạng vé...
                                </div>
                            ) : (
                                <select
                                    value={formData.maHangVe}
                                    onChange={(e) => setFormData({ ...formData, maHangVe: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Chọn hạng vé</option>
                                    {hangVeList.map(hv => (
                                        <option key={hv.maHangVe} value={hv.maHangVe}>{hv.tenHangVe}</option>
                                    ))}
                                </select>
                            )}
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {pos.icon} {pos.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                            <strong>Mã ghế:</strong> #{seat.maGhe}
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
                            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                            <FaSave className="inline mr-2" />
                            Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </>
    );
};

export default EditSeatModal;
