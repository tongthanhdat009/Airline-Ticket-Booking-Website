import React, { useState, useMemo } from 'react';
import { FaChair, FaWindowMaximize, FaDoorOpen, FaCrown, FaStar, FaPlane } from 'react-icons/fa';
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
    const [selectedCabin, setSelectedCabin] = useState('all');
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

        // Selected state - Elegant blue highlight
        if (isSelected) {
            return {
                bg: 'bg-sky-500',
                border: 'border-sky-600 ring-2 ring-sky-300',
                text: 'text-white',
                shadow: 'shadow-md',
                scale: 'scale-105',
                glow: ''
            };
        }

        // Exit row - Subtle orange indicator
        if (isExitRow) {
            return {
                bg: 'bg-orange-50',
                border: 'border-orange-300',
                text: 'text-orange-700',
                shadow: 'shadow-sm',
                scale: '',
                glow: ''
            };
        }

        // First class (maHangVe = 5) - Premium gold/amber
        if (maHangVe === 5) {
            return {
                bg: 'bg-amber-50',
                border: 'border-amber-400',
                text: 'text-amber-700',
                shadow: 'shadow-sm',
                scale: '',
                glow: ''
            };
        }

        // Business class (maHangVe = 4) - Professional slate blue
        if (maHangVe === 4) {
            return {
                bg: 'bg-slate-700',
                border: 'border-slate-800',
                text: 'text-white',
                shadow: 'shadow-sm',
                scale: '',
                glow: ''
            };
        }

        // Deluxe/Premium (maHangVe = 3) - Subtle teal
        if (maHangVe === 3) {
            return {
                bg: 'bg-emerald-50',
                border: 'border-emerald-400',
                text: 'text-emerald-700',
                shadow: 'shadow-sm',
                scale: '',
                glow: ''
            };
        }

        // Economy Saver (maHangVe = 2) - Light blue
        if (maHangVe === 2) {
            return {
                bg: 'bg-sky-50',
                border: 'border-sky-300',
                text: 'text-sky-700',
                shadow: 'shadow-sm',
                scale: '',
                glow: ''
            };
        }

        // Economy (maHangVe = 1) - Clean neutral gray
        return {
            bg: 'bg-gray-50',
            border: 'border-gray-200',
            text: 'text-gray-600',
            shadow: 'shadow-sm',
            scale: '',
            glow: ''
        };
    };

    const getCabinColor = (cabinName) => {
        const name = cabinName.toLowerCase();
        if (name.includes('business') || name.includes('thương gia')) return 'bg-slate-700';
        if (name.includes('deluxe') || name.includes('premium') || name.includes('cao cấp')) return 'bg-emerald-600';
        if (name.includes('first') || name.includes('hạng nhất')) return 'bg-amber-500';
        if (name.includes('saver') || name.includes('tiết kiệm')) return 'bg-sky-500';
        return 'bg-gray-500';
    };

    const renderAisle = (columnIndex, aislePositions) => {
        if (!aislePositions.includes(columnIndex)) return null;
        return (
            <td key={`aisle-${columnIndex}`} className="px-1">
                <div className="w-6 h-full flex items-center justify-center">
                    <div className="w-px h-10 bg-linear-to-b from-transparent via-gray-300 to-transparent"></div>
                </div>
            </td>
        );
    };

    // Filter cabins based on selection
    const filteredCabins = selectedCabin === 'all'
        ? cabinGroups
        : cabinGroups.filter(c => c.tenHangVe === selectedCabin);

    return (
        <div className="space-y-4">
            {/* Clean Cabin Filter Tabs */}
            {cabinGroups.length > 1 && (
                <div className="flex items-center gap-2 flex-wrap bg-white rounded-xl p-2 border border-gray-200 shadow-sm">
                    <button
                        onClick={() => setSelectedCabin('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            selectedCabin === 'all'
                                ? 'bg-slate-800 text-white'
                                : 'bg-transparent text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <span className="flex items-center gap-2">
                            <FaPlane className="text-xs" />
                            Tất cả
                        </span>
                    </button>
                    {cabinGroups.map((cabin) => (
                        <button
                            key={cabin.tenHangVe}
                            onClick={() => setSelectedCabin(cabin.tenHangVe)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                selectedCabin === cabin.tenHangVe
                                    ? `${getCabinColor(cabin.tenHangVe)} text-white`
                                    : 'bg-transparent text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {cabin.tenHangVe}
                        </button>
                    ))}
                </div>
            )}

            {/* Clean Seat Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {filteredCabins.length === 0 ? (
                    <div className="p-16 text-center">
                        <FaPlane className="text-gray-300 text-5xl mx-auto mb-4" />
                        <div className="text-gray-500 font-medium text-lg mb-1">Chưa có ghế</div>
                        <div className="text-gray-400 text-sm">Tạo cấu hình ghế đầu tiên của bạn</div>
                    </div>
                ) : (
                    filteredCabins.map((cabin, cabinIdx) => {
                        const aislePositions = getAislePositions(cabin.columns);

                        return (
                            <div key={cabinIdx} className="border-b border-gray-100 last:border-b-0">
                                {/* Clean Cabin Header */}
                                <div className={`${getCabinColor(cabin.tenHangVe)} px-6 py-4`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                                <FaPlane className="text-white text-sm" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold text-white">
                                                    {cabin.tenHangVe}
                                                </h3>
                                                <span className="text-xs text-white/80 flex items-center gap-2">
                                                    <span>Hàng {cabin.startRow}-{cabin.endRow}</span>
                                                    <span>•</span>
                                                    <span>{cabin.columns.length} cột</span>
                                                    <span>•</span>
                                                    <span>{(cabin.endRow - cabin.startRow + 1) * cabin.columns.length} ghế</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Clean Seat Table */}
                                <div className="p-4 overflow-auto max-h-[calc(100vh-350px)] bg-gray-50/50">
                                    <table className="border-collapse mx-auto">
                                        <thead className="sticky top-0 z-20">
                                            <tr>
                                                <th className="px-2 py-2">
                                                    <div className="w-9 h-9 flex items-center justify-center bg-slate-600 rounded-lg text-[10px] font-semibold text-white">
                                                        ROW
                                                    </div>
                                                </th>
                                                {cabin.columns.map((col, idx) => (
                                                    <React.Fragment key={col}>
                                                        <th className="px-1 py-2">
                                                            <div className="w-11 h-8 flex items-center justify-center bg-slate-500 rounded-lg text-xs font-semibold text-white">
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
                                                    <tr key={row} className={`${isExitRow ? 'bg-orange-50/50' : ''} hover:bg-gray-100/70 transition-colors duration-150`}>
                                                        <td className="px-2 py-1.5">
                                                            <div className={`flex items-center justify-center w-9 h-9 rounded-lg text-xs font-semibold transition-colors ${
                                                                isExitRow
                                                                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                                                    : 'bg-gray-200 text-gray-600'
                                                            }`}>
                                                                {row}
                                                            </div>
                                                        </td>
                                                        {cabin.columns.map((col, colIdx) => {
                                                            const seat = rowSeats.find(s => s.cot === col);

                                                            return (
                                                                <React.Fragment key={col}>
                                                                    <td className="px-1 py-1.5">
                                                                        {seat ? (
                                                                            <div
                                                                                className={`
                                                                                    relative w-11 h-11
                                                                                    ${getSeatStyle(seat).bg}
                                                                                    border ${getSeatStyle(seat).border}
                                                                                    ${getSeatStyle(seat).shadow}
                                                                                    ${getSeatStyle(seat).scale}
                                                                                    rounded-lg
                                                                                    flex flex-col items-center justify-center
                                                                                    cursor-pointer
                                                                                    hover:shadow-md hover:scale-105
                                                                                    active:scale-95
                                                                                    transition-all duration-200
                                                                                    group
                                                                                `}
                                                                                onClick={(e) => onSeatClick(seat, e)}
                                                                                onContextMenu={(e) => onSeatRightClick(seat, e)}
                                                                                title={`${seat.soGhe} - ${seat.hangVe?.tenHangVe || 'N/A'}`}
                                                                            >
                                                                                <span className={`${getSeatStyle(seat).text} text-sm`}>
                                                                                    {getSeatIcon(seat)}
                                                                                </span>
                                                                                <span className={`text-[9px] font-semibold ${getSeatStyle(seat).text} mt-0.5`}>
                                                                                    {seat.soGhe}
                                                                                </span>

                                                                                {/* Clean tooltip */}
                                                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30 shadow-lg">
                                                                                    {seat.hangVe?.tenHangVe || 'N/A'}
                                                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="w-11 h-11 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
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
                    })
                )}
            </div>
        </div>
    );
};

export default SeatGridDisplay;
