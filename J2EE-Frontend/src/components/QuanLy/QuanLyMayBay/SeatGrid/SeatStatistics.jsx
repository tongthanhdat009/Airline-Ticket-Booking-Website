import React from 'react';
import { FaChair, MdEventSeat } from 'react-icons/fa';

const SeatStatistics = ({ seats, hangVeList, sidebarCollapsed, setSidebarCollapsed }) => {
    const calculateStats = () => {
        const stats = {
            total: seats.length,
            byTicketClass: {},
            byPosition: {
                'CỬA SỔ': 0,
                'LỐI ĐI': 0,
                'GIỮA': 0
            }
        };

        // Count by ticket class
        hangVeList.forEach(hv => {
            stats.byTicketClass[hv.tenHangVe] = seats.filter(s => s.maHangVe === hv.maHangVe).length;
        });

        // Count by position
        seats.forEach(seat => {
            if (stats.byPosition[seat.viTriGhe] !== undefined) {
                stats.byPosition[seat.viTriGhe]++;
            }
        });

        return stats;
    };

    const stats = calculateStats();

    if (sidebarCollapsed) {
        return (
            <button
                onClick={() => setSidebarCollapsed(false)}
                className="fixed right-0 top-1/2 bg-blue-600 text-white p-3 rounded-l-lg shadow-lg z-30"
            >
                <MdEventSeat size={24} />
            </button>
        );
    }

    return (
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Thống kê</h3>
                <button
                    onClick={() => setSidebarCollapsed(true)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
            </div>

            <div className="space-y-6">
                {/* Total seats */}
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4 rounded-xl shadow-md">
                    <p className="text-sm opacity-90">Tổng số ghế</p>
                    <p className="text-3xl font-bold mt-1">{stats.total}</p>
                </div>

                {/* By ticket class */}
                <div>
                    <h4 className="font-bold text-gray-700 mb-3">Theo hạng vé</h4>
                    <div className="space-y-2">
                        {Object.entries(stats.byTicketClass).map(([className, count]) => (
                            <div key={className} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-700">{className}</span>
                                <span className="font-bold text-blue-600">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* By position */}
                <div>
                    <h4 className="font-bold text-gray-700 mb-3">Theo vị trí</h4>
                    <div className="space-y-2">
                        {Object.entries(stats.byPosition).map(([position, count]) => (
                            <div key={position} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-700">{position}</span>
                                <span className="font-bold text-green-600">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatStatistics;
