import { useState, useEffect } from 'react';
import { fetchMenuConfig } from '../data/adminMenuData';

/**
 * Custom hook để fetch menu data từ API
 * Cache data trong state để tránh gọi API nhiều lần
 *
 * Usage:
 * const { menuItems, actions, permissions, loading, error } = useMenuData();
 */
const useMenuData = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [actions, setActions] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMenuData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Gọi API lấy menu config
        const config = await fetchMenuConfig();

        setMenuItems(config.menuItems || []);
        setActions(config.actions || []);
        setPermissions(config.userPermissions || []);
        setGroups(config.groups || []);
      } catch (err) {
        console.error('Lỗi khi load menu data:', err);
        setError(err.message || 'Không thể tải dữ liệu menu');

        // Fallback về localStorage permissions
        try {
          const storedPerms = JSON.parse(localStorage.getItem('userPermissions') || '[]');
          setPermissions(storedPerms);
        } catch (e) {
          console.error('Lỗi khi parse localStorage:', e);
        }
      } finally {
        setLoading(false);
      }
    };

    loadMenuData();
  }, []);

  return {
    menuItems,
    actions,
    permissions,
    groups,
    loading,
    error
  };
};

export default useMenuData;
