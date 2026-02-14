import React, { useState, useEffect } from 'react';
import { FaPlus, FaWindowMaximize, FaArrowsAltH, FaDotCircle } from 'react-icons/fa';
import { SEAT_POSITIONS } from '../../../../constants/aircraftConfig';
import * as QLHangVeService from '../../../../services/QLHangVeService';
import Toast from '../../../common/Toast';

const AddSeatModal = ({ initialData, onSave, onClose, seats, aircraft }) => {
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'error' });
    const [formData, setFormData] = useState({
        soGhe: initialData?.soGhe || '',
        maHangVe: initialData?.maHangVe || '',
        viTriGhe: initialData?.viTriGhe || SEAT_POSITIONS.MIDDLE,
        hang: initialData?.hang || 1,
        cot: initialData?.cot || 'A'
    });

    const currentSeatsCount = seats?.length || 0;
    const maxSeats = aircraft?.tongSoGhe || 0;
    const availableSeats = Math.max(0, maxSeats - currentSeatsCount);
    const canAddSeat = availableSeats > 0;

    const [hangVeList, setHangVeList] = useState([]);
    const [loadingHangVe, setLoadingHangVe] = useState(true);

    useEffect(() => {
        const loadHangVe = async () => {
            try {
                setLoadingHangVe(true);
                const response = await QLHangVeService.getAllHangVeAdmin();
                setHangVeList(response.data || []);
            } catch (error) {
                console.error('Error loading ticket classes:', error);
            } finally {
                setLoadingHangVe(false);
            }
        };
        loadHangVe();
    }, []);

    useEffect(() => {
        if (formData.hang && formData.cot) {
            const soGhe = formData.hang + formData.cot.toUpperCase();
            setFormData(prev => ({ ...prev, soGhe }));
        }
    }, [formData.hang, formData.cot]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (seats && seats.some(seat => seat.soGhe === formData.soGhe)) {
            setToast({
                isVisible: true,
                message: 'Số ghế này đã tồn tại trên máy bay!',
                type: 'error'
            });
            return;
        }
        onSave(formData);
    };

    const hideToast = () => {
        setToast({ ...toast, isVisible: false });
    };

    const positionButtons = [
        { value: SEAT_POSITIONS.WINDOW, icon: <FaWindowMaximize />, label: 'Window' },
        { value: SEAT_POSITIONS.AISLE, icon: <FaArrowsAltH />, label: 'Aisle' },
        { value: SEAT_POSITIONS.MIDDLE, icon: <FaDotCircle />, label: 'Middle' }
    ];

    return React.createElement(React.Fragment, null,
        React.createElement(Toast, { message: toast.message, type: toast.type, isVisible: toast.isVisible, onClose: hideToast }),
        React.createElement('div', { className: 'fixed inset-0 flex justify-center items-center z-50 p-4' },
            React.createElement('div', { className: 'absolute inset-0 bg-black/50', onClick: onClose }),
            React.createElement('div', { className: 'bg-white rounded-xl shadow-2xl w-full max-w-md relative z-10', onClick: (e) => e.stopPropagation() },
                React.createElement('div', { className: 'bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6 rounded-t-xl' },
                    React.createElement('div', { className: 'flex items-center gap-2' },
                        React.createElement('div', { className: 'w-10 h-10 rounded-full bg-white/20 flex items-center justify-center' }, React.createElement(FaPlus)),
                        React.createElement('div', null,
                            React.createElement('h3', { className: 'text-xl font-bold' }, 'Thêm ghế mới'),
                            React.createElement('p', { className: 'text-green-100 text-sm mt-1' }, 'Tạo ghế mới cho máy bay')
                        )
                    )
                ),
                React.createElement('form', { onSubmit: handleSubmit, className: 'p-6 space-y-4' },
                    React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
                        React.createElement('div', null,
                            React.createElement('label', { className: 'block text-sm font-bold text-gray-700 mb-2' }, 'Số ghế (Tự động)'),
                            React.createElement('input', { type: 'text', value: formData.soGhe, readOnly: true, className: 'w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed', placeholder: 'Sẽ tự động tạo' })
                        ),
                        React.createElement('div', null,
                            React.createElement('label', { className: 'block text-sm font-bold text-gray-700 mb-2' }, 'Hạng vé ', React.createElement('span', { className: 'text-red-500' }, '*')),
                            loadingHangVe
                                ? React.createElement('div', { className: 'w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm' }, 'Đang tải danh sách hạng vé...')
                                : React.createElement(React.Fragment, null,
                                    React.createElement('select', { value: formData.maHangVe, onChange: (e) => setFormData({ ...formData, maHangVe: parseInt(e.target.value) }), className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500', required: true },
                                        React.createElement('option', { value: '' }, 'Chọn hạng vé'),
                                        ...hangVeList.map(hv => React.createElement('option', { key: hv.maHangVe, value: hv.maHangVe }, hv.tenHangVe))
                                    ),
                                    React.createElement('p', { className: 'text-xs text-gray-500 mt-1' }, 'Hạng vé chưa có ghế sẽ được tự động tạo ghế đầu tiên')
                                )
                        )
                    ),
                    React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
                        React.createElement('div', null,
                            React.createElement('label', { className: 'block text-sm font-bold text-gray-700 mb-2' }, 'Hàng ', React.createElement('span', { className: 'text-red-500' }, '*')),
                            React.createElement('input', { type: 'number', value: formData.hang, onChange: (e) => setFormData({ ...formData, hang: parseInt(e.target.value) }), className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500', min: '1', required: true })
                        ),
                        React.createElement('div', null,
                            React.createElement('label', { className: 'block text-sm font-bold text-gray-700 mb-2' }, 'Cột ', React.createElement('span', { className: 'text-red-500' }, '*')),
                            React.createElement('input', { type: 'text', value: formData.cot, onChange: (e) => setFormData({ ...formData, cot: e.target.value.toUpperCase() }), className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500', placeholder: 'A', maxLength: '2', required: true })
                        )
                    ),
                    React.createElement('div', null,
                        React.createElement('label', { className: 'block text-sm font-bold text-gray-700 mb-2' }, 'Vị trí ghế ', React.createElement('span', { className: 'text-red-500' }, '*')),
                        React.createElement('div', { className: 'grid grid-cols-3 gap-2' },
                            ...positionButtons.map(pos =>
                                React.createElement('button', {
                                    key: pos.value,
                                    type: 'button',
                                    onClick: () => setFormData({ ...formData, viTriGhe: pos.value }),
                                    className: 'px-4 py-2 rounded-lg font-medium transition-colors ' + (formData.viTriGhe === pos.value ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                                }, React.createElement(FaPlus), ' ', pos.label)
                            )
                        )
                    ),
                    aircraft && React.createElement('div', {
                        className: 'p-4 rounded-lg border-l-4 ' + (canAddSeat ? 'bg-blue-50 border-blue-300' : 'bg-red-50 border-red-300')
                    },
                        React.createElement('h4', {
                            className: 'font-bold mb-2 ' + (canAddSeat ? 'text-blue-800' : 'text-red-800')
                        }, canAddSeat ? 'Thông tin sức chứa ghế' : 'Đạt giới hạn số ghế'),
                        React.createElement('div', { className: 'grid grid-cols-3 gap-3 text-sm' },
                            React.createElement('div', null,
                                React.createElement('span', { className: 'text-gray-600' }, 'Đã tạo:'),
                                React.createElement('span', { className: 'font-bold text-gray-900' }, currentSeatsCount)
                            ),
                            React.createElement('div', null,
                                React.createElement('span', { className: 'text-gray-600' }, 'Tối đa:'),
                                React.createElement('span', { className: 'font-bold text-gray-900' }, maxSeats)
                            ),
                            React.createElement('div', null,
                                React.createElement('span', { className: 'text-gray-600' }, 'Còn lại:'),
                                React.createElement('span', { className: 'font-bold ' + (canAddSeat ? 'text-green-700' : 'text-red-700') }, availableSeats)
                            )
                        ),
                        !canAddSeat && React.createElement('p', { className: 'text-xs text-red-700 mt-2' }, 'Máy bay đã đạt giới hạn số ghế tối đa. Không thể thêm ghế mới.')
                    ),
                    React.createElement('div', { className: 'bg-green-50 p-4 rounded-lg border border-green-200' },
                        React.createElement('p', { className: 'text-sm text-green-800' }, 'Mẹo: Số ghế được tự động tạo theo định dạng "Hàng + Cột" (ví dụ: 1A, 2B)')
                    ),
                    React.createElement('div', { className: 'flex gap-3 pt-4' },
                        React.createElement('button', { type: 'button', onClick: onClose, className: 'flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium' }, 'Hủy'),
                        React.createElement('button', {
                            type: 'submit',
                            disabled: !canAddSeat,
                            className: 'flex-1 px-6 py-2 rounded-lg font-medium transition-colors ' + (canAddSeat ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-400 text-gray-500 cursor-not-allowed')
                        }, React.createElement(FaPlus, { className: 'inline mr-2' }), ' Thêm ghế')
                    )
                )
            )
        )
    );
};

export default AddSeatModal;
