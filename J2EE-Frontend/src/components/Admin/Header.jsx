import React from 'react';
import { Bell, Search, LogOut, User, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { getAdminUserInfo, getCurrentUsername } from '../../utils/permissionUtils';

/**
 * Header Component - Header cho admin dashboard
 * Hiển thị user info, notifications, logout button
 */
const Header = () => {
  const navigate = useNavigate();
  const username = getCurrentUsername();
  const userInfo = getAdminUserInfo();

  const handleLogout = () => {
    // Xóa tokens và user info
    Cookies.remove('admin_access_token');
    Cookies.remove('admin_refresh_token');
    Cookies.remove('admin_user_info');

    // Redirect về login page
    navigate('/admin/dangnhap');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        {/* Left: Search bar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
        </div>

        {/* Right: User actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{username}</p>
                <p className="text-xs text-gray-500">
                  {userInfo?.roles?.join(', ') || 'Admin'}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-100 transition-colors group"
              title="Đăng xuất"
            >
              <LogOut size={20} className="text-gray-600 group-hover:text-red-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
