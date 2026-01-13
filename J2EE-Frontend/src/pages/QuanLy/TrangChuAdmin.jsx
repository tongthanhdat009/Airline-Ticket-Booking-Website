import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FaChartBar, FaUsers, FaRoute, FaPlaneDeparture, FaConciergeBell, FaSignOutAlt, FaBars, FaTimes, FaMoneyBillWave, FaDollarSign, FaTags, FaFighterJet, FaFileInvoice, FaUndo, FaHistory, FaUserShield, FaKey } from 'react-icons/fa';
import { MdLocalAirport } from 'react-icons/md'; 
import { logout } from '../../services/AuthService';
import { getUserInfo, isAuthenticated } from '../../utils/cookieUtils';

function TrangChuAdmin() {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [userInfo, setUserInfo] = useState(null);

    // Kiểm tra xác thực khi component mount
    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/admin/login');
        } else {
            // Lấy thông tin user từ cookie
            const user = getUserInfo();
            setUserInfo(user);
        }
    }, [navigate]);

    const handleLogout = async () => {
        if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            await logout();
            navigate('/admin/login');
        }
    };

    const menuItems = [
        { path: 'ThongKe', icon: <FaChartBar size={20} />, text: 'Thống kê', color: 'from-blue-500 to-cyan-500' },
        { path: 'KhachHang', icon: <FaUsers size={20} />, text: 'Khách hàng', color: 'from-purple-500 to-pink-500' },
        { path: 'TuyenBay', icon: <FaRoute size={20} />, text: 'Tuyến bay', color: 'from-green-500 to-emerald-500' },
        { path: 'ChuyenBay', icon: <FaPlaneDeparture size={20} />, text: 'Chuyến bay', color: 'from-orange-500 to-red-500' },
        { path: 'GiaBay', icon: <FaDollarSign size={20} />, text: 'Giá chuyến bay', color: 'from-teal-500 to-cyan-500' },
        { path: 'DichVu', icon: <FaConciergeBell size={20} />, text: 'Dịch vụ', color: 'from-yellow-500 to-orange-500' },
        { path: 'SanBay', icon: <MdLocalAirport size={20} />, text: 'Sân bay', color: 'from-indigo-500 to-blue-500' },
        { path: 'KhuyenMai', icon: <FaTags size={20} />, text: 'Khuyến mãi', color: 'from-pink-500 to-rose-500' },
        { path: 'MayBay', icon: <FaFighterJet size={20} />, text: 'Máy bay', color: 'from-sky-500 to-blue-600' },
        { path: 'HoaDon', icon: <FaFileInvoice size={20} />, text: 'Hóa đơn', color: 'from-teal-500 to-cyan-600' },
        { path: 'HoanTien', icon: <FaUndo size={20} />, text: 'Hoàn tiền', color: 'from-lime-500 to-green-600' },
        { path: 'LichSuThaoTac', icon: <FaHistory size={20} />, text: 'Lịch sử thao tác', color: 'from-green-500 to-emerald-600' },
        { path: 'QuanLyTKAdmin', icon: <FaUsers size={20} />, text: 'Quản lý TK Admin', color: 'from-purple-500 to-pink-500' },
        { path: 'VaiTro', icon: <FaUserShield size={20} />, text: 'Quản lý Vai trò', color: 'from-violet-500 to-purple-600' },
        { path: 'PhanQuyen', icon: <FaKey size={20} />, text: 'Phân quyền', color: 'from-amber-500 to-orange-600' },
    ];

    // Lấy chữ cái đầu của username để hiển thị avatar
    const getInitial = () => {
        if (userInfo?.username) {
            return userInfo.username.charAt(0).toUpperCase();
        }
        return 'A';
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
                            <FaPlaneDeparture className="text-white" size={28} />
                            <h1 className="text-2xl font-bold text-white tracking-tight">Admin</h1>
                        </div>
                    </div>
                    
                    {/* Navigation */}
                    <nav className="flex-1 mt-6 px-4 overflow-y-auto">
                        <ul className="space-y-2">
                            {menuItems.map(item => (
                                <li key={item.path}>
                                    <NavLink
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
                                                {item.icon}
                                            </span>
                                            <span className="font-semibold text-sm tracking-wide">{item.text}</span>
                                        </div>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
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
                {/* Toggle Button */}
                <div className="bg-white shadow-md p-4 flex items-center gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        {isSidebarOpen ? (
                            <>
                                <FaTimes size={20} />
                                <span className="font-semibold text-sm">Đóng Menu</span>
                            </>
                        ) : (
                            <>
                                <FaBars size={20} />
                                <span className="font-semibold text-sm">Mở Menu</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Page Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default TrangChuAdmin;