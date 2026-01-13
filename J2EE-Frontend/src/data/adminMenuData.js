/**
 * File cấu hình menu admin với permissions
 * Mapping giữa các trang quản lý và permission keys từ backend
 *
 * Cấu trúc permission từ backend: {FEATURE_CODE}_{ACTION}
 * Ví dụ: FLIGHT_VIEW, CUSTOMER_CREATE, REPORT_EXPORT, etc.
 */

import {
  FaChartBar,
  FaUsers,
  FaRoute,
  FaPlaneDeparture,
  FaConciergeBell,
  FaDollarSign,
  FaTags,
  FaFighterJet,
  FaFileInvoice,
  FaUndo,
  FaHistory,
  FaUserShield,
  FaKey,
  FaTicketAlt,
  FaCalendarCheck,
  FaShoppingCart
} from 'react-icons/fa';
import { MdLocalAirport } from 'react-icons/md';

/**
 * Danh sách menu items cho Admin Panel - Đầy đủ thông tin
 * Mỗi menu item bao gồm:
 * - path: Route path
 * - text: Tên hiển thị
 * - icon: Icon component
 * - permissionKey: Permission cần để hiển thị (FEATURE_VIEW)
 * - featureCode: Mã chức năng (từ database: chuc_nang.ma_code)
 * - featureName: Tên chức năng (từ database: chuc_nang.ten_chuc_nang)
 * - group: Nhóm chức năng (từ database: chuc_nang.nhom)
 * - color: Gradient color cho UI
 * - description: Mô tả chức năng
 */
