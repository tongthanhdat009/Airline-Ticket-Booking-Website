import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DangNhapClientServices } from "../../services/DangNhapClientServices";
import { setClientUserEmail } from "../../utils/cookieUtils";
import { loginAndSetTokens } from "../../services/apiClient";
import { getOAuthUrl } from "../../config/api.config";
import useTitle from '../../hooks/useTitle';
import AuthLayout from "../../components/Auth/AuthLayout";
import LoginForm from "../../components/Auth/LoginForm";
import { LoginBannerContent } from "../../components/Auth/BannerContent";

function DangNhap() {
  useTitle('Đăng nhập - JadT Airline');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async ({ email, matKhau }) => {
    setIsLoading(true);
    try {
      const { accessToken, refreshToken } = await DangNhapClientServices({ email, matKhau });

      // Lưu tokens - access token vào cookie, refresh token vào memory
      loginAndSetTokens('customer', accessToken, refreshToken);
      setClientUserEmail(email);

      // Dispatch custom event để thông báo cho Navbar và các component khác
      window.dispatchEvent(new Event('storage'));
      localStorage.setItem('auth_update', Date.now().toString());

      // Navigate to home - navigate() không gọi trong useEffect nên sẽ không gây vấn đề history
      navigate("/", { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = getOAuthUrl('google');
  };

  return (
    <AuthLayout
      bannerContent={<LoginBannerContent />}
      className="max-w-5xl"
    >
      <LoginForm
        onSubmit={handleSubmit}
        onGoogleLogin={handleGoogleLogin}
        isLoading={isLoading}
      />
    </AuthLayout>
  );
}

export default DangNhap;
