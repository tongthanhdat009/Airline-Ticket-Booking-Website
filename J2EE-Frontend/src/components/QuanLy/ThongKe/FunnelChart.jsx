import React from 'react';

/**
 * Funnel Chart Component
 * Dùng cho hiển thị tỷ lệ chuyển đổi đặt vé
 */
const FunnelChart = ({ data, colors }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-64 text-gray-400">
                <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <p className="text-sm font-medium">Không có dữ liệu</p>
            </div>
        );
    }

    const defaultColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
    const funnelColors = colors || defaultColors;

    // Calculate max width for percentage
    const maxValue = Math.max(...data.map(d => d.soLuong));

    return (
        <div className="w-full py-4">
            <div className="flex flex-col gap-3">
                {data.map((item, index) => {
                    const widthPercent = maxValue > 0 ? (item.soLuong / maxValue) * 100 : 0;
                    const color = funnelColors[index % funnelColors.length];

                    return (
                        <div key={index} className="relative">
                            {/* Step label */}
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">{item.buoc}</span>
                                <span className="text-sm font-semibold" style={{ color }}>
                                    {item.soLuong?.toLocaleString('vi-VN')} đơn
                                </span>
                            </div>

                            {/* Funnel bar */}
                            <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
                                {/* Background funnel shape */}
                                <div
                                    className="absolute h-full rounded-lg flex items-center justify-end pr-3 transition-all duration-500"
                                    style={{
                                        width: `${Math.max(widthPercent, 5)}%`,
                                        backgroundColor: color,
                                        opacity: 0.9
                                    }}
                                >
                                    {/* Percentage label */}
                                    <span className="text-xs font-bold text-white">
                                        {item.tyLe?.toFixed(1)}%
                                    </span>
                                </div>

                                {/* Step number badge */}
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-xs font-bold shadow-sm" style={{ color }}>
                                    {index + 1}
                                </div>

                                {/* Conversion rate indicator (not first item) */}
                                {index > 0 && (
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500">
                                        {((item.soLuong / data[0].soLuong) * 100).toFixed(1)}%
                                    </div>
                                )}
                            </div>

                            {/* Drop rate (between steps) */}
                            {index < data.length - 1 && (
                                <div className="flex justify-end mt-1">
                                    <span className="text-xs text-red-500">
                                        ↓ {(((data[index].soLuong - data[index + 1].soLuong) / data[index].soLuong) * 100).toFixed(1)}% rơi rụng
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: funnelColors[0] }}></div>
                        <span>Tìm kiếm</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: funnelColors[1] }}></div>
                        <span>Điền thông tin</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: funnelColors[2] }}></div>
                        <span>Thanh toán</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: funnelColors[3] }}></div>
                        <span>Hoàn tất</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FunnelChart;
