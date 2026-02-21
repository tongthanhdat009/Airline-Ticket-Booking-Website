import React from "react";
import { useNavigate } from "react-router-dom";
import { DangKyClientServices } from "../../services/DangKyClientServices";
import { EmailVerificationService } from "../../services/EmailVerificationService";
import { getClientAccessToken } from "../../utils/cookieUtils";
import useTitle from '../../hooks/useTitle';
import AuthLayout from "../../components/Auth/AuthLayout";
import RegisterForm from "../../components/Auth/RegisterForm";
import { RegisterBannerContent } from "../../components/Auth/BannerContent";

function DangKy() {
  useTitle('Đăng ký tài khoản - JadT Airline');
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

  const handleSubmit = async (userData) => {
    setIsLoading(true);
    try {
      const response = await DangKyClientServices(userData);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSent = async (email) => {
    setIsLoading(true);
    try {
      await EmailVerificationService.sendVerificationEmail(email);
      setTimeout(() => {
        navigate("/dang-nhap-client");
      }, 3000);
    } finally {
      setIsLoading(false);
    }
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
      bannerContent={<RegisterBannerContent currentStep={1} showVerificationPrompt={false} />}
      className="max-w-4xl"
    >
      <RegisterForm
        onSubmit={handleSubmit}
        onVerificationSent={handleVerificationSent}
        isLoading={isLoading}
      />
    </AuthLayout>
  );
}

export default DangKy;