export const adminMenuItems = [
  {
    path: 'ThongKe',
    text: 'Thống kê',
    icon: FaChartBar,
    permissionKey: 'REPORT_VIEW',
    featureCode: 'REPORT',
    featureName: 'Báo cáo thống kê',
    group: 'Báo cáo',
    color: 'from-blue-500 to-cyan-500',
    description: 'Xem báo cáo doanh thu và thống kê'
  },
  {
    path: 'KhachHang',
    text: 'Khách hàng',
    icon: FaUsers,
    permissionKey: 'CUSTOMER_VIEW',
    featureCode: 'CUSTOMER',
    featureName: 'Quản lý Khách hàng',
    group: 'Bán vé',
    color: 'from-purple-500 to-pink-500',
    description: 'Quản lý thông tin khách hàng'
  },
  {
    path: 'DatCho',
    text: 'Đặt chỗ',
    icon: FaCalendarCheck,
    permissionKey: 'BOOKING_VIEW',
    featureCode: 'BOOKING',
    featureName: 'Quản lý Đặt chỗ',
    group: 'Bán vé',
    color: 'from-cyan-500 to-blue-500',
    description: 'Quản lý đặt chỗ vé'
  },
  {
    path: 'DonHang',
    text: 'Đơn hàng',
    icon: FaShoppingCart,
    permissionKey: 'ORDER_VIEW',
    featureCode: 'ORDER',
    featureName: 'Quản lý Đơn hàng',
    group: 'Bán vé',
    color: 'from-orange-500 to-amber-500',
    description: 'Quản lý đơn hàng'
  },
  {
    path: 'TuyenBay',
    text: 'Tuyến bay',
    icon: FaRoute,
    permissionKey: 'ROUTE_VIEW',
    featureCode: 'ROUTE',
    featureName: 'Quản lý Tuyến bay',
    group: 'Vận hành',
    color: 'from-green-500 to-emerald-500',
    description: 'Quản lý tuyến đường bay'
  },
  {
    path: 'ChuyenBay',
    text: 'Chuyến bay',
    icon: FaPlaneDeparture,
    permissionKey: 'FLIGHT_VIEW',
    featureCode: 'FLIGHT',
    featureName: 'Quản lý Chuyến bay',
    group: 'Vận hành',
    color: 'from-orange-500 to-red-500',
    description: 'Quản lý chuyến bay'
  },
  {
    path: 'SanBay',
    text: 'Sân bay',
    icon: MdLocalAirport,
    permissionKey: 'AIRPORT_VIEW',
    featureCode: 'AIRPORT',
    featureName: 'Quản lý Sân bay',
    group: 'Vận hành',
    color: 'from-indigo-500 to-blue-500',
    description: 'Quản lý thông tin sân bay'
  },
  {
    path: 'MayBay',
    text: 'Máy bay',
    icon: FaFighterJet,
    permissionKey: 'AIRCRAFT_VIEW',
    featureCode: 'AIRCRAFT',
    featureName: 'Quản lý Máy bay',
    group: 'Vận hành',
    color: 'from-sky-500 to-blue-600',
    description: 'Quản lý đội bay'
  },
  {
    path: 'DichVu',
    text: 'Dịch vụ',
    icon: FaConciergeBell,
    permissionKey: 'SERVICE_VIEW',
    featureCode: 'SERVICE',
    featureName: 'Quản lý Dịch vụ',
    group: 'Dịch vụ',
    color: 'from-yellow-500 to-orange-500',
    description: 'Quản lý dịch vụ phụ trợ'
  },
  {
    path: 'GiaBay',
    text: 'Giá chuyến bay',
    icon: FaDollarSign,
    permissionKey: 'PRICE_VIEW',
    featureCode: 'PRICE',
    featureName: 'Quản lý Giá vé',
    group: 'Tài chính',
    color: 'from-teal-500 to-cyan-500',
    description: 'Quản lý giá vé các hạng vé'
  },
  {
    path: 'HangVe',
    text: 'Hạng vé',
    icon: FaTicketAlt,
    permissionKey: 'PRICE_VIEW',
    featureCode: 'PRICE',
    featureName: 'Quản lý Giá vé',
    group: 'Tài chính',
    color: 'from-violet-500 to-purple-600',
    description: 'Quản lý các hạng vé (Economy, Business, ...)'
  },
  {
    path: 'HoaDon',
    text: 'Hóa đơn',
    icon: FaFileInvoice,
    permissionKey: 'PAYMENT_VIEW',
    featureCode: 'PAYMENT',
    featureName: 'Quản lý Thanh toán',
    group: 'Tài chính',
    color: 'from-teal-500 to-cyan-600',
    description: 'Quản lý hóa đơn và thanh toán'
  },
  {
    path: 'HoanTien',
    text: 'Hoàn tiền',
    icon: FaUndo,
    permissionKey: 'REFUND_VIEW',
    featureCode: 'REFUND',
    featureName: 'Quản lý Hoàn tiền',
    group: 'Tài chính',
    color: 'from-lime-500 to-green-600',
    description: 'Xử lý yêu cầu hoàn tiền'
  },
  {
    path: 'KhuyenMai',
    text: 'Khuyến mãi',
    icon: FaTags,
    permissionKey: 'PROMOTION_VIEW',
    featureCode: 'PROMOTION',
    featureName: 'Quản lý Khuyến mãi',
    group: 'Marketing',
    color: 'from-pink-500 to-rose-500',
    description: 'Quản lý chương trình khuyến mãi'
  },
  {
    path: 'LichSuThaoTac',
    text: 'Lịch sử thao tác',
    icon: FaHistory,
    permissionKey: 'REPORT_VIEW',
    featureCode: 'REPORT',
    featureName: 'Báo cáo thống kê',
    group: 'Báo cáo',
    color: 'from-green-500 to-emerald-600',
    description: 'Xem log lịch sử thao tác (Audit Log)'
  },
  {
    path: 'QuanLyTKAdmin',
    text: 'Quản lý TK Admin',
    icon: FaUsers,
    permissionKey: 'USER_VIEW',
    featureCode: 'USER',
    featureName: 'Quản lý Người dùng',
    group: 'Hệ thống',
    color: 'from-purple-500 to-pink-500',
    description: 'Quản lý tài khoản admin'
  },
  {
    path: 'VaiTro',
    text: 'Quản lý Vai trò',
    icon: FaUserShield,
    permissionKey: 'ROLE_VIEW',
    featureCode: 'ROLE',
    featureName: 'Quản lý Vai trò',
    group: 'Hệ thống',
    color: 'from-violet-500 to-purple-600',
    description: 'Quản lý vai trò hệ thống'
  },
  {
    path: 'PhanQuyen',
    text: 'Phân quyền',
    icon: FaKey,
    permissionKey: 'PERMISSION_VIEW',
    featureCode: 'PERMISSION',
    featureName: 'Quản lý Phân quyền',
    group: 'Hệ thống',
    color: 'from-amber-500 to-orange-600',
    description: 'Cấu hình phân quyền hệ thống'
  }
];

/**
 * Mapping permissions theo Feature Code từ database
 * Dựa vào bảng chuc_nang trong V2__Initial_Data.sql
 */
