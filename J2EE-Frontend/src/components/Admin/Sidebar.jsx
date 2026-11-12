import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
 FaTachometerAlt,
 FaPlane,
 FaUsers,
 FaCalendarAlt,
 FaShoppingCart,
 FaUndoAlt,
 FaTag,
 FaChartBar,
 FaUserCog,
 FaShieldAlt,
 FaMapMarkerAlt,
 FaBuilding,
 FaCar,
 FaWrench,
 FaDollarSign,
 FaBars,
 FaTimes,
 FaChevronDown,
 FaHistory
} from 'react-icons/fa';
import { hasPermission } from '../../utils/permissionUtils';

/**
 * Sidebar Component - Hiển thị menu navigation với permissions
 * Các menu items được ẩn/hiện dựa trên permissions của user
 * State mở/đóng được giữ cục bộ để không bị reset khi URL thay đổi
 */
const Sidebar = ({ collapsed, setCollapsed }) => {
 const location = useLocation();
 // Menu open/close state is local: the app has no sidebar context provider.
 const [openMenus, setOpenMenus] = useState({});
 const toggleMenu = (menuKey) => setOpenMenus((prev) => ({ ...prev, [menuKey]: !prev[menuKey] }));
 const isMenuOpen = (menuKey) => Boolean(openMenus[menuKey]);

 // Toggle menu con - chỉ thay đổi state, không navigate
 const handleToggleMenu = (menuKey, e) => {
 if (e) {
 e.preventDefault();
 e.stopPropagation();
 }
 toggleMenu(menuKey);
 };

 // Kiểm tra menu có đang active không
 const isActive = (path) => {
 return location.pathname === path || location.pathname.startsWith(path + '/');
 };

 // Menu structure với permissions
 const menuItems = [
 {
 title: 'Dashboard',
 icon: FaTachometerAlt,
 path: '/dashboard',
 permission: null, // Ai cũng thấy
 },
 {
 title: 'Quản lý Vai trò',
 icon: FaShieldAlt,
 permission: 'ROLE_MANAGE',
 path: '/dashboard/vai-tro',
 },
 {
 title: 'Chuyến Bay',
 icon: FaPlane,
 permission: 'FLIGHT_VIEW',
 path: '/dashboard/chuyenbay',
 children: [
 { title: 'Danh sách', path: '/dashboard/chuyenbay', permission: 'FLIGHT_VIEW' },
 { title: 'Tạo mới', path: '/dashboard/chuyenbay/tao-moi', permission: 'FLIGHT_CREATE' },
 ]
 },
 {
 title: 'Đặt Chỗ',
 icon: FaCalendarAlt,
 permission: 'BOOKING_VIEW',
 path: '/dashboard/dat-cho',
 children: [
 { title: 'Danh sách', path: '/dashboard/dat-cho', permission: 'BOOKING_VIEW' },
 { title: 'Tạo mới', path: '/dashboard/dat-cho/tao-moi', permission: 'BOOKING_CREATE' },
 ]
 },
 {
 title: 'Đơn Hàng',
 icon: FaShoppingCart,
 permission: 'ORDER_VIEW',
 path: '/dashboard/don-hang',
 },
 {
 title: 'Hoàn Tiền',
 icon: FaUndoAlt,
 permission: 'REFUND_VIEW',
 path: '/dashboard/hoan-tien',
 },
 {
 title: 'Khuyến Mãi',
 icon: FaTag,
 permission: 'PROMOTION_VIEW',
 path: '/dashboard/khuyen-mai',
 },
 {
 title: 'Khách Hàng',
 icon: FaUsers,
 permission: 'CUSTOMER_VIEW',
 path: '/dashboard/khach-hang',
 },
 {
 title: 'Báo Cáo',
 icon: FaChartBar,
 permission: 'REPORT_VIEW',
 path: '/dashboard/bao-cao',
 },
 {
 title: 'Người Dùng',
 icon: FaUserCog,
 permission: 'USER_VIEW',
 path: '/dashboard/users',
 },
 {
 title: 'Phân Quyền',
 icon: FaShieldAlt,
 permission: 'PERMISSION_VIEW',
 path: '/dashboard/permissions',
 },
 {
 title: 'Tuyến Bay',
 icon: FaMapMarkerAlt,
 permission: 'ROUTE_VIEW',
 path: '/dashboard/tuyen-bay',
 },
 {
 title: 'Sân Bay',
 icon: FaBuilding,
 permission: 'AIRPORT_VIEW',
 path: '/dashboard/san-bay',
 },
 {
 title: 'Máy Bay',
 icon: FaCar,
 permission: 'AIRCRAFT_VIEW',
 path: '/dashboard/may-bay',
 },
 {
 title: 'Dịch Vụ',
 icon: FaWrench,
 permission: 'SERVICE_VIEW',
 path: '/dashboard/dich-vu',
 },
 {
 title: 'Giá Vé',
 icon: FaDollarSign,
 permission: 'PRICE_VIEW',
 path: '/dashboard/gia-ve',
 },
 {
 title: 'Lịch sử thao tác',
 icon: FaHistory,
 permission: 'AUDITLOG_VIEW',
 path: '/dashboard/LichSuThaoTac',
 },
 ];

 // Filter menu items dựa trên permissions
 const renderMenuItems = () => {
 return menuItems.map((item) => {
 // Nếu có permission requirement và user không có quyền → ẩn
 if (item.permission && !hasPermission(item.permission)) {
 return null;
 }

 const Icon = item.icon;
 const hasChildren = item.children && item.children.length > 0;
 const isMenuItemOpen = isMenuOpen(item.title);
 const isMenuItemActive = isActive(item.path);

 return (
 <div key={item.title} className="mb-1">
 {/* Parent menu */}
 <div>
 {hasChildren ? (
 // Menu có children: dùng button để toggle, không navigate
 <button
 type="button"
 onClick={(e) => handleToggleMenu(item.title, e)}
 className={`
 w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
 ${isMenuItemActive
 ? 'bg-blue-600 text-white shadow-lg'
 : 'text-gray-700 hover:bg-gray-100'}
 ${collapsed ? 'justify-center' : ''}
 `}
 >
 <div className="flex items-center gap-3">
 <Icon size={20} />
 {!collapsed && <span className="font-medium">{item.title}</span>}
 </div>
 {!collapsed && (
 <FaChevronDown
 size={16}
 className={`transition-transform duration-200 ${isMenuItemOpen ? 'rotate-180' : ''}`}
 />
 )}
 </button>
 ) : (
 // Menu không có children: dùng Link để navigate
 <Link
 to={item.path}
 className={`
 flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
 ${isMenuItemActive
 ? 'bg-blue-600 text-white shadow-lg'
 : 'text-gray-700 hover:bg-gray-100'}
 ${collapsed ? 'justify-center' : ''}
 `}
 >
 <div className="flex items-center gap-3">
 <Icon size={20} />
 {!collapsed && <span className="font-medium">{item.title}</span>}
 </div>
 </Link>
 )}
 </div>

 {/* Children menu (submenu) */}
 {hasChildren && !collapsed && isMenuItemOpen && (
 <div className="ml-12 mt-1 space-y-1">
 {item.children.map((child) => {
 // Check permission cho child
 if (child.permission && !hasPermission(child.permission)) {
 return null;
 }

 const isChildActive = location.pathname === child.path;

 return (
 <Link
 key={child.path}
 to={child.path}
 className={`
 block px-4 py-2 rounded-lg text-sm transition-all duration-200
 ${isChildActive
 ? 'bg-blue-500 text-white'
 : 'text-gray-600 hover:bg-gray-100'}
 `}
 >
 {child.title}
 </Link>
 );
 })}
 </div>
 )}
 </div>
 );
 });
 };

 return (
 <div
 className={`
 fixed left-0 top-0 h-screen bg-white border-r border-gray-200
 transition-all duration-300 z-50
 ${collapsed ? 'w-20' : 'w-64'}
 `}
 >
 {/* Logo / Header */}
 <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
 {!collapsed && (
 <h1 className="text-xl font-bold text-blue-600">Admin Panel</h1>
 )}
 <button
 onClick={() => setCollapsed(!collapsed)}
 className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
 >
 {collapsed ? <FaBars size={20} /> : <FaTimes size={20} />}
 </button>
 </div>

 {/* Menu Items */}
 <nav className="p-4 overflow-y-auto h-[calc(100vh-80px)]">
 {renderMenuItems()}
 </nav>
 </div>
 );
};

export default Sidebar;
