import React, { useState, useEffect } from 'react';
import { FaCog, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { getDichVuByChuyenBay, addDichVuToChuyenBay, removeDichVuFromChuyenBay } from '../../../services/QLDichVuChuyenBayService';
import { getAllServices, fetchImageByName } from '../../../services/QLDichVuService';

const ManageServiceModal = ({ isOpen, onClose, flight, showToast }) => {
    const [services, setServices] = useState([]);
    const [assignedServices, setAssignedServices] = useState([]);
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
            const allServicesRes = await getAllServices();
            const allServices = Array.isArray(allServicesRes.data) ? allServicesRes.data : [];
            setServices(allServices);

            try {
                const assignedRes = await getDichVuByChuyenBay(flight.maChuyenBay);
                const assignedData = assignedRes.data?.data;
                setAssignedServices(Array.isArray(assignedData) ? assignedData : []);
            } catch {
                setAssignedServices([]);
            }

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
            const errorMessage = error.response?.data?.message || 'Có lỗi khi thêm dịch vụ';
            showToast(errorMessage, 'error');
        }
    };

    const handleRemoveService = async (maDichVu) => {
        if (window.confirm('Bạn có chắc muốn xóa dịch vụ này?')) {
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
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
                <div className="sticky top-0 bg-linear-to-r from-purple-600 to-purple-700 text-white px-6 py-4 flex justify-between items-center z-10">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <FaCog />
                        Quản lý dịch vụ chuyến bay {flight.soHieuChuyenBay}
                    </h3>
                    <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                        <FaTimes size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                        </div>
                    ) : (
                        <>
                            {/* Dịch vụ đã gán */}
                            <div className="mb-8">
                                <h4 className="text-lg font-bold text-gray-800 mb-4">Dịch vụ đã cung cấp</h4>
                                {assignedServices.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {assignedServices.map((service) => (
                                            <div key={service.maDichVu} className="bg-linear-to-br from-green-50 to-emerald-50 rounded-lg p-4 shadow-md border border-green-200 flex items-center gap-3">
                                                {serviceImages[service.maDichVu] && (
                                                    <img
                                                        src={serviceImages[service.maDichVu]}
                                                        alt={service.tenDichVu}
                                                        className="w-16 h-16 rounded-lg object-cover shadow-sm"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <div className="font-bold text-gray-900">{service.tenDichVu}</div>
                                                    <div className="text-sm text-gray-600 mt-1 line-clamp-2">{service.moTa}</div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveService(service.maDichVu)}
                                                    className="p-3 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                    title="Xóa dịch vụ"
                                                >
                                                    <FaTrash size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                                        <FaCog className="mx-auto text-gray-300 text-5xl mb-3" />
                                        <p className="text-gray-500 font-medium">Chưa có dịch vụ nào được cung cấp</p>
                                    </div>
                                )}
                            </div>

                            {/* Dịch vụ có thể thêm */}
                            <div>
                                <h4 className="text-lg font-bold text-gray-800 mb-4">Thêm dịch vụ mới</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                                    {Array.isArray(services) && services.length > 0 ? (
                                        services
                                            .filter(service => !isServiceAssigned(service.maDichVu))
                                            .map((service) => (
                                            <div key={service.maDichVu} className="bg-white rounded-lg p-4 shadow-md border border-gray-200 hover:border-blue-300 transition-colors flex items-center gap-3">
                                                {serviceImages[service.maDichVu] && (
                                                    <img
                                                        src={serviceImages[service.maDichVu]}
                                                        alt={service.tenDichVu}
                                                        className="w-16 h-16 rounded-lg object-cover shadow-sm"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <div className="font-bold text-gray-900">{service.tenDichVu}</div>
                                                    <div className="text-sm text-gray-600 mt-1 line-clamp-2">{service.moTa}</div>
                                                </div>
                                                <button
                                                    onClick={() => handleAddService(service.maDichVu)}
                                                    className="p-3 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                                    title="Thêm dịch vụ"
                                                >
                                                    <FaPlus size={16} />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full bg-gray-50 rounded-lg p-8 text-center">
                                            <p className="text-gray-500 font-medium">Không có dịch vụ nào</p>
                                        </div>
                                    )}
                                </div>
                                {Array.isArray(services) && services.filter(service => !isServiceAssigned(service.maDichVu)).length === 0 && services.length > 0 && (
                                    <div className="bg-gray-50 rounded-lg p-8 text-center mt-4">
                                        <p className="text-gray-500 font-medium">Tất cả dịch vụ đã được thêm vào chuyến bay</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageServiceModal;
