import { STATUS_COLORS, TAILWIND_COLORS } from '../constants/colorPalette.js';

/**
 * Trả về màu badge cho trạng thái cụ thể
 * @param {string} status - Trạng thái cần lấy màu
 * @returns {string} - CSS class string cho màu badge
 */
export const getStatusColor = (status) => {
  if (!status) {
    return STATUS_COLORS.default.bg + ' ' + STATUS_COLORS.default.text;
  }

  const normalizedStatus = status.toString().toLowerCase().trim();

  // Map các trạng thái thường gặp
  const statusMap = {
    // Active states
    'active': STATUS_COLORS.active,
    'active': STATUS_COLORS.active,
    'hoatdong': STATUS_COLORS.active,
    'hoạt động': STATUS_COLORS.active,

    // Inactive states
    'inactive': STATUS_COLORS.inactive,
    'disabled': STATUS_COLORS.inactive,
    'ngunghoatdong': STATUS_COLORS.inactive,
    'ngưng hoạt động': STATUS_COLORS.inactive,

    // Pending states
    'pending': STATUS_COLORS.pending,
    'cho': STATUS_COLORS.pending,
    'chờ': STATUS_COLORS.pending,
    'choxuly': STATUS_COLORS.pending,
    'chờ xử lý': STATUS_COLORS.pending,

    // Processing states
    'processing': STATUS_COLORS.processing,
    'dangxuly': STATUS_COLORS.processing,
    'đangxửlý': STATUS_COLORS.processing,
    'đang xử lý': STATUS_COLORS.processing,

    // Completed states
    'completed': STATUS_COLORS.completed,
    'done': STATUS_COLORS.completed,
    'hoanthanh': STATUS_COLORS.completed,
    'hoàn thành': STATUS_COLORS.completed,
    'dathanhtoan': STATUS_COLORS.completed,
    'đã thanh toán': STATUS_COLORS.completed,
    'dacheckin': STATUS_COLORS.completed,
    'đã check-in': STATUS_COLORS.completed,
    'dangmaban': STATUS_COLORS.completed,
    'đang mở bán': STATUS_COLORS.completed,

    // Cancelled states
    'cancelled': STATUS_COLORS.cancelled,
    'canceled': STATUS_COLORS.cancelled,
    'dahuy': STATUS_COLORS.cancelled,
    'đã hủy': STATUS_COLORS.cancelled,
    'huy': STATUS_COLORS.cancelled,
    'hủy': STATUS_COLORS.cancelled,

    // Failed states
    'failed': STATUS_COLORS.failed,
    'error': STATUS_COLORS.failed,
    'loi': STATUS_COLORS.failed,
    'lỗi': STATUS_COLORS.failed,
    'thatbai': STATUS_COLORS.failed,
    'thất bại': STATUS_COLORS.failed,

    // Draft states
    'draft': STATUS_COLORS.draft,
    'nhap': STATUS_COLORS.draft,

    // Published states
    'published': STATUS_COLORS.published,
    'dangban': STATUS_COLORS.published,
    'đang bán': STATUS_COLORS.published,

    // Flight specific states
    'da_khoi_hanh': STATUS_COLORS.inactive,
    'da_khoihanh': STATUS_COLORS.inactive,
    'đã_khởi_hành': STATUS_COLORS.inactive,
    'delay': STATUS_COLORS.pending,
  };

  const mappedStatus = statusMap[normalizedStatus];

  if (mappedStatus) {
    return `${mappedStatus.bg} ${mappedStatus.text}`;
  }

  // Fallback to default
  return STATUS_COLORS.default.bg + ' ' + STATUS_COLORS.default.text;
};

/**
 * Trả về màu badge dựa trên loại (type)
 * @param {string} type - Loại badge (success, warning, error, info, default)
 * @returns {string} - CSS class string cho màu badge
 */
