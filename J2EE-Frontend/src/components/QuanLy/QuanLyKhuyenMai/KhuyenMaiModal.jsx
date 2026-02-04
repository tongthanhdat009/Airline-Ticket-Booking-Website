import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { createPromotion, updatePromotion } from '../../../services/PromotionService';

/**
 * KhuyenMaiModal Component
 * Modal thêm/sửa khuyến mãi
 *
 * @param {boolean} isOpen - Hiển thị/ẩn modal
 * @param {function} onClose - Callback khi đóng modal
 * @param {function} onSave - Callback khi lưu thành công
 * @param {object} promotion - Dữ liệu khuyến mãi (null khi thêm mới)
 * @param {function} showToast - Hàm hiển thị toast notification
 */
const KhuyenMaiModal = ({ isOpen, onClose, onSave, promotion, showToast }) => {
    const [formData, setFormData] = useState({
        maKM: '',
        tenKhuyenMai: '',
        moTa: '',
        loaiKhuyenMai: 'PERCENT',
        giaTriGiam: '',
        giaTriToiThieu: '',
        giaTriToiDa: '',
        soLuong: '',
        ngayBatDau: '',
        ngayKetThuc: '',
        trangThai: 'ACTIVE'
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helper function để format ngày cho input datetime-local
    const formatDateTimeForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        // Format: YYYY-MM-DDTHH:mm (đúng format cho input datetime-local)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Helper function để format ngày cho API (ISO 8601)
    const formatDateTimeForAPI = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toISOString();
    };

    useEffect(() => {
        if (isOpen && promotion) {
            setFormData({
                maKM: promotion.maKM || '',
                tenKhuyenMai: promotion.tenKhuyenMai || '',
                moTa: promotion.moTa || '',
                loaiKhuyenMai: promotion.loaiKhuyenMai || 'PERCENT',
                giaTriGiam: promotion.giaTriGiam || '',
                giaTriToiThieu: promotion.giaTriToiThieu || '',
                giaTriToiDa: promotion.giaTriToiDa || '',
                soLuong: promotion.soLuong || '',
                ngayBatDau: formatDateTimeForInput(promotion.ngayBatDau),
                ngayKetThuc: formatDateTimeForInput(promotion.ngayKetThuc),
                trangThai: promotion.trangThai || 'ACTIVE'
            });
        } else if (isOpen) {
            setFormData({
                maKM: '',
                tenKhuyenMai: '',
                moTa: '',
                loaiKhuyenMai: 'PERCENT',
                giaTriGiam: '',
                giaTriToiThieu: '',
                giaTriToiDa: '',
                soLuong: '',
                ngayBatDau: '',
                ngayKetThuc: '',
                trangThai: 'ACTIVE'
            });
        }
        setErrors({});
    }, [isOpen, promotion]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.maKM.trim()) newErrors.maKM = 'Mã khuyến mãi không được để trống';
        if (!formData.tenKhuyenMai.trim()) newErrors.tenKhuyenMai = 'Tên khuyến mãi không được để trống';

        // Validate giá trị giảm theo loại khuyến mãi
        if (!formData.giaTriGiam || parseFloat(formData.giaTriGiam) <= 0) {
            newErrors.giaTriGiam = 'Giá trị giảm phải lớn hơn 0';
        } else if (formData.loaiKhuyenMai === 'PERCENT') {
            const giaTri = parseFloat(formData.giaTriGiam);
            if (giaTri > 100) {
                newErrors.giaTriGiam = 'Phần trăm giảm không được vượt quá 100%';
            }
        }

        if (formData.giaTriToiThieu && parseFloat(formData.giaTriToiThieu) < 0) {
            newErrors.giaTriToiThieu = 'Giá trị tối thiểu không được âm';
        }
        if (formData.giaTriToiDa && parseFloat(formData.giaTriToiDa) < 0) {
            newErrors.giaTriToiDa = 'Giá trị tối đa không được âm';
        }
        if (!formData.ngayBatDau) newErrors.ngayBatDau = 'Ngày bắt đầu không được để trống';
        if (!formData.ngayKetThuc) newErrors.ngayKetThuc = 'Ngày kết thúc không được để trống';
        if (formData.ngayBatDau && formData.ngayKetThuc && formData.ngayKetThuc <= formData.ngayBatDau) {
            newErrors.ngayKetThuc = 'Ngày kết thúc phải sau ngày bắt đầu';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showToast('Vui lòng kiểm tra lại các lỗi', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                giaTriGiam: parseFloat(formData.giaTriGiam),
                giaTriToiThieu: formData.giaTriToiThieu ? parseFloat(formData.giaTriToiThieu) : null,
                giaTriToiDa: formData.giaTriToiDa ? parseFloat(formData.giaTriToiDa) : null,
                soLuong: formData.soLuong ? parseInt(formData.soLuong) : null,
                ngayBatDau: formatDateTimeForAPI(formData.ngayBatDau),
                ngayKetThuc: formatDateTimeForAPI(formData.ngayKetThuc)
            };

            if (promotion) {
                await updatePromotion(promotion.maKhuyenMai, payload);
                showToast('Cập nhật khuyến mãi thành công');
            } else {
                await createPromotion(payload);
                showToast('Tạo khuyến mãi thành công');
            }
            onSave();
        } catch (error) {
            console.error('Lỗi khi lưu khuyến mãi:', error);
            showToast(error.response?.data?.message || 'Không thể lưu khuyến mãi', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Early return phải ở sau tất cả hooks
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="bg-linear-to-r from-pink-600 to-rose-600 text-white p-6 rounded-t-xl sticky top-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">{promotion ? 'Cập nhật khuyến mãi' : 'Thêm khuyến mãi mới'}</h2>
                        <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                            <FaTimes size={24} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Mã khuyến mãi <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="maKM"
                                value={formData.maKM}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm ${
                                    errors.maKM ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="VD: SUMMER20"
                                disabled={!!promotion}
                                required
                            />
                            {errors.maKM && <p className="text-red-500 text-xs mt-1">{errors.maKM}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Tên khuyến mãi <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="tenKhuyenMai"
                                value={formData.tenKhuyenMai}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm ${
                                    errors.tenKhuyenMai ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            />
                            {errors.tenKhuyenMai && <p className="text-red-500 text-xs mt-1">{errors.tenKhuyenMai}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Mô tả
                            </label>
                            <textarea
                                name="moTa"
                                value={formData.moTa}
                                onChange={handleChange}
                                rows="2"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm"
                                placeholder="Mô tả về khuyến mãi..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Loại khuyến mãi <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="loaiKhuyenMai"
                                value={formData.loaiKhuyenMai}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm"
                                required
                            >
                                <option value="PERCENT">Phần trăm (%)</option>
                                <option value="FIXED">Số tiền cố định (VNĐ)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Giá trị giảm <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="giaTriGiam"
                                value={formData.giaTriGiam}
                                onChange={handleChange}
                                step="0.01"
                                min="0.01"
                                max={formData.loaiKhuyenMai === 'PERCENT' ? '100' : undefined}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm ${
                                    errors.giaTriGiam ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder={formData.loaiKhuyenMai === 'PERCENT' ? 'VD: 20' : 'VD: 500000'}
                                required
                            />
                            {errors.giaTriGiam && <p className="text-red-500 text-xs mt-1">{errors.giaTriGiam}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Giá trị đơn hàng tối thiểu
                            </label>
                            <input
                                type="number"
                                name="giaTriToiThieu"
                                value={formData.giaTriToiThieu}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm ${
                                    errors.giaTriToiThieu ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="VD: 2000000"
                            />
                            {errors.giaTriToiThieu && <p className="text-red-500 text-xs mt-1">{errors.giaTriToiThieu}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Giá trị giảm tối đa
                            </label>
                            <input
                                type="number"
                                name="giaTriToiDa"
                                value={formData.giaTriToiDa}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm ${
                                    errors.giaTriToiDa ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="VD: 1000000"
                            />
                            {errors.giaTriToiDa && <p className="text-red-500 text-xs mt-1">{errors.giaTriToiDa}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Số lượng mã
                            </label>
                            <input
                                type="number"
                                name="soLuong"
                                value={formData.soLuong}
                                onChange={handleChange}
                                min="1"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm"
                                placeholder="Để trống nếu không giới hạn"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Ngày bắt đầu <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                name="ngayBatDau"
                                value={formData.ngayBatDau}
                                onChange={handleChange}
                                min={promotion ? undefined : new Date().toISOString().slice(0, 16)}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm ${
                                    errors.ngayBatDau ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            />
                            {errors.ngayBatDau && <p className="text-red-500 text-xs mt-1">{errors.ngayBatDau}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Ngày kết thúc <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                name="ngayKetThuc"
                                value={formData.ngayKetThuc}
                                onChange={handleChange}
                                min={formData.ngayBatDau || new Date().toISOString().slice(0, 16)}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm ${
                                    errors.ngayKetThuc ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            />
                            {errors.ngayKetThuc && <p className="text-red-500 text-xs mt-1">{errors.ngayKetThuc}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Trạng thái
                            </label>
                            <select
                                name="trangThai"
                                value={formData.trangThai}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm"
                                disabled={!!promotion && promotion.trangThai !== 'INACTIVE'}
                            >
                                <option value="ACTIVE">Hoạt động</option>
                                <option value="INACTIVE">Vô hiệu</option>
                            </select>
                            {promotion && promotion.trangThai !== 'INACTIVE' && (
                                <p className="text-yellow-600 text-xs mt-1">⚠️ Chỉ có thể thay đổi trạng thái khi INACTIVE</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-linear-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 font-semibold transition-all shadow-lg disabled:opacity-50"
                        >
                            {isSubmitting ? 'Đang lưu...' : (promotion ? 'Cập nhật' : 'Thêm mới')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default KhuyenMaiModal;
