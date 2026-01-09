import React, { useState, useEffect } from 'react';
import { FaPlane, FaMoneyBillWave, FaCalendarAlt, FaEdit, FaTrash, FaPlus, FaChevronDown, FaChevronUp, FaSyncAlt } from 'react-icons/fa';

const ViewPriceDetailModal = ({ 
    selectedRoute, 
    isOpen, 
    onClose, 
    onEdit, 
    onDelete, 
    onAddNew,
    onRefresh,
    formatCurrency, 
    formatDate 
}) => {
    const [expandedClassId, setExpandedClassId] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setExpandedClassId(null);
        }
    }, [isOpen]);

    if (!isOpen || !selectedRoute) return null;

    const toggleClassExpansion = (classId) => {
        setExpandedClassId(prev => prev === classId ? null : classId);
    };

    const groupPricesByClass = (prices) => {
        const grouped = {};
        
        console.log('ViewPriceDetailModal - groupPricesByClass input prices:', prices);
        
        prices.forEach(price => {
            const classId = price.hangVe?.maHangVe;
            if (!classId) return;
            
            if (!grouped[classId]) {
                grouped[classId] = {
                    maHangVe: classId,
                    tenHangVe: price.hangVe?.tenHangVe,
                    prices: [],
                    totalPrice: 0,
                    count: 0
                };
            }
            
            grouped[classId].prices.push(price);
            grouped[classId].totalPrice += parseFloat(price.giaVe);
            grouped[classId].count += 1;
        });
        
        Object.keys(grouped).forEach(classId => {
            grouped[classId].avgPrice = grouped[classId].totalPrice / grouped[classId].count;
        });
        
        const result = Object.values(grouped);
        console.log('ViewPriceDetailModal - groupPricesByClass result:', result);
        return result;
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await onRefresh();
        setTimeout(() => setIsRefreshing(false), 500);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 ">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center z-10">
                    <h3 className="text-xl font-bold">Chi tiết giá chuyến bay</h3>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleRefresh}
                            className="text-white hover:bg-blue-500 p-2 rounded-lg transition-colors"
                            title="Refresh dữ liệu"
                        >
                            <FaSyncAlt className={`${isRefreshing ? 'animate-spin' : ''}`} size={18} />
                        </button>
                        <button onClick={onClose} className="text-white hover:text-gray-200">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Thông tin tuyến bay */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FaPlane className="text-blue-600" />
                                Thông tin tuyến bay
                            </h4>
                            
                            <div className="space-y-4">
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <div className="text-xs text-gray-500 mb-1">Sân bay đi</div>
                                    <div className="font-bold text-lg text-gray-900">{selectedRoute.tuyenBay?.sanBayDi?.tenSanBay}</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        <span className="font-semibold">{selectedRoute.tuyenBay?.sanBayDi?.maIATA}</span> • {selectedRoute.tuyenBay?.sanBayDi?.thanhPhoSanBay}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">{selectedRoute.tuyenBay?.sanBayDi?.quocGiaSanBay}</div>
                                </div>
                                
                                <div className="flex justify-center">
                                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </div>
                                </div>
                                
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <div className="text-xs text-gray-500 mb-1">Sân bay đến</div>
                                    <div className="font-bold text-lg text-gray-900">{selectedRoute.tuyenBay?.sanBayDen?.tenSanBay}</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        <span className="font-semibold">{selectedRoute.tuyenBay?.sanBayDen?.maIATA}</span> • {selectedRoute.tuyenBay?.sanBayDen?.thanhPhoSanBay}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">{selectedRoute.tuyenBay?.sanBayDen?.quocGiaSanBay}</div>
                                </div>
                                
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                                    <div className="text-sm text-gray-600 mb-2">Giá vé trung bình</div>
                                    <div className="text-2xl font-bold text-green-600">{formatCurrency(selectedRoute.avgPrice)}</div>
                                    <div className="text-xs text-gray-500 mt-1">{selectedRoute.count} mức giá khác nhau</div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Danh sách giá theo hạng vé */}
                        <div className="h-100% bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <FaMoneyBillWave className="text-green-600" />
                                    Giá theo hạng vé và thời gian
                                </h4>
                                <button 
                                    onClick={onAddNew}
                                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg text-sm font-semibold"
                                >
                                    <FaPlus size={14} />
                                    <span>Thêm giá</span>
                                </button>
                            </div>
                            
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                {selectedRoute.prices.length > 0 ? (
                                    groupPricesByClass(selectedRoute.prices).map((ticketClass) => (
                                        <div key={ticketClass.maHangVe} className="bg-white rounded-lg p-4 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                                            <div className="flex justify-between items-center mb-3 cursor-pointer" onClick={() => toggleClassExpansion(ticketClass.maHangVe)}>
                                                <div>
                                                    <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                                                        {ticketClass.tenHangVe}
                                                    </span>
                                                    <span className="ml-2 text-xs text-gray-500">({ticketClass.count} mức giá)</span>
                                                </div>
                                                <div className="text-right flex items-center gap-2">
                                                    <span className="text-sm font-bold text-green-600">{formatCurrency(ticketClass.avgPrice)}</span>
                                                    {expandedClassId === ticketClass.maHangVe ? <FaChevronUp /> : <FaChevronDown />}
                                                </div>
                                            </div>
                                            
                                            {expandedClassId === ticketClass.maHangVe && (
                                                <div className="space-y-3 mt-3 pt-3 border-t border-gray-200">
                                                    {ticketClass.prices.map((price) => (
                                                        <div key={price.maGia} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="text-xs text-gray-500">Mã giá: <span className="font-semibold text-blue-600">#{price.maGia}</span></div>
                                                                <div className="text-xl font-bold text-green-600">{formatCurrency(price.giaVe)}</div>
                                                            </div>
                                                            
                                                            <div className="space-y-1 text-xs mb-3">
                                                                <div className="flex items-center gap-2 text-gray-600">
                                                                    <FaCalendarAlt className="text-blue-500" size={10} />
                                                                    <span className="font-medium">Từ:</span>
                                                                    <span>{formatDate(price.ngayApDungTu)}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-gray-600">
                                                                    <FaCalendarAlt className="text-red-500" size={10} />
                                                                    <span className="font-medium">Đến:</span>
                                                                    <span>{formatDate(price.ngayApDungDen)}</span>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex gap-2">
                                                                <button 
                                                                    onClick={() => onEdit(price)}
                                                                    className="flex-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                                                                >
                                                                    <FaEdit className="inline mr-1" size={10} /> Sửa
                                                                </button>
                                                                <button 
                                                                    onClick={() => onDelete(price.maGia)}
                                                                    className="flex-1 px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                                                                >
                                                                    <FaTrash className="inline mr-1" size={10} /> Xóa
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 px-4">
                                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                            <FaMoneyBillWave className="text-gray-400 text-3xl" />
                                        </div>
                                        <p className="text-gray-500 font-medium text-center mb-2">Chưa có giá cho tuyến bay này</p>
                                        <p className="text-gray-400 text-sm text-center">Click nút "Thêm giá" để thêm mức giá mới</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewPriceDetailModal;