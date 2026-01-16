import React from 'react';
import { FaChair, FaWindowMaximize, FaDoorOpen } from 'react-icons/fa';
import { MdAirlineSeatReclineExtra } from 'react-icons/md';

const SeatLegend = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap items-center gap-6">
                <span className="text-sm font-semibold text-gray-700">Chú thích:</span>

                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center">
                        <FaChair className="text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-600">Trống</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 border-2 border-green-500 rounded-lg flex items-center justify-center ring-2 ring-green-400">
                        <FaChair className="text-green-600" />
                    </div>
                    <span className="text-sm text-gray-600">Đang chọn</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 border-2 border-blue-400 rounded-lg flex items-center justify-center">
                        <FaWindowMaximize className="text-blue-500 text-xs" />
                    </div>
                    <span className="text-sm text-gray-600">Cửa sổ</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-50 border-2 border-green-400 rounded-lg flex items-center justify-center">
                        <MdAirlineSeatReclineExtra className="text-green-500" />
                    </div>
                    <span className="text-sm text-gray-600">Lối đi</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-50 border-2 border-red-400 rounded-lg flex items-center justify-center">
                        <FaDoorOpen className="text-red-500 text-xs" />
                    </div>
                    <span className="text-sm text-gray-600">Cửa thoát hiểm</span>
                </div>
            </div>
        </div>
    );
};

export default SeatLegend;
