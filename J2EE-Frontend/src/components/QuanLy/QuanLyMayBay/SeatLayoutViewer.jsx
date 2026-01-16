import React, { useState, useEffect } from 'react';
import { FaChair, FaTimes, FaSync, FaPlane, FaWindowMaximize } from 'react-icons/fa';

const SeatLayoutViewer = ({ maMayBay, onClose }) => {
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [groupByClass, setGroupByClass] = useState(true);

    const loadSeats = async () => {
        try {
            setLoading(true);
            // Import service dynamically to avoid circular dependency
            const { getSeatsByAircraft } = await import('../../../services/SoDoGheService');
            const response = await getSeatsByAircraft(maMayBay);
            setSeats(response.data || []);
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
        return grouped;
    };

    // Get seat color based on position
    const getSeatColor = (viTriGhe) => {
        switch (viTriGhe) {
            case 'CỬA SỔ': return 'bg-blue-500 text-white border-blue-600';
            case 'LỐI ĐI': return 'bg-green-500 text-white border-green-600';
            case 'GIỮA': return 'bg-gray-400 text-white border-gray-500';
            default: return 'bg-gray-300 text-gray-700 border-gray-400';
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
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
                <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
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
                    <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-500 border-2 border-blue-600 rounded flex items-center justify-center">
                                <FaWindowMaximize className="text-white text-xs" />
                            </div>
                            <span className="text-gray-600">Cửa sổ</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-500 border-2 border-green-600 rounded flex items-center justify-center">
                                <FaChair className="text-white text-xs" />
                            </div>
                            <span className="text-gray-600">Lối đi</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-400 border-2 border-gray-500 rounded flex items-center justify-center">
                                <FaChair className="text-white text-xs" />
                            </div>
                            <span className="text-gray-600">Giữa</span>
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
                            <div key={className} className="mb-8 bg-white rounded-lg shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-sky-600 flex items-center gap-2">
                                    <FaPlane className="text-sky-600" />
                                    {className} ({classSeats.length} ghế)
                                </h3>
                                <SeatGrid seats={classSeats} getSeatColor={getSeatColor} />
                            </div>
                        ))
                    ) : (
                        // All seats in one grid
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <SeatGrid seats={seats} getSeatColor={getSeatColor} />
                        </div>
                    )}
                </div>

                {/* Footer - Aircraft visualization */}
                {seats.length > 0 && (
                    <div className="bg-gray-100 border-t border-gray-200 p-4">
                        <div className="flex justify-center items-center gap-8 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-500 rounded"></div>
                                <span>Cửa sổ trái</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-20 h-8 bg-gradient-to-r from-blue-500 via-green-500 to-blue-500 rounded"></div>
                                <span>Lối đi</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-500 rounded"></div>
                                <span>Cửa sổ phải</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Sub-component for rendering seat grid with aircraft layout
const SeatGrid = ({ seats, getSeatColor }) => {
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

    // Find aisle position (middle of the grid)
    const findAislePosition = () => {
        const midIndex = Math.floor(sortedColumns.length / 2);
        return sortedColumns[midIndex];
    };

    const aisleCol = findAislePosition();

    return (
        <div className="overflow-x-auto">
            <div className="min-w-max bg-white rounded-lg p-4">
                {/* Aircraft top visualization */}
                <div className="flex justify-center mb-4">
                    <div className="relative">
                        {/* Nose of aircraft */}
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                            <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-sky-600"></div>
                        </div>
                        {/* Body */}
                        <div className="h-4 bg-gradient-to-r from-sky-400 via-sky-500 to-sky-400 rounded-t-lg w-full"></div>
                    </div>
                </div>

                {/* Seat layout with window indicators */}
                <div className="relative">
                    {/* Left windows */}
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-blue-400 to-blue-500 rounded-l-lg"></div>

                    {/* Right windows */}
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-b from-blue-400 to-blue-500 rounded-r-lg"></div>

                    {/* Column headers */}
                    <div className="flex border-b-2 border-gray-300 mb-3 px-4">
                        <div className="w-16 flex-shrink-0"></div>
                        {sortedColumns.map((col) => {
                            const isAisle = col === aisleCol;
                            return (
                                <div key={col} className={`w-14 flex-shrink-0 text-center font-bold text-gray-700 text-sm py-2 ${isAisle ? 'bg-green-100 mx-2 rounded' : ''}`}>
                                    {col}
                                </div>
                            );
                        })}
                    </div>

                    {/* Seat rows */}
                    {sortedRows.map((row) => (
                        <div key={row} className="flex items-center mb-2 px-4">
                            <div className="w-16 flex-shrink-0 text-center font-bold text-gray-700 text-sm">
                                Hàng {row}
                            </div>
                            {sortedColumns.map((col, index) => {
                                const seat = seatMap[row]?.[col];
                                const isAisle = col === aisleCol;

                                return (
                                    <React.Fragment key={`${row}-${col}`}>
                                        {/* Spacer before aisle */}
                                        {isAisle && (
                                            <div className="w-6 flex-shrink-0 flex items-center justify-center">
                                                <div className="h-12 w-1 bg-green-500 rounded"></div>
                                            </div>
                                        )}

                                        {/* Spacer after aisle */}
                                        {sortedColumns[index - 1] === aisleCol && (
                                            <div className="w-6 flex-shrink-0 flex items-center justify-center">
                                                <div className="h-12 w-1 bg-green-500 rounded"></div>
                                            </div>
                                        )}

                                        <div className="w-14 flex-shrink-0 p-1">
                                            {seat ? (
                                                <div
                                                    className={`w-full aspect-square border-2 rounded-lg flex flex-col items-center justify-center hover:shadow-lg transition-all cursor-pointer hover:scale-105 ${getSeatColor(seat.viTriGhe)}`}
                                                    title={`${seat.soGhe} - ${seat.hangVe?.tenHangVe} - ${seat.viTriGhe}`}
                                                >
                                                    <FaChair className="text-lg" />
                                                    <span className="text-xs font-bold mt-0.5">{seat.soGhe}</span>
                                                </div>
                                            ) : (
                                                <div className="w-full aspect-square flex items-center justify-center">
                                                    {/* Empty seat indicator */}
                                                    <div className="w-4 h-4 border-2 border-dashed border-gray-300 rounded"></div>
                                                </div>
                                            )}
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    ))}

                    {/* Aircraft bottom */}
                    <div className="flex justify-center mt-4">
                        <div className="h-4 bg-gradient-to-r from-sky-400 via-sky-500 to-sky-400 rounded-b-lg w-full px-4"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatLayoutViewer;