export const permissionMapping = {
  // Features từ database
  DASHBOARD: 'Thống kê & Báo cáo',
  KHACHHANG: 'Quản lý Khách hàng',
  DATCHO: 'Quản lý Đặt chỗ',
  DONHANG: 'Quản lý Đơn hàng',
  TUYENBAY: 'Quản lý Tuyến bay',
  CHUYENBAY: 'Quản lý Chuyến bay',
  GIABAY: 'Quản lý Giá vé',
  SANBAY: 'Quản lý Sân bay',
  MAYBAY: 'Quản lý Máy bay',
  DICHVU: 'Quản lý Dịch vụ',
  KHUYENMAI: 'Quản lý Khuyến mãi',
  HOADON: 'Quản lý Hóa đơn',
  HOANTIEN: 'Quản lý Hoàn tiền',
  ADMIN: 'Quản lý Tài khoản Admin',
  VAITRO: 'Quản lý Vai trò',
  PHANQUYEN: 'Phân quyền',

  // Mapping cũ để tương thích (nếu cần)
  REPORT: 'Thống kê & Báo cáo',
  CUSTOMER: 'Khách hàng',
  BOOKING: 'Đặt chỗ',
  ORDER: 'Đơn hàng',
  ROUTE: 'Tuyến bay',
  FLIGHT: 'Chuyến bay',
  AIRPORT: 'Sân bay',
  AIRCRAFT: 'Máy bay',
  PAYMENT: 'Thanh toán',
  REFUND: 'Hoàn tiền',
  PROMOTION: 'Khuyến mãi',
  SERVICE: 'Dịch vụ',
  PRICE: 'Giá vé',
  USER: 'Người dùng',
  ROLE: 'Vai trò',
  PERMISSION: 'Phân quyền'
};

/**
 * Danh sách actions từ bảng hanh_dong trong database
 * Đồng bộ với V2__Initial_Data.sql lines 243-253
 */
export const actionList = [
  { code: 'VIEW', label: 'Xem', description: 'Xem/Đọc dữ liệu' },
  { code: 'CREATE', label: 'Tạo mới', description: 'Tạo mới' },
  { code: 'UPDATE', label: 'Cập nhật', description: 'Cập nhật/Sửa' },
  { code: 'DELETE', label: 'Xóa', description: 'Xóa' },
  { code: 'IMPORT', label: 'Import', description: 'Import dữ liệu' },
  { code: 'EXPORT', label: 'Export', description: 'Export/Tải xuống' },
  { code: 'APPROVE', label: 'Phê duyệt', description: 'Phê duyệt' },
  { code: 'CANCEL', label: 'Hủy bỏ', description: 'Hủy bỏ' },
  { code: 'RESTORE', label: 'Khôi phục', description: 'Khôi phục' },
  { code: 'MANAGE', label: 'Quản lý toàn bộ', description: 'Quản lý toàn bộ' }
];

/**
 * Helper function để lấy menu items theo permissions - FLAT LIST
 * Hỗ trợ 2 format permissions:
 * 1. Format cụ thể: ["CUSTOMER_VIEW", "BOOKING_CREATE", ...]
 * 2. Format MANAGE: ["CUSTOMER_MANAGE", "BOOKING_MANAGE", ...]
 *
 * @param {Array<string>} userPermissions - Danh sách permissions của user từ localStorage
 * @returns {Array} - Danh sách menu items được phép hiển thị (flat list)
 */
export const getMenuItemsByPermissions = (userPermissions = []) => {
  if (!Array.isArray(userPermissions) || userPermissions.length === 0) {
    return [];
  }

  return adminMenuItems.filter(item => {
    // Nếu không có permissionKey, ai cũng thấy (như Dashboard)
    if (!item.permissionKey) return true;

    // Check xem user có permission này không
    // Support cả format cũ và mới
    return userPermissions.some(perm => {
      // 1. Check trực tiếp permission key (format cũ: CUSTOMER_VIEW)
      if (perm === item.permissionKey) return true;

      // 2. Check theo pattern FEATURE_ACTION (format mới: CUSTOMER_MANAGE)
      const permParts = perm.split('_');
      if (permParts.length >= 2) {
        const feature = permParts[0];
        const action = permParts.slice(1).join('_');

        // Mapping với menu item
        // Ví dụ: ROUTE_VIEW -> TuyenBay, ROUTE_MANAGE -> TuyenBay
        return checkPermissionMatch(item, feature, action);
      }

      return false;
    });
  });
};

