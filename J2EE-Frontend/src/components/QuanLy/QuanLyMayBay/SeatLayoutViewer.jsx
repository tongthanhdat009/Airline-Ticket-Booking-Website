import React, { useState, useEffect } from 'react';
import { FaChair, FaTimes, FaSync, FaPlane, FaWindowMaximize, FaWalking, FaUser } from 'react-icons/fa';

const SeatLayoutViewer = ({ maMayBay, onClose }) => {
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [groupByClass, setGroupByClass] = useState(true);
    const [hoveredSeat, setHoveredSeat] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    const loadSeats = async () => {
        try {
            setLoading(true);
            // Import service dynamically to avoid circular dependency
            const { getSeatsByAircraft } = await import('../../../services/SoDoGheService');
            const response = await getSeatsByAircraft(maMayBay);

            // Service đã return response.data, nên response chính là data
            const seatsData = Array.isArray(response) ? response : (response?.data || []);
            console.log('Raw response:', response);
            console.log('Seats data:', seatsData);
            console.log('Number of seats:', seatsData.length);

            // Log các hạng vé khác nhau
            const uniqueClasses = [...new Set(seatsData.map(s => s.hangVe?.tenHangVe).filter(Boolean))];
            console.log('Unique seat classes:', uniqueClasses);

            setSeats(seatsData);
        } catch (error) {
            console.error('Lỗi khi tải sơ đồ ghế:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSeats();
    }, [maMayBay]);

    // Group seats by class (hangVe)
    const groupSeatsByClass = (seatList) => {
        const grouped = {};
        seatList.forEach(seat => {
            const className = seat.hangVe?.tenHangVe || 'Chưa phân loại';
            if (!grouped[className]) {
                grouped[className] = [];
            }
            grouped[className].push(seat);
        });

        console.log('Grouped seats:', grouped);
        console.log('Number of classes:', Object.keys(grouped).length);
        console.log('Class names:', Object.keys(grouped));

        return grouped;
    };

    // Get seat color and icon based on position
    const getSeatStyle = (viTriGhe) => {
        switch (viTriGhe) {
            case 'CỬA SỜ': return {
                bg: 'bg-blue-500',
                bgHover: 'hover:bg-blue-600',
                border: 'border-blue-700',
                text: 'text-white',
                icon: <FaWindowMaximize className="text-sm" />,
                label: 'Cửa sổ'
            };
            case 'LỐI ĐI': return {
                bg: 'bg-green-500',
                bgHover: 'hover:bg-green-600',
                border: 'border-green-700',
                text: 'text-white',
                icon: <FaWalking className="text-sm" />,
                label: 'Lối đi'
            };
            case 'GIỮA': return {
                bg: 'bg-gray-500',
                bgHover: 'hover:bg-gray-600',
                border: 'border-gray-700',
                text: 'text-white',
                icon: <FaUser className="text-sm" />,
                label: 'Giữa'
            };
            default: return {
                bg: 'bg-gray-300',
                bgHover: 'hover:bg-gray-400',
                border: 'border-gray-400',
                text: 'text-gray-700',
                icon: <FaChair className="text-sm" />,
                label: 'Khác'
            };
        }
    };

    const handleMouseEnter = (seat, event) => {
        setHoveredSeat(seat);
        setTooltipPosition({
            x: event.clientX,
            y: event.clientY
        });
    };

    const handleMouseLeave = () => {
        setHoveredSeat(null);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl p-8">
                    <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
                        <span className="ml-4 text-gray-700">Đang tải sơ đồ ghế...</span>
                    </div>
                </div>
            </div>
        );
    }

    const groupedSeats = groupSeatsByClass(seats);

    console.log('State - groupByClass:', groupByClass);
    console.log('State - groupedSeats keys:', Object.keys(groupedSeats));

    return (
        <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-sky-600 to-blue-700 text-white p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <FaPlane className="text-sky-200" />
                            Sơ đồ ghế máy bay
                        </h2>
                        <p className="text-sky-100 text-sm mt-1">Mã máy bay: #{maMayBay} | Tổng số ghế: {seats.length}</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                        <FaTimes size={24} />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="bg-gray-50 border-b border-gray-200 p-4">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={groupByClass}
                                    onChange={(e) => setGroupByClass(e.target.checked)}
                                    className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Nhóm theo hạng vé</span>
                            </label>
                            <button
                                onClick={loadSeats}
                                className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm font-medium"
                            >
                                <FaSync />
                                Làm mới
                            </button>
                        </div>

                        {/* Legend */}
                        <div className="flex gap-6 text-xs">
                            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                                <div className="w-8 h-8 bg-blue-500 border-2 border-blue-600 rounded flex items-center justify-center">
                                    <FaWindowMaximize className="text-white text-xs" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-800">Cửa sổ</span>
                                    <span className="text-gray-500">WINDOW</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                                <div className="w-8 h-8 bg-green-500 border-2 border-green-600 rounded flex items-center justify-center">
                                    <FaWalking className="text-white text-xs" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-800">Lối đi</span>
                                    <span className="text-gray-500">AISLE</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg border border-gray-300">
                                <div className="w-8 h-8 bg-gray-500 border-2 border-gray-700 rounded flex items-center justify-center">
                                    <FaUser className="text-white text-xs" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-800">Giữa</span>
                                    <span className="text-gray-500">MIDDLE</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-sky-50 to-white">
                    {seats.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <FaPlane className="text-gray-300 text-6xl mb-4" />
                            <p className="text-gray-500 font-medium text-lg">Chưa có sơ đồ ghế</p>
                            <p className="text-gray-400 text-sm mt-2">Vui lòng thêm sơ đồ ghế cho máy bay này</p>
                        </div>
                    ) : groupByClass ? (
                        // Group by class view
                        Object.entries(groupedSeats).map(([className, classSeats]) => (
                            <div key={className} className="mb-8 bg-white rounded-xl shadow-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-sky-50 to-blue-50 px-6 py-4 border-b-2 border-sky-200">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <FaPlane className="text-sky-600" />
                                        {className}
                                        <span className="bg-sky-600 text-white text-xs px-2 py-1 rounded-full">
                                            {classSeats.length} ghế
                                        </span>
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <SeatGrid
                                        seats={classSeats}
                                        getSeatStyle={getSeatStyle}
                                        onSeatHover={handleMouseEnter}
                                        onSeatLeave={handleMouseLeave}
                                    />
                                </div>
                            </div>
                        ))
                    ) : (
                        // All seats in one grid
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <SeatGrid
                                seats={seats}
                                getSeatStyle={getSeatStyle}
                                onSeatHover={handleMouseEnter}
                                onSeatLeave={handleMouseLeave}
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                {seats.length > 0 && (
                    <div className="bg-gray-100 border-t border-gray-200 px-6 py-4">
                        <div className="flex justify-center items-center gap-8 text-sm">
                            <div className="text-center">
                                <div className="font-bold text-gray-800">Cửa sổ trái</div>
                                <div className="text-xs text-gray-500">Left Window</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-16 h-3 bg-gradient-to-r from-blue-400 via-green-400 to-blue-400 rounded"></div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-gray-800">Lối đi</div>
                                <div className="text-xs text-gray-500">Aisle</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-16 h-3 bg-gradient-to-r from-blue-400 via-green-400 to-blue-400 rounded"></div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-gray-800">Cửa sổ phải</div>
                                <div className="text-xs text-gray-500">Right Window</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tooltip */}
                {hoveredSeat && (
                    <div
                        className="fixed z-[100] bg-gray-900 text-white px-4 py-3 rounded-lg shadow-2xl pointer-events-none max-w-xs"
                        style={{
                            left: tooltipPosition.x + 15,
                            top: tooltipPosition.y + 15,
                        }}
                    >
                        <div className="space-y-1">
                            <div className="font-bold text-sky-300 text-lg">{hoveredSeat.soGhe}</div>
                            <div className="text-sm">
                                <span className="text-gray-400">Hạng vé:</span>{' '}
                                <span className="font-semibold text-white">{hoveredSeat.hangVe?.tenHangVe || 'Chưa phân loại'}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-gray-400">Vị trí:</span>{' '}
                                <span className="font-semibold text-white">{hoveredSeat.viTriGhe}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-gray-400">Hàng:</span>{' '}
                                <span className="font-semibold text-white">{hoveredSeat.hang}</span>
                            </div>
                            <div className="text-sm">
                                <span className="text-gray-400">Cột:</span>{' '}
                                <span className="font-semibold text-white">{hoveredSeat.cot}</span>
                            </div>
                        </div>
                        {/* Arrow */}
                        <div
                            className="absolute w-3 h-3 bg-gray-900 transform rotate-45 -left-1.5 top-4"
                            style={{ marginLeft: '-6px' }}
                        ></div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Sub-component for rendering seat grid with aircraft layout
const SeatGrid = ({ seats, getSeatStyle, onSeatHover, onSeatLeave }) => {
    // Organize seats by row (hang) and column (cot)
    const seatMap = {};
    const columns = new Set();

    seats.forEach(seat => {
        const row = seat.hang || 0;
        if (!seatMap[row]) {
            seatMap[row] = {};
        }
        seatMap[row][seat.cot] = seat;
        columns.add(seat.cot);
    });

    const sortedRows = Object.keys(seatMap).sort((a, b) => a - b);
    const sortedColumns = Array.from(columns).sort();

    // Find aisle positions based on gaps in seating
    const findAislePositions = () => {
        const aisles = [];
        const maxGap = 2; // If gap between columns > 2, it's an aisle

        for (let i = 0; i < sortedColumns.length - 1; i++) {
            const currentCol = sortedColumns[i];
            const nextCol = sortedColumns[i + 1];
            const gap = nextCol.charCodeAt(0) - currentCol.charCodeAt(0);

            if (gap > maxGap) {
                aisles.push({
                    before: currentCol,
                    after: nextCol,
                    position: i
                });
            }
        }

        // If no aisles detected by gaps, use middle column
        if (aisles.length === 0 && sortedColumns.length > 4) {
            const midIndex = Math.floor(sortedColumns.length / 2);
            aisles.push({
                before: sortedColumns[midIndex - 1],
                after: sortedColumns[midIndex],
                position: midIndex - 1
            });
        }

        return aisles;
    };

    const aislePositions = findAislePositions();

    // Check if a column should have an aisle after it
    const hasAisleAfter = (colIndex) => {
        return aislePositions.some(aisle => aisle.position === colIndex);
    };

    return (
        <div className="overflow-x-auto">
            <div className="min-w-max flex justify-center">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    {/* Aircraft top visualization */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            {/* Nose of aircraft */}
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[12px] border-l-transparent border-r-transparent border-b-sky-600"></div>
                            </div>
                            {/* Body */}
                            <div className="h-6 bg-gradient-to-r from-sky-400 via-sky-500 to-sky-400 rounded-t-full w-64 shadow-md"></div>
                        </div>
                    </div>

                    {/* Seat layout */}
                    <div className="relative">
                        {/* Left windows */}
                        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-b from-blue-300 to-blue-400 rounded-l-lg border-r-2 border-blue-200"></div>

                        {/* Right windows */}
                        <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-b from-blue-300 to-blue-400 rounded-r-lg border-l-2 border-blue-200"></div>

                        {/* Column headers */}
                        <div className="flex border-b-2 border-gray-300 mb-4 px-12 py-2 bg-gray-50">
                            <div className="w-20 flex-shrink-0"></div>
                            {sortedColumns.map((col, index) => {
                                const isAisleAfter = hasAisleAfter(index);
                                return (
                                    <React.Fragment key={`header-${col}`}>
                                        <div className="w-16 flex-shrink-0 text-center font-bold text-gray-700 text-sm">
                                            {col}
                                        </div>
                                        {isAisleAfter && (
                                            <div className="w-12 flex-shrink-0 flex items-center justify-center">
                                                <div className="text-xs text-green-600 font-semibold">LỐI ĐI</div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>

                        {/* Seat rows */}
                        <div className="px-12">
                            {sortedRows.map((row) => (
                                <div key={row} className="flex items-center mb-3">
                                    <div className="w-20 flex-shrink-0 text-center font-bold text-gray-700 text-sm bg-gray-100 rounded-lg py-2">
                                        Hàng {row}
                                    </div>
                                    {sortedColumns.map((col, index) => {
                                        const seat = seatMap[row]?.[col];
                                        const isAisleAfter = hasAisleAfter(index);
                                        const seatStyle = seat ? getSeatStyle(seat.viTriGhe) : null;

                                        return (
                                            <React.Fragment key={`${row}-${col}`}>
                                                <div className="w-16 flex-shrink-0 p-1.5">
                                                    {seat ? (
                                                        <div
                                                            className={`w-full aspect-square border-2 rounded-xl flex flex-col items-center justify-center shadow-md hover:shadow-xl transition-all cursor-pointer hover:scale-110 ${seatStyle.bg} ${seatStyle.bgHover} ${seatStyle.border} ${seatStyle.text}`}
                                                            onMouseEnter={(e) => onSeatHover(seat, e)}
                                                            onMouseLeave={onSeatLeave}
                                                        >
                                                            <div className="text-base mb-0.5">{seatStyle.icon}</div>
                                                            <span className="text-xs font-bold leading-tight">{seat.soGhe}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="w-full aspect-square flex items-center justify-center">
                                                            {/* Empty seat indicator */}
                                                            <div className="w-6 h-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"></div>
                                                        </div>
                                                    )}
                                                </div>
                                                {isAisleAfter && (
                                                    <div className="w-12 flex-shrink-0 flex items-center justify-center">
                                                        <div className="h-16 w-1.5 bg-gradient-to-b from-green-300 to-green-400 rounded-full shadow-sm"></div>
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        {/* Aircraft bottom */}
                        <div className="flex justify-center mt-6">
                            <div className="h-6 bg-gradient-to-r from-sky-400 via-sky-500 to-sky-400 rounded-b-full w-64 shadow-md"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatLayoutViewer;
