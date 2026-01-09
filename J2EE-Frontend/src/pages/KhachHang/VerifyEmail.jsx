import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Footer from "../../components/common/Footer";
import { EmailVerificationService } from "../../services/EmailVerificationService";

function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");
  const hasVerified = useRef(false); // Prevent double verification

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (!token) {
      setStatus("error");
      setMessage("Token xác thực không hợp lệ");
      return;
    }

    // Check if already verified in this session
    if (hasVerified.current) {
      return;
    }

    // Verify email
    const verifyEmail = async () => {
      try {
        hasVerified.current = true; // Mark as verified to prevent re-run
        
        await EmailVerificationService.verifyEmail(token);
        setStatus("success");
        setMessage("Xác thực email thành công!");
        
        // Store verification status
        localStorage.setItem("emailVerified", "true");
        
        // Redirect after 3 seconds
        setTimeout(() => {
          const isLoggedIn = localStorage.getItem("accessToken");
          if (isLoggedIn) {
            navigate("/ca-nhan");
          } else {
            navigate("/dang-nhap-client");
          }
        }, 3000);
      } catch (error) {
        setStatus("error");
        setMessage(error.message || "Xác thực email thất bại");
      }
    };

    verifyEmail();
  }, [searchParams, navigate]); // Only run when searchParams or navigate changes

  return (
    <>
      <div 
        className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed relative flex items-center justify-center"
        style={{ backgroundImage: 'url(/background/auth/bg_footer.2f611c1f.webp)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/80 via-yellow-50/80 to-white/80"></div>
        
        <div className="relative z-10 max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {status === "verifying" && (
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6">
                  <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-red-600"></div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Đang xác thực email...
                </h2>
                <p className="text-gray-600">
                  Vui lòng đợi trong giây lát
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-green-600 mb-4">
                  ✅ Xác thực thành công!
                </h2>
                <p className="text-gray-600 mb-4">
                  {message}
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-700">
                    🎉 Tài khoản của bạn đã được xác thực thành công!
                  </p>
                </div>
                <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                  Đang chuyển hướng...
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-red-600 mb-4">
                  ❌ Xác thực thất bại
                </h2>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-700 font-medium mb-2">Lỗi:</p>
                  <p className="text-sm text-red-600">
                    {message}
                  </p>
                </div>
                
                {message.includes("đã được sử dụng") && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-700">
                      💡 <strong>Gợi ý:</strong> Token này đã được sử dụng để xác thực. 
                      Nếu bạn chưa xác thực, vui lòng yêu cầu gửi lại email xác thực.
                    </p>
                  </div>
                )}
                
                {(message.includes("hết hạn") || message.includes("không hợp lệ")) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-yellow-700">
                      ⚠️ <strong>Lưu ý:</strong> Token xác thực có hiệu lực trong 24 giờ. 
                      Vui lòng yêu cầu gửi lại email xác thực mới.
                    </p>
                  </div>
                )}
                
                <div className="space-y-3">
                  <button
                    onClick={() => navigate("/dang-nhap-client")}
                    className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-all"
                  >
                    Về trang chủ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default VerifyEmail;
