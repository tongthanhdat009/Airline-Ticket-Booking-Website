import { useState, useCallback, createElement } from 'react';
import Toast from '../components/common/Toast';

/**
 * Custom hook để sử dụng Toast component
 * @returns {Object} Toast component và các hàm điều khiển
 */
export const useToast = () => {
    const [toast, setToast] = useState({
        isVisible: false,
        message: '',
        type: 'success',
        duration: 3000
    });

    const showToast = useCallback((message, type = 'success', duration = 3000) => {
        setToast({
            isVisible: true,
            message,
            type,
            duration
        });
    }, []);

    const hideToast = useCallback(() => {
        setToast(prev => ({ ...prev, isVisible: false }));
    }, []);

    // Helper methods
    const showSuccess = useCallback((message, duration) => {
        return showToast(message, 'success', duration);
    }, [showToast]);

    const showError = useCallback((message, duration) => {
        return showToast(message, 'error', duration);
    }, [showToast]);

    const showInfo = useCallback((message, duration) => {
        return showToast(message, 'info', duration);
    }, [showToast]);

    // Sử dụng createElement thay vì JSX để tránh lỗi parse
    const ToastComponent = useCallback(() => {
        return createElement(Toast, {
            message: toast.message,
            type: toast.type,
            isVisible: toast.isVisible,
            onClose: hideToast,
            duration: toast.duration
        });
    }, [toast, hideToast]);

    return {
        ToastComponent,
        showToast,
        showSuccess,
        showError,
        showInfo,
        hideToast
    };
};

export default useToast;
