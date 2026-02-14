import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaTimes, FaInfoCircle } from 'react-icons/fa';

const Toast = ({ message, type = 'success', isVisible, onClose, duration = 3000 }) => {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    const styles = {
        success: {
            bg: 'bg-green-50',
            border: 'border-green-500',
            icon: 'text-green-500',
            text: 'text-green-800',
            iconComponent: FaCheckCircle
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-500',
            icon: 'text-red-500',
            text: 'text-red-800',
            iconComponent: FaExclamationCircle
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-500',
            icon: 'text-blue-500',
            text: 'text-blue-800',
            iconComponent: FaInfoCircle
        },
    };

    const style = styles[type] || styles.success;
    const Icon = style.iconComponent;

    return (
        <div className="fixed top-4 right-4 z-[9999] animate-slide-in-right">
            <div className={`${style.bg} ${style.border} border-l-4 rounded-lg shadow-2xl p-4 pr-12 min-w-[320px] max-w-md relative`}>
                <div className="flex items-start gap-3">
                    <Icon className={`${style.icon} text-2xl shrink-0 mt-0.5`} />
                    <div className="flex-1">
                        <h3 className={`${style.text} font-semibold mb-1`}>
                            {type === 'success' ? 'Thành công!' : type === 'error' ? 'Lỗi!' : 'Thông tin'}
                        </h3>
                        <p className={`${style.text} text-sm`}>{message}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className={`absolute top-3 right-3 ${style.text} hover:opacity-70 transition-opacity`}
                >
                    <FaTimes size={16} />
                </button>
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
                    <div 
                        className={`h-full ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'} animate-progress`}
                        style={{ animationDuration: `${duration}ms` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default Toast;
