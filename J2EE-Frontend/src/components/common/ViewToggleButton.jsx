import React from 'react';
import { FaTable, FaThLarge } from 'react-icons/fa';

/**
 * ViewToggleButton - Component for switching between table and card views
 * @param {string} currentView - Current view mode ('table' or 'grid')
 * @param {function} onViewChange - Callback function when view is changed
 * @param {string} className - Additional CSS classes for the button container
 */
const ViewToggleButton = ({ currentView = 'table', onViewChange, className = '' }) => {
    const handleViewChange = (view) => {
        if (onViewChange && view !== currentView) {
            onViewChange(view);
        }
    };

    const isTableActive = currentView === 'table';
    const isGridActive = currentView === 'grid';

    return (
        <div className={`inline-flex bg-gray-100 rounded-lg p-1 gap-1 ${className}`}>
            <button
                onClick={() => handleViewChange('table')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all font-medium ${
                    isTableActive
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }`}
                title="Xem dạng bảng"
                aria-label="Xem dạng bảng"
            >
                <FaTable size={16} />
                <span className="text-sm">Bảng</span>
            </button>
            <button
                onClick={() => handleViewChange('grid')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all font-medium ${
                    isGridActive
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }`}
                title="Xem dạng thẻ"
                aria-label="Xem dạng thẻ"
            >
                <FaThLarge size={16} />
                <span className="text-sm">Thẻ</span>
            </button>
        </div>
    );
};

export default ViewToggleButton;
