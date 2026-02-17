import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook để quản lý trạng thái chuyển đổi giữa chế độ table và grid view
 * Lưu trữ preference trong localStorage để persist qua các session
 * Tự động responsive: mobile/tablet dùng grid view, desktop dùng table view
 * @param {string} storageKey - Key duy nhất để lưu view mode (ví dụ: 'ql-khach-hang-view')
 * @param {string} defaultView - View mặc định cho desktop ('table' hoặc 'grid')
 * @returns {Object} - { viewMode, toggleView, setViewMode }
 */
export const useViewToggle = (storageKey, defaultView = 'table') => {
  // Xác định view mặc định dựa trên kích thước màn hình
  const getInitialView = () => {
    // Kiểm tra nếu đã lưu preference trong localStorage
    try {
      const savedView = localStorage.getItem(storageKey);
      if (savedView && (savedView === 'table' || savedView === 'grid')) {
        return savedView;
      }
    } catch {
      // Silent fail
    }

    // Mobile/Tablet (≤ 1024px) → mặc định là Grid view
    // Desktop (> 1024px) → dùng defaultView parameter
    if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
      return 'grid';
    }
    return defaultView;
  };

  const [viewMode, setViewMode] = useState(getInitialView);

  // Load view mode từ localStorage khi mount (chỉ khi chưa có giá trị)
  useEffect(() => {
    // Skip nếu đã có giá trị từ getInitialView
    // Chỉ update khi localStorage thay đổi từ tab khác
    const handleStorageChange = (e) => {
      if (e.key === storageKey && e.newValue) {
        const newView = e.newValue;
        if (newView === 'table' || newView === 'grid') {
          setViewMode(newView);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [storageKey]);

  // Tự động chuyển view khi resize màn hình
  useEffect(() => {
    const handleResize = () => {
      // Chỉ tự động chuyển nếu chưa có preference trong localStorage
      try {
        const savedView = localStorage.getItem(storageKey);
        if (savedView) return; // User đã chọn preference, không tự động chuyển
      } catch {
        // Silent fail
      }

      // Mobile/Tablet (≤ 1024px) → Grid view
      if (window.innerWidth <= 1024 && viewMode === 'table') {
        setViewMode('grid');
      }
      // Desktop (> 1024px) → Table view (chỉ khi chưa có preference)
      else if (window.innerWidth > 1024 && viewMode === 'grid') {
        setViewMode(defaultView);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [storageKey, viewMode, defaultView]);

  // Hàm toggle giữa table và grid view
  const toggleView = useCallback(() => {
    const newView = viewMode === 'table' ? 'grid' : 'table';
    setViewMode(newView);

    try {
      localStorage.setItem(storageKey, newView);
    } catch {
      // Silent fail nếu localStorage không available
    }
  }, [viewMode, storageKey]);

  // Hàm set trực tiếp view mode
  const setView = useCallback((newView) => {
    if (newView === 'table' || newView === 'grid') {
      setViewMode(newView);

      try {
        localStorage.setItem(storageKey, newView);
      } catch {
        // Silent fail nếu localStorage không available
      }
    }
  }, [storageKey]);

  return {
    viewMode,
    toggleView,
    setViewMode: setView
  };
};

export default useViewToggle;
