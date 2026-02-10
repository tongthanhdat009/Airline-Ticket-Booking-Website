import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlane, FaConciergeBell, FaSave } from 'react-icons/fa';
import Card from '../../../components/QuanLy/CardChucNang';
import { getAllTuyenBay } from '../../../services/QLTuyenBayService';
import { getActiveMayBay } from '../../../services/QLMayBayService';
import { getAllServices } from '../../../services/QLDichVuService';
import { createChuyenBay } from '../../../services/QLChuyenBayService';
// import { getDichVuByChuyenBay, addDichVuToChuyenBay } from '../../../services/QLDichVuChuyenBayService';
import Toast from '../../../components/common/Toast';
import SeatLayoutViewer from '../../../components/QuanLy/QuanLyMayBay/SeatLayoutViewer';
import SeatMapCompactPreview from '../../../components/QuanLy/QuanLyMayBay/SeatMapCompactPreview';

const ThemChuyenBay = () => {
    const navigate = useNavigate();
    const [loaiChuyenBay, setLoaiChuyenBay] = useState('1-chieu');
    const [formData, setFormData] = useState({
        maTuyenBay: '',
        maMayBay: '',
        soHieuChuyenBay: '',
        ngayDi: '',
        gioDi: '',
        ngayDen: '',
        gioDen: '',
        // Chuyến bay về
        soHieuChuyenBayVe: '',
        ngayDiVe: '',
        gioDiVe: '',
        ngayDenVe: '',
        gioDenVe: ''
    });
    const [selectedServices, setSelectedServices] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [filteredRoutes, setFilteredRoutes] = useState([]); // Tuyến bay được lọc theo vị trí máy bay
    const [aircraft, setAircraft] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedAircraft, setSelectedAircraft] = useState(null);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
    const [showSeatModal, setShowSeatModal] = useState(false);

    // Load dữ liệu
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [routesRes, aircraftRes, servicesRes] = await Promise.all([
                    getAllTuyenBay(),
                    getActiveMayBay(), // Chỉ lấy máy bay active
                    getAllServices()
                ]);

                // Debug log để kiểm tra cấu trúc response
                console.log('Routes response:', routesRes);
                console.log('Aircraft response:', aircraftRes);
                console.log('Services response:', servicesRes);

                // Các service đã return response.data, nên access trực tiếp vào .data nếu có
                setRoutes(Array.isArray(routesRes?.data) ? routesRes.data : (Array.isArray(routesRes) ? routesRes : []));
                setAircraft(Array.isArray(aircraftRes?.data) ? aircraftRes.data : (Array.isArray(aircraftRes) ? aircraftRes : []));
                setServices(Array.isArray(servicesRes?.data) ? servicesRes.data : (Array.isArray(servicesRes) ? servicesRes : []));
            } catch (err) {
                console.error('Error loading data:', err);
                showToast('Không thể tải dữ liệu!', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Khi chọn máy bay, cập nhật selectedAircraft và lọc tuyến bay phù hợp
    useEffect(() => {
        if (formData.maMayBay) {
            const selectedCraft = aircraft.find(mb => mb.maMayBay === parseInt(formData.maMayBay));
            setSelectedAircraft(selectedCraft || null);

            // Lọc tuyến bay theo vị trí sân bay hiện tại của máy bay
            if (selectedCraft?.sanBayHienTai) {
                const filtered = routes.filter(r =>
                    r.sanBayDi?.maSanBay === selectedCraft.sanBayHienTai.maSanBay
                );
                setFilteredRoutes(filtered);

                // Reset tuyến bay đã chọn nếu không còn trong danh sách lọc
                if (formData.maTuyenBay && !filtered.some(r => r.maTuyenBay === parseInt(formData.maTuyenBay))) {
                    setFormData(prev => ({ ...prev, maTuyenBay: '' }));
                    setSelectedRoute(null);
                }
            } else {
                // Máy bay chưa có vị trí - không có tuyến bay khả dụng
                setFilteredRoutes([]);
            }
        } else {
            setSelectedAircraft(null);
            setFilteredRoutes(routes); // Khi chưa chọn máy bay, hiển thị tất cả tuyến bay
        }
    }, [formData.maMayBay, aircraft, routes]);

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

        if (ngayDi < today) {
            newErrors.ngayDi = 'Ngày đi không được trong quá khứ';
        }

        if (ngayDen < ngayDi) {
            newErrors.ngayDen = 'Ngày đến phải sau ngày đi';
        }

        if (formData.ngayDi === formData.ngayDen && formData.gioDi >= formData.gioDen) {
            newErrors.gioDen = 'Giờ đến phải sau giờ đi';
        }

        // Validate chuyến bay về nếu là khứ hồi
        if (loaiChuyenBay === 'khu-hoi') {
            if (!formData.soHieuChuyenBayVe) newErrors.soHieuChuyenBayVe = 'Vui lòng nhập số hiệu chuyến bay về';
            if (!formData.ngayDiVe) newErrors.ngayDiVe = 'Vui lòng chọn ngày đi về';
            if (!formData.gioDiVe) newErrors.gioDiVe = 'Vui lòng chọn giờ đi về';
            if (!formData.ngayDenVe) newErrors.ngayDenVe = 'Vui lòng chọn ngày đến về';
            if (!formData.gioDenVe) newErrors.gioDenVe = 'Vui lòng chọn giờ đến về';

            const ngayDiVe = new Date(formData.ngayDiVe);
            const ngayDenVe = new Date(formData.ngayDenVe);

            if (ngayDiVe <= ngayDen) {
                newErrors.ngayDiVe = 'Ngày đi về phải sau ngày đến chuyến đi';
            }

            if (ngayDenVe < ngayDiVe) {
                newErrors.ngayDenVe = 'Ngày đến về phải sau ngày đi về';
            }

            if (formData.ngayDiVe === formData.ngayDenVe && formData.gioDiVe >= formData.gioDenVe) {
                newErrors.gioDenVe = 'Giờ đến về phải sau giờ đi về';
            }
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

            // Tạo chuyến bay đi
            const flightDataDi = {
                soHieuChuyenBay: formData.soHieuChuyenBay,
                ngayDi: formData.ngayDi,
                gioDi: formData.gioDi,
                ngayDen: formData.ngayDen,
                gioDen: formData.gioDen,
                tuyenBay: selectedRoute,
                mayBay: selectedAircraft
            };

            const createdFlightDi = await createChuyenBay(flightDataDi);
            const maChuyenBayDi = createdFlightDi.data?.data?.maChuyenBay || createdFlightDi.data?.maChuyenBay;

            // Gán dịch vụ cho chuyến bay đi
            if (maChuyenBayDi && selectedServices.length > 0) {
                for (const maDichVu of selectedServices) {
                    try {
                        await fetch(`http://localhost:8080/admin/dashboard/chuyenbay/${maChuyenBayDi}/dichvu/${maDichVu}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        });
                    } catch (error) {
                        console.error(`Error assigning service ${maDichVu}:`, error);
                    }
                }
            }

            // Nếu là khứ hồi, tạo thêm chuyến bay về
            if (loaiChuyenBay === 'khu-hoi') {
                // Tìm tuyến bay ngược lại
                const returnRoute = routes.find(r =>
                    r.sanBayDi?.maSanBay === selectedRoute.sanBayDen?.maSanBay &&
                    r.sanBayDen?.maSanBay === selectedRoute.sanBayDi?.maSanBay
                );

                if (!returnRoute) {
                    showToast('Không tìm thấy tuyến bay ngược lại!', 'error');
                    setIsSubmitting(false);
                    return;
                }

                const flightDataVe = {
                    soHieuChuyenBay: formData.soHieuChuyenBayVe,
                    ngayDi: formData.ngayDiVe,
                    gioDi: formData.gioDiVe,
                    ngayDen: formData.ngayDenVe,
                    gioDen: formData.gioDenVe,
                    tuyenBay: returnRoute,
                    mayBay: selectedAircraft
                };

                const createdFlightVe = await createChuyenBay(flightDataVe);
                const maChuyenBayVe = createdFlightVe.data?.data?.maChuyenBay || createdFlightVe.data?.maChuyenBay;

                // Gán dịch vụ cho chuyến bay về
                if (maChuyenBayVe && selectedServices.length > 0) {
                    for (const maDichVu of selectedServices) {
                        try {
                            await fetch(`http://localhost:8080/admin/dashboard/chuyenbay/${maChuyenBayVe}/dichvu/${maDichVu}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' }
                            });
                        } catch (error) {
                            console.error(`Error assigning service ${maDichVu}:`, error);
                        }
                    }
                }

                showToast('Thêm mới chuyến bay khứ hồi thành công!', 'success');
            } else {
                showToast('Thêm mới chuyến bay thành công!', 'success');
            }

            setTimeout(() => {
                navigate('/admin/dashboard/ChuyenBay');
            }, 1500);

        } catch (err) {
            console.error('Error creating flight:', err);
            console.error('Error response:', err.response);
            // Lấy message lỗi từ API response
            let errorMessage = 'Có lỗi xảy ra khi lưu chuyến bay. Vui lòng thử lại.';

            if (err.response?.data) {
                const data = err.response.data;
                // API trả về { success: false, message: "...", data: null }
                errorMessage = data.message || data.error || errorMessage;
            } else if (err.message) {
                errorMessage = err.message;
            }

            showToast(errorMessage, 'error');
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

    return (
        <Card title="Thêm chuyến bay mới">
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Loại chuyến bay */}
                <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
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

                {/* Chuyến bay đi */}
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                        {loaiChuyenBay === 'khu-hoi' ? 'Chuyến bay đi' : 'Thông tin chuyến bay'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                        {mb.tenMayBay} - {mb.soHieu || mb.sohieu} ({mb.tongSoGhe} ghế)
                                        {mb.sanBayHienTai ? ` - Đang ở ${mb.sanBayHienTai.maIATA}` : ' - Chưa có vị trí'}
                                    </option>
                                ))}
                            </select>
                            {errors.maMayBay && <p className="text-red-500 text-xs mt-1">{errors.maMayBay}</p>}
                            {selectedAircraft?.sanBayHienTai && (
                                <p className="text-sm text-blue-600 mt-1">
                                    📍 Vị trí hiện tại: {selectedAircraft.sanBayHienTai.tenSanBay} ({selectedAircraft.sanBayHienTai.maIATA})
                                </p>
                            )}
                            {selectedAircraft && !selectedAircraft.sanBayHienTai && (
                                <p className="text-sm text-orange-600 mt-1">
                                    ⚠️ Máy bay chưa được gán vị trí sân bay. Vui lòng cập nhật trong Quản lý máy bay.
                                </p>
                            )}
                        </div>

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
                                disabled={!selectedAircraft || filteredRoutes.length === 0}
                            >
                                <option value="">-- Chọn tuyến bay --</option>
                                {filteredRoutes.map(r => (
                                    <option key={r.maTuyenBay} value={r.maTuyenBay}>
                                        {r.sanBayDi?.maIATA || '?'} → {r.sanBayDen?.maIATA || '?'}
                                    </option>
                                ))}
                            </select>
                            {errors.maTuyenBay && <p className="text-red-500 text-xs mt-1">{errors.maTuyenBay}</p>}
                            {selectedAircraft && filteredRoutes.length === 0 && (
                                <p className="text-sm text-orange-600 mt-1">
                                    ⚠️ Không có tuyến bay khả dụng từ sân bay hiện tại của máy bay
                                </p>
                            )}
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

                            <div className="flex items-center gap-3">
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
                        </div>
                    )}
                </div>

                {/* Chuyến bay về */}
                {
                    loaiChuyenBay === 'khu-hoi' && (
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Chuyến bay về</h3>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                <p className="text-sm text-yellow-800">
                                    <span className="font-semibold">📌 Lưu ý:</span> Chuyến bay về sẽ đi ngược lại tuyến bay (điểm đến → điểm đi)
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Số hiệu chuyến bay về <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="soHieuChuyenBayVe"
                                        value={formData.soHieuChuyenBayVe}
                                        onChange={handleFormChange}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.soHieuChuyenBayVe ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="VD: VN215"
                                        required
                                    />
                                    {errors.soHieuChuyenBayVe && <p className="text-red-500 text-xs mt-1">{errors.soHieuChuyenBayVe}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Ngày đi về <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="ngayDiVe"
                                        value={formData.ngayDiVe}
                                        onChange={handleFormChange}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.ngayDiVe ? 'border-red-500' : 'border-gray-300'}`}
                                        required
                                    />
                                    {errors.ngayDiVe && <p className="text-red-500 text-xs mt-1">{errors.ngayDiVe}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Giờ đi về <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        name="gioDiVe"
                                        value={formData.gioDiVe}
                                        onChange={handleFormChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Ngày đến về <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="ngayDenVe"
                                        value={formData.ngayDenVe}
                                        onChange={handleFormChange}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.ngayDenVe ? 'border-red-500' : 'border-gray-300'}`}
                                        required
                                    />
                                    {errors.ngayDenVe && <p className="text-red-500 text-xs mt-1">{errors.ngayDenVe}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Giờ đến về <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        name="gioDenVe"
                                        value={formData.gioDenVe}
                                        onChange={handleFormChange}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.gioDenVe ? 'border-red-500' : 'border-gray-300'}`}
                                        required
                                    />
                                    {errors.gioDenVe && <p className="text-red-500 text-xs mt-1">{errors.gioDenVe}</p>}
                                </div>
                            </div>
                        </div>
                    )
                }

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
                            <div className="mt-3 p-2 bg-blue-100 rounded text-sm text-blue-800">
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
                        <FaSave />
                        <span>{isSubmitting ? 'Đang lưu...' : 'Lưu chuyến bay'}</span>
                    </button>
                </div>
            </form >

            {/* Seat Layout Modal */}
            {
                showSeatModal && selectedAircraft && (
                    <SeatLayoutViewer
                        maMayBay={selectedAircraft.maMayBay}
                        onClose={() => setShowSeatModal(false)}
                    />
                )
            }
        </Card >
    );
};

export default ThemChuyenBay;
