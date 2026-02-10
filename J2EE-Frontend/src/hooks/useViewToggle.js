import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook để quản lý trạng thái chuyển đổi giữa chế độ table và grid view
 * Lưu trữ preference trong localStorage để persist qua các session
 * @param {string} storageKey - Key duy nhất để lưu view mode (ví dụ: 'ql-khach-hang-view')
 * @param {string} defaultView - View mặc định ('table' hoặc 'grid')
 * @returns {Object} - { viewMode, toggleView, setViewMode }
 */
export const useViewToggle = (storageKey, defaultView = 'table') => {
  const [viewMode, setViewMode] = useState(defaultView);

  // Load view mode từ localStorage khi mount
  useEffect(() => {
    try {
      const savedView = localStorage.getItem(storageKey);
      if (savedView && (savedView === 'table' || savedView === 'grid')) {
        setViewMode(savedView);
      }
    } catch (error) {
      // Silent fail nếu localStorage không available
      // Fallback to default view
    }
  }, [storageKey]);

  // Hàm toggle giữa table và grid view
  const toggleView = useCallback(() => {
    const newView = viewMode === 'table' ? 'grid' : 'table';
    setViewMode(newView);

    try {
      localStorage.setItem(storageKey, newView);
    } catch (error) {
      // Silent fail nếu localStorage không available
    }
  }, [viewMode, storageKey]);

  // Hàm set trực tiếp view mode
  const setView = useCallback((newView) => {
    if (newView === 'table' || newView === 'grid') {
      setViewMode(newView);

      try {
        localStorage.setItem(storageKey, newView);
      } catch (error) {
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
