import React from 'react';

const colorMap = {
 green: {
 bg: 'bg-white',
 icon: 'bg-emerald-500',
 accent: 'border-l-emerald-500'
 },
 blue: {
 bg: 'bg-white',
 icon: 'bg-blue-500',
 accent: 'border-l-blue-500'
 },
 indigo: {
 bg: 'bg-white',
 icon: 'bg-indigo-500',
 accent: 'border-l-indigo-500'
 },
 orange: {
 bg: 'bg-white',
 icon: 'bg-orange-500',
 accent: 'border-l-orange-500'
 },
 teal: {
 bg: 'bg-white',
 icon: 'bg-teal-500',
 accent: 'border-l-teal-500'
 },
 red: {
 bg: 'bg-white',
 icon: 'bg-red-500',
 accent: 'border-l-red-500'
 }
};

const StatCard = React.memo(({ title, value, icon, color = 'blue' }) => {
 const colors = colorMap[color] || colorMap.blue;

 return (
 <div className={`${colors.bg} ${colors.accent} border-l-4 p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300`}>
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1.5">{title}</p>
 <p className="text-2xl font-bold text-gray-800">{value}</p>
 </div>
 <div className={`p-3 rounded-lg ${colors.icon} text-white shadow-md`}>
 {icon}
 </div>
 </div>
 </div>
 );
});

export default StatCard;