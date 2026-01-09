import React from 'react';
import { Navigate } from 'react-router-dom';
import { isClientAuthenticated, isAdminAuthenticated } from '../../utils/cookieUtils';

// Default client protected route (for frontend /client flows)
const ProtectedRoute = ({ children }) => {
    if (!isClientAuthenticated()) {
        // Chuyển hướng về trang đăng nhập client nếu chưa xác thực
        return <Navigate to="/dang-nhap-client" replace />;
    }

    return children;
};

// Admin-only protected route component (use for /admin routes)
export const AdminProtectedRoute = ({ children }) => {
    if (!isAdminAuthenticated()) {
        return <Navigate to="/admin/login" replace />;
    }
    return children;
};

export default ProtectedRoute;
