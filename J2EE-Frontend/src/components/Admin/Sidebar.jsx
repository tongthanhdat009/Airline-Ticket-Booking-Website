import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Plane,
  Users,
  Calendar,
  ShoppingCart,
  Undo,
  Tag,
  BarChart3,
  UserCog,
  Shield,
  Map,
  Building,
  Car,
  Wrench,
  DollarSign,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { hasPermission } from '../../utils/permissionUtils';

/**
 * Sidebar Component - Hiển thị menu navigation với permissions
 * Các menu items được ẩn/hiện dựa trên permissions của user
 */
const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();

  // State để theo dõi menu đang mở
  const [openMenus, setOpenMenus] = useState({});

  // Toggle menu con - chỉ thay đổi state, không navigate
  const toggleMenu = (menuKey, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setOpenMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  // Kiểm tra menu có đang active không
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Menu structure với permissions
  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      permission: null, // Ai cũng thấy
    },
    {
      title: 'Quản lý Vai trò',
      icon: Shield,
      permission: 'ROLE_MANAGE',
      path: '/dashboard/vai-tro',
    },
    {
      title: 'Chuyến Bay',
      icon: Plane,
      permission: 'FLIGHT_VIEW',
      path: '/dashboard/chuyenbay',
      children: [
        { title: 'Danh sách', path: '/dashboard/chuyenbay', permission: 'FLIGHT_VIEW' },
        { title: 'Tạo mới', path: '/dashboard/chuyenbay/tao-moi', permission: 'FLIGHT_CREATE' },
      ]
    },
    {
      title: 'Đặt Chỗ',
      icon: Calendar,
      permission: 'BOOKING_VIEW',
      path: '/dashboard/dat-cho',
      children: [
        { title: 'Danh sách', path: '/dashboard/dat-cho', permission: 'BOOKING_VIEW' },
        { title: 'Tạo mới', path: '/dashboard/dat-cho/tao-moi', permission: 'BOOKING_CREATE' },
      ]
    },
    {
      title: 'Đơn Hàng',
      icon: ShoppingCart,
      permission: 'ORDER_VIEW',
      path: '/dashboard/don-hang',
    },
    {
      title: 'Hoàn Tiền',
      icon: Undo,
      permission: 'REFUND_VIEW',
      path: '/dashboard/hoan-tien',
    },
    {
      title: 'Khuyến Mãi',
      icon: Tag,
      permission: 'PROMOTION_VIEW',
      path: '/dashboard/khuyen-mai',
    },
    {
      title: 'Khách Hàng',
      icon: Users,
      permission: 'CUSTOMER_VIEW',
      path: '/dashboard/khach-hang',
    },
    {
      title: 'Báo Cáo',
      icon: BarChart3,
      permission: 'REPORT_VIEW',
      path: '/dashboard/bao-cao',
    },
    {
      title: 'Người Dùng',
      icon: UserCog,
      permission: 'USER_VIEW',
      path: '/dashboard/users',
    },
    {
      title: 'Phân Quyền',
      icon: Shield,
      permission: 'PERMISSION_VIEW',
      path: '/dashboard/permissions',
    },
    {
      title: 'Tuyến Bay',
      icon: Map,
      permission: 'ROUTE_VIEW',
      path: '/dashboard/tuyen-bay',
    },
    {
      title: 'Sân Bay',
      icon: Building,
      permission: 'AIRPORT_VIEW',
      path: '/dashboard/san-bay',
    },
    {
      title: 'Máy Bay',
      icon: Car,
      permission: 'AIRCRAFT_VIEW',
      path: '/dashboard/may-bay',
    },
    {
      title: 'Dịch Vụ',
      icon: Wrench,
      permission: 'SERVICE_VIEW',
      path: '/dashboard/dich-vu',
    },
    {
      title: 'Giá Vé',
      icon: DollarSign,
      permission: 'PRICE_VIEW',
      path: '/dashboard/gia-ve',
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
      const isMenuOpen = openMenus[item.title];
      const isMenuItemActive = isActive(item.path);

      return (
        <div key={item.title} className="mb-1">
          {/* Parent menu */}
          <div>
            {hasChildren ? (
              // Menu có children: dùng button để toggle, không navigate
              <button
                type="button"
                onClick={(e) => toggleMenu(item.title, e)}
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
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
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
          {hasChildren && !collapsed && isMenuOpen && (
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
          {collapsed ? <Menu size={20} /> : <X size={20} />}
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
