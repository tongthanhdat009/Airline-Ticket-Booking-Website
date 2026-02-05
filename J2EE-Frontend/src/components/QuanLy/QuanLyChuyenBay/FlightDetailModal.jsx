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
            console.log('Fetching all services...');
            // Lấy tất cả dịch vụ có sẵn
            const allServicesRes = await getAllServices();
            console.log('Services response:', allServicesRes);
            
            const allServices = Array.isArray(allServicesRes.data.data) ? allServicesRes.data.data : [];
            console.log('All services:', allServices);
            setServices(allServices);

            // Lấy dịch vụ đã gán cho chuyến bay
            try {
                console.log('Fetching assigned services for flight:', flight.maChuyenBay);
                const assignedRes = await getDichVuByChuyenBay(flight.maChuyenBay);
                console.log('Assigned services response:', assignedRes.data);
                
                const assignedData = assignedRes.data.data ? assignedRes.data.data : [];
                const assignedList = Array.isArray(assignedData) ? assignedData : [];
                console.log('Assigned services list:', assignedList);
                setAssignedServices(assignedList);
            } catch (error) {
                console.log("No services assigned yet or error fetching:", error);
                setAssignedServices([]);
            }

            // Tải ảnh cho tất cả dịch vụ
            await loadServiceImages(allServices);
        } catch (error) {
            console.error('Error fetching services:', error);
            showToast('Không thể tải danh sách dịch vụ', 'error');
            setServices([]);
            setAssignedServices([]);
        } finally {
            setLoading(false);
        }
    };

    const loadServiceImages = async (servicesList) => {
        if (!Array.isArray(servicesList) || servicesList.length === 0) {
            console.log('No services to load images for');
            return;
        }
        
        console.log('Loading images for services:', servicesList.length);
        const images = {};
        for (const service of servicesList) {
            if (service.anh) {
                try {
                    const imageRes = await fetchImageByName(service.anh);
                    const imageUrl = URL.createObjectURL(imageRes.data);
                    images[service.maDichVu] = imageUrl;
                } catch (error) {
                    console.error(`Error loading image for service ${service.maDichVu}:`, error);
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
            console.error('Error adding service:', error);
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
                console.error('Error removing service:', error);
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
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-linear-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center z-10">
                    <h3 className="text-xl font-bold">Chi tiết chuyến bay</h3>
                    <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                        <FaTimes size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Thông tin chuyến bay */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Cột trái - Thông tin cơ bản */}
                        <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
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
                        <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
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
                                            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
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
                                            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
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
            </div>
        </div>
    );
};

export default FlightDetailModal;
