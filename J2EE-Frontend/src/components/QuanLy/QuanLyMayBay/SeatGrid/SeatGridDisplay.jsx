import React, { useMemo } from 'react';
import { FaChair, FaWindowMaximize, FaDoorOpen, FaCrown, FaStar } from 'react-icons/fa';
import { MdAirlineSeatReclineExtra, MdAirlineSeatReclineNormal, MdEventSeat } from 'react-icons/md';
import { COMMON_EXIT_ROWS } from '../../../../constants/aircraftConfig';

const SeatGridDisplay = ({
    seats,
    maxRow,
    selectedSeats,
    onSeatClick,
    onSeatRightClick
    // zoomLevel is now handled by parent component
}) => {
    // Group seats by cabin with their own columns
    const cabinGroups = useMemo(() => {
        const groups = [];
        const rowsByCabin = new Map();
        
        // Group rows by cabin (based on hangVe)
        for (let row = 1; row <= maxRow; row++) {
            const rowSeats = seats.filter(s => s.hang === row);
            if (rowSeats.length === 0) continue;
            
            const maHangVe = rowSeats[0]?.hangVe?.maHangVe || rowSeats[0]?.maHangVe || 1;
            const tenHangVe = rowSeats[0]?.hangVe?.tenHangVe || 'Economy';
            const key = `${maHangVe}-${tenHangVe}`;
            
            if (!rowsByCabin.has(key)) {
                rowsByCabin.set(key, {
                    maHangVe,
                    tenHangVe,
                    startRow: row,
                    endRow: row,
                    columns: new Set()
                });
            }
            
            const cabin = rowsByCabin.get(key);
            cabin.endRow = row;
            
            // Collect all unique columns for this cabin
            rowSeats.forEach(seat => cabin.columns.add(seat.cot));
        }
        
        // Convert to array and sort columns
        rowsByCabin.forEach((cabin) => {
            cabin.columns = Array.from(cabin.columns).sort();
            groups.push(cabin);
        });
        
        return groups;
    }, [seats, maxRow]);

    // Detect aisle positions for a specific set of columns
    const getAislePositions = (columns) => {
        if (columns.length <= 3) return [];
        if (columns.length === 6) return [2]; // After C for 3-3 layout
        if (columns.length === 9) return [2, 5]; // After C and F for 3-3-3 layout
        if (columns.length === 10) return [2, 6]; // After C and G for 3-4-3 layout
        return [Math.floor(columns.length / 2) - 1];
    };

    const getSeatIcon = (seat) => {
        // Use maHangVe to determine seat type (1=Economy, 2=Economy Saver, 3=Deluxe, 4=Business, 5=First)
        const maHangVe = seat.hangVe?.maHangVe || seat.maHangVe || 1;
        
        if (maHangVe === 5) return <FaCrown className="text-sm" />; // First Class
        if (maHangVe === 4) return <MdAirlineSeatReclineNormal className="text-base" />; // Business
        if (maHangVe === 3) return <FaStar className="text-sm" />; // Deluxe/Premium
        
        // For Economy and Economy Saver, use position-based icons
        if (seat.viTriGhe === 'WINDOW' || seat.viTriGhe === 'CỬA SỔ') return <FaWindowMaximize className="text-xs" />;
        if (seat.viTriGhe === 'AISLE' || seat.viTriGhe === 'LỐI ĐI') return <MdAirlineSeatReclineExtra className="text-sm" />;
        return <MdEventSeat className="text-sm" />;
    };

    const getSeatStyle = (seat) => {
        const maHangVe = seat.hangVe?.maHangVe || seat.maHangVe || 1;
        const isExitRow = COMMON_EXIT_ROWS.includes(seat.hang);
        const isSelected = selectedSeats.some(s => s.maGhe === seat.maGhe);

        // Selected state
        if (isSelected) {
            return {
                bg: 'bg-gradient-to-br from-emerald-400 to-green-500',
                border: 'border-green-600 ring-2 ring-green-400 ring-offset-1',
                text: 'text-white',
                shadow: 'shadow-lg shadow-green-300/50',
                scale: 'scale-110'
            };
        }

        // Exit row
        if (isExitRow) {
            return {
                bg: 'bg-gradient-to-br from-red-50 to-orange-50',
                border: 'border-red-300',
                text: 'text-red-500',
                shadow: '',
                scale: ''
            };
        }

        // First class (maHangVe = 5)
        if (maHangVe === 5) {
            return {
                bg: 'bg-gradient-to-br from-purple-100 to-violet-100',
                border: 'border-purple-300',
                text: 'text-purple-600',
                shadow: 'shadow-sm',
                scale: ''
            };
        }

        // Business class (maHangVe = 4)
        if (maHangVe === 4) {
            return {
                bg: 'bg-gradient-to-br from-blue-100 to-indigo-100',
                border: 'border-blue-300',
                text: 'text-blue-600',
                shadow: 'shadow-sm',
                scale: ''
            };
        }

        // Deluxe/Premium (maHangVe = 3)
        if (maHangVe === 3) {
            return {
                bg: 'bg-gradient-to-br from-amber-50 to-yellow-100',
                border: 'border-amber-300',
                text: 'text-amber-600',
                shadow: '',
                scale: ''
            };
        }

        // Economy Saver (maHangVe = 2)
        if (maHangVe === 2) {
            return {
                bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
                border: 'border-green-300',
                text: 'text-green-600',
                shadow: '',
                scale: ''
            };
        }

        // Economy (maHangVe = 1) - default
        return {
            bg: 'bg-gradient-to-br from-gray-50 to-slate-100',
            border: 'border-gray-300',
            text: 'text-gray-500',
            shadow: '',
            scale: ''
        };
    };

    const getCabinColor = (cabinName) => {
        const name = cabinName.toLowerCase();
        if (name.includes('business') || name.includes('thương gia')) return 'from-blue-500 to-indigo-600';
        if (name.includes('deluxe') || name.includes('premium') || name.includes('cao cấp')) return 'from-amber-500 to-orange-500';
        if (name.includes('first') || name.includes('hạng nhất')) return 'from-purple-500 to-violet-600';
        if (name.includes('saver') || name.includes('tiết kiệm')) return 'from-green-500 to-emerald-600';
        return 'from-gray-400 to-slate-500';
    };

    const renderAisle = (columnIndex, aislePositions) => {
        if (!aislePositions.includes(columnIndex)) return null;
        return (
            <td key={`aisle-${columnIndex}`} className="px-1">
                <div className="w-6 h-full flex items-center justify-center">
                    <div className="w-px h-10 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
                </div>
            </td>
        );
    };

    return (
        <div className="relative space-y-8">
            {cabinGroups.map((cabin, cabinIdx) => {
                const aislePositions = getAislePositions(cabin.columns);
                
                return (
                    <div key={cabinIdx} className="relative">
                        {/* Cabin indicator bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-3 z-10">
                            <div
                                className={`w-3 h-full bg-gradient-to-b ${getCabinColor(cabin.tenHangVe)} rounded-r shadow-sm`}
                                title={cabin.tenHangVe}
                            />
                        </div>

                        {/* Cabin header */}
                        <div className={`mb-3 pl-5 flex items-center gap-3 py-2 rounded-lg border-l-4`}>
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                                {cabin.tenHangVe}
                            </h3>
                            <span className="text-xs text-gray-500 font-medium">
                                Hàng {cabin.startRow} - {cabin.endRow} • {cabin.columns.length} cột
                            </span>
                        </div>

                        <div className="pl-5 overflow-auto max-h-[calc(100vh-350px)]">
                            <table className="border-collapse mx-auto">
                                <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                                    <tr>
                                        <th className="px-3 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            Hàng
                                        </th>
                                        {cabin.columns.map((col, idx) => (
                                            <React.Fragment key={col}>
                                                <th className="px-2 py-3">
                                                    <div className="w-12 h-8 flex items-center justify-center bg-gradient-to-br from-slate-100 to-gray-200 rounded-lg text-sm font-bold text-slate-700 shadow-sm">
                                                        {col}
                                                    </div>
                                                </th>
                                                {renderAisle(idx, aislePositions)}
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: cabin.endRow - cabin.startRow + 1 }, (_, i) => cabin.startRow + i).map(row => {
                                        const rowSeats = seats.filter(s => s.hang === row);
                                        const isExitRow = COMMON_EXIT_ROWS.includes(row);
                                        
                                        return (
                                            <tr key={row} className={`${isExitRow ? 'bg-red-50/30' : ''} hover:bg-gray-50/50 transition-colors`}>
                                                <td className="px-3 py-1.5">
                                                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${
                                                        isExitRow 
                                                            ? 'bg-red-100 text-red-600 border border-red-200' 
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {row}
                                                    </div>
                                                </td>
                                                {cabin.columns.map((col, colIdx) => {
                                                    const seat = rowSeats.find(s => s.cot === col);
                                                    
                                                    return (
                                                        <React.Fragment key={col}>
                                                            <td className="px-1.5 py-1.5">
                                                                {seat ? (
                                                                    <div
                                                                        className={`
                                                                            w-12 h-12 
                                                                            ${getSeatStyle(seat).bg}
                                                                            border-2 ${getSeatStyle(seat).border}
                                                                            ${getSeatStyle(seat).shadow}
                                                                            ${getSeatStyle(seat).scale}
                                                                            rounded-xl 
                                                                            flex flex-col items-center justify-center 
                                                                            cursor-pointer 
                                                                            hover:shadow-lg hover:scale-105 
                                                                            active:scale-95
                                                                            transition-all duration-150
                                                                            group
                                                                            relative
                                                                        `}
                                                                        onClick={(e) => onSeatClick(seat, e)}
                                                                        onContextMenu={(e) => onSeatRightClick(seat, e)}
                                                                        title={`${seat.soGhe} - ${seat.hangVe?.tenHangVe || 'N/A'} - ${seat.viTriGhe}\nChuột phải để xem menu`}
                                                                    >
                                                                        <span className={`${getSeatStyle(seat).text} transition-transform group-hover:scale-110`}>
                                                                            {getSeatIcon(seat)}
                                                                        </span>
                                                                        <span className={`text-[9px] font-semibold ${getSeatStyle(seat).text} mt-0.5 opacity-80`}>
                                                                            {seat.soGhe}
                                                                        </span>
                                                                        
                                                                        {/* Hover tooltip */}
                                                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-lg">
                                                                            {seat.hangVe?.tenHangVe || 'N/A'}
                                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-12 h-12 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 flex items-center justify-center">
                                                                        <span className="text-gray-300 text-xs">—</span>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            {renderAisle(colIdx, aislePositions)}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SeatGridDisplay;
