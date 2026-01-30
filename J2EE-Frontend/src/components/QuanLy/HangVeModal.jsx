import React, { useState, useEffect } from 'react';
import { FaTicketAlt } from 'react-icons/fa';
import { Modal, message } from 'antd';


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

    if (!isOpen) return null;

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

    return (
        <Modal
            title={
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <FaTicketAlt className="text-purple-600 text-xl" />
                    </div>
                    <span className="text-xl font-bold">
                        {isEditMode ? 'Cập nhật hạng vé' : 'Thêm hạng vé mới'}
                    </span>
                </div>
            }
            open={isOpen}
            onCancel={handleCancel}
            footer={null}
            centered
            width={500}
            closable={!submitting}
            maskClosable={!submitting}
        >
            <form onSubmit={handleSubmit} className="py-4">
                <div className="space-y-5">
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
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all ${
                                errors.tenHangVe ? 'border-red-500' : 'border-gray-300'
                            } ${submitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            required
                        />
                        {errors.tenHangVe && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {errors.tenHangVe}
                            </p>
                        )}
                    </div>

                    {/* Hướng dẫn */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Thông tin:</strong>
                        </p>
                        <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                            <li>Tên hạng vé phải từ 2 đến 255 ký tự</li>
                            <li>Tên hạng vé không được trùng với các hạng vé đã tồn tại</li>
                            <li>Ví dụ: Economy, Business, First Class, Premium Economy</li>
                        </ul>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={submitting}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-3 bg-linear-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Đang lưu...</span>
                            </>
                        ) : (
                            <>
                                <span>{isEditMode ? 'Cập nhật' : 'Thêm mới'}</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default HangVeModal;
