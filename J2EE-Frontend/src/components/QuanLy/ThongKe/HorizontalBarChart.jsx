import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import CustomTooltip from './CustomTooltip';

/**
 * Horizontal Bar Chart Component
 * Dùng cho hiển thị Top chặng bay phổ biến nhất
 */
const HorizontalBarChart = ({ data, dataKey = "soVeBan", nameKey = "changBay", formatValue }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-64 text-gray-400">
                <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-sm font-medium">Không có dữ liệu</p>
            </div>
        );
    }

    // Generate colors for bars
    const getBarColor = (index) => {
        const colors = [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
            '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16'
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={150}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={true} vertical={false} />
                    <XAxis
                        type="number"
                        tickFormatter={formatValue}
                        fontSize={11}
                        stroke="#6B7280"
                    />
                    <YAxis
                        type="category"
                        dataKey={nameKey}
                        fontSize={11}
                        width={150}
                        stroke="#6B7280"
                        tick={{ fontSize: 10 }}
                    />
                    <Tooltip
                        content={<CustomTooltip formatter={formatValue} />}
                        cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                    />
                    <Bar dataKey={dataKey} radius={[0, 4, 4, 0]} isAnimationActive={true}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default HorizontalBarChart;
