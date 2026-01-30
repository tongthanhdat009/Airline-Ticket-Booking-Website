import React from 'react';

const StatCard = React.memo(({ title, value, icon, color }) => (
    <div className={`bg-linear-to-br from-white to-${color}-50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border`}>
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-2">{title}</p>
                <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>
            </div>
            <div className={`p-4 rounded-xl bg-linear-to-br from-${color}-500 to-${color}-600 text-white shadow-lg`}>
                {icon}
            </div>
        </div>
    </div>
));

export default StatCard;