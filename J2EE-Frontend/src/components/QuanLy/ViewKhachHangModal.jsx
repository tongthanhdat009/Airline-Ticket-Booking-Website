import React, { useState, useEffect } from 'react';
import { getChuyenBayByKhachHangId } from '../../services/QLKhachHangService';

const ViewKhachHangModal = ({ isOpen, onClose, customer }) => {
    const [flights, setFlights] = useState([]);
    const [loadingFlights, setLoadingFlights] = useState(false);
    const [selectedFlight, setSelectedFlight] = useState(null);

    useEffect(() => {
        if (isOpen && customer) {
            fetchFlights();
        }
    }, [isOpen, customer]);

    const fetchFlights = async () => {
        if (!customer) return;
        try {
            setLoadingFlights(true);
            const response = await getChuyenBayByKhachHangId(customer.maHanhKhach);
            setFlights(response.data || []);
        } catch (error) {
            console.error('Error fetching flights:', error);
            setFlights([]);
        } finally {
            setLoadingFlights(false);
        }
    };

    const handleFlightClick = (flight, index) => {
        setSelectedFlight(selectedFlight === index ? null : index);
    };

    if (!isOpen || !customer) return null;

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const formatCurrency = (amount) => {
        if (!amount) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-linear-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
                    <h3 className="text-xl font-bold">Thông tin chi tiết khách hàng</h3>
                    <button onClick={onClose} className="text-white hover:text-gray-200">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Two Column Layout */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Column - Customer Information */}
                    <div className="w-1/3 border-r border-gray-200 overflow-y-auto bg-gray-50">
                        <div className="p-6 space-y-4">
                            {/* Thông tin cá nhân */}
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Thông tin cá nhân
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Mã khách hàng</label>
                                        <p className="text-sm text-gray-900 font-semibold">#{customer.maHanhKhach}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Họ và tên</label>
                                        <p className="text-sm text-gray-900 font-medium">{customer.hoVaTen || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                                        <p className="text-sm text-gray-900">{customer.email || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Số điện thoại</label>
                                        <p className="text-sm text-gray-900">{customer.soDienThoai || '-'}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Giới tính</label>
                                            <p className="text-sm text-gray-900">{customer.gioiTinh || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Ngày sinh</label>
                                            <p className="text-sm text-gray-900">{formatDate(customer.ngaySinh)}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Quốc gia</label>
                                        <p className="text-sm text-gray-900">{customer.quocGia || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Mã định danh</label>
                                        <p className="text-sm text-gray-900">{customer.maDinhDanh || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Địa chỉ</label>
                                        <p className="text-sm text-gray-900">{customer.diaChi || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Thông tin tài khoản */}
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Tài khoản
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Trạng thái</label>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <span className="w-2 h-2 mr-1 bg-green-600 rounded-full"></span>
                                            Hoạt động
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Flights List */}
                    <div className="flex-1 overflow-y-auto bg-white">
                        {/* Thống kê */}
                        {flights.length > 0 && (
                                <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg p-4 shadow-sm border border-blue-100">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        Thống kê
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="bg-white rounded-lg p-3">
                                            <p className="text-xs text-gray-500 mb-1">Tổng chuyến bay</p>
                                            <p className="text-2xl font-bold text-blue-600">{flights.length}</p>
                                        </div>
                                        <div className="bg-white rounded-lg p-3">
                                            <p className="text-xs text-gray-500 mb-1">Tổng chi tiêu</p>
                                            <p className="text-lg font-bold text-green-600">
                                                {formatCurrency(flights.reduce((sum, flight) => sum + (flight.tongTien || 0), 0))}
                                            </p>
                                        </div>
                                        <div className="bg-white rounded-lg p-3">
                                            <p className="text-xs text-gray-500 mb-1">Dịch vụ đã dùng</p>
                                            <p className="text-2xl font-bold text-purple-600">
                                                {flights.reduce((sum, flight) => sum + (flight.dichVuDaDat?.length || 0), 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        <div className="p-6">
                            <div className="mb-4">
                                <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    Chuyến bay đã tham gia
                                    {flights.length > 0 && (
                                        <span className="ml-2 text-sm font-normal text-gray-500">
                                            ({flights.length} chuyến)
                                        </span>
                                    )}
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">Nhấn vào chuyến bay để xem chi tiết dịch vụ</p>
                            </div>

                            {loadingFlights ? (
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                    <p className="mt-4 text-sm text-gray-600">Đang tải dữ liệu chuyến bay...</p>
                                </div>
                            ) : flights.length > 0 ? (
                                <div className="space-y-3">
                                    {flights.map((flight, index) => {
                                        const isSelected = selectedFlight === index;
                                        const tongTienDichVu = flight.dichVuDaDat?.reduce((sum, dv) => sum + (dv.donGia * dv.soLuong), 0) || 0;
                                        
                                        return (
                                            <div 
                                                key={index} 
                                                className={`border rounded-lg transition-all duration-200 ${
                                                    isSelected 
                                                        ? 'border-blue-500 shadow-lg bg-blue-50' 
                                                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md bg-white'
                                                }`}
                                            >
                                                {/* Flight Header - Clickable */}
                                                <div 
                                                    className="p-4 cursor-pointer"
                                                    onClick={() => handleFlightClick(flight, index)}
                                                >
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h5 className="text-lg font-semibold text-gray-900 flex items-center">
                                                                {flight.soHieuChuyenBay}
                                                                {isSelected && (
                                                                    <svg className="w-5 h-5 ml-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                    </svg>
                                                                )}
                                                            </h5>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Mã đặt chỗ: <span className="font-medium text-gray-700">#{flight.maDatCho}</span>
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold text-green-600">
                                                                {formatCurrency(flight.tongTien)}
                                                            </p>
                                                            <p className="text-xs text-gray-500">Tổng tiền</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                                        <div className="flex items-center space-x-2">
                                                            <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            <div>
                                                                <p className="text-xs text-gray-500">Từ</p>
                                                                <p className="font-medium text-gray-900">{flight.diemDi}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center space-x-2">
                                                            <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            <div>
                                                                <p className="text-xs text-gray-500">Đến</p>
                                                                <p className="font-medium text-gray-900">{flight.diemDen}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center space-x-2">
                                                            <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <div>
                                                                <p className="text-xs text-gray-500">Ngày bay</p>
                                                                <p className="font-medium text-gray-900">{formatDate(flight.ngayDi)}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center space-x-2">
                                                            <svg className="w-4 h-4 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                            </svg>
                                                            <div>
                                                                <p className="text-xs text-gray-500">Dịch vụ</p>
                                                                <p className="font-medium text-orange-600">
                                                                    {flight.dichVuDaDat?.length || 0} dịch vụ
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Expandable Services Section */}
                                                {isSelected && (
                                                    <div className="border-t border-blue-200 bg-white">
                                                        <div className="p-4">
                                                            <h6 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                                                                <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                                </svg>
                                                                Dịch vụ đã đặt
                                                                {flight.dichVuDaDat && flight.dichVuDaDat.length > 0 && (
                                                                    <span className="ml-auto text-xs font-normal text-gray-500">
                                                                        Tổng: {formatCurrency(tongTienDichVu)}
                                                                    </span>
                                                                )}
                                                            </h6>
                                                            
                                                            {flight.dichVuDaDat && flight.dichVuDaDat.length > 0 ? (
                                                                <div className="space-y-2">
                                                                    {flight.dichVuDaDat.map((dv, idx) => (
                                                                        <div 
                                                                            key={idx} 
                                                                            className="bg-linear-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                                                                        >
                                                                            <div className="flex justify-between items-start">
                                                                                <div className="flex-1">
                                                                                    <div className="flex items-start justify-between mb-2">
                                                                                        <p className="text-sm font-medium text-gray-900 flex-1">
                                                                                            {dv.tenLuaChon}
                                                                                        </p>
                                                                                        <span className="text-sm font-semibold text-orange-600 ml-3">
                                                                                            {formatCurrency(dv.donGia)}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="flex items-center justify-between text-xs">
                                                                                        <span className="text-gray-600 bg-white px-2 py-1 rounded">
                                                                                            Số lượng: {dv.soLuong}
                                                                                        </span>
                                                                                        {dv.soLuong > 1 && (
                                                                                            <span className="text-gray-700 font-medium">
                                                                                                = {formatCurrency(dv.donGia * dv.soLuong)}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="text-center py-6 text-gray-500">
                                                                    <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                                    </svg>
                                                                    <p className="text-sm">Không có dịch vụ nào</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    <h3 className="mt-4 text-lg font-medium text-gray-900">Không có chuyến bay</h3>
                                    <p className="mt-2 text-sm text-gray-500">Khách hàng chưa tham gia chuyến bay nào.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-4 border-t bg-gray-50">
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

export default ViewKhachHangModal;