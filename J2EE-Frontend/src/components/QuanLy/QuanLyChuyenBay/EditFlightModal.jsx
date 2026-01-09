import React, { useState, useEffect } from 'react';
import { FaPlane, FaConciergeBell } from 'react-icons/fa';

const EditFlightModal = ({ isOpen, onClose, onSubmit, formData, onFormChange, routes, getRouteInfo, currentFlight, services = [], selectedServices = [], onServiceChange }) => {
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
        <div className="fixed inset-0 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
                    <h2 className="text-2xl font-bold">{currentFlight ? 'Chỉnh sửa chuyến bay' : 'Thêm chuyến bay mới'}</h2>
                </div>
                <form onSubmit={handleFormSubmit} className="p-6">
                    {/* Loại chuyến bay - chỉ hiển thị khi thêm mới */}
                    {!currentFlight && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <label className="block text-sm font-bold text-gray-700 mb-3">Loại chuyến bay</label>
                            <div className="flex gap-4">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="loaiChuyenBay"
                                        value="1-chieu"
                                        checked={loaiChuyenBay === '1-chieu'}
                                        onChange={(e) => setLoaiChuyenBay(e.target.value)}
                                        className="mr-2 w-4 h-4"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Một chiều</span>
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
                                    <span className="text-sm font-medium text-gray-700">Khứ hồi</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Chuyến bay đi */}
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                            {loaiChuyenBay === 'khu-hoi' ? 'Chuyến bay đi' : 'Thông tin chuyến bay'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tuyến bay</label>
                                <select 
                                name="maTuyenBay" 
                                value={formData.maTuyenBay} 
                                onChange={onFormChange} 
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
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
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                required 
                                placeholder="VD: VN214"
                            />
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
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
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

                    {/* Số lượng ghế cho từng hạng vé - chỉ hiển thị khi thêm mới */}
                    {!currentFlight && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                                <FaPlane className="text-blue-600" />
                                Số lượng ghế theo hạng vé
                            </h3>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-gray-700 mb-4">
                                    Nhập số lượng ghế cho từng hạng vé trên chuyến bay:
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Economy (Hạng 1)
                                        </label>
                                        <input 
                                            type="number" 
                                            name="soGheEconomy" 
                                            value={formData.soGheEconomy || 0} 
                                            onChange={onFormChange} 
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                                            min="0"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Deluxe (Hạng 2)
                                        </label>
                                        <input 
                                            type="number" 
                                            name="soGheDeluxe" 
                                            value={formData.soGheDeluxe || 0} 
                                            onChange={onFormChange} 
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent" 
                                            min="0"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Business (Hạng 3)
                                        </label>
                                        <input 
                                            type="number" 
                                            name="soGheBusiness" 
                                            value={formData.soGheBusiness || 0} 
                                            onChange={onFormChange} 
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                                            min="0"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            FirstClass (Hạng 4)
                                        </label>
                                        <input 
                                            type="number" 
                                            name="soGheFirstClass" 
                                            value={formData.soGheFirstClass || 0} 
                                            onChange={onFormChange} 
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                                            min="0"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div className="mt-3 p-3 bg-blue-100 rounded text-sm text-blue-800">
                                    <span className="font-semibold">Tổng số ghế: </span>
                                    {(parseInt(formData.soGheEconomy || 0) + 
                                      parseInt(formData.soGheDeluxe || 0) + 
                                      parseInt(formData.soGheBusiness || 0) + 
                                      parseInt(formData.soGheFirstClass || 0))} ghế
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chuyến bay về - chỉ hiển thị khi chọn khứ hồi */}
                    {!currentFlight && loaiChuyenBay === 'khu-hoi' && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Chuyến bay về</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Số hiệu chuyến bay về</label>
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
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Ngày đi về</label>
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
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Giờ đi về</label>
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
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Ngày đến về</label>
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
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Giờ đến về</label>
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
                            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-xs text-yellow-800">
                                    <span className="font-semibold">📌 Lưu ý:</span> Chuyến bay về sẽ đi ngược lại tuyến bay (điểm đến → điểm đi)
                                </p>
                            </div>
                        </div>
                    )})

                    {/* Phần gán dịch vụ cho chuyến bay */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                            <FaConciergeBell className="text-purple-600" />
                            Dịch vụ chuyến bay
                        </h3>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <p className="text-sm text-gray-700 mb-3">
                                Chọn các dịch vụ sẽ được cung cấp trên chuyến bay này:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                                {services.length > 0 ? (
                                    services.map(service => (
                                        <label key={service.maDichVu} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 cursor-pointer transition-all">
                                            <input
                                                type="checkbox"
                                                checked={selectedServices.includes(service.maDichVu)}
                                                onChange={() => onServiceChange(service.maDichVu)}
                                                className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900">{service.tenDichVu}</div>
                                                <div className="text-xs text-gray-500 line-clamp-1">{service.moTa}</div>
                                            </div>
                                        </label>
                                    ))
                                ) : (
                                    <p className="col-span-2 text-center text-gray-500 py-4">
                                        Không có dịch vụ nào để hiển thị
                                    </p>
                                )}
                            </div>
                            {selectedServices.length > 0 && (
                                <div className="mt-3 p-2 bg-purple-100 rounded text-sm text-purple-800">
                                    Đã chọn {selectedServices.length} dịch vụ
                                </div>
                            )}
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
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold transition-all shadow-lg"
                        >
                            Lưu
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditFlightModal;