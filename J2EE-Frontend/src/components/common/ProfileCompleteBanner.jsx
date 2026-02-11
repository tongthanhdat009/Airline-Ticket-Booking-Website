import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkProfileComplete } from '../../utils/profileUtils';

/**
 * Banner hiển thị ở đầu trang để nhắc user hoàn thiện thông tin
 */
function ProfileCompleteBanner() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [profileStatus, setProfileStatus] = useState(null);

  useEffect(() => {
    const checkProfile = async () => {
      // Kiểm tra xem đã dismiss chưa (lưu trong sessionStorage)
      const isDismissed = sessionStorage.getItem('profileBannerDismissed') === 'true';
      if (isDismissed) {
        return;
      }

      const status = await checkProfileComplete();
      setProfileStatus(status);
      
      if (status.isLoggedIn && !status.isComplete) {
        setShow(true);
      }
    };

    checkProfile();
  }, []);

  const handleComplete = () => {
    navigate('/hoan-thien-thong-tin');
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    sessionStorage.setItem('profileBannerDismissed', 'true');
  };

  if (!show || dismissed) {
    return null;
  }

  return (
    <div className="bg-linear-to-r from-[#FF7043] to-[#F4511E] text-white px-4 py-3 shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-sm">
              Hoàn thiện thông tin để sử dụng đầy đủ tính năng
            </p>
            <p className="text-xs opacity-90">
              {profileStatus?.needsPhone && profileStatus?.needsDob && 'Vui lòng cập nhật số điện thoại và ngày sinh'}
              {profileStatus?.needsPhone && !profileStatus?.needsDob && 'Vui lòng cập nhật số điện thoại'}
              {!profileStatus?.needsPhone && profileStatus?.needsDob && 'Vui lòng cập nhật ngày sinh'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleComplete}
            className="px-4 py-2 bg-white text-orange-600 rounded-lg text-sm font-semibold hover:bg-orange-50 transition-colors"
          >
            Hoàn thiện ngay
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileCompleteBanner;
