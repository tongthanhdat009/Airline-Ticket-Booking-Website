import React, { useRef, useEffect, useState } from 'react';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';

const ContextMenu = ({ x, y, seat, onAction }) => {
    const menuRef = useRef(null);
    const [position, setPosition] = useState({ x, y });

    useEffect(() => {
        if (menuRef.current) {
            const menu = menuRef.current;
            const rect = menu.getBoundingClientRect();
            
            // Adjust position if menu goes off screen
            let newX = x;
            let newY = y;
            
            if (x + rect.width > window.innerWidth) {
                newX = window.innerWidth - rect.width - 10;
            }
            
            if (y + rect.height > window.innerHeight) {
                newY = window.innerHeight - rect.height - 10;
            }
            
            setPosition({ x: newX, y: newY });
        }
    }, [x, y]);

    return (
        <div
            ref={menuRef}
            className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-50 min-w-[200px]"
            style={{ left: `${position.x}px`, top: `${position.y}px` }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-xs text-gray-500">Ghế {seat.soGhe}</p>
                <p className="text-sm font-semibold text-gray-800">{seat.hangVe?.tenHangVe || 'N/A'}</p>
            </div>
            
            <button
                onClick={() => onAction('edit', seat)}
                className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center gap-3 text-gray-700 transition-colors"
            >
                <FaEdit className="text-blue-600" />
                <span>Chỉnh sửa</span>
            </button>
            
            <button
                onClick={() => onAction('duplicate', seat)}
                className="w-full px-4 py-2 text-left hover:bg-green-50 flex items-center gap-3 text-gray-700 transition-colors"
            >
                <FaPlus className="text-green-600" />
                <span>Nhân bản</span>
            </button>
            
            <div className="border-t border-gray-200 my-1"></div>
            
            <button
                onClick={() => onAction('delete', seat)}
                className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-3 text-red-600 transition-colors"
            >
                <FaTrash />
                <span>Xóa ghế</span>
            </button>
        </div>
    );
};

export default ContextMenu;