export const getBadgeColor = (type) => {
  if (!type) {
    return STATUS_COLORS.default.bg + ' ' + STATUS_COLORS.default.text;
  }

  const normalizedType = type.toString().toLowerCase().trim();

  switch (normalizedType) {
    case 'success':
    case 'thanhcong':
    case 'thành công':
      return TAILWIND_COLORS.success.badge;
    case 'warning':
    case 'canhbao':
    case 'cảnh báo':
      return TAILWIND_COLORS.warning.badge;
    case 'error':
    case 'danger':
    case 'loi':
    case 'lỗi':
      return TAILWIND_COLORS.error.badge;
    case 'info':
    case 'thongtin':
    case 'thông tin':
      return TAILWIND_COLORS.info.badge;
    default:
      return STATUS_COLORS.default.bg + ' ' + STATUS_COLORS.default.text;
  }
};

/**
 * Gộp nhiều CSS classes thành một string, lọc các giá trị falsy
 * @param {...string} classes - Các class cần gộp
 * @returns {string} - CSS class string đã gộp
 */
export const mergeClasses = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Trả về các class cho badge trạng thái hoàn chỉnh (bao gồm cả border và rounded)
 * @param {string} status - Trạng thái
 * @param {Object} options - Tùy chọn bổ sung
 * @param {string} options.size - Kích thước badge: 'sm', 'md', 'lg' (default: 'md')
 * @param {boolean} options.dot - Hiển thị chấm tròn ở đầu
 * @returns {string} - CSS class string đầy đủ
 */
export const getStatusBadgeClasses = (status, options = {}) => {
  const { size = 'md', dot = false } = options;

  const baseClasses = ['inline-flex', 'items-center', 'font-medium'];

  // Size classes
  const sizeClasses = {
    sm: ['px-2', 'py-0.5', 'text-xs'],
    md: ['px-2.5', 'py-1', 'text-sm'],
    lg: ['px-3', 'py-1.5', 'text-base'],
  };
  baseClasses.push(...(sizeClasses[size] || sizeClasses.md));

  // Border radius
  baseClasses.push('rounded-full');

  const colorClasses = getStatusColor(status);

  return mergeClasses(...baseClasses, colorClasses);
};

/**
 * Trả về các class cho nút bấm theo biến thể
 * @param {string} variant - Biến thể nút: 'primary', 'secondary', 'success', 'danger', 'outline', 'ghost', 'link'
 * @param {Object} options - Tùy chọn bổ sung
 * @param {string} options.size - Kích thước nút: 'sm', 'md', 'lg' (default: 'md')
 * @param {boolean} options.disabled - Trạng thái disabled
 * @returns {string} - CSS class string đầy đủ
 */
