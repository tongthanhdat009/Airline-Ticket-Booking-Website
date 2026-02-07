import React, { useState, useEffect } from 'react';
import { updateKhachHangPartial } from '../../../services/QLKhachHangService';

const ThongTinKhachHang = ({ customer, onUpdate, initialEditMode = false }) => {
    const [isEditing, setIsEditing] = useState(initialEditMode);
    const [formData, setFormData] = useState({
        hoVaTen: '',
        ngaySinh: '',
        gioiTinh: '',
        diaChi: '',
        soDienThoai: '',
        quocGia: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (customer) {
            // Format ngaySinh to YYYY-MM-DD for date input
            const ngaySinhFormatted = customer.ngaySinh
                ? new Date(customer.ngaySinh).toISOString().split('T')[0]
                : '';

            setFormData({
                hoVaTen: customer.hoVaTen || '',
                ngaySinh: ngaySinhFormatted,
                gioiTinh: customer.gioiTinh || '',
                diaChi: customer.diaChi || '',
                soDienThoai: customer.soDienThoai || '',
                quocGia: customer.quocGia || ''
            });
        }
    }, [customer]);

    // Update isEditing when initialEditMode changes
    useEffect(() => {
        setIsEditing(initialEditMode);
    }, [initialEditMode]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.hoVaTen || formData.hoVaTen.trim().length < 2) {
            newErrors.hoVaTen = 'Họ và tên phải từ 2 ký tự trở lên';
        }
        if (formData.hoVaTen && formData.hoVaTen.length > 100) {
            newErrors.hoVaTen = 'Họ và tên không được vượt quá 100 ký tự';
        }

        // Validate ngày sinh - phải là ngày trong quá khứ
        if (formData.ngaySinh) {
            const birthDate = new Date(formData.ngaySinh);
            const today = new Date();
            const minDate = new Date();
            minDate.setFullYear(today.getFullYear() - 100); // Max 100 years old

            if (birthDate > today) {
                newErrors.ngaySinh = 'Ngày sinh không được lớn hơn ngày hiện tại';
            } else if (birthDate < minDate) {
                newErrors.ngaySinh = 'Ngày sinh không hợp lệ';
            }
        }

        // Validate giới tính
        if (formData.gioiTinh && !['Nam', 'Nữ', 'Khác'].includes(formData.gioiTinh)) {
            newErrors.gioiTinh = 'Giới tính phải là Nam, Nữ hoặc Khác';
        }

        // Validate số điện thoại
        if (formData.soDienThoai && !/^[0-9]{10,11}$/.test(formData.soDienThoai)) {
            newErrors.soDienThoai = 'Số điện thoại phải có 10-11 chữ số';
        }

        // Validate địa chỉ
        if (formData.diaChi && formData.diaChi.length > 255) {
            newErrors.diaChi = 'Địa chỉ không được vượt quá 255 ký tự';
        }

        // Validate quốc gia
        if (formData.quocGia && formData.quocGia.length > 100) {
            newErrors.quocGia = 'Quốc gia không được vượt quá 100 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setErrors({});
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset form to original customer data
        const ngaySinhFormatted = customer.ngaySinh
            ? new Date(customer.ngaySinh).toISOString().split('T')[0]
            : '';
        setFormData({
            hoVaTen: customer.hoVaTen || '',
            ngaySinh: ngaySinhFormatted,
            gioiTinh: customer.gioiTinh || '',
            diaChi: customer.diaChi || '',
            soDienThoai: customer.soDienThoai || '',
            quocGia: customer.quocGia || ''
        });
        setErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await updateKhachHangPartial(customer.maHanhKhach, formData);
            setIsEditing(false);
            if (onUpdate) {
                onUpdate();
            }
        } catch (error) {
            console.error('Error updating customer:', error);
            // Show error from API
            if (error.response && error.response.data && error.response.data.message) {
                alert(error.response.data.message);
            } else {
                alert('Có lỗi xảy ra khi cập nhật thông tin khách hàng.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    // Read-only fields
    const readonlyFields = [
        { label: 'Mã khách hàng', value: `#${customer.maHanhKhach}` },
        { label: 'Email', value: customer.email || '-' },
        { label: 'Mã định danh', value: customer.maDinhDanh || '-' }
    ];

    // Editable fields
    const editableFields = [
        { label: 'Họ và tên', name: 'hoVaTen', type: 'text', required: true },
        { label: 'Ngày sinh', name: 'ngaySinh', type: 'date' },
        { label: 'Giới tính', name: 'gioiTinh', type: 'select', options: ['Nam', 'Nữ', 'Khác'] },
        { label: 'Số điện thoại', name: 'soDienThoai', type: 'tel' },
        { label: 'Địa chỉ', name: 'diaChi', type: 'textarea', rows: 3 },
        { label: 'Quốc gia', name: 'quocGia', type: 'text' }
    ];

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Thông tin cá nhân
                </h3>
                {!isEditing && (
                    <button
                        onClick={handleEdit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Chỉnh sửa
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Readonly fields */}
                    {readonlyFields.map((field) => (
                        <div key={field.label} className="bg-gray-50 rounded-lg p-3">
                            <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
                            <p className="text-sm text-gray-900 font-medium">{field.value}</p>
                        </div>
                    ))}

                    {/* Editable fields */}
                    {editableFields.map((field) => (
                        <div key={field.name} className={`${field.name === 'diaChi' ? 'md:col-span-2' : ''}`}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {isEditing ? (
                                field.type === 'select' ? (
                                    <select
                                        name={field.name}
                                        value={formData[field.name]}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors[field.name] ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="">Chọn giới tính</option>
                                        {field.options.map((opt) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                ) : field.type === 'textarea' ? (
                                    <textarea
                                        name={field.name}
                                        value={formData[field.name]}
                                        onChange={handleInputChange}
                                        rows={field.rows}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors[field.name] ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                ) : (
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        value={formData[field.name]}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors[field.name] ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                )
                            ) : (
                                <div className="bg-gray-50 rounded-lg p-3 min-h-[42px] flex items-center">
                                    <p className="text-sm text-gray-900">
                                        {field.type === 'date' && formData[field.name]
                                            ? formatDate(formData[field.name])
                                            : (formData[field.name] || '-')}
                                    </p>
                                </div>
                            )}
                            {errors[field.name] && (
                                <p className="text-xs text-red-500 mt-1">{errors[field.name]}</p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Action buttons when editing */}
                {isEditing && (
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Lưu
                                </>
                            )}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default ThongTinKhachHang;
