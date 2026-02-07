import React, { useState, useEffect } from 'react';
import { getChuyenBayByKhachHangId } from '../../../services/QLKhachHangService';

const ThongTinChuyenBay = ({ customer }) => {
    const [flights, setFlights] = useState([]);
    const [loadingFlights, setLoadingFlights] = useState(false);
    const [selectedFlightIndex, setSelectedFlightIndex] = useState(null);
    const [statistics, setStatistics] = useState({
        tongChuyenBay: 0,
        tongChiTieu: 0,
        tongDichVu: 0
    });

    useEffect(() => {
        if (customer) {
            fetchFlights();
        }
    }, [customer]);

    const fetchFlights = async () => {
        if (!customer) return;
        try {
            setLoadingFlights(true);
            const response = await getChuyenBayByKhachHangId(customer.maHanhKhach);
            const flightData = response.data || [];
            setFlights(flightData);

            // Calculate statistics
            const tongChiTieu = flightData.reduce((sum, flight) => sum + (flight.tongTien || 0), 0);
            const tongDichVu = flightData.reduce((sum, flight) => sum + (flight.dichVuDaDat?.length || 0), 0);

            setStatistics({
                tongChuyenBay: flightData.length,
                tongChiTieu,
                tongDichVu
            });
        } catch (error) {
            console.error('Error fetching flights:', error);
            setFlights([]);
        } finally {
            setLoadingFlights(false);
        }
    };

    const handleFlightClick = (index) => {
        setSelectedFlightIndex(selectedFlightIndex === index ? null : index);
    };

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

    if (loadingFlights) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-sm text-gray-600">Đang tải dữ liệu chuyến bay...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Statistics Section */}
            {flights.length > 0 && (
                <div className="[background:linear-gradient(to_bottom_right,rgb(239,246,255),rgb(238,242,255))] rounded-lg p-4 shadow-sm border border-blue-100 mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Thống kê
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-white rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Tổng chuyến bay</p>
                            <p className="text-2xl font-bold text-blue-600">{statistics.tongChuyenBay}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Tổng chi tiêu</p>
                            <p className="text-lg font-bold text-green-600">
                                {formatCurrency(statistics.tongChiTieu)}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Dịch vụ đã dùng</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {statistics.tongDichVu}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Flights List */}
            <div>
                <h4 className="text-lg font-semibold text-gray-800 flex items-center mb-2">
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
                <p className="text-sm text-gray-500 mb-4">Nhấn vào chuyến bay để xem chi tiết dịch vụ</p>

                {flights.length > 0 ? (
                    <div className="space-y-3">
                        {flights.map((flight, index) => {
                            const isSelected = selectedFlightIndex === index;
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
                                        onClick={() => handleFlightClick(index)}
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
                                                                className="[background:linear-gradient(to_right,rgb(255,247,237),rgb(254,252,232))] border border-orange-200 rounded-lg p-3 hover:shadow-md transition-shadow"
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
    );
};

export default ThongTinChuyenBay;
