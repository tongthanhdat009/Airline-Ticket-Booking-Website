import React from 'react';

const colorMap = {
    green: {
        bg: 'bg-gradient-to-br from-white to-green-50',
        icon: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    blue: {
        bg: 'bg-gradient-to-br from-white to-blue-50',
        icon: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    indigo: {
        bg: 'bg-gradient-to-br from-white to-indigo-50',
        icon: 'bg-gradient-to-br from-indigo-500 to-indigo-600'
    },
    orange: {
        bg: 'bg-gradient-to-br from-white to-orange-50',
        icon: 'bg-gradient-to-br from-orange-500 to-orange-600'
    },
    teal: {
        bg: 'bg-gradient-to-br from-white to-teal-50',
        icon: 'bg-gradient-to-br from-teal-500 to-teal-600'
    },
    red: {
        bg: 'bg-gradient-to-br from-white to-red-50',
        icon: 'bg-gradient-to-br from-red-500 to-red-600'
    }
};

const StatCard = React.memo(({ title, value, icon, color = 'blue' }) => {
    const colors = colorMap[color] || colorMap.blue;

    return (
        <div className={`${colors.bg} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium mb-2">{title}</p>
                    <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>
                </div>
                <div className={`p-4 rounded-xl ${colors.icon} text-white shadow-lg`}>
                    {icon}
                </div>
            </div>
        </div>
    );
});

export default StatCard;