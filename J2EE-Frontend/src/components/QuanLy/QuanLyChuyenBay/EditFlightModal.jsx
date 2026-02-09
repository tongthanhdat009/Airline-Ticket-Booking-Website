import React, { useState, useEffect } from 'react';
import { FaConciergeBell } from 'react-icons/fa';

const EditFlightModal = ({ isOpen, onClose, onSubmit, formData, onFormChange, routes, getRouteInfo, currentFlight, services = [], selectedServices = [], onServiceChange, aircraft = [] }) => {
    const [loaiChuyenBay, setLoaiChuyenBay] = useState('1-chieu'); // '1-chieu' hoặc 'khu-hoi'
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen && !currentFlight) {
            setLoaiChuyenBay('1-chieu');
            setErrors({});
        }
    }, [isOpen, currentFlight]);

    const validateForm = () => {
        const newErrors = {};

        // Validate ngày đi không được trong quá khứ
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const ngayDi = new Date(formData.ngayDi);
        if (ngayDi < today) {
            newErrors.ngayDi = 'Ngày đi không được trong quá khứ';
        }

        // Validate ngày đến phải sau ngày đi
        const ngayDen = new Date(formData.ngayDen);
        if (ngayDen < ngayDi) {
            newErrors.ngayDen = 'Ngày đến phải sau ngày đi';
        }

        // Validate giờ đến phải sau giờ đi nếu cùng ngày
        if (formData.ngayDi === formData.ngayDen) {
            if (formData.gioDi && formData.gioDen && formData.gioDi >= formData.gioDen) {
                newErrors.gioDen = 'Giờ đến phải sau giờ đi';
            }
        }

        // Nếu là khứ hồi, validate chuyến bay về
        if (loaiChuyenBay === 'khu-hoi') {
            if (!formData.ngayDiVe) {
                newErrors.ngayDiVe = 'Vui lòng chọn ngày đi về';
            } else {
                const ngayDiVe = new Date(formData.ngayDiVe);
                if (ngayDiVe <= ngayDen) {
                    newErrors.ngayDiVe = 'Ngày đi về phải sau ngày đến chuyến đi';
                }
            }

            if (!formData.gioDiVe) {
                newErrors.gioDiVe = 'Vui lòng chọn giờ đi về';
            }

            if (!formData.ngayDenVe) {
                newErrors.ngayDenVe = 'Vui lòng chọn ngày đến về';
            } else {
                const ngayDenVe = new Date(formData.ngayDenVe);
                const ngayDiVe = new Date(formData.ngayDiVe);
                if (ngayDenVe < ngayDiVe) {
                    newErrors.ngayDenVe = 'Ngày đến về phải sau ngày đi về';
                }
            }

            if (!formData.gioDenVe) {
                newErrors.gioDenVe = 'Vui lòng chọn giờ đến về';
            }

            // Validate giờ đến về phải sau giờ đi về nếu cùng ngày
            if (formData.ngayDiVe === formData.ngayDenVe) {
                if (formData.gioDiVe && formData.gioDenVe && formData.gioDiVe >= formData.gioDenVe) {
                    newErrors.gioDenVe = 'Giờ đến về phải sau giờ đi về';
                }
            }

            if (!formData.soHieuChuyenBayVe) {
                newErrors.soHieuChuyenBayVe = 'Vui lòng nhập số hiệu chuyến bay về';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(e, loaiChuyenBay);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

            {/* Modal - Full screen on mobile, centered modal on desktop */}
            <div className="relative z-10 h-full w-full md:h-[90vh] md:max-w-3xl md:mx-auto md:my-8 md:rounded-xl bg-white md:shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="[background:linear-gradient(to_right,rgb(37,99,235),rgb(29,78,216))] text-white px-4 md:px-6 py-3 md:py-4 flex justify-between items-center shrink-0">
                    <h2 className="text-lg md:text-2xl font-bold">{currentFlight ? 'Chỉnh sửa chuyến bay' : 'Thêm chuyến bay mới'}</h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 transition-colors p-1 hover:bg-white/10 rounded-lg shrink-0"
                    >
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Main Content - Scrollable area */}
                <div className="flex-1 overflow-y-auto">
                    <form onSubmit={handleFormSubmit} className="p-4 md:p-6">
                    {/* Loại chuyến bay - chỉ hiển thị khi thêm mới */}
                    {!currentFlight && (
                        <div className="mb-4 md:mb-6 p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <label className="block text-sm md:text-base font-bold text-gray-700 mb-2 md:mb-3">Loại chuyến bay</label>
                            <div className="flex gap-3 md:gap-4">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="loaiChuyenBay"
                                        value="1-chieu"
                                        checked={loaiChuyenBay === '1-chieu'}
                                        onChange={(e) => setLoaiChuyenBay(e.target.value)}
                                        className="mr-2 w-4 h-4"
                                    />
                                    <span className="text-xs md:text-sm font-medium text-gray-700">Một chiều</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="loaiChuyenBay"
                                        value="khu-hoi"
                                        checked={loaiChuyenBay === 'khu-hoi'}
                                        onChange={(e) => setLoaiChuyenBay(e.target.value)}
                                        className="mr-2 w-4 h-4"
                                    />
                                    <span className="text-xs md:text-sm font-medium text-gray-700">Khứ hồi</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Chuyến bay đi */}
                    <div className="mb-4 md:mb-6">
                        <h3 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 pb-2 border-b border-gray-200">
                            {loaiChuyenBay === 'khu-hoi' ? 'Chuyến bay đi' : 'Thông tin chuyến bay'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                            <div>
                                <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1 md:mb-2">Tuyến bay</label>
                                <select 
                                name="maTuyenBay" 
                                value={formData.maTuyenBay} 
                                onChange={onFormChange} 
                                className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                required
                            >
                                <option value="" disabled>-- Chọn tuyến bay --</option>
                                {routes.map(r => <option key={r.maTuyenBay} value={r.maTuyenBay}>{getRouteInfo(r)}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Số hiệu chuyến bay</label>
                            <input
                                type="text"
                                name="soHieuChuyenBay"
                                value={formData.soHieuChuyenBay}
                                onChange={onFormChange}
                                className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                placeholder="VD: VN214"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Máy bay</label>
                            <select
                                name="maMayBay"
                                value={formData.maMayBay || ''}
                                onChange={onFormChange}
                                className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="" disabled>-- Chọn máy bay --</option>
                                {aircraft.map(mb => (
                                    <option key={mb.maMayBay} value={mb.maMayBay}>
                                        {mb.tenMayBay} - {mb.sohieu} ({mb.tongSoGhe} ghế)
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Ngày đi</label>
                            <input 
                                type="date" 
                                name="ngayDi" 
                                value={formData.ngayDi} 
                                onChange={onFormChange} 
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.ngayDi ? 'border-red-500' : 'border-gray-300'}`}
                                required 
                            />
                            {errors.ngayDi && <p className="text-red-500 text-xs mt-1">{errors.ngayDi}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Giờ đi</label>
                            <input 
                                type="time" 
                                name="gioDi" 
                                value={formData.gioDi} 
                                onChange={onFormChange} 
                                className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Ngày đến</label>
                            <input 
                                type="date" 
                                name="ngayDen" 
                                value={formData.ngayDen} 
                                onChange={onFormChange} 
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.ngayDen ? 'border-red-500' : 'border-gray-300'}`}
                                required 
                            />
                            {errors.ngayDen && <p className="text-red-500 text-xs mt-1">{errors.ngayDen}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Giờ đến</label>
                            <input 
                                type="time" 
                                name="gioDen" 
                                value={formData.gioDen} 
                                onChange={onFormChange} 
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.gioDen ? 'border-red-500' : 'border-gray-300'}`}
                                required 
                            />
                            {errors.gioDen && <p className="text-red-500 text-xs mt-1">{errors.gioDen}</p>}
                        </div>
                    </div>
                    </div>

                    {/* Chuyến bay về - chỉ hiển thị khi chọn khứ hồi */}
                    {!currentFlight && loaiChuyenBay === 'khu-hoi' && (
                        <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
                            <h3 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 pb-2 border-b border-gray-200">Chuyến bay về</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                                <div>
                                    <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1 md:mb-2">Số hiệu chuyến bay về</label>
                                    <input 
                                        type="text" 
                                        name="soHieuChuyenBayVe" 
                                        value={formData.soHieuChuyenBayVe || ''} 
                                        onChange={onFormChange} 
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.soHieuChuyenBayVe ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="VD: VN215"
                                        required
                                    />
                                    {errors.soHieuChuyenBayVe && <p className="text-red-500 text-xs mt-1">{errors.soHieuChuyenBayVe}</p>}
                                </div>
                                <div></div>
                                <div>
                                    <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1 md:mb-2">Ngày đi về</label>
                                    <input 
                                        type="date" 
                                        name="ngayDiVe" 
                                        value={formData.ngayDiVe || ''} 
                                        onChange={onFormChange} 
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.ngayDiVe ? 'border-red-500' : 'border-gray-300'}`}
                                        required
                                    />
                                    {errors.ngayDiVe && <p className="text-red-500 text-xs mt-1">{errors.ngayDiVe}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1 md:mb-2">Giờ đi về</label>
                                    <input 
                                        type="time" 
                                        name="gioDiVe" 
                                        value={formData.gioDiVe || ''} 
                                        onChange={onFormChange} 
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.gioDiVe ? 'border-red-500' : 'border-gray-300'}`}
                                        required
                                    />
                                    {errors.gioDiVe && <p className="text-red-500 text-xs mt-1">{errors.gioDiVe}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1 md:mb-2">Ngày đến về</label>
                                    <input 
                                        type="date" 
                                        name="ngayDenVe" 
                                        value={formData.ngayDenVe || ''} 
                                        onChange={onFormChange} 
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.ngayDenVe ? 'border-red-500' : 'border-gray-300'}`}
                                        required
                                    />
                                    {errors.ngayDenVe && <p className="text-red-500 text-xs mt-1">{errors.ngayDenVe}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1 md:mb-2">Giờ đến về</label>
                                    <input 
                                        type="time" 
                                        name="gioDenVe" 
                                        value={formData.gioDenVe || ''} 
                                        onChange={onFormChange} 
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.gioDenVe ? 'border-red-500' : 'border-gray-300'}`}
                                        required
                                    />
                                    {errors.gioDenVe && <p className="text-red-500 text-xs mt-1">{errors.gioDenVe}</p>}
                                </div>
                            </div>
                            <div className="mt-3 md:mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-2 md:p-3">
                                <p className="text-xs text-yellow-800">
                                    <span className="font-semibold">📌 Lưu ý:</span> Chuyến bay về sẽ đi ngược lại tuyến bay (điểm đến → điểm đi)
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Phần gán dịch vụ cho chuyến bay */}
                    <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
                        <h3 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                            <FaConciergeBell className="text-purple-600 text-sm md:text-base" />
                            <span>Dịch vụ chuyến bay</span>
                        </h3>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 md:p-4">
                            <p className="text-xs md:text-sm text-gray-700 mb-2 md:mb-3">
                                Chọn các dịch vụ sẽ được cung cấp trên chuyến bay này:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 max-h-48 md:max-h-60 overflow-y-auto">
                                {services.length > 0 ? (
                                    services.map(service => (
                                        <label key={service.maDichVu} className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-white border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 cursor-pointer transition-all">
                                            <input
                                                type="checkbox"
                                                checked={selectedServices.includes(service.maDichVu)}
                                                onChange={() => onServiceChange(service.maDichVu)}
                                                className="w-4 h-4 text-purple-600 focus:ring-purple-500 shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-900 text-xs md:text-sm truncate">{service.tenDichVu}</div>
                                                <div className="text-xs text-gray-500 line-clamp-1 hidden md:block">{service.moTa}</div>
                                            </div>
                                        </label>
                                    ))
                                ) : (
                                    <p className="col-span-2 text-center text-gray-500 py-3 md:py-4 text-sm">
                                        Không có dịch vụ nào để hiển thị
                                    </p>
                                )}
                            </div>
                            {selectedServices.length > 0 && (
                                <div className="mt-2 md:mt-3 p-2 bg-purple-100 rounded text-xs md:text-sm text-purple-800">
                                    Đã chọn {selectedServices.length} dịch vụ
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors text-sm md:text-base"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all shadow-lg text-sm md:text-base"
                        >
                            Lưu
                        </button>
                    </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditFlightModal;