import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DangKyClientServices } from "../../services/DangKyClientServices";
import { EmailVerificationService } from "../../services/EmailVerificationService";
import useTitle from '../../hooks/useTitle';
import AuthLayout from "../../components/Auth/AuthLayout";
import RegisterForm from "../../components/Auth/RegisterForm";
import { RegisterBannerContent } from "../../components/Auth/BannerContent";

function DangKy() {
  useTitle('Đăng ký tài khoản - JadT Airline');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

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
