import React from "react";
import { useNavigate } from "react-router-dom";
import { DangNhapClientServices } from "../../services/DangNhapClientServices";
import { getClientAccessToken, setClientUserEmail } from "../../utils/cookieUtils";
import { loginAndSetTokens } from "../../services/apiClient";
import { getOAuthUrl } from "../../config/api.config";
import useTitle from '../../hooks/useTitle';
import AuthLayout from "../../components/Auth/AuthLayout";
import LoginForm from "../../components/Auth/LoginForm";
import { LoginBannerContent } from "../../components/Auth/BannerContent";

function DangNhap() {
  useTitle('Đăng nhập - JadT Airline');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);

  // Kiểm tra nếu đã đăng nhập thì chuyển về trang chủ
  React.useEffect(() => {
    const accessToken = getClientAccessToken();
    if (accessToken) {
      navigate("/", { replace: true });
    } else {
      setIsCheckingAuth(false);
    }
  }, [navigate]);

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = getOAuthUrl('google');
  };

  // Hiển thị loading khi đang kiểm tra authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Đang kiểm tra...</p>
        </div>
      </div>
    );
  }

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
