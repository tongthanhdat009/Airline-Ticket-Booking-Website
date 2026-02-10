import React, { useMemo } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { MdEventSeat } from 'react-icons/md';
import { HiChartPie, HiViewGrid } from 'react-icons/hi';

const SeatStatistics = ({ seats, hangVeList, sidebarCollapsed, setSidebarCollapsed }) => {
    const stats = useMemo(() => {
        const result = {
            total: seats.length,
            byTicketClass: {},
            byPosition: {
                'CỬA SỔ': 0,
                'LỐI ĐI': 0,
                'GIỮA': 0
            },
            rows: {
                min: seats.length > 0 ? Math.min(...seats.map(s => s.hang)) : 0,
                max: seats.length > 0 ? Math.max(...seats.map(s => s.hang)) : 0
            },
            columns: new Set(seats.map(s => s.cot)).size
        };

        // Count by ticket class with percentages
        hangVeList.forEach(hv => {
            const count = seats.filter(s => s.maHangVe === hv.maHangVe).length;
            result.byTicketClass[hv.tenHangVe] = {
                count,
                percentage: seats.length > 0 ? Math.round((count / seats.length) * 100) : 0
            };
        });

        // Count by position
        seats.forEach(seat => {
            if (result.byPosition[seat.viTriGhe] !== undefined) {
                result.byPosition[seat.viTriGhe]++;
            }
        });

        return result;
    }, [seats, hangVeList]);

    // Color mapping for ticket classes
    const getClassColor = (className) => {
        const name = className.toLowerCase();
        if (name.includes('business') || name.includes('thương gia'))
            return { bg: 'bg-blue-100', text: 'text-blue-700', bar: 'bg-blue-500', icon: 'text-blue-500' };
        if (name.includes('premium') || name.includes('cao cấp'))
            return { bg: 'bg-yellow-100', text: 'text-yellow-700', bar: 'bg-yellow-500', icon: 'text-yellow-500' };
        if (name.includes('first') || name.includes('hạng nhất'))
            return { bg: 'bg-blue-100', text: 'text-blue-700', bar: 'bg-blue-500', icon: 'text-blue-500' };
        return { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500', icon: 'text-green-500' };
    };

    // Color mapping for positions
    const getPositionStyle = (position) => {
        switch (position) {
            case 'CỬA SỔ': return { icon: <FaWindowMaximize />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
            case 'LỐI ĐI': return { icon: <MdAirlineSeatReclineExtra />, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
            case 'GIỮA': return { icon: <FaChair />, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
            default: return { icon: <FaChair />, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' };
        }
    };

    if (sidebarCollapsed) {
        return (
            <div className="flex flex-col items-center">
                <button
                    onClick={() => setSidebarCollapsed(false)}
                    className="fixed right-0 top-1/2 -translate-y-1/2 bg-linear-to-l from-blue-600 to-indigo-600 text-white p-3 rounded-l-xl shadow-lg z-30 hover:from-blue-700 hover:to-indigo-700 transition-all group"
                    title="Hiển thị thống kê"
                >
                    <div className="flex flex-col items-center gap-2">
                        <MdEventSeat size={22} />
                        <FaChevronLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
                    </div>
                </button>
            </div>
        );
    }

    return (
        <div className="w-80 bg-linear-to-b from-white to-gray-50 border-l border-gray-200 flex flex-col h-full shadow-lg">
            {/* Header */}
            <div className="bg-linear-to-r from-slate-800 to-slate-900 text-white p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <HiChartPie className="text-xl" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Thống kê</h3>
                        <p className="text-xs text-slate-300">Seat Statistics</p>
                    </div>
                </div>
                <button
                    onClick={() => setSidebarCollapsed(true)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                    title="Thu gọn"
                >
                    <FaChevronRight className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* Total seats - Hero card */}
                <div className="relative overflow-hidden bg-linear-to-br from-blue-500 via-blue-600 to-indigo-700 text-white p-5 rounded-2xl shadow-lg">
                    <div className="absolute -top-4 -right-4 opacity-20">
                        <MdAirlineSeatReclineNormal size={100} />
                    </div>
                    <div className="relative">
                        <p className="text-sm opacity-90 font-medium">Tổng số ghế</p>
                        <div className="flex items-end gap-2 mt-1">
                            <p className="text-4xl font-bold">{stats.total}</p>
                            <span className="text-blue-200 text-sm pb-1">seats</span>
                        </div>
                        {stats.total > 0 && (
                            <div className="flex gap-4 mt-3 text-xs text-blue-100">
                                <span>📏 Hàng: {stats.rows.min} → {stats.rows.max}</span>
                                <span>📊 Cột: {stats.columns}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick stats grid */}
                <div className="grid grid-cols-3 gap-2">
                    {Object.entries(stats.byPosition).map(([position, count]) => {
                        const style = getPositionStyle(position);
                        return (
                            <div 
                                key={position} 
                                className={`${style.bg} ${style.border} border rounded-xl p-3 text-center`}
                            >
                                <div className={`${style.color} flex justify-center mb-1`}>
                                    {style.icon}
                                </div>
                                <p className="text-lg font-bold text-gray-800">{count}</p>
                                <p className="text-xs text-gray-500 truncate">{position}</p>
                            </div>
                        );
                    })}
                </div>

                {/* By ticket class with progress bars */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <HiViewGrid className="text-gray-500" />
                        <h4 className="font-bold text-gray-800">Phân bố hạng vé</h4>
                    </div>
                    <div className="space-y-3">
                        {Object.entries(stats.byTicketClass).map(([className, data]) => {
                            const colors = getClassColor(className);
                            return (
                                <div key={className} className="group">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 ${colors.bar} rounded-full`}></div>
                                            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                                                {className}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-bold ${colors.text}`}>{data.count}</span>
                                            <span className="text-xs text-gray-400">({data.percentage}%)</span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
                                            style={{ width: `${data.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Position breakdown - Doughnut style visualization */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <MdEventSeat className="text-gray-500" />
                        <h4 className="font-bold text-gray-800">Vị trí ghế</h4>
                    </div>
                    <div className="space-y-2">
                        {Object.entries(stats.byPosition).map(([position, count]) => {
                            const style = getPositionStyle(position);
                            const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                            return (
                                <div 
                                    key={position} 
                                    className={`flex items-center justify-between p-3 ${style.bg} ${style.border} border rounded-xl hover:shadow-sm transition-shadow`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`text-lg ${style.color}`}>
                                            {style.icon}
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">{position}</span>
                                            <p className="text-xs text-gray-400">{percentage}% tổng số</p>
                                        </div>
                                    </div>
                                    <span className={`text-xl font-bold ${style.color}`}>{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Info tip */}
                <div className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-xs text-amber-800">
                        💡 <strong>Mẹo:</strong> Click vào ghế để chọn, Ctrl+Click để chọn nhiều, hoặc chuột phải để xem menu.
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-3 bg-gray-50 text-center">
                <p className="text-xs text-gray-500">Cập nhật theo thời gian thực</p>
            </div>
        </div>
    );
};

export default SeatStatistics;
