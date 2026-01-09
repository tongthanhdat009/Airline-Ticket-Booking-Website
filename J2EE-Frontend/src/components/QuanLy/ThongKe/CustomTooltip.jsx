import React from 'react';

const CustomTooltip = React.memo(({ active, payload, label, formatter }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                <p className="font-semibold text-gray-800">{`${label}`}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {`${entry.dataKey}: ${formatter ? formatter(entry.value) : entry.value}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
});

export default CustomTooltip;