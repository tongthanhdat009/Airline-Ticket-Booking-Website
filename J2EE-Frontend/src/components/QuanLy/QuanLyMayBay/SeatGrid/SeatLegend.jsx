import React from 'react';
import { FaWindowMaximize, FaDoorOpen, FaCrown, FaStar, FaChair } from 'react-icons/fa';
import { MdAirlineSeatReclineExtra, MdAirlineSeatReclineNormal, MdEventSeat } from 'react-icons/md';

const SeatLegend = () => {
    const legendItems = [
        {
            category: 'Hạng vé',
            items: [
                { 
                    icon: <FaCrown className="text-purple-600" />, 
                    label: 'First Class', 
                    bgClass: 'bg-gradient-to-br from-purple-100 to-violet-100 border-purple-300' 
                },
                { 
                    icon: <MdAirlineSeatReclineNormal className="text-blue-600" />, 
                    label: 'Business', 
                    bgClass: 'bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-300' 
                },
                { 
                    icon: <FaStar className="text-amber-600" />, 
                    label: 'Deluxe', 
                    bgClass: 'bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-300' 
                },
                { 
                    icon: <MdEventSeat className="text-green-600" />, 
                    label: 'Economy Saver', 
                    bgClass: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' 
                },
                { 
                    icon: <MdEventSeat className="text-gray-500" />, 
                    label: 'Economy', 
                    bgClass: 'bg-gradient-to-br from-gray-50 to-slate-100 border-gray-300' 
                },
            ]
        },
        {
            category: 'Trạng thái',
            items: [
                { 
                    icon: <MdEventSeat className="text-white" />, 
                    label: 'Đang chọn', 
                    bgClass: 'bg-gradient-to-br from-emerald-400 to-green-500 border-green-600 ring-2 ring-green-400' 
                },
                { 
                    icon: <FaDoorOpen className="text-red-500 text-xs" />, 
                    label: 'Lối thoát hiểm', 
                    bgClass: 'bg-gradient-to-br from-red-50 to-orange-50 border-red-300' 
                },
            ]
        }
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                    <MdEventSeat className="text-indigo-600" />
                </div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Chú thích sơ đồ ghế</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {legendItems.map((group, groupIdx) => (
                    <div key={groupIdx} className="space-y-3">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">
                            {group.category}
                        </h4>
                        <div className="flex flex-wrap gap-3">
                            {group.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 group">
                                    <div className={`w-9 h-9 ${item.bgClass} border-2 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all`}>
                                        {item.icon}
                                    </div>
                                    <span className="text-sm text-gray-600 font-medium">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Keyboard shortcuts */}
            <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Phím tắt</p>
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono text-gray-600">Click</kbd>
                        <span className="text-xs text-gray-500">Chọn ghế</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono text-gray-600">Double Click</kbd>
                        <span className="text-xs text-gray-500">Sửa ghế</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono text-gray-600">Ctrl</kbd>
                        <span className="text-xs text-gray-400">+</span>
                        <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono text-gray-600">Click</kbd>
                        <span className="text-xs text-gray-500">Chọn nhiều</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono text-gray-600">Shift</kbd>
                        <span className="text-xs text-gray-400">+</span>
                        <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono text-gray-600">Click</kbd>
                        <span className="text-xs text-gray-500">Chọn vùng</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono text-gray-600">Right Click</kbd>
                        <span className="text-xs text-gray-500">Menu ngữ cảnh</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatLegend;
