import React from"react";

const Card = ({ title, children }) => (
 <div className="bg-white rounded-xl shadow-sm border border-gray-200/60">
 <div className="px-6 pt-5 pb-4 border-b border-gray-100">
 <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2.5">
 <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
 {title}
 </h2>
 </div>
 <div className="p-6 text-gray-600">{children}</div>
 </div>
);
export default Card;