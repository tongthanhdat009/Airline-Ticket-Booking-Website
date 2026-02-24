import React, { useState, useEffect, createContext, useContext } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { FaSignOutAlt, FaBars, FaTimes, FaUserCircle, FaChevronDown, FaChevronRight, FaPlaneDeparture } from 'react-icons/fa';
import { logout } from '../../services/AuthService';
import { getUserInfo, isAuthenticated, getAdminUserInfo } from '../../utils/cookieUtils';
import { getMenuItemsGroupedByPermissions } from '../../data/adminMenuData';

// Context cho expanded groups state
const AdminSidebarContext = createContext();

const useAdminSidebar = () => {
  const context = useContext(AdminSidebarContext);
  if (!context) {
    throw new Error('useAdminSidebar must be used within AdminSidebarProvider');
  }
  return context;
};

const AdminSidebarProvider = ({ children }) => {
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const isGroupExpanded = (groupName) => {
    return expandedGroups[groupName] || false;
  };

  return (
    <AdminSidebarContext.Provider value={{ expandedGroups, toggleGroup, isGroupExpanded }}>
      {children}
    </AdminSidebarContext.Provider>
  );
};

function TrangChuAdmin() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isGroupExpanded, toggleGroup } = useAdminSidebar();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [userInfo, setUserInfo] = useState(null);
    const [groupedMenuItems, setGroupedMenuItems] = useState({});

    // Set document title based on current path
    useEffect(() => {
        const pathTitles = {
            '/admin/dashboard': 'Dashboard - Airline Booking Admin',
            '/admin/dashboard/KhachHang': 'Quản lý khách hàng - Airline Booking Admin',
            '/admin/dashboard/TuyenBay': 'Quản lý tuyến bay - Airline Booking Admin',
            '/admin/dashboard/ChuyenBay': 'Quản lý chuyến bay - Airline Booking Admin',
            '/admin/dashboard/DichVu': 'Quản lý dịch vụ - Airline Booking Admin',
            '/admin/dashboard/ThongKe': 'Thống kê doanh thu - Airline Booking Admin',
            '/admin/dashboard/SanBay': 'Quản lý sân bay - Airline Booking Admin',
            '/admin/dashboard/QuanLyTKAdmin': 'Quản lý tài khoản admin - Airline Booking Admin',
            '/admin/dashboard/GiaBay': 'Quản lý giá vé - Airline Booking Admin',
            '/admin/dashboard/KhuyenMai': 'Quản lý khuyến mãi - Airline Booking Admin',
            '/admin/dashboard/MayBay': 'Quản lý máy bay - Airline Booking Admin',
            '/admin/dashboard/DonHang': 'Quản lý đơn hàng - Airline Booking Admin',
            '/admin/dashboard/DatCho': 'Quản lý đặt chỗ - Airline Booking Admin',
            '/admin/dashboard/HoaDon': 'Quản lý hóa đơn - Airline Booking Admin',
            '/admin/dashboard/HoanTien': 'Quản lý hoàn tiền - Airline Booking Admin',
            '/admin/dashboard/LichSuThaoTac': 'Lịch sử thao tác - Airline Booking Admin',
            '/admin/dashboard/VaiTro': 'Quản lý vai trò - Airline Booking Admin',
            '/admin/dashboard/PhanQuyen': 'Quản lý quyền hạn - Airline Booking Admin',
            '/admin/dashboard/HangVe': 'Quản lý hạng vé - Airline Booking Admin',
        };

        const getTitle = (pathname) => {
            for (const [path, title] of Object.entries(pathTitles)) {
                if (pathname === path || pathname.startsWith(path + '/')) {
                    return title;
                }
            }
            return 'Dashboard - Airline Booking Admin';
        };

        document.title = getTitle(location.pathname);
    }, [location.pathname]);
    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/admin/login');
        } else {
            // Lấy thông tin user từ cookie
            const user = getUserInfo();
            setUserInfo(user);

            // Lấy permissions và filter menu items theo nhóm
            const adminUserInfo = getAdminUserInfo();
            if (adminUserInfo && adminUserInfo.permissions) {
                const groupedMenu = getMenuItemsGroupedByPermissions(adminUserInfo.permissions);
                setGroupedMenuItems(groupedMenu);
            }
        }
    }, [navigate]);

    const handleLogout = async () => {
        if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            await logout();
            navigate('/admin/login');
        }
    };

    // Lấy chữ cái đầu của username để hiển thị avatar
    const getInitial = () => {
        if (userInfo?.username) {
            return userInfo.username.charAt(0).toUpperCase();
        }
        return 'A';
    };

    // Tạo breadcrumb động từ URL
    const getBreadcrumbs = () => {
        const path = location.pathname;
        const segments = path.split('/').filter(Boolean);
        
        const breadcrumbMap = {
            'admin': 'Quản trị',
            'dashboard': 'Dashboard',
            'MayBay': 'Quản lý Máy Bay',
            'TuyenBay': 'Quản lý Tuyến Bay',
            'ChuyenBay': 'Quản lý Chuyến Bay',
            'SanBay': 'Quản lý Sân Bay',
            'DichVu': 'Quản lý Dịch Vụ',
            'KhachHang': 'Quản lý Khách Hàng',
            'TKAdmin': 'Quản lý Tài Khoản',
            'QuanLyTKAdmin': 'Quản lý Tài Khoản',
            'GiaBay': 'Quản lý Giá Bay',
            'KhuyenMai': 'Quản lý Khuyến Mãi',
            'DonHang': 'Quản lý Đơn Hàng',
            'HoaDon': 'Quản lý Hóa Đơn',
            'HoanTien': 'Quản lý Hoàn Tiền',
            'LichSuThaoTac': 'Lịch Sử Thao Tác',
            'VaiTro': 'Quản lý Vai Trò',
            'PhanQuyen': 'Quản lý Phân Quyền',
            'HangVe': 'Quản lý Hạng Vé',
            'DatCho': 'Quản lý Đặt Chỗ',
            'ThongKe': 'Thống Kê Doanh Thu',
            'XuatBaoCao': 'Xuất Báo Cáo',
            'DoiSoatGiaoDich': 'Đối Soát Giao Dịch',
            'BannerTinTuc': 'Quản lý Banner & Tin Tức',
            'LichSuGiaoDichVNPay': 'Lịch Sử Giao Dịch VNPay',
            'QuanLyChat': 'Chat Trực Tuyến',
            'them': 'Thêm Mới',
            'sua': 'Chỉnh Sửa',
            'ghe': 'Sơ Đồ Ghế',
        };
        
        const breadcrumbs = [];
        let currentPath = '';
        
        segments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            const label = breadcrumbMap[segment] || segment;
            
            // Nếu là segment cuối cùng và có dạng số hoặc ID, bỏ qua
            if (index === segments.length - 1 && /^[0-9]+$/.test(segment)) {
                return;
            }
            
            breadcrumbs.push({
                label,
                path: currentPath,
                isLast: index === segments.length - 1
            });
        });
        
        return breadcrumbs;
    };

    return (
        <div className="flex h-screen bg-[#f0f2f5] font-sans overflow-hidden">
            {/* Mobile overlay when sidebar is open */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? 'w-72' : 'w-0'} ${isSidebarOpen ? 'fixed md:relative' : ''} md:relative z-30 md:z-0 bg-linear-to-b from-[#001529] via-[#001d3d] to-[#00223a] text-white flex flex-col justify-between shadow-2xl transition-all duration-300 ease-in-out overflow-hidden shrink-0 h-full`}>
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-cyan-500/5 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col h-full w-72">
                    {/* Logo */}
                    <div className="flex items-center h-15 px-5 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                                <FaPlaneDeparture className="text-white" size={15} />
                            </div>
                            <div>
                                <h1 className="text-[15px] font-bold text-white tracking-tight leading-tight">JadT Airline</h1>
                                <p className="text-[10px] text-blue-300/70 font-medium tracking-widest uppercase">Admin Panel</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Navigation */}
                    <nav className="flex-1 mt-4 px-3 overflow-y-auto scrollbar-thin">
                        <div className="space-y-1">
                            {Object.entries(groupedMenuItems).map(([groupName, groupData]) => {
                                const isExpanded = isGroupExpanded(groupName);

                                return (
                                    <div key={groupName} className="mb-1">
                                        {/* Group Header - Collapsible */}
                                        <button
                                            onClick={() => toggleGroup(groupName)}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 text-blue-200/60 font-semibold text-[11px] tracking-widest uppercase transition-all duration-200"
                                        >
                                            <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
                                                <FaChevronDown size={10} />
                                            </span>
                                            <span className="flex-1 text-left">{groupName}</span>
                                            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-blue-300/50 font-normal">
                                                {groupData.items.length}
                                            </span>
                                        </button>

                                        {/* Group Items - Collapsible Content with Animation */}
                                        <div
                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                                isExpanded ? 'max-h-250 opacity-100 mt-0.5 ml-1' : 'max-h-0 opacity-0'
                                            }`}
                                        >
                                            <div className="space-y-1">
                                                {groupData.items.map(item => {
                                                    const Icon = item.icon;
                                                    return (
                                                        <NavLink
                                                            key={item.path}
                                                            to={item.path}
                                                            className={({ isActive }) =>
                                                                `group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                                                                    isActive
                                                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                                                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                                                }`
                                                            }
                                                        >
                                                            <span className="shrink-0 transition-transform duration-200 group-hover:scale-105">
                                                                <Icon size={16} />
                                                            </span>
                                                            <span className="font-medium text-[13px]">{item.text}</span>
                                                        </NavLink>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </nav>
                
                    {/* User Profile / Logout */}
                    <div className="p-3 border-t border-white/10">
                        <div className="mb-2 p-2.5 rounded-lg bg-white/5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-white text-sm shrink-0">
                                    {getInitial()}
                                </div>
                                <div className="overflow-hidden min-w-0 flex-1">
                                    <p className="font-medium text-[13px] text-white truncate">
                                        {userInfo?.username || 'Admin User'}
                                    </p>
                                    <p className="text-[11px] text-slate-400 truncate">
                                        {userInfo?.email || userInfo?.role || 'Administrator'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="group flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full"
                        >
                            <FaSignOutAlt size={14} className="group-hover:rotate-12 transition-transform duration-200 shrink-0" />
                            <span className="font-medium text-[13px]">Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header with Breadcrumb */}
                <header className="bg-white border-b border-gray-200/80 shadow-sm">
                    <div className="w-full mx-auto px-3 sm:px-4 lg:px-6">
                        <div className="flex items-center justify-between h-14">
                            {/* Left side - Menu toggle + Breadcrumb */}
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                <button
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className="flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all shrink-0"
                                >
                                    {isSidebarOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
                                </button>

                                {/* Dynamic Breadcrumb - Responsive */}
                                <div className="flex items-center gap-1.5 text-sm hidden sm:flex">
                                    {getBreadcrumbs().map((crumb, index) => (
                                        <React.Fragment key={crumb.path}>
                                            {index > 0 && <FaChevronRight className="text-gray-300 text-[10px] shrink-0" />}
                                            {crumb.isLast ? (
                                                <span className="text-gray-800 font-semibold truncate">{crumb.label}</span>
                                            ) : (
                                                <Link
                                                    to={crumb.path}
                                                    className="text-gray-400 hover:text-gray-600 transition-colors font-medium truncate"
                                                >
                                                    {crumb.label}
                                                </Link>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                                {/* Show only current page on mobile */}
                                <div className="flex items-center sm:hidden text-sm">
                                    {getBreadcrumbs().length > 0 && (
                                        <span className="text-gray-800 font-semibold truncate">
                                            {getBreadcrumbs()[getBreadcrumbs().length - 1]?.label || ''}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default TrangChuAdmin;
export { AdminSidebarProvider };