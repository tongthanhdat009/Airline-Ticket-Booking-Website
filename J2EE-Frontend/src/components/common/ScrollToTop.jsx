import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Component tự động scroll về đầu trang khi route thay đổi
 * Fix lỗi back button - trang hiển thị ở vị trí scroll cũ
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth' // hoặc 'auto' nếu không muốn animation
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
