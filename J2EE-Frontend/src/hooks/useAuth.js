import { useState, useEffect, useCallback } from 'react';
import { getAdminUserInfo, isAdminAuthenticated } from '../utils/permissionUtils';

/**
 * Custom hook để quản lý authentication state
 * @returns {Object} - { user, isAuthenticated, loading, refreshUserInfo }
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user info từ cookie khi mount
  useEffect(() => {
    const userInfo = getAdminUserInfo();
    const authenticated = isAdminAuthenticated();

    setUser(userInfo);
    setIsAuthenticated(authenticated);
    setLoading(false);
  }, []);

  // Refresh user info (sau khi login/refresh token)
  const refreshUserInfo = useCallback(() => {
    const userInfo = getAdminUserInfo();
    const authenticated = isAdminAuthenticated();

    setUser(userInfo);
    setIsAuthenticated(authenticated);
  }, []);

  return {
    user,
    isAuthenticated,
    loading,
    refreshUserInfo
  };
};

export default useAuth;