export const getButtonClasses = (variant = 'primary', options = {}) => {
  const { size = 'md', disabled = false } = options;

  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'rounded-lg',
    'transition-colors',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
  ];

  // Size classes
  const sizeClasses = {
    sm: ['px-3', 'py-1.5', 'text-sm'],
    md: ['px-4', 'py-2', 'text-base'],
    lg: ['px-6', 'py-3', 'text-lg'],
  };
  baseClasses.push(...(sizeClasses[size] || sizeClasses.md));

  // Variant classes
  const variantClasses = {
    primary: [
      TAILWIND_COLORS.primary.bg,
      TAILWIND_COLORS.primary.bgHover,
      TAILWIND_COLORS.primary.text,
      TAILWIND_COLORS.primary.ring,
      'focus:ring-offset-white',
    ],
    secondary: [
      TAILWIND_COLORS.secondary.bg,
      TAILWIND_COLORS.secondary.bgHover,
      TAILWIND_COLORS.secondary.text,
      TAILWIND_COLORS.secondary.ring,
    ],
    success: [
      TAILWIND_COLORS.success.bg,
      TAILWIND_COLORS.success.bgHover,
      TAILWIND_COLORS.success.text,
      TAILWIND_COLORS.success.ring,
    ],
    danger: [
      TAILWIND_COLORS.error.bg,
      TAILWIND_COLORS.error.bgHover,
      TAILWIND_COLORS.error.text,
      TAILWIND_COLORS.error.ring,
    ],
    outline: [
      TAILWIND_COLORS.neutral.borderLight,
      TAILWIND_COLORS.neutral.textDark,
      TAILWIND_COLORS.neutral.bgHover,
      TAILWIND_COLORS.neutral.bgLighter,
      TAILWIND_COLORS.neutral.ring,
    ],
    ghost: [
      TAILWIND_COLORS.neutral.text,
      TAILWIND_COLORS.neutral.bgHover,
      TAILWIND_COLORS.neutral.bgLight,
    ],
    link: [
      TAILWIND_COLORS.primary.text,
      TAILWIND_COLORS.primary.textHover,
      'bg-transparent',
      'hover:bg-transparent',
    ],
  };

  const classes = variantClasses[variant] || variantClasses.primary;
  baseClasses.push(...classes);

  // Disabled state
  if (disabled) {
    baseClasses.push(
      'opacity-50',
      'cursor-not-allowed',
      'pointer-events-none'
    );
  }

  return mergeClasses(...baseClasses);
};

/**
 * Trả về các class cho gradient background
 * @param {string} variant - Loại gradient: 'primary', 'primaryLight', 'secondary', 'success', 'warning', 'error', 'info'
 * @returns {string} - CSS class string cho gradient
 */
export const getGradientClasses = (variant = 'primary') => {
  const gradients = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700',
    primaryLight: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    secondary: 'bg-gradient-to-r from-indigo-600 to-indigo-700',
    secondaryLight: 'bg-gradient-to-br from-indigo-50 to-purple-50',
    success: 'bg-gradient-to-r from-green-600 to-green-700',
    successLight: 'bg-gradient-to-br from-green-50 to-emerald-50',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    warningLight: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    error: 'bg-gradient-to-r from-red-600 to-red-700',
    errorLight: 'bg-gradient-to-br from-red-50 to-pink-50',
    info: 'bg-gradient-to-r from-sky-600 to-blue-600',
    infoLight: 'bg-gradient-to-br from-sky-50 to-blue-50',
  };

  return gradients[variant] || gradients.primary;
};

/**
 * Trả về các class cho text color
 * @param {string} color - Màu chữ: 'primary', 'secondary', 'success', 'warning', 'error', 'info', 'neutral'
 * @returns {string} - CSS class string cho màu chữ
 */
export const getTextClasses = (color = 'primary') => {
  const normalizedColor = color.toString().toLowerCase().trim();

  const colorMap = {
    primary: TAILWIND_COLORS.primary.text,
    secondary: TAILWIND_COLORS.secondary.text,
    success: TAILWIND_COLORS.success.text,
    warning: TAILWIND_COLORS.warning.text,
    error: TAILWIND_COLORS.error.text,
    info: TAILWIND_COLORS.info.text,
    neutral: TAILWIND_COLORS.neutral.text,
  };

  return colorMap[normalizedColor] || TAILWIND_COLORS.primary.text;
};

/**
 * Trả về các class cho border color
 * @param {string} color - Màu border: 'primary', 'secondary', 'success', 'warning', 'error', 'info', 'neutral'
 * @returns {string} - CSS class string cho màu border
 */
export const getBorderClasses = (color = 'primary') => {
  const normalizedColor = color.toString().toLowerCase().trim();

  const colorMap = {
    primary: TAILWIND_COLORS.primary.borderLight,
    secondary: TAILWIND_COLORS.secondary.borderLight,
    success: TAILWIND_COLORS.success.borderLight,
    warning: TAILWIND_COLORS.warning.borderLight,
    error: TAILWIND_COLORS.error.borderLight,
    info: TAILWIND_COLORS.info.borderLight,
    neutral: TAILWIND_COLORS.neutral.borderLight,
  };

  return colorMap[normalizedColor] || TAILWIND_COLORS.primary.borderLight;
};

