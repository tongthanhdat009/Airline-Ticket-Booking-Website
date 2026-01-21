import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaPlane, FaConciergeBell, FaSave } from 'react-icons/fa';
import Card from '../../../components/QuanLy/CardChucNang';
import { getAllTuyenBay } from '../../../services/QLTuyenBayService';
import { getActiveMayBay } from '../../../services/QLMayBayService';
import { getAllServices } from '../../../services/QLDichVuService';
import { getChuyenBayById, updateChuyenBay } from '../../../services/QLChuyenBayService';
import { getDichVuByChuyenBay, addDichVuToChuyenBay, removeDichVuFromChuyenBay } from '../../../services/QLDichVuChuyenBayService';
import Toast from '../../../components/common/Toast';
import SeatLayoutViewer from '../../../components/QuanLy/QuanLyMayBay/SeatLayoutViewer';
import SeatMapCompactPreview from '../../../components/QuanLy/QuanLyMayBay/SeatMapCompactPreview';

const SuaChuyenBay = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        maTuyenBay: '',
        maMayBay: '',
        soHieuChuyenBay: '',
        ngayDi: '',
        gioDi: '',
        ngayDen: '',
        gioDen: ''
    });
    const [selectedServices, setSelectedServices] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [aircraft, setAircraft] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedAircraft, setSelectedAircraft] = useState(null);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
    const [flightData, setFlightData] = useState(null);
    const [showSeatModal, setShowSeatModal] = useState(false);

    // Load dữ liệu
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [flightRes, routesRes, aircraftRes, servicesRes] = await Promise.all([
                    getChuyenBayById(id),
                    getAllTuyenBay(),
                    getActiveMayBay(), // Chỉ lấy máy bay active
                    getAllServices()
                ]);

                // Debug log để kiểm tra cấu trúc response
                console.log('Flight response:', flightRes);
                console.log('Routes response:', routesRes);
                console.log('Aircraft response:', aircraftRes);
                console.log('Services response:', servicesRes);

                const flight = flightRes?.data || flightRes;
                setFlightData(flight);

                // Set form data
                setFormData({
                    maTuyenBay: flight.tuyenBay?.maTuyenBay || '',
                    maMayBay: flight.mayBay?.maMayBay || '',
                    soHieuChuyenBay: flight.soHieuChuyenBay || '',
                    ngayDi: flight.ngayDi || '',
                    gioDi: flight.gioDi || '',
                    ngayDen: flight.ngayDen || '',
                    gioDen: flight.gioDen || ''
                });

                // Load dịch vụ của chuyến bay
                try {
                    const flightServicesRes = await getDichVuByChuyenBay(flight.maChuyenBay);
                    const flightServices = flightServicesRes?.data || [];
                    setSelectedServices(flightServices.map(s => s.maDichVu));
                } catch (error) {
                    console.error('Error fetching flight services:', error);
                    setSelectedServices([]);
                }

                // Các service đã return response.data
                setRoutes(Array.isArray(routesRes?.data) ? routesRes.data : (Array.isArray(routesRes) ? routesRes : []));
                setAircraft(Array.isArray(aircraftRes?.data) ? aircraftRes.data : (Array.isArray(aircraftRes) ? aircraftRes : []));
                setServices(Array.isArray(servicesRes?.data) ? servicesRes.data : (Array.isArray(servicesRes) ? servicesRes : []));
            } catch (err) {
                console.error('Error loading data:', err);
                showToast('Không thể tải dữ liệu chuyến bay!', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // Khi chọn máy bay, cập nhật selectedAircraft
    useEffect(() => {
        if (formData.maMayBay) {
            const selectedCraft = aircraft.find(mb => mb.maMayBay === parseInt(formData.maMayBay));
            setSelectedAircraft(selectedCraft || null);
        } else {
            setSelectedAircraft(null);
        }
    }, [formData.maMayBay, aircraft]);

    // Khi chọn tuyến bay, cập nhật selectedRoute
    useEffect(() => {
        if (formData.maTuyenBay) {
            const route = routes.find(r => r.maTuyenBay === parseInt(formData.maTuyenBay));
            setSelectedRoute(route || null);
        } else {
            setSelectedRoute(null);
        }
    }, [formData.maTuyenBay, routes]);

    const showToast = (message, type = 'success') => {
        setToast({ isVisible: true, message, type });
    };

    const hideToast = () => {
        setToast({ ...toast, isVisible: false });
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error khi user nhập
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleServiceChange = (maDichVu) => {
        setSelectedServices(prev =>
            prev.includes(maDichVu)
                ? prev.filter(id => id !== maDichVu)
                : [...prev, maDichVu]
        );
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.maTuyenBay) newErrors.maTuyenBay = 'Vui lòng chọn tuyến bay';
        if (!formData.maMayBay) newErrors.maMayBay = 'Vui lòng chọn máy bay';
        if (!formData.soHieuChuyenBay) newErrors.soHieuChuyenBay = 'Vui lòng nhập số hiệu chuyến bay';
        if (!formData.ngayDi) newErrors.ngayDi = 'Vui lòng chọn ngày đi';
        if (!formData.gioDi) newErrors.gioDi = 'Vui lòng chọn giờ đi';
        if (!formData.ngayDen) newErrors.ngayDen = 'Vui lòng chọn ngày đến';
        if (!formData.gioDen) newErrors.gioDen = 'Vui lòng chọn giờ đến';

        // Validate ngày giờ
        const ngayDi = new Date(formData.ngayDi);
        const ngayDen = new Date(formData.ngayDen);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (ngayDen < ngayDi) {
            newErrors.ngayDen = 'Ngày đến phải sau ngày đi';
        }

        if (formData.ngayDi === formData.ngayDen && formData.gioDi >= formData.gioDen) {
            newErrors.gioDen = 'Giờ đến phải sau giờ đi';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showToast('Vui lòng kiểm tra lại thông tin!', 'error');
            return;
        }

        try {
            setIsSubmitting(true);

            const flightUpdateData = {
                maChuyenBay: flightData.maChuyenBay,
                soHieuChuyenBay: formData.soHieuChuyenBay,
                ngayDi: formData.ngayDi,
                gioDi: formData.gioDi,
                ngayDen: formData.ngayDen,
                gioDen: formData.gioDen,
                tuyenBay: selectedRoute,
                mayBay: selectedAircraft
            };

            // Cập nhật thông tin chuyến bay
            await updateChuyenBay(flightUpdateData);

            // Cập nhật dịch vụ cho chuyến bay
            try {
                const servicesRes = await getDichVuByChuyenBay(flightData.maChuyenBay);
                const currentServices = servicesRes.data?.data || servicesRes.data || [];
                const currentServiceIds = currentServices.map(s => s.maDichVu);

                // Xóa các dịch vụ không còn được chọn
                for (const maDichVu of currentServiceIds) {
                    if (!selectedServices.includes(maDichVu)) {
                        await removeDichVuFromChuyenBay(flightData.maChuyenBay, maDichVu);
                    }
                }

                // Thêm các dịch vụ mới
                for (const maDichVu of selectedServices) {
                    if (!currentServiceIds.includes(maDichVu)) {
                        await addDichVuToChuyenBay(flightData.maChuyenBay, maDichVu);
                    }
                }
            } catch (error) {
                console.error('Error updating flight services:', error);
                showToast('Cập nhật dịch vụ thất bại!', 'error');
            }

            showToast('Cập nhật chuyến bay thành công!', 'success');

            setTimeout(() => {
                navigate('/admin/dashboard/ChuyenBay');
            }, 1500);

        } catch (err) {
            console.error('Error updating flight:', err);
            showToast('Có lỗi xảy ra khi cập nhật chuyến bay. Vui lòng thử lại.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (!flightData) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <p className="text-red-500 text-lg font-medium">Không tìm thấy chuyến bay!</p>
                    <button
                        onClick={() => navigate('/admin/dashboard/ChuyenBay')}
                        className="mt-4 text-blue-600 hover:text-blue-800 font-semibold"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    // Hiển thị trạng thái chuyến bay
    const statusColors = {
        'Đang mở bán': 'bg-green-100 text-green-700',
        'Đang check-in': 'bg-blue-100 text-blue-700',
        'Đang bay': 'bg-purple-100 text-purple-700',
        'Delay': 'bg-yellow-100 text-yellow-700',
        'Đã bay': 'bg-gray-100 text-gray-700',
        'Đã hủy': 'bg-red-100 text-red-700',
        'Hủy': 'bg-red-100 text-red-700'
    };

    return (
        <Card title={`Sửa chuyến bay: ${flightData.soHieuChuyenBay}`}>
            {/* Toast */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />

            {/* Nút quay lại */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/admin/dashboard/ChuyenBay')}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                >
                    <FaArrowLeft />
                    <span>Quay lại danh sách</span>
                </button>
            </div>

            {/* Thông tin trạng thái hiện tại */}
            <div className={`mb-6 p-4 rounded-lg border ${statusColors[flightData.trangThai] || 'bg-gray-50'}`}>
                <p className="font-semibold">
                    Trạng thái hiện tại: <span className="ml-2">{flightData.trangThai}</span>
                </p>
            </div>

            {/* Cảnh báo khi chuyến bay đang bay */}
            {flightData.trangThai === 'Đang bay' && (
                <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
                    <p className="text-red-700 font-semibold">
                        ⚠️ Không thể sửa thông tin chuyến bay khi đang bay. Chỉ có thể cập nhật trạng thái từ bảng quản lý.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/dashboard/ChuyenBay')}
                        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Quay lại danh sách chuyến bay
                    </button>
                </div>
            )}

            {/* Form - Ẩn khi đang bay */}
            {flightData.trangThai !== 'Đang bay' && (
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Thông tin chuyến bay */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                            Thông tin chuyến bay
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Tuyến bay <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="maTuyenBay"
                                    value={formData.maTuyenBay}
                                    onChange={handleFormChange}
                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.maTuyenBay ? 'border-red-500' : 'border-gray-300'}`}
                                    required
                                >
                                    <option value="">-- Chọn tuyến bay --</option>
                                    {routes.map(r => (
                                        <option key={r.maTuyenBay} value={r.maTuyenBay}>
                                            {r.sanBayDi?.maIATA || '?'} → {r.sanBayDen?.maIATA || '?'}
                                        </option>
                                    ))}
                                </select>
                                {errors.maTuyenBay && <p className="text-red-500 text-xs mt-1">{errors.maTuyenBay}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Máy bay <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="maMayBay"
                                    value={formData.maMayBay}
                                    onChange={handleFormChange}
                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.maMayBay ? 'border-red-500' : 'border-gray-300'}`}
                                    required
                                >
                                    <option value="">-- Chọn máy bay --</option>
                                    {aircraft.map(mb => (
                                        <option key={mb.maMayBay} value={mb.maMayBay}>
                                            {mb.tenMayBay} - {mb.sohieu} ({mb.tongSoGhe} ghế)
                                        </option>
                                    ))}
                                </select>
                                {errors.maMayBay && <p className="text-red-500 text-xs mt-1">{errors.maMayBay}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Số hiệu chuyến bay <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="soHieuChuyenBay"
                                    value={formData.soHieuChuyenBay}
                                    onChange={handleFormChange}
                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.soHieuChuyenBay ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="VD: VN214"
                                    required
                                />
                                {errors.soHieuChuyenBay && <p className="text-red-500 text-xs mt-1">{errors.soHieuChuyenBay}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Ngày đi <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="ngayDi"
                                    value={formData.ngayDi}
                                    onChange={handleFormChange}
                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.ngayDi ? 'border-red-500' : 'border-gray-300'}`}
                                    required
                                />
                                {errors.ngayDi && <p className="text-red-500 text-xs mt-1">{errors.ngayDi}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Giờ đi <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    name="gioDi"
                                    value={formData.gioDi}
                                    onChange={handleFormChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Ngày đến <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="ngayDen"
                                    value={formData.ngayDen}
                                    onChange={handleFormChange}
                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.ngayDen ? 'border-red-500' : 'border-gray-300'}`}
                                    required
                                />
                                {errors.ngayDen && <p className="text-red-500 text-xs mt-1">{errors.ngayDen}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Giờ đến <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    name="gioDen"
                                    value={formData.gioDen}
                                    onChange={handleFormChange}
                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.gioDen ? 'border-red-500' : 'border-gray-300'}`}
                                    required
                                />
                                {errors.gioDen && <p className="text-red-500 text-xs mt-1">{errors.gioDen}</p>}
                            </div>
                        </div>

                        {/* Preview Seat Map */}
                        {selectedAircraft && (
                            <div className="mt-6">
                                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FaPlane className="text-blue-600" />
                                    Sơ đồ ghế máy bay
                                </h4>

                                {/* Compact preview */}
                                <div className="mb-4">
                                    <SeatMapCompactPreview maMayBay={selectedAircraft.maMayBay} />
                                </div>

                                <div className="flex items-center gap-3 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowSeatModal(true)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                                    >
                                        <FaPlane />
                                        Xem chi tiết
                                    </button>
                                    <span className="text-sm text-gray-500">
                                        {selectedAircraft.tenMayBay} - {selectedAircraft.sohieu} ({selectedAircraft.tongSoGhe} ghế)
                                    </span>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-700">
                                        <span className="font-semibold">ℹ️ Lưu ý:</span> Để sửa ghế, vui lòng vào <a href="/admin/dashboard/MayBay" className="underline font-semibold hover:text-blue-800">Quản lý máy bay</a>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dịch vụ */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                            <FaConciergeBell className="text-purple-600" />
                            Dịch vụ chuyến bay
                        </h3>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <p className="text-sm text-gray-700 mb-3">
                                Chọn các dịch vụ sẽ được cung cấp trên chuyến bay này:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {services.length > 0 ? (
                                    services.map(service => (
                                        <label key={service.maDichVu} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 cursor-pointer transition-all">
                                            <input
                                                type="checkbox"
                                                checked={selectedServices.includes(service.maDichVu)}
                                                onChange={() => handleServiceChange(service.maDichVu)}
                                                className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900">{service.tenDichVu}</div>
                                                <div className="text-xs text-gray-500">{service.moTa}</div>
                                            </div>
                                        </label>
                                    ))
                                ) : (
                                    <p className="col-span-2 text-center text-gray-500 py-4">
                                        Không có dịch vụ nào
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

                    {/* Nút lưu */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/dashboard/ChuyenBay')}
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                            disabled={isSubmitting}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <faSave />
                            <span>{isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                        </button>
                    </div>
                </form>
            )}

            {/* Seat Layout Modal */}
            {showSeatModal && selectedAircraft && (
                <SeatLayoutViewer
                    maMayBay={selectedAircraft.maMayBay}
                    onClose={() => setShowSeatModal(false)}
                />
            )}
        </Card>
    );
};

export default SuaChuyenBay;