/**
 * Helper function để lấy menu items được group theo nhóm chức năng
 * @param {Array<string>} userPermissions - Danh sách permissions của user
 * @returns {Object} - Menu items được group theo nhóm
 *                    { groupName: { items: [], color: "", icon: "" } }
 */
export const getMenuItemsGroupedByPermissions = (userPermissions = []) => {
  const filteredMenu = getMenuItemsByPermissions(userPermissions);

  // Group menu items by group
  const grouped = filteredMenu.reduce((acc, item) => {
    const group = item.group || 'Khác';

    if (!acc[group]) {
      acc[group] = {
        groupName: group,
        items: [],
        // Color của group = color của item đầu tiên trong group
        color: item.color,
        icon: null // Sẽ set sau
      };
    }

    acc[group].items.push(item);
    return acc;
  }, {});

  return grouped;
};

/**
 * Helper function để lấy danh sách các nhóm chức năng
 * @returns {Array} - Danh sách nhóm với thông tin
 */
export const getMenuGroups = () => {
  const groups = {};

  adminMenuItems.forEach(item => {
    const group = item.group || 'Khác';

    if (!groups[group]) {
      groups[group] = {
        name: group,
        color: item.color,
        icon: item.icon,
        itemCount: 0
      };
    }

    groups[group].itemCount++;
  });

  // Convert to array and sort by item count
  return Object.values(groups).sort((a, b) => b.itemCount - a.itemCount);
};

/**
 * Helper function để check permission match với menu item
 */
const checkPermissionMatch = (menuItem, feature, action) => {
  // Mapping feature code với menu item
  const featureMap = {
    'REPORT': 'ThongKe',
    'CUSTOMER': 'KhachHang',
    'BOOKING': 'DatCho',
    'ORDER': 'DonHang',
    'ROUTE': 'TuyenBay',
    'FLIGHT': 'ChuyenBay',
    'PRICE': 'GiaBay',
    'SERVICE': 'DichVu',
    'AIRPORT': 'SanBay',
    'PROMOTION': 'KhuyenMai',
    'AIRCRAFT': 'MayBay',
    'PAYMENT': 'HoaDon',
    'REFUND': 'HoanTien',
    'USER': 'QuanLyTKAdmin',
    'ROLE': 'VaiTro',
    'PERMISSION': 'PhanQuyen'
  };

  // Special cases
  // 1. LichSuThaoTac dùng chung REPORT (là phần của báo cáo)
  if (menuItem.path === 'LichSuThaoTac' && feature === 'REPORT') {
    return action === 'VIEW' || action === 'MANAGE';
  }

  // 2. HangVe và GiaBay dùng chung PRICE
  if (menuItem.path === 'HangVe' && feature === 'PRICE') {
    return action === 'VIEW' || action === 'MANAGE';
  }

  // Check xem feature có match với menu item không
  const expectedPath = featureMap[feature];
  if (expectedPath === menuItem.path) {
    // Cho phép cả VIEW và MANAGE (và các action khác)
    // MANAGE có quyền cao nhất, bao gồm cả VIEW
    return action === 'VIEW' || action === 'MANAGE';
  }

  return false;
};

/**
 * Helper function để check user có quyền truy cập menu không
 * @param {string} menuPath - Path của menu
 * @param {Array<string>} userPermissions - Permissions của user
 * @returns {boolean}
 */
export const canAccessMenu = (menuPath, userPermissions = []) => {
  const menuItem = adminMenuItems.find(item => item.path === menuPath);
  if (!menuItem) return false;

  if (!menuItem.permissionKey) return true;

  return userPermissions.some(perm => {
    if (perm === menuItem.permissionKey) return true;

    const permParts = perm.split('_');
    if (permParts.length >= 2) {
      const feature = permParts[0];
      const action = permParts.slice(1).join('_');
      return checkPermissionMatch(menuItem, feature, action);
    }

    return false;
  });
};

/**
 * Dữ liệu phân quyền cho các Role trong hệ thống
 * Dựa vào bảng phan_quyen trong V2__Initial_Data.sql
 *
 * Cấu trúc: Role có danh sách permissions theo format {FEATURE}_{ACTION}
 * Ví dụ: "FLIGHT_VIEW", "CUSTOMER_CREATE", "BOOKING_MANAGE", etc.
 */
