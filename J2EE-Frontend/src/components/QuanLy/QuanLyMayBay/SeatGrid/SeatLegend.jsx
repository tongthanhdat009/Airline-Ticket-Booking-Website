import React from 'react';
import { FaWindowMaximize, FaDoorOpen, FaCrown, FaStar, FaChair } from 'react-icons/fa';
import { MdAirlineSeatReclineExtra, MdAirlineSeatReclineNormal, MdEventSeat } from 'react-icons/md';

const SeatLegend = () => {
    const legendItems = [
        {
            icon: <FaCrown className="text-white text-xs" />,
            label: 'First Class',
            bgClass: 'bg-linear-to-br from-amber-500 to-orange-500 border-orange-500'
        },
        {
            icon: <MdAirlineSeatReclineNormal className="text-white text-xs" />,
            label: 'Business',
            bgClass: 'bg-linear-to-br from-blue-500 to-indigo-600 border-indigo-600'
        },
        {
            icon: <FaStar className="text-white text-xs" />,
            label: 'Deluxe',
            bgClass: 'bg-linear-to-br from-teal-500 to-emerald-600 border-teal-600'
        },
        {
            icon: <MdEventSeat className="text-white text-xs" />,
            label: 'Economy Saver',
            bgClass: 'bg-linear-to-br from-cyan-500 to-blue-600 border-blue-600'
        },
        {
            icon: <MdEventSeat className="text-slate-700 text-xs" />,
            label: 'Economy',
            bgClass: 'bg-linear-to-br from-slate-100 to-slate-200 border-slate-300'
        },
        {
            icon: <MdEventSeat className="text-white text-xs" />,
            label: 'Selected',
            bgClass: 'bg-linear-to-br from-yellow-400 to-amber-500 border-amber-500'
        },
        {
            icon: <FaDoorOpen className="text-white text-[10px]" />,
            label: 'Exit Row',
            bgClass: 'bg-linear-to-br from-rose-400 to-pink-500 border-rose-500'
        },
    ];

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
                <MdEventSeat className="text-indigo-600 text-lg" />
                <h3 className="text-sm font-bold text-gray-800">Chú thích</h3>
            </div>

            {/* Legend Items - Grid Layout */}
            <div className="grid grid-cols-2 gap-2">
                {legendItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 group">
                        <div className={`w-8 h-8 ${item.bgClass} border rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-105`}>
                            {item.icon}
                        </div>
                        <span className="text-[10px] text-gray-600 font-medium leading-tight">{item.label}</span>
                    </div>
                ))}
            </div>

            {/* Keyboard Shortcuts - Compact */}
            <div className="pt-3 border-t border-gray-200">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Phím tắt</p>
                <div className="space-y-1.5 text-[10px] text-gray-600">
                    <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-300 font-mono">Click</kbd>
                        <span>Chọn</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-300 font-mono">Double</kbd>
                        <span>Sửa</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-300 font-mono">Ctrl+</kbd>
                        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-300 font-mono">Click</kbd>
                        <span>Chọn nhiều</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-300 font-mono">Right</kbd>
                        <span>Menu</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatLegend;
