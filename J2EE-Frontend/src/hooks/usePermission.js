import { useMemo } from 'react';
import { useAuth } from './useAuth';
import {
  hasRole,
  hasAnyRole,
  hasAllRoles,
  hasPermission,
  hasFeatureAction,
  hasAnyPermission,
  getCurrentRoles,
  getCurrentPermissions,
  isSuperAdmin
} from '../utils/permissionUtils';

/**
 * Custom hook để kiểm tra permissions và roles
 * @returns {Object} - Các hàm kiểm tra permission
 */
export const usePermission = () => {
  const { user, isAuthenticated } = useAuth();

  // Memoize các functions để tránh re-render không cần thiết
  const checkHasRole = useMemo(() => {
    return (roleName) => {
      if (!isAuthenticated || !user) return false;
      return hasRole(roleName);
    };
  }, [isAuthenticated, user]);

  const checkHasAnyRole = useMemo(() => {
    return (roleNames) => {
      if (!isAuthenticated || !user) return false;
      return hasAnyRole(roleNames);
    };
  }, [isAuthenticated, user]);

  const checkHasAllRoles = useMemo(() => {
    return (roleNames) => {
      if (!isAuthenticated || !user) return false;
      return hasAllRoles(roleNames);
    };
  }, [isAuthenticated, user]);

  const checkHasPermission = useMemo(() => {
    return (permission) => {
      if (!isAuthenticated || !user) return false;
      return hasPermission(permission);
    };
  }, [isAuthenticated, user]);

  const checkHasFeatureAction = useMemo(() => {
    return (feature, action) => {
      if (!isAuthenticated || !user) return false;
      return hasFeatureAction(feature, action);
    };
  }, [isAuthenticated, user]);

  const checkHasAnyPermission = useMemo(() => {
    return (permissions) => {
      if (!isAuthenticated || !user) return false;
      return hasAnyPermission(permissions);
    };
  }, [isAuthenticated, user]);

  const getCurrentRolesList = useMemo(() => {
    if (!isAuthenticated || !user) return [];
    return getCurrentRoles();
  }, [isAuthenticated, user]);

  const getCurrentPermissionsList = useMemo(() => {
    if (!isAuthenticated || !user) return [];
    return getCurrentPermissions();
  }, [isAuthenticated, user]);

  const checkIsSuperAdmin = useMemo(() => {
    if (!isAuthenticated || !user) return false;
    return isSuperAdmin();
  }, [isAuthenticated, user]);

  return {
    // Role checks
    hasRole: checkHasRole,
    hasAnyRole: checkHasAnyRole,
    hasAllRoles: checkHasAllRoles,
    isSuperAdmin: checkIsSuperAdmin,

    // Permission checks
    hasPermission: checkHasPermission,
    hasFeatureAction: checkHasFeatureAction,
    hasAnyPermission: checkHasAnyPermission,

    // Getters
    roles: getCurrentRolesList,
    permissions: getCurrentPermissionsList
  };
};

export default usePermission;