export const rolePermissions = {
  // SUPER_ADMIN - Toàn quyền tất cả
  SUPER_ADMIN: [
    'FLIGHT_MANAGE',
    'ROUTE_MANAGE',
    'AIRPORT_MANAGE',
    'AIRCRAFT_MANAGE',
    'BOOKING_MANAGE',
    'ORDER_MANAGE',
    'CUSTOMER_MANAGE',
    'PAYMENT_MANAGE',
    'REFUND_MANAGE',
    'PROMOTION_MANAGE',
    'SERVICE_MANAGE',
    'PRICE_MANAGE',
    'REPORT_MANAGE',
    'USER_MANAGE',
    'ROLE_MANAGE',
    'PERMISSION_MANAGE'
  ],

  // QUAN_LY - Quản lý chính
  QUAN_LY: [
    'FLIGHT_VIEW', 'FLIGHT_CREATE', 'FLIGHT_UPDATE', 'FLIGHT_DELETE',
    'ROUTE_VIEW', 'ROUTE_CREATE', 'ROUTE_UPDATE',
    'BOOKING_VIEW', 'BOOKING_UPDATE', 'BOOKING_CANCEL',
    'ORDER_VIEW', 'ORDER_UPDATE',
    'CUSTOMER_VIEW', 'CUSTOMER_CREATE', 'CUSTOMER_UPDATE',
    'PAYMENT_VIEW', 'PAYMENT_APPROVE',
    'REPORT_VIEW', 'REPORT_EXPORT'
  ],

  // NHAN_VIEN_VE - Nhân viên bán vé
  NHAN_VIEN_VE: [
    'BOOKING_VIEW', 'BOOKING_CREATE', 'BOOKING_UPDATE', 'BOOKING_CANCEL',
    'ORDER_VIEW', 'ORDER_CREATE', 'ORDER_UPDATE',
    'CUSTOMER_VIEW', 'CUSTOMER_CREATE', 'CUSTOMER_UPDATE',
    'FLIGHT_VIEW',
    'SERVICE_VIEW'
  ],

  // KE_TOAN - Kế toán
  KE_TOAN: [
    'PAYMENT_VIEW', 'PAYMENT_UPDATE', 'PAYMENT_APPROVE',
    'REFUND_VIEW', 'REFUND_UPDATE', 'REFUND_APPROVE',
    'PRICE_VIEW', 'PRICE_UPDATE',
    'REPORT_VIEW', 'REPORT_EXPORT',
    'ORDER_VIEW'
  ],

  // VAN_HANH - Vận hành
  VAN_HANH: [
    'FLIGHT_VIEW', 'FLIGHT_CREATE', 'FLIGHT_UPDATE', 'FLIGHT_DELETE',
    'ROUTE_VIEW', 'ROUTE_CREATE', 'ROUTE_UPDATE',
    'AIRPORT_VIEW',
    'AIRCRAFT_VIEW', 'AIRCRAFT_UPDATE',
    'BOOKING_VIEW'
  ]
};

/**
 * Helper function để lấy permissions theo role code
 * @param {string} roleCode - Mã role (SUPER_ADMIN, QUAN_LY, etc.)
 * @returns {Array<string>} - Danh sách permissions
 */
export const getPermissionsByRole = (roleCode) => {
  return rolePermissions[roleCode] || [];
};

/**
 * Helper function để lấy permissions theo danh sách roles
 * @param {Array<string>} roles - Danh sách role codes
 * @returns {Array<string>} - Danh sách all permissions (gộp tất cả)
 */
export const getPermissionsByRoles = (roles = []) => {
  if (!Array.isArray(roles) || roles.length === 0) {
    return [];
  }

  // Gộp tất cả permissions từ các roles, loại bỏ trùng lặp
  const allPermissions = roles.reduce((acc, role) => {
    const rolePerms = getPermissionsByRole(role);
    return [...acc, ...rolePerms];
  }, []);

  // Remove duplicates
  return [...new Set(allPermissions)];
};

/**
 * Mapping role code sang tên hiển thị
 */
export const roleNames = {
  SUPER_ADMIN: 'Super Admin',
  QUAN_LY: 'Quản lý',
  NHAN_VIEN_VE: 'Nhân viên bán vé',
  KE_TOAN: 'Kế toán',
  VAN_HANH: 'Vận hành'
};

// Export default
export default adminMenuItems;
