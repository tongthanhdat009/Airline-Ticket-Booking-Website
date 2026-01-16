import React from 'react';
import { FaChair, FaWindowMaximize, FaDoorOpen } from 'react-icons/fa';
import { MdAirlineSeatReclineExtra } from 'react-icons/md';

const SeatGridDisplay = ({ 
    seats, 
    maxRow, 
    allColumns, 
    selectedSeats, 
    onSeatClick, 
    onSeatRightClick, 
    zoomLevel 
}) => {
    const getSeatIcon = (seat) => {
        if (seat.viTriGhe === 'CỬA SỔ') return <FaWindowMaximize className="text-xs" />;
        if (seat.viTriGhe === 'LỐI ĐI') return <MdAirlineSeatReclineExtra />;
        return <FaChair />;
    };

    const getSeatColor = (seat) => {
        const cabinName = seat.hangVe?.tenHangVe || 'default';
        const isExitRow = [1, 12, 13, 20, 21, 23, 24].includes(seat.hang);
        const isSelected = selectedSeats.some(s => s.maGhe === seat.maGhe);

        if (isSelected) return 'bg-green-100 border-green-500 ring-2 ring-green-400 text-green-600';
        if (isExitRow) return 'bg-red-50 border-red-400 text-red-500';
        if (cabinName.toLowerCase().includes('business')) return 'bg-blue-100 border-blue-400 text-blue-500';
        if (cabinName.toLowerCase().includes('premium')) return 'bg-yellow-100 border-yellow-400 text-yellow-600';
        return 'bg-gray-100 border-gray-300 text-gray-500';
    };

    return (
        <div 
            className="overflow-auto max-h-[calc(100vh-300px)] bg-gradient-to-b from-sky-50 to-white rounded-lg p-6 shadow-inner"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
        >
            <table className="border-collapse mx-auto">
                <thead>
                    <tr>
                        <th className="px-2 py-2"></th>
                        {allColumns.map(col => (
                            <th key={col} className="px-2 py-2 text-sm font-bold text-gray-700">{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: maxRow }, (_, i) => i + 1).map(row => {
                        const rowSeats = seats.filter(s => s.hang === row);
                        
                        return (
                            <tr key={row} className="border-b border-gray-200">
                                <td className="px-2 py-1 text-sm font-bold text-gray-600 text-right">{row}</td>
                                {allColumns.map(col => {
                                    const seat = rowSeats.find(s => s.cot === col);
                                    
                                    if (!seat) {
                                        return (
                                            <td key={col} className="px-2 py-1">
                                                <div className="w-12 h-12"></div>
                                            </td>
                                        );
                                    }

                                    return (
                                        <td key={col} className="px-2 py-1">
                                            <div
                                                className={`w-12 h-12 ${getSeatColor(seat)} border-2 rounded-lg flex items-center justify-center cursor-pointer hover:shadow-lg transition-all`}
                                                onClick={(e) => onSeatClick(seat, e)}
                                                onContextMenu={(e) => onSeatRightClick(seat, e)}
                                                title={`${seat.soGhe} - ${seat.hangVe?.tenHangVe || 'N/A'} | Chuột phải để menu`}
                                            >
                                                {getSeatIcon(seat)}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default SeatGridDisplay;
