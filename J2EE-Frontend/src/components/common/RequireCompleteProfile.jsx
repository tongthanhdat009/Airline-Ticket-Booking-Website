import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TaiKhoanService from '../../services/TaiKhoanService';
import { getClientAccessToken, getClientUserEmail } from '../../utils/cookieUtils';

/**
 * Component bảo vệ route - yêu cầu user phải hoàn thiện thông tin
 * Nếu thiếu số điện thoại hoặc ngày sinh -> redirect sang trang hoàn thiện thông tin
 */
function RequireCompleteProfile({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const email = getClientUserEmail();
        console.log("User email from cookie:", email);
        const token = getClientAccessToken();

        // Nếu chưa đăng nhập, cho phép truy cập (để ProtectedRoute xử lý)
        if (!email || !token) {
          setIsChecking(false);
          setIsComplete(true);
          return;
        }

        // Nếu đang ở trang hoàn thiện thông tin, cho phép
        if (location.pathname === '/hoan-thien-thong-tin') {
          setIsChecking(false);
          setIsComplete(true);
          return;
        }

        // Lấy thông tin tài khoản
        const data = await TaiKhoanService.getTaiKhoanByEmail(email);
        // Kiểm tra xem đã có đủ thông tin chưa
        const hasPhone = data.data?.hanhKhach?.soDienThoai && data.data.hanhKhach.soDienThoai.trim() !== '';
        const hasDob = data.data?.hanhKhach?.ngaySinh;
        if (!hasPhone || !hasDob) {
          // Thiếu thông tin -> redirect sang trang hoàn thiện
          navigate('/hoan-thien-thong-tin', { 
            replace: true,
            state: { from: location.pathname } 
          });
        } else {
          setIsComplete(true);
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra thông tin:', error);
        // Nếu lỗi, vẫn cho phép truy cập để không block user
        setIsComplete(true);
      } finally {
        setIsChecking(false);
      }
    };

    checkProfile();
  }, [navigate, location]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra thông tin...</p>
        </div>
      </div>
    );
  }

  return isComplete ? children : null;
}

export default RequireCompleteProfile;
