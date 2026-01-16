import React from 'react';
import { FaExclamationTriangle, FaCheck, FaTimes } from 'react-icons/fa';

/**
 * ConfirmDialog Component - Modal xác nhận hành động
 * Component có thể tái sử dụng cho nhiều trường hợp khác nhau
 *
 * @param {boolean} isVisible - Hiển thị/ẩn dialog
 * @param {string} title - Tiêu đề của dialog
 * @param {string} message - Nội dung thông điệp
 * @param {string} type - Loại dialog: 'warning' | 'danger' | 'info'
 * @param {string} confirmText - Text cho nút xác nhận (mặc định: "Xác nhận")
 * @param {string} cancelText - Text cho nút hủy (mặc định: "Hủy")
 * @param {function} onConfirm - Callback khi nhấn xác nhận
 * @param {function} onCancel - Callback khi nhấn hủy
 * @param {boolean} showIcon - Hiển thị icon hay không
 */
const ConfirmDialog = ({
  isVisible,
  title = "Xác nhận",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  type = "warning",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onConfirm,
  onCancel,
  showIcon = true
}) => {
  if (!isVisible) return null;

  // Định nghĩa style theo loại
  const typeStyles = {
    warning: {
      bgGradient: "from-yellow-500 to-orange-500",
      bgLight: "bg-yellow-50",
      border: "border-yellow-500",
      icon: FaExclamationTriangle,
      iconColor: "text-yellow-500",
      textColor: "text-yellow-800",
      buttonBg: "bg-yellow-500 hover:bg-yellow-600",
      buttonBgHover: "hover:bg-yellow-600"
    },
    danger: {
      bgGradient: "from-red-500 to-red-600",
      bgLight: "bg-red-50",
      border: "border-red-500",
      icon: FaExclamationTriangle,
      iconColor: "text-red-500",
      textColor: "text-red-800",
      buttonBg: "bg-red-500 hover:bg-red-600",
      buttonBgHover: "hover:bg-red-600"
    },
    info: {
      bgGradient: "from-blue-500 to-blue-600",
      bgLight: "bg-blue-50",
      border: "border-blue-500",
      icon: FaExclamationTriangle,
      iconColor: "text-blue-500",
      textColor: "text-blue-800",
      buttonBg: "bg-blue-500 hover:bg-blue-600",
      buttonBgHover: "hover:bg-blue-600"
    }
  };

  const styles = typeStyles[type] || typeStyles.warning;
  const Icon = showIcon ? styles.icon : null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  // Đóng dialog khi nhấn phím Escape
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isVisible) {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-opacity-50 transition-opacity"
        onClick={handleCancel}
      ></div>

      {/* Dialog Content */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all animate-fade-in-up">
        {/* Header */}
        <div className={`bg-gradient-to-r ${styles.bgGradient} text-white p-6 rounded-t-xl`}>
          <div className="flex items-center gap-3">
            {Icon && <Icon className="text-2xl" />}
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700 text-base leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            onClick={handleCancel}
            className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-all duration-200 flex items-center gap-2"
          >
            <FaTimes size={14} />
            <span>{cancelText}</span>
          </button>
          <button
            onClick={handleConfirm}
            className={`px-5 py-2.5 ${styles.buttonBg} text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
          >
            <FaCheck size={14} />
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
