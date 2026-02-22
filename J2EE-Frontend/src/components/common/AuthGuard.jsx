import { Navigate, useLocation } from 'react-router-dom';
import { getClientAccessToken, getAdminAccessToken } from '../../utils/cookieUtils';
import { useMemo } from 'react';

/**
 * AuthGuard - Component bảo vệ route dựa trên authentication status
 * Sử dụng useMemo để kiểm tra auth sync trong render phase, không useEffect
 * Điều này giúp browser back button hoạt động đúng
 */

// Guard cho trang đăng nhập client - redirect về home nếu đã đăng nhập
export const LoginGuard = ({ children }) => {
  const isAuthenticated = useMemo(() => !!getClientAccessToken(), []);
  const location = useLocation();

  // Nếu đã đăng nhập và đang ở trang đăng nhập -> redirect về home
  if (isAuthenticated && (location.pathname === '/dang-nhap-client' || location.pathname === '/dang-ky-client')) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Guard cho trang đăng ký client - redirect về home nếu đã đăng nhập
export const RegisterGuard = ({ children }) => {
  const isAuthenticated = useMemo(() => !!getClientAccessToken(), []);
  const location = useLocation();

  if (isAuthenticated && location.pathname === '/dang-ky-client') {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Guard cho trang đăng nhập admin - redirect về dashboard nếu đã đăng nhập
export const AdminLoginGuard = ({ children }) => {
  const isAuthenticated = useMemo(() => !!getAdminAccessToken(), []);
  const location = useLocation();

  if (isAuthenticated && (location.pathname === '/admin/login' || location.pathname === '/dang-nhap-admin')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};
