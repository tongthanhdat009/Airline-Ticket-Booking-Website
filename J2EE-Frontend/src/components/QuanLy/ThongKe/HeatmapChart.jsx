import React, { useMemo } from 'react';

/**
 * Heatmap Chart Component
 * Dùng cho hiển thị khung giờ đặt vé cao điểm
 * Trục X: Các ngày trong tuần (Thứ 2 - Chủ Nhật)
 * Trục Y: Khung giờ (0-23)
 */
const HeatmapChart = ({ data }) => {
    // Process data to create a matrix [day][hour]
    const heatmapData = useMemo(() => {
        if (!data || data.length === 0) return null;

        // Initialize 7x24 matrix with zeros
        const matrix = Array(7).fill(null).map(() => Array(24).fill(0));

        // Map day names to indices (0=Thứ 2, 6=Chủ Nhật)
        const dayMap = { 'Thứ 2': 0, 'Thứ 3': 1, 'Thứ 4': 2, 'Thứ 5': 3, 'Thứ 6': 4, 'Thứ 7': 5, 'Chủ Nhật': 6 };

        // Fill matrix with data
        data.forEach(item => {
            const dayIndex = dayMap[item.tenThu];
            const hourIndex = item.gio;
            if (dayIndex !== undefined && hourIndex !== undefined) {
                matrix[dayIndex][hourIndex] = item.soLuong;
            }
        });

        // Find max value for color scaling
        const maxValue = Math.max(...matrix.flat());

        return { matrix, maxValue };
    }, [data]);

    if (!heatmapData) {
        return (
            <div className="flex flex-col justify-center items-center h-64 text-gray-400">
                <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium">Không có dữ liệu</p>
            </div>
        );
    }

    const { matrix, maxValue } = heatmapData;
    const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Get color based on value intensity
    const getColor = (value) => {
        if (value === 0) return '#F3F4F6';
        const intensity = value / maxValue;
        // Light blue to dark blue
        if (intensity < 0.2) return '#DBEAFE';
        if (intensity < 0.4) return '#93C5FD';
        if (intensity < 0.6) return '#3B82F6';
        if (intensity < 0.8) return '#2563EB';
        return '#1D4ED8';
    };

    const getTextColor = (value) => {
        if (value === 0) return '#9CA3AF';
        return value > maxValue * 0.5 ? '#FFFFFF' : '#1F2937';
    };

    return (
        <div className="w-full">
            {/* Legend */}
            <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-xs text-gray-500">Thấp</span>
                <div className="flex gap-0.5">
                    <div className="w-4 h-3 rounded" style={{ backgroundColor: '#F3F4F6' }}></div>
                    <div className="w-4 h-3 rounded" style={{ backgroundColor: '#DBEAFE' }}></div>
                    <div className="w-4 h-3 rounded" style={{ backgroundColor: '#93C5FD' }}></div>
                    <div className="w-4 h-3 rounded" style={{ backgroundColor: '#3B82F6' }}></div>
                    <div className="w-4 h-3 rounded" style={{ backgroundColor: '#2563EB' }}></div>
                    <div className="w-4 h-3 rounded" style={{ backgroundColor: '#1D4ED8' }}></div>
                </div>
                <span className="text-xs text-gray-500">Cao</span>
            </div>

            {/* Heatmap Grid */}
            <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                    {/* Hour labels */}
                    <div className="flex ml-10">
                        {hours.map(hour => (
                            <div
                                key={hour}
                                className="flex-1 text-center text-[9px] text-gray-400 py-1"
                            >
                                {hour}
                            </div>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="flex flex-col gap-0.5">
                        {matrix.map((row, dayIndex) => (
                            <div key={dayIndex} className="flex items-center">
                                {/* Day label */}
                                <div className="w-10 text-[10px] text-gray-500 text-right pr-2 font-medium">
                                    {days[dayIndex]}
                                </div>

                                {/* Cells */}
                                {row.map((value, hourIndex) => (
                                    <div
                                        key={hourIndex}
                                        className="flex-1 aspect-square rounded-sm flex items-center justify-center text-[9px] font-medium transition-all hover:scale-110 hover:z-10 hover:shadow-md cursor-default relative group"
                                        style={{
                                            backgroundColor: getColor(value),
                                            color: getTextColor(value)
                                        }}
                                        title={`${days[dayIndex]} ${hourIndex}h: ${value} đơn`}
                                    >
                                        {value > 0 && value}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Note */}
            <p className="text-xs text-gray-400 text-center mt-3">
                Màu càng đậm thể hiện lượng đặt càng cao
            </p>
        </div>
    );
};

export default HeatmapChart;
