import React, { useState, useEffect } from 'react';
import { FaTicketAlt } from 'react-icons/fa';
import { message } from 'antd';


/**
 * Modal Component để thêm/cập nhật hạng vé
 * @param {boolean} isOpen - Trạng thái mở/đóng modal
 * @param {function} onClose - Callback khi đóng modal
 * @param {function} onSave - Callback khi lưu dữ liệu
 * @param {boolean} isEditMode - Chế độ sửa (true) hoặc thêm (false)
 * @param {object} hangVe - Dữ liệu hạng vé (chỉ dùng ở chế độ sửa)
 */
const HangVeModal = ({ isOpen, onClose, onSave, isEditMode, hangVe }) => {
    const [formData, setFormData] = useState({
        tenHangVe: ''
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Reset form khi modal mở/đóng
    useEffect(() => {
        if (isOpen) {
            if (isEditMode && hangVe) {
                setFormData({
                    tenHangVe: hangVe.tenHangVe || ''
                });
            } else {
                setFormData({ tenHangVe: '' });
            }
            setErrors({});
        }
    }, [isOpen, isEditMode, hangVe]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.tenHangVe || formData.tenHangVe.trim() === '') {
            newErrors.tenHangVe = 'Tên hạng vé không được để trống';
        } else if (formData.tenHangVe.length < 2) {
            newErrors.tenHangVe = 'Tên hạng vé phải có ít nhất 2 ký tự';
        } else if (formData.tenHangVe.length > 255) {
            newErrors.tenHangVe = 'Tên hạng vé không được quá 255 ký tự';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            message.warning({
                content: 'Vui lòng kiểm tra lại thông tin!',
                duration: 3,
            });
            return;
        }

        try {
            setSubmitting(true);
            await onSave(formData);
            // Success message is handled in parent component
        } catch {
            // Error is handled in parent component
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (!submitting) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={handleCancel}
            ></div>

            {/* Modal - Full screen on mobile, centered modal on desktop */}
            <div className="relative z-10 h-full w-full md:h-auto md:max-w-lg md:mx-auto md:my-8 md:rounded-xl bg-white md:shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="[background:linear-gradient(to_right,rgb(147,51,234),rgb(126,34,206))] text-white px-4 md:px-6 py-3 md:py-4 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                            <FaTicketAlt className="text-white text-lg md:text-xl" />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold truncate">
                            {isEditMode ? 'Cập nhật hạng vé' : 'Thêm hạng vé mới'}
                        </h3>
                    </div>
                    <button
                        onClick={handleCancel}
                        disabled={submitting}
                        className="text-white hover:text-gray-200 transition-colors p-1 hover:bg-white/10 rounded-lg ml-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form wraps content and footer */}
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto bg-white p-4 md:p-6 space-y-4 md:space-y-5">
                        {/* Tên hạng vé */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Tên hạng vé <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="tenHangVe"
                                placeholder="Nhập tên hạng vé (VD: Economy, Business, First Class)"
                                value={formData.tenHangVe}
                                onChange={handleChange}
                                disabled={submitting}
                                className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all ${
                                    errors.tenHangVe ? 'border-red-500' : 'border-gray-300'
                                } ${submitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                required
                            />
                            {errors.tenHangVe && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span className="break-words">{errors.tenHangVe}</span>
                                </p>
                            )}
                        </div>

                        {/* Hướng dẫn */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
                            <p className="text-sm text-blue-800 font-semibold">
                                Thông tin:
                            </p>
                            <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                                <li>Tên hạng vé phải từ 2 đến 255 ký tự</li>
                                <li>Tên hạng vé không được trùng với các hạng vé đã tồn tại</li>
                                <li>Ví dụ: Economy, Business, First Class, Premium Economy</li>
                            </ul>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 md:p-6 border-t border-gray-200 bg-gray-50 shrink-0">
                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={submitting}
                                className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Đang lưu...</span>
                                    </>
                                ) : (
                                    <span>{isEditMode ? 'Cập nhật' : 'Thêm mới'}</span>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HangVeModal;
