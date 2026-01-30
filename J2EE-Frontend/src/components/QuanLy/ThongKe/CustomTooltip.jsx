import React from 'react';

const CustomTooltip = React.memo(({ active, payload, label, formatter }) => {
    if (active && payload && payload.length) {
        // Với PieChart, label thường undefined, dùng payload[0].name thay thế
        const displayLabel = label !== undefined ? label : (payload[0]?.name || payload[0]?.payload?.name || '');

        return (
            <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                <p className="font-semibold text-gray-800">{displayLabel}</p>
                {payload.map((entry, index) => {
                    // Với PieChart, dataKey thường là 'value', hiển thị friendly hơn
                    const displayKey = entry.dataKey === 'value' ? 'Doanh thu' : entry.dataKey;
                    return (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {`${displayKey}: ${formatter ? formatter(entry.value) : entry.value.toLocaleString('vi-VN')} đ`}
                        </p>
                    );
                })}
            </div>
        );
    }
    return null;
});

export default CustomTooltip;