import Cookies from 'js-cookie';

/**
 * Lấy thông tin user từ cookie
 * @returns {Object|null} - { username, roles, permissions } hoặc null
 */
export const getAdminUserInfo = () => {
  try {
    const userInfoStr = Cookies.get('admin_user_info');
    if (userInfoStr) {
      return JSON.parse(userInfoStr);
    }
  } catch (error) {
    console.error('Error parsing admin user info:', error);
  }
  return null;
};

/**
 * Kiểm tra user có role cụ thể không
 * @param {string} roleName - Tên role cần kiểm tra (ví dụ: "SUPER_ADMIN", "QUAN_LY")
 * @returns {boolean}
 */
export const hasRole = (roleName) => {
  const userInfo = getAdminUserInfo();
  if (!userInfo || !userInfo.roles) {
    return false;
  }
  return userInfo.roles.includes(roleName);
};

/**
 * Kiểm tra user có bất kỳ role nào trong danh sách không
 * @param {string[]} roleNames - Mảng tên các roles cần kiểm tra
 * @returns {boolean}
 */
export const hasAnyRole = (roleNames) => {
  if (!Array.isArray(roleNames)) {
    return false;
  }
  const userInfo = getAdminUserInfo();
  if (!userInfo || !userInfo.roles) {
    return false;
  }
  return roleNames.some(role => userInfo.roles.includes(role));
};

/**
 * Kiểm tra user có tất cả các roles không
 * @param {string[]} roleNames - Mảng tên các roles cần kiểm tra
 * @returns {boolean}
 */
export const hasAllRoles = (roleNames) => {
  if (!Array.isArray(roleNames)) {
    return false;
  }
  const userInfo = getAdminUserInfo();
  if (!userInfo || !userInfo.roles) {
    return false;
  }
  return roleNames.every(role => userInfo.roles.includes(role));
};

/**
 * Kiểm tra user có permission cụ thể không
 * @param {string} permission - Permission string (ví dụ: "FLIGHT_VIEW", "BOOKING_CREATE")
 * @returns {boolean}
 */
export const hasPermission = (permission) => {
  const userInfo = getAdminUserInfo();
  if (!userInfo || !userInfo.permissions) {
    return false;
  }
  return userInfo.permissions.includes(permission);
};

/**
 * Kiểm tra user có permission với feature và action không
 * @param {string} feature - Feature code (ví dụ: "FLIGHT", "BOOKING")
 * @param {string} action - Action code (ví dụ: "VIEW", "CREATE")
 * @returns {boolean}
 */
export const hasFeatureAction = (feature, action) => {
  return hasPermission(`${feature}_${action}`);
};

/**
 * Kiểm tra user có bất kỳ permission nào trong danh sách không
 * @param {string[]} permissions - Mảng các permissions cần kiểm tra
 * @returns {boolean}
 */
export const hasAnyPermission = (permissions) => {
  if (!Array.isArray(permissions)) {
    return false;
  }
  const userInfo = getAdminUserInfo();
  if (!userInfo || !userInfo.permissions) {
    return false;
  }
  return permissions.some(permission => userInfo.permissions.includes(permission));
};

/**
 * Lấy danh sách roles của user hiện tại
 * @returns {string[]}
 */
export const getCurrentRoles = () => {
  const userInfo = getAdminUserInfo();
  return userInfo?.roles || [];
};

/**
 * Lấy danh sách permissions của user hiện tại
 * @returns {string[]}
 */
export const getCurrentPermissions = () => {
  const userInfo = getAdminUserInfo();
  return userInfo?.permissions || [];
};

/**
 * Kiểm tra xem user có phải là SUPER_ADMIN không
 * @returns {boolean}
 */
export const isSuperAdmin = () => {
  return hasRole('SUPER_ADMIN');
};

/**
 * Kiểm tra xem user đã đăng nhập chưa
 * @returns {boolean}
 */
export const isAdminAuthenticated = () => {
  const token = Cookies.get('admin_access_token');
  return !!token;
};

/**
 * Lấy username của user hiện tại
 * @returns {string|null}
 */
export const getCurrentUsername = () => {
  const userInfo = getAdminUserInfo();
  return userInfo?.username || null;
};
