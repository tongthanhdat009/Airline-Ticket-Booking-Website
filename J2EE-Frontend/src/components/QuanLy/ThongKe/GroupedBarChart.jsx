import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CustomTooltip from './CustomTooltip';

/**
 * Grouped Bar Chart Component
 * Dùng cho so sánh cùng kỳ (tháng này với tháng trước, năm nay với năm trước)
 */
const GroupedBarChart = ({ data, dataKeys, colors, formatValue }) => {
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

    const defaultDataKeys = [
        { key: 'doanhThu', name: 'Doanh thu' },
        { key: 'soVe', name: 'Số vé' },
        { key: 'soDonHang', name: 'Đơn hàng' }
    ];

    const defaultColors = ['#3B82F6', '#10B981', '#F59E0B'];
    const barColors = colors || defaultColors;

    const keysToUse = dataKeys || defaultDataKeys;

    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={150}>
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    barSize={40}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                        dataKey="ky"
                        fontSize={12}
                        stroke="#6B7280"
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        fontSize={11}
                        stroke="#6B7280"
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={formatValue}
                    />
                    <Tooltip
                        content={<CustomTooltip formatter={formatValue} />}
                        cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                    />
                    <Legend
                        wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
                        iconType="circle"
                    />

                    {/* Render bars for each data key */}
                    {keysToUse.map((dataKey, index) => (
                        <Bar
                            key={dataKey.key}
                            dataKey={dataKey.key}
                            name={dataKey.name}
                            fill={barColors[index % barColors.length]}
                            radius={[4, 4, 0, 0]}
                            isAnimationActive={true}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default GroupedBarChart;
