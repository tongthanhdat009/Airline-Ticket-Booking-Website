import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermission } from '../../hooks/usePermission';

/**
 * Component bảo vệ route dựa trên permission
 * @param {Object} props
 * @param {string} props.feature - Feature code (ví dụ: "FLIGHT", "BOOKING")
 * @param {string} props.action - Action code (ví dụ: "VIEW", "CREATE")
 * @param {React.ReactNode} props.children - Child component
 * @param {string} props.redirectTo - Path to redirect if no permission (default: /admin/dashboard)
 */
export const PermissionProtectedRoute = ({
  feature,
  action,
  children,
  redirectTo = '/admin/dashboard'
}) => {
  const { hasFeatureAction } = usePermission();

  if (!hasFeatureAction(feature, action)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

/**
 * Component bảo vệ route dựa trên role
 * @param {Object} props
 * @param {string|string[]} props.roles - Role hoặc mảng roles yêu cầu
 * @param {boolean} props.requireAll - Yêu cầu tất cả roles (default: false)
 * @param {React.ReactNode} props.children - Child component
 * @param {string} props.redirectTo - Path to redirect if no permission (default: /admin/dashboard)
 */
export const RoleProtectedRoute = ({
  roles,
  requireAll = false,
  children,
  redirectTo = '/admin/dashboard'
}) => {
  const { hasAnyRole, hasAllRoles } = usePermission();
  const roleArray = Array.isArray(roles) ? roles : [roles];

  const hasAccess = requireAll
    ? hasAllRoles(roleArray)
    : hasAnyRole(roleArray);

  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

/**
 * Component hiển thị nội dung dựa trên permission (không redirect)
 * @param {Object} props
 * @param {string} props.feature - Feature code
 * @param {string} props.action - Action code
 * @param {React.ReactNode} props.children - Child component
 * @param {React.ReactNode} props.fallback - Fallback component nếu không có permission
 */
export const IfHasPermission = ({ feature, action, children, fallback = null }) => {
  const { hasFeatureAction } = usePermission();

  if (!hasFeatureAction(feature, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Component hiển thị nội dung dựa trên role (không redirect)
 * @param {Object} props
 * @param {string|string[]} props.roles - Role hoặc mảng roles yêu cầu
 * @param {boolean} props.requireAll - Yêu cầu tất cả roles (default: false)
 * @param {React.ReactNode} props.children - Child component
 * @param {React.ReactNode} props.fallback - Fallback component nếu không có role
 */
export const IfHasRole = ({ roles, requireAll = false, children, fallback = null }) => {
  const { hasAnyRole, hasAllRoles } = usePermission();
  const roleArray = Array.isArray(roles) ? roles : [roles];

  const hasAccess = requireAll
    ? hasAllRoles(roleArray)
    : hasAnyRole(roleArray);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionProtectedRoute;
