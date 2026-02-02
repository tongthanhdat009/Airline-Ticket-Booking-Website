import React from 'react';
import { FaCrown, FaStar, FaDoorOpen } from 'react-icons/fa';
import { MdAirlineSeatReclineNormal, MdEventSeat } from 'react-icons/md';

const SeatLegend = () => {
    const legendItems = [
        {
            icon: <FaCrown className="text-amber-700 text-xs" />,
            label: 'First Class',
            bgClass: 'bg-amber-50 border-amber-400'
        },
        {
            icon: <MdAirlineSeatReclineNormal className="text-white text-xs" />,
            label: 'Business',
            bgClass: 'bg-slate-700 border-slate-800'
        },
        {
            icon: <FaStar className="text-emerald-700 text-xs" />,
            label: 'Deluxe',
            bgClass: 'bg-emerald-50 border-emerald-400'
        },
        {
            icon: <MdEventSeat className="text-sky-700 text-xs" />,
            label: 'Economy Saver',
            bgClass: 'bg-sky-50 border-sky-300'
        },
        {
            icon: <MdEventSeat className="text-gray-600 text-xs" />,
            label: 'Economy',
            bgClass: 'bg-gray-50 border-gray-200'
        },
        {
            icon: <MdEventSeat className="text-white text-xs" />,
            label: 'Đã chọn',
            bgClass: 'bg-sky-500 border-sky-600'
        },
        {
            icon: <FaDoorOpen className="text-orange-700 text-[10px]" />,
            label: 'Hàng thoát hiểm',
            bgClass: 'bg-orange-50 border-orange-300'
        },
    ];

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
                <MdEventSeat className="text-slate-600 text-base" />
                <h3 className="text-sm font-semibold text-gray-700">Chú thích</h3>
            </div>

            {/* Legend Items - Grid Layout */}
            <div className="grid grid-cols-2 gap-2">
                {legendItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <div className={`w-7 h-7 ${item.bgClass} border rounded-md flex items-center justify-center shrink-0`}>
                            {item.icon}
                        </div>
                        <span className="text-[10px] text-gray-600 font-medium leading-tight">{item.label}</span>
                    </div>
                ))}
            </div>

            {/* Keyboard Shortcuts - Compact */}
            <div className="pt-3 border-t border-gray-100">
                <p className="text-[10px] font-semibold text-gray-500 uppercase mb-2 tracking-wide">Phím tắt</p>
                <div className="space-y-1.5 text-[10px] text-gray-500">
                    <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-gray-50 rounded border border-gray-200 font-mono text-gray-600">Click</kbd>
                        <span>Chọn</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-gray-50 rounded border border-gray-200 font-mono text-gray-600">Double</kbd>
                        <span>Sửa</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-gray-50 rounded border border-gray-200 font-mono text-gray-600">Ctrl+</kbd>
                        <kbd className="px-1.5 py-0.5 bg-gray-50 rounded border border-gray-200 font-mono text-gray-600">Click</kbd>
                        <span>Chọn nhiều</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-gray-50 rounded border border-gray-200 font-mono text-gray-600">Right</kbd>
                        <span>Menu</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatLegend;
