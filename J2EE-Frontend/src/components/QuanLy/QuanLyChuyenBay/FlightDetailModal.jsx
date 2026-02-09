import React, { useState, useEffect } from 'react';
import { FaPlane, FaTimes, FaCog, FaPlus, FaTrash, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { getDichVuByChuyenBay, addDichVuToChuyenBay, removeDichVuFromChuyenBay } from '../../../services/QLDichVuChuyenBayService';
import { getAllServices, fetchImageByName } from '../../../services/QLDichVuService';

const FlightDetailModal = ({ isOpen, onClose, flight, getRouteInfo, showToast }) => {
    const [services, setServices] = useState([]); // Tất cả dịch vụ có sẵn
    const [assignedServices, setAssignedServices] = useState([]); // Dịch vụ đã gán cho chuyến bay
    const [loading, setLoading] = useState(false);
    const [serviceImages, setServiceImages] = useState({});

    useEffect(() => {
        if (isOpen && flight) {
            fetchAllData();
        }
    }, [isOpen, flight]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // Lấy tất cả dịch vụ có sẵn
            const allServicesRes = await getAllServices();
            const allServices = Array.isArray(allServicesRes.data.data) ? allServicesRes.data.data : [];
            setServices(allServices);

            // Lấy dịch vụ đã gán cho chuyến bay
            try {
                const assignedRes = await getDichVuByChuyenBay(flight.maChuyenBay);
                const assignedData = assignedRes.data.data ? assignedRes.data.data : [];
                const assignedList = Array.isArray(assignedData) ? assignedData : [];
                setAssignedServices(assignedList);
            } catch (error) {
                setAssignedServices([]);
            }

            // Tải ảnh cho tất cả dịch vụ
            await loadServiceImages(allServices);
        } catch (error) {
            showToast('Không thể tải danh sách dịch vụ', 'error');
            setServices([]);
            setAssignedServices([]);
        } finally {
            setLoading(false);
        }
    };

    const loadServiceImages = async (servicesList) => {
        if (!Array.isArray(servicesList) || servicesList.length === 0) {
            return;
        }

        const images = {};
        for (const service of servicesList) {
            if (service.anh) {
                try {
                    const imageRes = await fetchImageByName(service.anh);
                    const imageUrl = URL.createObjectURL(imageRes.data);
                    images[service.maDichVu] = imageUrl;
                } catch (error) {
                    // Silently handle image load errors
                }
            }
        }
        setServiceImages(images);
    };

    const handleAddService = async (maDichVu) => {
        try {
            await addDichVuToChuyenBay(flight.maChuyenBay, maDichVu);
            showToast('Thêm dịch vụ thành công', 'success');
            await fetchAllData();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi khi thêm dịch vụ';
            showToast(errorMessage, 'error');
        }
    };

    const handleRemoveService = async (maDichVu) => {
        if (window.confirm('Bạn có chắc muốn xóa dịch vụ này khỏi chuyến bay?')) {
            try {
                await removeDichVuFromChuyenBay(flight.maChuyenBay, maDichVu);
                showToast('Xóa dịch vụ thành công', 'success');
                await fetchAllData();
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Có lỗi khi xóa dịch vụ';
                showToast(errorMessage, 'error');
            }
        }
    };

    const isServiceAssigned = (maDichVu) => {
        return assignedServices.some(service => service.maDichVu === maDichVu);
    };

    if (!isOpen || !flight) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

            {/* Modal - Full screen on mobile, centered modal on desktop */}
            <div className="relative z-10 h-full w-full md:h-[85vh] md:max-w-6xl md:mx-auto md:my-8 md:rounded-xl bg-white md:shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="[background:linear-gradient(to_right,rgb(37,99,235),rgb(29,78,216))] text-white px-4 md:px-6 py-3 md:py-4 flex justify-between items-center shrink-0">
                    <div className="min-w-0 flex-1">
                        <h3 className="text-lg md:text-xl font-bold truncate">Chi tiết chuyến bay</h3>
                        <p className="text-xs md:text-sm text-blue-100 mt-1 truncate">{flight.soHieuChuyenBay}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 transition-colors p-1 hover:bg-white/10 rounded-lg ml-2 shrink-0"
                    >
                        <FaTimes size={20} className="md:w-6 md:h-6" />
                    </button>
                </div>

                {/* Main Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    {/* Thông tin chuyến bay */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {/* Cột trái - Thông tin cơ bản */}
                        <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 border border-blue-200">
                            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FaPlane className="text-blue-600" />
                                Thông tin chuyến bay
                            </h4>
                            
                            <div className="space-y-4">
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <div className="text-xs text-gray-500 mb-1">Số hiệu chuyến bay</div>
                                    <div className="font-bold text-2xl text-blue-600">{flight.soHieuChuyenBay}</div>
                                </div>

                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <div className="text-xs text-gray-500 mb-1">Tuyến bay</div>
                                    <div className="font-bold text-lg text-gray-900">{getRouteInfo(flight.tuyenBay)}</div>
                                    <div className="text-sm text-gray-600 mt-2">
                                        {flight.tuyenBay?.sanBayDi?.tenSanBay} → {flight.tuyenBay?.sanBayDen?.tenSanBay}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white rounded-lg p-3 shadow-sm">
                                        <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                            <FaCalendarAlt size={10} />
                                            Ngày đi
                                        </div>
                                        <div className="font-semibold text-gray-900">{flight.ngayDi}</div>
                                        <div className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                                            <FaClock size={10} />
                                            {flight.gioDi}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-3 shadow-sm">
                                        <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                            <FaCalendarAlt size={10} />
                                            Ngày đến
                                        </div>
                                        <div className="font-semibold text-gray-900">{flight.ngayDen}</div>
                                        <div className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                                            <FaClock size={10} />
                                            {flight.gioDen}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-linear-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                                    <div className="text-sm text-gray-600 mb-1">Trạng thái</div>
                                    <div className="text-xl font-bold text-green-600">{flight.trangThai}</div>
                                    {flight.lyDoDelay && (
                                        <div className="mt-2 text-sm text-gray-600">
                                            <span className="font-semibold">Lý do:</span> {flight.lyDoDelay}
                                        </div>
                                    )}
                                </div>

                                {/* Thời gian thực tế - hiển thị trong cột trái nếu có */}
                                {(flight.thoiGianDiThucTe || flight.thoiGianDenThucTe) && (
                                    <div className="bg-linear-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                                        <div className="text-sm font-semibold text-gray-700 mb-3">Thời gian thực tế</div>
                                        <div className="space-y-2">
                                            {flight.thoiGianDiThucTe && (
                                                <div className="bg-white rounded-lg p-3 shadow-sm">
                                                    <div className="text-xs text-gray-500 mb-1">Đi thực tế</div>
                                                    <div className="font-semibold text-sm text-gray-900">
                                                        {new Date(flight.thoiGianDiThucTe).toLocaleString('vi-VN')}
                                                    </div>
                                                </div>
                                            )}
                                            {flight.thoiGianDenThucTe && (
                                                <div className="bg-white rounded-lg p-3 shadow-sm">
                                                    <div className="text-xs text-gray-500 mb-1">Đến thực tế</div>
                                                    <div className="font-semibold text-sm text-gray-900">
                                                        {new Date(flight.thoiGianDenThucTe).toLocaleString('vi-VN')}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cột phải - Quản lý dịch vụ */}
                        <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-xl p-4 md:p-6 border border-purple-200">
                            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FaCog className="text-purple-600" />
                                Dịch vụ trên chuyến bay
                            </h4>

                            {loading ? (
                                <div className="flex justify-center items-center py-8">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Dịch vụ đã gán */}
                                    <div>
                                        <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                                {assignedServices.length}
                                            </span>
                                            Dịch vụ đã cung cấp
                                        </h5>
                                        {assignedServices.length > 0 ? (
                                            <div className="space-y-2 max-h-48 md:max-h-64 overflow-y-auto pr-2">
                                                {assignedServices.map((service) => (
                                                    <div key={service.maDichVu} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-center gap-3">
                                                        {serviceImages[service.maDichVu] ? (
                                                            <img
                                                                src={serviceImages[service.maDichVu]}
                                                                alt={service.tenDichVu}
                                                                className="w-14 h-14 rounded-lg object-cover shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-14 h-14 rounded-lg bg-linear-to-br from-purple-100 to-pink-100 flex items-center justify-center shrink-0">
                                                                <FaCog className="text-purple-400 text-xl" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-semibold text-gray-900 truncate">{service.tenDichVu}</div>
                                                            <div className="text-xs text-gray-500 line-clamp-2">{service.moTa}</div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveService(service.maDichVu)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                                                            title="Xóa dịch vụ"
                                                        >
                                                            <FaTrash size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-white rounded-lg p-4 text-center text-gray-500 border border-dashed border-gray-300">
                                                <FaCog className="mx-auto text-gray-300 text-3xl mb-2" />
                                                <p className="text-sm">Chưa có dịch vụ nào</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Dịch vụ có thể thêm */}
                                    <div className="pt-4 border-t border-purple-200">
                                        <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <FaPlus className="text-blue-600" />
                                            Thêm dịch vụ mới
                                        </h5>
                                        {services.filter(service => !isServiceAssigned(service.maDichVu)).length > 0 ? (
                                            <div className="space-y-2 max-h-48 md:max-h-64 overflow-y-auto pr-2">
                                                {services
                                                    .filter(service => !isServiceAssigned(service.maDichVu))
                                                    .map((service) => (
                                                        <div key={service.maDichVu} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all flex items-center gap-3 cursor-pointer" onClick={() => handleAddService(service.maDichVu)}>
                                                            {serviceImages[service.maDichVu] ? (
                                                                <img
                                                                    src={serviceImages[service.maDichVu]}
                                                                    alt={service.tenDichVu}
                                                                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                                                                />
                                                            ) : (
                                                                <div className="w-14 h-14 rounded-lg bg-linear-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0">
                                                                    <FaPlane className="text-blue-400 text-xl" />
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-semibold text-gray-900 truncate">{service.tenDichVu}</div>
                                                                <div className="text-xs text-gray-500 line-clamp-2">{service.moTa}</div>
                                                            </div>
                                                            <button
                                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors shrink-0"
                                                                title="Thêm dịch vụ"
                                                            >
                                                                <FaPlus size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                            </div>
                                        ) : (
                                            <div className="bg-white rounded-lg p-4 text-center text-gray-500 border border-dashed border-gray-300">
                                                <div className="text-green-600 text-3xl mb-2">✓</div>
                                                <p className="text-sm">Đã thêm tất cả dịch vụ</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer - Hidden on mobile, shown on desktop */}
                <div className="hidden md:flex justify-end p-4 border-t bg-gray-50 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FlightDetailModal;
