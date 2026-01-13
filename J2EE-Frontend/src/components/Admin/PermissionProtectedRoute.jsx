import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { hasPermission, hasFeatureAction } from '../utils/permissionUtils';

/**
 * PermissionProtectedRoute Component - Bảo vệ route bằng permission
 * @param {string} feature - Feature code (ví dụ: "FLIGHT", "BOOKING")
 * @param {string} action - Action code (ví dụ: "VIEW", "CREATE")
 * @param {string} permission - Full permission string (ví dụ: "FLIGHT_MANAGE")
 * @param {ReactNode} children - Component con sẽ render nếu có quyền
 * @param {string} redirectTo - Path redirect nếu không có quyền (mặc định: /dashboard)
 */
const PermissionProtectedRoute = ({
  feature,
  action,
  permission,
  children,
  redirectTo = '/dashboard'
}) => {
  // Check permission theo 3 cách (ưu tiên theo thứ tự):
  // 1. Nếu có full permission string → check trực tiếp
  if (permission && hasPermission(permission)) {
    return <>{children}</>;
  }

  // 2. Nếu có feature + action → check feature_action
  if (feature && action && hasFeatureAction(feature, action)) {
    return <>{children}</>;
  }

  // 3. Nếu chỉ có feature → check bất kỳ action nào của feature
  if (feature && !action) {
    // Check xem user có bất kỳ permission nào của feature này không
    const userInfo = JSON.parse(Cookies.get('admin_user_info') || '{}');
    const hasAnyFeaturePermission = userInfo?.permissions?.some(p => p.startsWith(`${feature}_`));

    if (hasAnyFeaturePermission) {
      return <>{children}</>;
    }
  }

  // Không có quyền → redirect
  return <Navigate to={redirectTo} replace />;
};

export default PermissionProtectedRoute;
