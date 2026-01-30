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

        // Selected state - Glowing gold
        if (isSelected) {
            return {
                bg: 'bg-linear-to-br from-yellow-400 to-amber-500',
                border: 'border-amber-500',
                text: 'text-white',
                shadow: 'shadow-xl shadow-amber-400/60',
                scale: 'scale-110',
                glow: 'before:content-[""] before:absolute before:inset-0 before:bg-linear-to-br before:from-yellow-400/50 before:to-amber-500/50 before:blur-xl before:rounded-xl before:-z-10'
            };
        }

        // Exit row - Rose gradient
        if (isExitRow) {
            return {
                bg: 'bg-linear-to-br from-rose-400 to-pink-500',
                border: 'border-rose-500',
                text: 'text-white',
                shadow: 'shadow-lg shadow-rose-400/50',
                scale: '',
                glow: ''
            };
        }

        // First class (maHangVe = 5) - Amber/Gold
        if (maHangVe === 5) {
            return {
                bg: 'bg-linear-to-br from-amber-500 to-orange-500',
                border: 'border-orange-500',
                text: 'text-white',
                shadow: 'shadow-lg shadow-orange-400/40',
                scale: '',
                glow: ''
            };
        }

        // Business class (maHangVe = 4) - Blue/Indigo
        if (maHangVe === 4) {
            return {
                bg: 'bg-linear-to-br from-blue-500 to-indigo-600',
                border: 'border-indigo-600',
                text: 'text-white',
                shadow: 'shadow-lg shadow-indigo-400/40',
                scale: '',
                glow: ''
            };
        }

        // Deluxe/Premium (maHangVe = 3) - Teal/Emerald
        if (maHangVe === 3) {
            return {
                bg: 'bg-linear-to-br from-teal-500 to-emerald-600',
                border: 'border-teal-600',
                text: 'text-white',
                shadow: 'shadow-lg shadow-teal-400/40',
                scale: '',
                glow: ''
            };
        }

        // Economy Saver (maHangVe = 2) - Cyan/Blue
        if (maHangVe === 2) {
            return {
                bg: 'bg-linear-to-br from-cyan-500 to-blue-600',
                border: 'border-blue-600',
                text: 'text-white',
                shadow: 'shadow-md shadow-blue-400/40',
                scale: '',
                glow: ''
            };
        }

        // Economy (maHangVe = 1) - Light gray
        return {
            bg: 'bg-linear-to-br from-slate-100 to-slate-200',
            border: 'border-slate-300',
            text: 'text-slate-700',
            shadow: 'shadow-sm',
            scale: '',
            glow: ''
        };
    };

    const getCabinColor = (cabinName) => {
        const name = cabinName.toLowerCase();
        if (name.includes('business') || name.includes('thương gia')) return 'from-blue-500 to-indigo-600';
        if (name.includes('deluxe') || name.includes('premium') || name.includes('cao cấp')) return 'from-teal-500 to-emerald-600';
        if (name.includes('first') || name.includes('hạng nhất')) return 'from-amber-500 to-orange-500';
        if (name.includes('saver') || name.includes('tiết kiệm')) return 'from-cyan-500 to-blue-600';
        return 'from-slate-300 to-slate-400';
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
        <div className="space-y-6">
            {/* Animated Cabin Filter Tabs */}
            {cabinGroups.length > 1 && (
                <div className="relative">
                    {/* Glow effect behind tabs */}
                    <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl rounded-3xl"></div>

                    <div className="relative flex items-center gap-3 flex-wrap bg-white/80 backdrop-blur-xl rounded-3xl p-3 border border-white/50 shadow-2xl">
                        <button
                            onClick={() => setSelectedCabin('all')}
                            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 relative overflow-hidden group ${
                                selectedCabin === 'all'
                                    ? 'bg-linear-to-r from-violet-600 to-indigo-600 text-white shadow-xl shadow-indigo-500/50 scale-105'
                                    : 'bg-white text-slate-600 hover:bg-slate-50 hover:shadow-lg'
                            }`}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <span className="text-lg">✈️</span>
                                All Cabins
                            </span>
                            {selectedCabin === 'all' && (
                                <div className="absolute inset-0 bg-linear-to-r from-violet-600/50 to-indigo-600/50 animate-pulse"></div>
                            )}
                        </button>
                        {cabinGroups.map((cabin) => (
                            <button
                                key={cabin.tenHangVe}
                                onClick={() => setSelectedCabin(cabin.tenHangVe)}
                                className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 relative overflow-hidden ${
                                    selectedCabin === cabin.tenHangVe
                                        ? `bg-linear-to-r ${getCabinColor(cabin.tenHangVe)} text-white shadow-xl scale-105`
                                        : 'bg-white text-slate-600 hover:bg-slate-50 hover:shadow-lg'
                                }`}
                            >
                                <span className="relative z-10">{cabin.tenHangVe}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Stunning Seat Grid with 3D Effects */}
            <div className="relative">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl animate-gradient-xy"></div>
                <div className="absolute inset-0 bg-linear-to-br from-blue-100/50 via-purple-100/50 to-pink-100/50 rounded-3xl blur-3xl opacity-40"></div>

                <div className="relative bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden">
                    {filteredCabins.length === 0 ? (
                        <div className="p-20 text-center">
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-500 blur-2xl opacity-50 animate-pulse"></div>
                                <div className="relative text-8xl mb-6">✈️</div>
                            </div>
                            <div className="text-slate-600 font-bold text-xl mb-2">No seats available</div>
                            <div className="text-slate-400">Create your first seat configuration</div>
                        </div>
                    ) : (
                        filteredCabins.map((cabin, cabinIdx) => {
                            const aislePositions = getAislePositions(cabin.columns);

                            return (
                                <div key={cabinIdx} className={`border-b border-slate-100/50 last:border-b-0 relative overflow-hidden`}>
                                    {/* Animated background pattern for cabin */}
                                    <div className="absolute inset-0 opacity-5">
                                        <div className="absolute inset-0" style={{
                                            backgroundImage: 'radial-gradient(circle at 2px 2px, slate-900 1px, transparent 0)',
                                            backgroundSize: '24px 24px'
                                        }}></div>
                                    </div>

                                    {/* Stunning Cabin Header */}
                                    <div className={`relative bg-linear-to-r ${getCabinColor(cabin.tenHangVe)} px-8 py-5 overflow-hidden`}>
                                        {/* Animated wave overlay */}
                                        <div className="absolute inset-0 opacity-20">
                                            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] animate-shimmer"></div>
                                        </div>

                                        <div className="relative flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                {/* Animated icon container */}
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl animate-pulse"></div>
                                                    <div className="relative w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl border-2 border-white/30">
                                                        {cabin.tenHangVe.toLowerCase().includes('first') ? '👑' :
                                                         cabin.tenHangVe.toLowerCase().includes('business') ? '💎' :
                                                         cabin.tenHangVe.toLowerCase().includes('deluxe') ? '⭐' : '✈️'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-white tracking-tight drop-shadow-lg">
                                                        {cabin.tenHangVe}
                                                    </h3>
                                                    <span className="text-sm text-white/90 font-semibold flex items-center gap-3">
                                                        <span>Rows {cabin.startRow}-{cabin.endRow}</span>
                                                        <span className="w-1 h-1 bg-white/60 rounded-full"></span>
                                                        <span>{cabin.columns.length} columns</span>
                                                        <span className="w-1 h-1 bg-white/60 rounded-full"></span>
                                                        <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                                                            {(cabin.endRow - cabin.startRow + 1) * cabin.columns.length} seats
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Premium Seat Table */}
                                    <div className="p-6 overflow-auto max-h-[calc(100vh-350px)] bg-linear-to-br from-slate-50/50 to-white/50">
                                        <table className="border-collapse mx-auto">
                                            <thead className="sticky top-0 z-20">
                                                <tr>
                                                    <th className="px-3 py-3">
                                                        <div className="w-10 h-10 flex items-center justify-center bg-linear-to-br from-slate-700 to-slate-900 rounded-xl text-[10px] font-black text-white shadow-lg">
                                                            ROW
                                                        </div>
                                                    </th>
                                                    {cabin.columns.map((col, idx) => (
                                                        <React.Fragment key={col}>
                                                            <th className="px-2 py-3">
                                                                <div className="w-12 h-9 flex items-center justify-center bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl text-xs font-black text-white shadow-lg border-2 border-white/30">
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
                                                        <tr key={row} className={`${isExitRow ? 'bg-rose-500/10' : ''} hover:bg-slate-100/50 transition-all duration-200`}>
                                                            <td className="px-3 py-2">
                                                                <div className={`flex items-center justify-center w-10 h-10 rounded-xl text-xs font-black transition-all duration-200 ${
                                                                    isExitRow
                                                                        ? 'bg-linear-to-br from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-400/40'
                                                                        : 'bg-linear-to-br from-slate-200 to-slate-300 text-slate-700 shadow-md'
                                                                }`}>
                                                                    {row}
                                                                </div>
                                                            </td>
                                                            {cabin.columns.map((col, colIdx) => {
                                                                const seat = rowSeats.find(s => s.cot === col);

                                                                return (
                                                                    <React.Fragment key={col}>
                                                                        <td className="px-1.5 py-2">
                                                                            {seat ? (
                                                                                <div
                                                                                    className={`
                                                                                        relative w-12 h-12
                                                                                        ${getSeatStyle(seat).bg}
                                                                                        border-2 ${getSeatStyle(seat).border}
                                                                                        ${getSeatStyle(seat).shadow}
                                                                                        ${getSeatStyle(seat).scale}
                                                                                        ${getSeatStyle(seat).glow}
                                                                                        rounded-2xl
                                                                                        flex flex-col items-center justify-center
                                                                                        cursor-pointer
                                                                                        hover:shadow-2xl hover:scale-110 hover:-translate-y-1
                                                                                        active:scale-95
                                                                                        transition-all duration-300
                                                                                        group
                                                                                        overflow-visible
                                                                                    `}
                                                                                    onClick={(e) => onSeatClick(seat, e)}
                                                                                    onContextMenu={(e) => onSeatRightClick(seat, e)}
                                                                                    title={`${seat.soGhe} - ${seat.hangVe?.tenHangVe || 'N/A'}`}
                                                                                >
                                                                                    {/* Inner glow effect */}
                                                                                    <div className="absolute inset-1 bg-linear-to-br from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                                                                    <span className={`relative z-10 ${getSeatStyle(seat).text} text-sm transition-transform duration-300 drop-shadow-md group-hover:scale-110`}>
                                                                                        {getSeatIcon(seat)}
                                                                                    </span>
                                                                                    <span className={`relative z-10 text-[9px] font-black ${getSeatStyle(seat).text} mt-0.5 drop-shadow-md`}>
                                                                                        {seat.soGhe}
                                                                                    </span>

                                                                                    {/* Premium tooltip */}
                                                                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-linear-to-r from-slate-900 to-slate-800 text-white text-xs px-4 py-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-30 shadow-2xl font-semibold border border-white/10">
                                                                                        {seat.hangVe?.tenHangVe || 'N/A'}
                                                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-6 border-transparent border-t-slate-800"></div>
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-100/50 flex items-center justify-center">
                                                                                    <span className="text-slate-300 text-sm font-light">—</span>
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
        </div>
    );
};

export default SeatGridDisplay;
