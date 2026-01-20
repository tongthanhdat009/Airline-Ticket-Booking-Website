import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const MayBayModal = ({ isOpen, onClose, onSave, aircraft }) => {
    const [formData, setFormData] = useState({
        tenMayBay: '',
        loaiMayBay: 'Commercial',
        hangMayBay: '',
        namKhaiThac: '',
        tongSoGhe: '',
        trangThai: 'Active',
        soHieu: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen && aircraft) {
            setFormData({
                tenMayBay: aircraft.tenMayBay || '',
                loaiMayBay: aircraft.loaiMayBay || 'Commercial',
                hangMayBay: aircraft.hangMayBay || '',
                namKhaiThac: aircraft.namKhaiThac || '',
                tongSoGhe: aircraft.tongSoGhe || '',
                trangThai: aircraft.trangThai || 'Active',
                soHieu: aircraft.soHieu || ''
            });
        } else if (isOpen) {
            setFormData({
                tenMayBay: '',
                loaiMayBay: 'Commercial',
                hangMayBay: '',
                namKhaiThac: '',
                tongSoGhe: '',
                trangThai: 'Active',
                soHieu: ''
            });
        }
        setErrors({});
    }, [isOpen, aircraft]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.tenMayBay?.trim()) newErrors.tenMayBay = 'Tên máy bay là bắt buộc';
        if (!formData.hangMayBay?.trim()) newErrors.hangMayBay = 'Hãng máy bay là bắt buộc';
        if (!formData.loaiMayBay?.trim()) newErrors.loaiMayBay = 'Loại máy bay là bắt buộc';
        if (!formData.soHieu?.trim()) {
            newErrors.soHieu = 'Số hiệu là bắt buộc';
        } else if (!/^[A-Z0-9-]+$/.test(formData.soHieu)) {
            newErrors.soHieu = 'Số hiệu chỉ được chứa chữ hoa, số và dấu gạch ngang';
        }
        if (!formData.tongSoGhe || formData.tongSoGhe <= 0) {
            newErrors.tongSoGhe = 'Tổng số ghế phải lớn hơn 0';
        }
        if (formData.namKhaiThac && formData.namKhaiThac < 1900) {
            newErrors.namKhaiThac = 'Năm khai thác phải từ năm 1900';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const submitData = {
                ...formData,
                tongSoGhe: parseInt(formData.tongSoGhe),
                namKhaiThac: formData.namKhaiThac ? parseInt(formData.namKhaiThac) : null
            };
            onSave(submitData);
        }
    };

    return (
        <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-sky-600 to-blue-700 text-white p-6 rounded-t-xl sticky top-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">{aircraft ? 'Cập nhật máy bay' : 'Thêm máy bay mới'}</h2>
                        <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                            <FaTimes size={24} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Tên máy bay <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="tenMayBay"
                                value={formData.tenMayBay}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm ${
                                    errors.tenMayBay ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="VD: Boeing 787-9 Dreamliner"
                                required
                            />
                            {errors.tenMayBay && <p className="text-red-500 text-xs mt-1">{errors.tenMayBay}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Hãng máy bay <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="hangMayBay"
                                value={formData.hangMayBay}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm ${
                                    errors.hangMayBay ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            >
                                <option value="">Chọn hãng</option>
                                <option value="Boeing">Boeing</option>
                                <option value="Airbus">Airbus</option>
                                <option value="Embraer">Embraer</option>
                                <option value="Bombardier">Bombardier</option>
                            </select>
                            {errors.hangMayBay && <p className="text-red-500 text-xs mt-1">{errors.hangMayBay}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Loại máy bay <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="loaiMayBay"
                                value={formData.loaiMayBay}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm ${
                                    errors.loaiMayBay ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            >
                                <option value="Commercial">Commercial</option>
                                <option value="Private">Private</option>
                                <option value="Cargo">Cargo</option>
                            </select>
                            {errors.loaiMayBay && <p className="text-red-500 text-xs mt-1">{errors.loaiMayBay}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Số hiệu <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="soHieu"
                                value={formData.soHieu}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm ${
                                    errors.soHieu ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="VD: VN-A12345"
                                required
                            />
                            {errors.soHieu && <p className="text-red-500 text-xs mt-1">{errors.soHieu}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Tổng số ghế <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="tongSoGhe"
                                value={formData.tongSoGhe}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm ${
                                    errors.tongSoGhe ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="VD: 180"
                                min="1"
                                required
                            />
                            {errors.tongSoGhe && <p className="text-red-500 text-xs mt-1">{errors.tongSoGhe}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Năm khai thác
                            </label>
                            <input
                                type="number"
                                name="namKhaiThac"
                                value={formData.namKhaiThac}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm ${
                                    errors.namKhaiThac ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="VD: 2020"
                                min="1900"
                            />
                            {errors.namKhaiThac && <p className="text-red-500 text-xs mt-1">{errors.namKhaiThac}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Trạng thái
                            </label>
                            <select
                                name="trangThai"
                                value={formData.trangThai}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                            >
                                <option value="Active">Active (Hoạt động)</option>
                                <option value="Inactive">Inactive (Vô hiệu)</option>
                                <option value="Maintenance">Maintenance (Bảo trì)</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.trangThai === 'Active' ? 'Máy bay đang hoạt động bình thường' :
                                 formData.trangThai === 'Inactive' ? 'Máy bay không hoạt động - có thể chỉnh sửa sơ đồ ghế' :
                                 'Máy bay đang bảo trì - có thể chỉnh sửa sơ đồ ghế'}
                            </p>
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
                            className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 font-semibold transition-all shadow-lg"
                        >
                            {aircraft ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MayBayModal;
