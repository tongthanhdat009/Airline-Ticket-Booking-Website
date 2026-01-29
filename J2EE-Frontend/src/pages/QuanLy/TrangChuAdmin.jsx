import React, { useState, useEffect, createContext, useContext } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { FaSignOutAlt, FaBars, FaTimes, FaUserCircle, FaChevronDown, FaChevronRight } from 'react-icons/fa';
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

    // Kiểm tra xác thực khi component mount và load menu theo permission
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
            'GiaBay': 'Quản lý Giá Bay',
            'KhuyenMai': 'Quản lý Khuyến Mãi',
            'DonHang': 'Quản lý Đơn Hàng',
            'HoaDon': 'Quản lý Hóa Đơn',
            'HoanTien': 'Quản lý Hoàn Tiền',
            'LichSuThaoTac': 'Lịch Sử Thao Tác',
            'VaiTro': 'Quản lý Vai Trò',
            'PhanQuyen': 'Quản lý Phân Quyền',
            'HangVe': 'Quản lý Hạng Vé',
            'ThongKe': 'Thống Kê Doanh Thu',
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
        <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-200 font-sans">
            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? 'w-72' : 'w-0'} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col justify-between shadow-2xl transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0`}>
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-purple-500/10 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col h-full w-72">
                    {/* Logo */}
                    <div className="flex items-center justify-center h-24 border-b border-slate-700/50 bg-slate-900/80">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 shadow-lg shadow-sky-500/50">
                            <FaUserCircle className="text-white" size={28} />
                            <h1 className="text-2xl font-bold text-white tracking-tight">Admin</h1>
                        </div>
                    </div>
                    
                    {/* Navigation */}
                    <nav className="flex-1 mt-6 px-4 overflow-y-auto">
                        <div className="space-y-3">
                            {Object.entries(groupedMenuItems).map(([groupName, groupData]) => {
                                const isExpanded = isGroupExpanded(groupName);

                                return (
                                    <div key={groupName} className="mb-2">
                                        {/* Group Header - Collapsible */}
                                        <button
                                            onClick={() => toggleGroup(groupName)}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-slate-700/50 to-slate-600/50 hover:from-slate-700/70 hover:to-slate-600/70 text-white font-semibold text-sm tracking-wide transition-all duration-300 border border-slate-600/30"
                                        >
                                            <span className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
                                                <FaChevronDown size={14} />
                                            </span>
                                            <span className="flex-1 text-left">{groupName}</span>
                                            <span className="text-xs bg-slate-800/50 px-2 py-0.5 rounded-full text-slate-400">
                                                {groupData.items.length}
                                            </span>
                                        </button>

                                        {/* Group Items - Collapsible Content with Animation */}
                                        <div
                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                                isExpanded ? 'max-h-[1000px] opacity-100 mt-2 ml-2' : 'max-h-0 opacity-0'
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
                                                                `group flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-200 relative overflow-hidden ${
                                                                    isActive
                                                                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                                                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                                                }`
                                                            }
                                                        >
                                                            <div className="relative z-10 flex items-center gap-4 w-full">
                                                                <span className="transform group-hover:scale-110 transition-transform duration-200">
                                                                    <Icon size={18} />
                                                                </span>
                                                                <span className="font-medium text-sm">{item.text}</span>
                                                            </div>
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
                    <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
                        <div className="mb-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 flex items-center justify-center font-bold text-white shadow-lg flex-shrink-0">
                                    {getInitial()}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-semibold text-sm text-white truncate">
                                        {userInfo?.username || 'Admin User'}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate">
                                        {userInfo?.email || userInfo?.role || 'Administrator'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <button 
                            onClick={handleLogout}
                            className="group flex items-center gap-4 px-5 py-3.5 rounded-xl text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 border border-transparent transition-all duration-200 w-full"
                        >
                            <FaSignOutAlt size={20} className="group-hover:rotate-12 transition-transform duration-200" />
                            <span className="font-semibold text-sm">Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header with Breadcrumb */}
                <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg">
                    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            {/* Left side - Menu toggle + Breadcrumb */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all border border-white/20"
                                >
                                    {isSidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
                                </button>
                                
                                {/* Dynamic Breadcrumb */}
                                <div className="flex items-center gap-2 text-sm">
                                    {getBreadcrumbs().map((crumb, index) => (
                                        <React.Fragment key={crumb.path}>
                                            {index > 0 && <FaChevronRight className="text-blue-300 text-xs" />}
                                            {crumb.isLast ? (
                                                <span className="text-white font-bold">{crumb.label}</span>
                                            ) : (
                                                <Link 
                                                    to={crumb.path} 
                                                    className="text-blue-100 hover:text-white transition-colors font-medium"
                                                >
                                                    {crumb.label}
                                                </Link>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default TrangChuAdmin;
export { AdminSidebarProvider };