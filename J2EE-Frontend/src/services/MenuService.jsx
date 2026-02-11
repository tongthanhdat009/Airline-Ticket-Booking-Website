import apiClient from './apiClient';

/**
 * Service để lấy cấu hình menu động từ API
 */
class MenuService {
  /**
   * Lấy tất cả menu items (đã filter theo permissions của user)
   *
   * @returns {Promise<Array>} Danh sách menu items
   *
   * Response format:
   * [
   *   {
   *     maChucNang: 1,
   *     maCode: "FLIGHT",
   *     tenChucNang: "Quản lý chuyến bay",
   *     nhom: "Vận hành",
   *     routePath: "ChuyenBay",
   *     uiIcon: "FaPlaneDeparture",
   *     uiColor: "from-orange-500 to-red-500",
   *     uiDescription: "Quản lý chuyến bay",
   *     displayOrder: 6,
   *     permissionKey: "FLIGHT_VIEW"
   *   },
   *   ...
   * ]
   */
  async getMenuItems() {
    try {
      const response = await apiClient.get('/admin/dashboard/menu/items');

      if (response.data.success) {
        return response.data.data;
      } else {
        console.error('Lỗi khi lấy menu items:', response.data.message);
        return [];
      }
    } catch (error) {
      console.error('Lỗi API getMenuItems:', error);
      throw error;
    }
  }

  /**
   * Lấy menu items theo nhóm
   *
   * @returns {Promise<Object>} Menu grouped theo nhóm
   *
   * Response format:
   * {
   *   "Vận hành": {
   *     groupName: "Vận hành",
   *     items: [...],
   *     color: "from-orange-500 to-red-500",
   *     icon: "FaPlaneDeparture"
   *   },
   *   "Bán vé": { ... }
   * }
   */
  async getMenuGroups() {
    try {
      const response = await apiClient.get('/admin/dashboard/menu/groups');

      if (response.data.success) {
        return response.data.data;
      } else {
        console.error('Lỗi khi lấy menu groups:', response.data.message);
        return {};
      }
    } catch (error) {
      console.error('Lỗi API getMenuGroups:', error);
      throw error;
    }
  }

  /**
   * Lấy toàn bộ cấu hình menu (menu + actions + permissions)
   * Endpoint này tương đương với adminMenuData.js hiện tại
   *
   * @returns {Promise<Object>} Menu config đầy đủ
   *
   * Response format:
   * {
   *   menuItems: [...],      // Danh sách menu items
   *   actions: [...],        // Danh sách actions (VIEW, CREATE, UPDATE, ...)
   *   userPermissions: [...],// Permissions của user hiện tại
   *   groups: [...]          // Menu grouped
   * }
   */
  async getMenuConfig() {
    try {
      const response = await apiClient.get('/admin/dashboard/menu/config');

      if (response.data.success) {
        return response.data.data;
      } else {
        console.error('Lỗi khi lấy menu config:', response.data.message);
        return {
          menuItems: [],
          actions: [],
          userPermissions: [],
          groups: []
        };
      }
    } catch (error) {
      console.error('Lỗi API getMenuConfig:', error);
      throw error;
    }
  }
}

export default new MenuService();
