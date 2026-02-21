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
  FaShoppingCart,
  FaFileExport,
  FaBalanceScale,
  FaImage,
  FaServer,
  FaHeadset
} from 'react-icons/fa';
import { MdLocalAirport } from 'react-icons/md';
import MenuService from '../services/MenuService';

/**
 * Icon mapping - Map icon name từ API sang React Icon component
 * API chỉ trả về string "FaPlaneDeparture", cần map sang component thực tế
 */
const iconMap = {
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
  FaShoppingCart,
  FaFileExport,
  FaBalanceScale,
  FaImage,
  FaServer,
  FaHeadset,
  MdLocalAirport
};

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
    path: '/admin/dashboard/ThongKe',
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
    path: '/admin/dashboard/KhachHang',
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
    path: '/admin/dashboard/DatCho',
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
    path: '/admin/dashboard/DonHang',
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
    path: '/admin/dashboard/TuyenBay',
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
    path: '/admin/dashboard/ChuyenBay',
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
    path: '/admin/dashboard/SanBay',
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
    path: '/admin/dashboard/MayBay',
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
    path: '/admin/dashboard/DichVu',
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
    path: '/admin/dashboard/GiaBay',
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
    path: '/admin/dashboard/HangVe',
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
    path: '/admin/dashboard/HoaDon',
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
    path: '/admin/dashboard/HoanTien',
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
    path: '/admin/dashboard/KhuyenMai',
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
    path: '/admin/dashboard/XuatBaoCao',
    text: 'Xuất báo cáo',
    icon: FaFileExport,
    permissionKey: 'EXPORT_REPORT_VIEW',
    featureCode: 'EXPORT_REPORT',
    featureName: 'Xuất báo cáo',
    group: 'Báo cáo',
    color: 'from-emerald-500 to-teal-500',
    description: 'Xuất báo cáo doanh thu, danh sách hành khách dạng Excel/PDF'
  },
  {
    path: '/admin/dashboard/DoiSoatGiaoDich',
    text: 'Đối soát giao dịch',
    icon: FaBalanceScale,
    permissionKey: 'RECONCILIATION_VIEW',
    featureCode: 'RECONCILIATION',
    featureName: 'Đối soát giao dịch',
    group: 'Tài chính',
    color: 'from-amber-500 to-yellow-500',
    description: 'Đối soát giao dịch với cổng thanh toán VNPay'
  },
  {
    path: '/admin/dashboard/BannerTinTuc',
    text: 'Banner & Tin tức',
    icon: FaImage,
    permissionKey: 'BANNER_NEWS_VIEW',
    featureCode: 'BANNER_NEWS',
    featureName: 'Quản lý Banner & Tin tức',
    group: 'Marketing',
    color: 'from-fuchsia-500 to-pink-500',
    description: 'Quản lý banner quảng cáo và tin tức trang chủ'
  },
  {
    path: '/admin/dashboard/LichSuGiaoDichVNPay',
    text: 'Log giao dịch VNPay',
    icon: FaServer,
    permissionKey: 'TRANSACTION_LOG_VIEW',
    featureCode: 'TRANSACTION_LOG',
    featureName: 'Lịch sử giao dịch VNPay',
    group: 'Tài chính',
    color: 'from-slate-500 to-gray-600',
    description: 'Xem raw data IPN từ VNPay để debug và xử lý khiếu nại'
  },
  {
    path: '/admin/dashboard/HoTroLienHe',
    text: 'Hỗ trợ / Liên hệ',
    icon: FaHeadset,
    permissionKey: 'SUPPORT_VIEW',
    featureCode: 'SUPPORT',
    featureName: 'Hỗ trợ / Liên hệ',
    group: 'Dịch vụ',
    color: 'from-sky-500 to-cyan-500',
    description: 'Tiếp nhận và xử lý yêu cầu hỗ trợ từ khách hàng'
  },
  {
    path: '/admin/dashboard/LichSuThaoTac',
    text: 'Lịch sử thao tác',
    icon: FaHistory,
    permissionKey: 'AUDITLOG_VIEW',
    featureCode: 'AUDITLOG',
    featureName: 'Lịch sử thao tác',
    group: 'Hệ thống',
    color: 'from-green-500 to-emerald-600',
    description: 'Xem log lịch sử thao tác (Audit Log)'
  },
  {
    path: '/admin/dashboard/QuanLyTKAdmin',
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
    path: '/admin/dashboard/VaiTro',
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
    path: '/admin/dashboard/PhanQuyen',
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
  AUDITLOG: 'Lịch sử thao tác',
  EXPORT_REPORT: 'Xuất báo cáo',
  RECONCILIATION: 'Đối soát giao dịch',
  BANNER_NEWS: 'Banner & Tin tức',
  TRANSACTION_LOG: 'Log giao dịch VNPay',
  SUPPORT: 'Hỗ trợ / Liên hệ',

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

      // 2. Check MANAGE permission - nếu có MANAGE thì có tất cả các quyền
      const menuFeature = item.featureCode; // VD: 'AUDITLOG', 'FLIGHT'
      if (menuFeature) {
        const managePermission = `${menuFeature}_MANAGE`;
        if (perm === managePermission) return true;
      }

      // 3. Check theo pattern FEATURE_ACTION (format mới: CUSTOMER_MANAGE)
      // Tách action từ cuối chuỗi (VIEW, CREATE, UPDATE, DELETE, MANAGE, etc.)
      const knownActions = ['MANAGE', 'VIEW', 'CREATE', 'UPDATE', 'DELETE', 'IMPORT', 'EXPORT', 'APPROVE', 'CANCEL', 'RESTORE'];
      for (const action of knownActions) {
        if (perm.endsWith(`_${action}`)) {
          const feature = perm.substring(0, perm.length - action.length - 1);
          if (feature && checkPermissionMatch(item, feature, action)) {
            return true;
          }
        }
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
  // Mapping feature code với menu item path (có prefix /admin/dashboard/)
  const featureMap = {
    'REPORT': '/admin/dashboard/ThongKe',
    'CUSTOMER': '/admin/dashboard/KhachHang',
    'BOOKING': '/admin/dashboard/DatCho',
    'ORDER': '/admin/dashboard/DonHang',
    'ROUTE': '/admin/dashboard/TuyenBay',
    'FLIGHT': '/admin/dashboard/ChuyenBay',
    'PRICE': '/admin/dashboard/GiaBay',
    'SERVICE': '/admin/dashboard/DichVu',
    'AIRPORT': '/admin/dashboard/SanBay',
    'PROMOTION': '/admin/dashboard/KhuyenMai',
    'AIRCRAFT': '/admin/dashboard/MayBay',
    'PAYMENT': '/admin/dashboard/HoaDon',
    'REFUND': '/admin/dashboard/HoanTien',
    'USER': '/admin/dashboard/QuanLyTKAdmin',
    'ROLE': '/admin/dashboard/VaiTro',
    'PERMISSION': '/admin/dashboard/PhanQuyen',
    'AUDITLOG': '/admin/dashboard/LichSuThaoTac',
    'EXPORT_REPORT': '/admin/dashboard/XuatBaoCao',
    'RECONCILIATION': '/admin/dashboard/DoiSoatGiaoDich',
    'BANNER_NEWS': '/admin/dashboard/BannerTinTuc',
    'TRANSACTION_LOG': '/admin/dashboard/LichSuGiaoDichVNPay',
    'SUPPORT': '/admin/dashboard/HoTroLienHe'
  };

  // Special cases
  // 1. HangVe và GiaBay dùng chung PRICE
  if (menuItem.path === '/admin/dashboard/HangVe' && feature === 'PRICE') {
    return action === 'VIEW' || action === 'MANAGE';
  }

  // Check xem feature có match với menu item không
  const expectedPath = featureMap[feature];
  if (expectedPath === menuItem.path) {
    // Cho phép cả VIEW và MANAGE
    // MANAGE có quyền cao nhất, bao gồm cả VIEW
    if (action === 'MANAGE') return true;
    if (action === 'VIEW') return true;
    // Các action khác cũng được cho phép nếu có MANAGE (đã check ở trên)
    return false;
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
    'PERMISSION_MANAGE',
    'AUDITLOG_MANAGE',
    'EXPORT_REPORT_MANAGE',
    'RECONCILIATION_MANAGE',
    'BANNER_NEWS_MANAGE',
    'TRANSACTION_LOG_MANAGE',
    'SUPPORT_MANAGE'
  ],

  // QUAN_LY - Quản lý chính
  QUAN_LY: [
    'FLIGHT_VIEW', 'FLIGHT_CREATE', 'FLIGHT_UPDATE', 'FLIGHT_DELETE',
    'ROUTE_VIEW', 'ROUTE_CREATE', 'ROUTE_UPDATE',
    'BOOKING_VIEW', 'BOOKING_UPDATE', 'BOOKING_CANCEL',
    'ORDER_VIEW', 'ORDER_UPDATE',
    'CUSTOMER_VIEW', 'CUSTOMER_CREATE', 'CUSTOMER_UPDATE',
    'PAYMENT_VIEW', 'PAYMENT_APPROVE',
    'REPORT_VIEW', 'REPORT_EXPORT',
    'EXPORT_REPORT_VIEW', 'EXPORT_REPORT_EXPORT',
    'RECONCILIATION_VIEW',
    'BANNER_NEWS_VIEW', 'BANNER_NEWS_CREATE', 'BANNER_NEWS_UPDATE', 'BANNER_NEWS_DELETE',
    'SUPPORT_VIEW', 'SUPPORT_UPDATE'
  ],

  // NHAN_VIEN_VE - Nhân viên bán vé
  NHAN_VIEN_VE: [
    'BOOKING_VIEW', 'BOOKING_CREATE', 'BOOKING_UPDATE', 'BOOKING_CANCEL',
    'ORDER_VIEW', 'ORDER_CREATE', 'ORDER_UPDATE',
    'CUSTOMER_VIEW', 'CUSTOMER_CREATE', 'CUSTOMER_UPDATE',
    'FLIGHT_VIEW',
    'SERVICE_VIEW',
    'SUPPORT_VIEW', 'SUPPORT_UPDATE'
  ],

  // KE_TOAN - Kế toán
  KE_TOAN: [
    'PAYMENT_VIEW', 'PAYMENT_UPDATE', 'PAYMENT_APPROVE',
    'REFUND_VIEW', 'REFUND_UPDATE', 'REFUND_APPROVE',
    'PRICE_VIEW', 'PRICE_UPDATE',
    'REPORT_VIEW', 'REPORT_EXPORT',
    'ORDER_VIEW',
    'EXPORT_REPORT_VIEW', 'EXPORT_REPORT_EXPORT',
    'RECONCILIATION_VIEW', 'RECONCILIATION_UPDATE',
    'TRANSACTION_LOG_VIEW'
  ],

  // VAN_HANH - Vận hành
  VAN_HANH: [
    'FLIGHT_VIEW', 'FLIGHT_CREATE', 'FLIGHT_UPDATE', 'FLIGHT_DELETE',
    'ROUTE_VIEW', 'ROUTE_CREATE', 'ROUTE_UPDATE',
    'AIRPORT_VIEW',
    'AIRCRAFT_VIEW', 'AIRCRAFT_UPDATE',
    'BOOKING_VIEW',
    'TRANSACTION_LOG_VIEW'
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

// ============================================================
// API-DRIVEN MENU FUNCTIONS (NEW)
// ============================================================

/**
 * Convert menu item từ API format sang format hiện tại
 * @param {Object} apiItem - Menu item từ API
 * @returns {Object} - Menu item format hiện tại
 */
const convertMenuItemFromAPI = (apiItem) => {
  return {
    path: apiItem.routePath,
    text: apiItem.tenChucNang,
    icon: iconMap[apiItem.uiIcon] || FaUsers, // Fallback icon
    permissionKey: apiItem.permissionKey,
    featureCode: apiItem.maCode,
    featureName: apiItem.tenChucNang,
    group: apiItem.nhom,
    color: apiItem.uiColor,
    description: apiItem.uiDescription
  };
};

/**
 * Lấy menu items từ API
 * Fallback về hardcode data nếu API fail
 * @returns {Promise<Array>} - Danh sách menu items
 */
export const fetchMenuItems = async () => {
  try {
    const apiMenuItems = await MenuService.getMenuItems();

    // Convert API format sang format hiện tại
    const convertedItems = apiMenuItems.map(convertMenuItemFromAPI);

    // Xử lý special case: HangVe (dùng chung permission với GiaBay)
    const hasGiaBay = convertedItems.find(item => item.path === '/admin/dashboard/GiaBay');
    if (hasGiaBay) {
      convertedItems.push({
        path: '/admin/dashboard/HangVe',
        text: 'Hạng vé',
        icon: FaTicketAlt,
        permissionKey: 'PRICE_VIEW',
        featureCode: 'PRICE',
        featureName: 'Quản lý Giá vé',
        group: 'Tài chính',
        color: 'from-violet-500 to-purple-600',
        description: 'Quản lý các hạng vé (Economy, Business, ...)'
      });
    }

    return convertedItems;
  } catch (error) {
    console.error('Không thể lấy menu từ API, fallback về hardcode:', error);
    // Fallback về hardcode data cũ (adminMenuItems)
    return adminMenuItems;
  }
};

/**
 * Lấy menu config đầy đủ từ API
 * @returns {Promise<Object>} - Menu config đầy đủ
 */
export const fetchMenuConfig = async () => {
  try {
    const config = await MenuService.getMenuConfig();

    // Convert menu items
    const menuItems = config.menuItems.map(convertMenuItemFromAPI);

    // Special case: HangVe
    const hasGiaBay = menuItems.find(item => item.path === '/admin/dashboard/GiaBay');
    if (hasGiaBay) {
      menuItems.push({
        path: '/admin/dashboard/HangVe',
        text: 'Hạng vé',
        icon: FaTicketAlt,
        permissionKey: 'PRICE_VIEW',
        featureCode: 'PRICE',
        featureName: 'Quản lý Giá vé',
        group: 'Tài chính',
        color: 'from-violet-500 to-purple-600',
        description: 'Quản lý các hạng vé (Economy, Business, ...)'
      });
    }

    return {
      menuItems,
      actions: config.actions,
      userPermissions: config.userPermissions,
      groups: config.groups
    };
  } catch (error) {
    console.error('Không thể lấy menu config từ API:', error);
    throw error;
  }
};

// Export default
export default adminMenuItems;
