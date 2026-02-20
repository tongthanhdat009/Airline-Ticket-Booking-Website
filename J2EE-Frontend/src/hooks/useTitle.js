import { useEffect } from 'react';

/**
 * Hook để cập nhật document title
 * @param {string} title - Tiêu đề của trang
 */
function useTitle(title) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}

export default useTitle;