/**
 * Trả về màu badge và icon cho trạng thái thanh toán
 * @param {string} paymentStatus - Trạng thái thanh toán
 * @returns {Object} - { text, color, icon }
 */
export const getPaymentStatusInfo = (paymentStatus) => {
  if (!paymentStatus) {
    return {
      text: 'Chưa thanh toán',
      color: TAILWIND_COLORS.warning.badge,
      icon: '⏱'
    };
  }

  const normalizedStatus = paymentStatus.toString().toLowerCase().trim();

  switch (normalizedStatus) {
    case 'paid':
    case 'dathanhtoan':
    case 'đã thanh toán':
    case 'completed':
    case 'hoàn thành':
      return {
        text: 'Đã thanh toán',
        color: TAILWIND_COLORS.success.badge,
        icon: '✓'
      };
    case 'pending':
    case 'cho':
    case 'chờ':
    case 'chothanhtoan':
    case 'chờ thanh toán':
      return {
        text: 'Chờ thanh toán',
        color: TAILWIND_COLORS.warning.badge,
        icon: '⏱'
      };
    case 'failed':
    case 'thatbai':
    case 'thất bại':
      return {
        text: 'Thất bại',
        color: TAILWIND_COLORS.error.badge,
        icon: '✗'
      };
    case 'cancelled':
    case 'dahuy':
    case 'đã hủy':
    case 'huy':
    case 'hủy':
      return {
        text: 'Đã hủy',
        color: TAILWIND_COLORS.error.badge,
        icon: '✗'
      };
    default:
      return {
        text: paymentStatus,
        color: STATUS_COLORS.default.bg + ' ' + STATUS_COLORS.default.text,
        icon: '•'
      };
  }
};

/**
 * Trả về màu badge và icon cho trạng thái booking
 * @param {string} bookingStatus - Trạng thái booking
 * @returns {Object} - { text, color, icon }
 */
export const getBookingStatusInfo = (bookingStatus) => {
  if (!bookingStatus) {
    return {
      text: 'Chưa biết',
      color: STATUS_COLORS.default.bg + ' ' + STATUS_COLORS.default.text,
      icon: '?'
    };
  }

  const normalizedStatus = bookingStatus.toString().toLowerCase().trim();

  switch (normalizedStatus) {
    case 'confirmed':
    case 'xacnhan':
    case 'xác nhận':
      return {
        text: 'Đã xác nhận',
        color: TAILWIND_COLORS.success.badge,
        icon: '✓'
      };
    case 'pending':
    case 'cho':
    case 'chờ':
    case 'choxacnhan':
    case 'chờ xác nhận':
      return {
        text: 'Chờ xác nhận',
        color: TAILWIND_COLORS.warning.badge,
        icon: '⏱'
      };
    case 'checkedin':
    case 'dacheckin':
    case 'đã check-in':
    case 'checkin':
      return {
        text: 'Đã check-in',
        color: TAILWIND_COLORS.success.badge,
        icon: '✓'
      };
    case 'cancelled':
    case 'dahuy':
    case 'đã hủy':
    case 'huy':
    case 'hủy':
      return {
        text: 'Đã hủy',
        color: TAILWIND_COLORS.error.badge,
        icon: '✗'
      };
    default:
      return {
        text: bookingStatus,
        color: STATUS_COLORS.default.bg + ' ' + STATUS_COLORS.default.text,
        icon: '•'
      };
  }
};

// Export default object for convenience
export default {
  getStatusColor,
  getBadgeColor,
  mergeClasses,
  getStatusBadgeClasses,
  getButtonClasses,
  getGradientClasses,
  getTextClasses,
  getBorderClasses,
  getPaymentStatusInfo,
  getBookingStatusInfo,
};
