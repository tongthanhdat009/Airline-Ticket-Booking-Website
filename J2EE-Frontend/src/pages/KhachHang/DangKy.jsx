import React from "react";
import { useTranslation } from 'react-i18next'
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { DangKyClientServices } from "../../services/DangKyClientServices";
import { EmailVerificationService } from "../../services/EmailVerificationService";
import { getClientAccessToken } from "../../utils/cookieUtils";
import { getOAuthUrl } from "../../config/api.config";
import useTitle from '../../hooks/useTitle';

// Steps configuration
const STEPS = [
  { id: 1, title: 'Thông tin cá nhân', icon: '👤' },
  { id: 2, title: 'Liên hệ', icon: '📞' },
  { id: 3, title: 'Bảo mật', icon: '🔒' }
];

function DangKy() {
  const { t } = useTranslation()
  useTitle('Đăng ký tài khoản - JadT Airline');
  const navigate = useNavigate();
  const [showPass, setShowPass] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(1);
  const [hoVaTen, setHoVaTen] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [soDienThoai, setSoDienThoai] = React.useState("");
  const [ngaySinh, setNgaySinh] = React.useState("");
  const [matKhau, setMatKhau] = React.useState("");
  const [xacNhanMatKhau, setXacNhanMatKhau] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [showVerificationPrompt, setShowVerificationPrompt] = React.useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
  const [fieldErrors, setFieldErrors] = React.useState({});

  // Kiểm tra nếu đã đăng nhập thì chuyển về trang chủ
  React.useEffect(() => {
    const accessToken = getClientAccessToken();
    if (accessToken) {
      navigate("/", { replace: true });
    } else {
      setIsCheckingAuth(false);
    }
  }, [navigate]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Validate từng bước
  const validateStep = (step) => {
    const errors = {};

    if (step === 1) {
      if (!hoVaTen.trim()) errors.hoVaTen = t('validation.required');
      if (!ngaySinh) errors.ngaySinh = t('validation.required');
    } else if (step === 2) {
      if (!email.trim()) errors.email = t('validation.required');
      else if (!validateEmail(email)) errors.email = t('validation.invalid_email');
      if (!soDienThoai.trim()) errors.soDienThoai = t('validation.required');
      else if (!/^[0-9]{10,11}$/.test(soDienThoai)) errors.soDienThoai = t('validation.invalid_phone');
    } else if (step === 3) {
      if (!matKhau.trim()) errors.matKhau = t('validation.required');
      else if (matKhau.length < 6) errors.matKhau = t('validation.min_length', { count: 6 });
      if (!xacNhanMatKhau) errors.xacNhanMatKhau = t('validation.required');
      else if (matKhau !== xacNhanMatKhau) errors.xacNhanMatKhau = t('validation.password_mismatch');
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    setError("");
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handleBack = () => {
    setError("");
    setFieldErrors({});
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!validateStep(3)) return;

    setIsLoading(true);
    try {
      const userData = { hoVaTen, email, soDienThoai, ngaySinh, matKhau };
      const response = await DangKyClientServices(userData);
      console.log("Registration response:", response);
      setMessage("🎉" + response.message);
      setShowVerificationPrompt(true);
    } catch (err) {
      setError(`❌ ${err.message || "Đã có lỗi xảy ra. Vui lòng thử lại."}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVerification = async () => {
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      await EmailVerificationService.sendVerificationEmail(email);
      setMessage("✅ Email xác thực đã được gửi! Vui lòng kiểm tra hộp thư của bạn.");
      setTimeout(() => {
        navigate("/dang-nhap-client");
      }, 3000);
    } catch (err) {
      setError(`❌ ${err.message || "Không thể gửi email xác thực."}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipVerification = () => {
    navigate("/dang-nhap-client");
  };

  const handleGoogleRegister = () => {
    window.location.href = getOAuthUrl('google');
  };

  // Animation variants
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      scale: 0.95
    })
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
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-blue-600/10 to-transparent pointer-events-none" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        className="max-w-4xl mx-auto relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid md:grid-cols-5 gap-8 items-start">
          {/* Left Side - Banner */}
          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-linear-to-br from-blue-600 to-cyan-600 rounded-3xl p-8 text-white overflow-hidden shadow-2xl shadow-blue-500/30 sticky top-24">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

              <div className="relative z-10">
                <div className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
                  ✈️ JadT Airline 2026
                </div>
                <h2 className="text-3xl font-extrabold mb-4 leading-tight">
                  Tham gia cùng chúng tôi!
                </h2>
                <p className="text-base text-blue-100 mb-6">
                  Đăng ký ngay để nhận ưu đãi đặc biệt
                </p>

                {/* Progress Steps */}
                {!showVerificationPrompt && (
                  <div className="space-y-3">
                    {STEPS.map((step, idx) => (
                      <motion.div
                        key={step.id}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                          currentStep === step.id
                            ? 'bg-white/20 scale-105'
                            : currentStep > step.id
                            ? 'bg-white/10 opacity-70'
                            : 'bg-white/5 opacity-40'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                          currentStep === step.id
                            ? 'bg-white text-blue-600'
                            : currentStep > step.id
                            ? 'bg-white/30 text-white'
                            : 'bg-white/10 text-white/60'
                        }`}>
                          {currentStep > step.id ? '✓' : step.id}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{step.title}</p>
                          <p className="text-xs text-blue-100 opacity-80">
                            {currentStep > step.id ? 'Hoàn thành' : currentStep === step.id ? 'Đang điền' : 'Chờ'}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Benefits */}
                {showVerificationPrompt && (
                  <div className="space-y-3 mt-4">
                    {[
                      { icon: "🔒", title: "Bảo mật tài khoản" },
                      { icon: "📩", title: "Nhận thông báo" },
                      { icon: "🎁", title: "Ưu đãi độc quyền" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-sm">{item.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            className="md:col-span-3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 md:p-8">
              {!showVerificationPrompt ? (
                <>
                  <div className="mb-6">
                    <h1 className="text-2xl font-extrabold text-slate-800 mb-2">{t('common.register')}</h1>
                    <p className="text-sm text-slate-600">Bước {currentStep}/3 - {STEPS[currentStep - 1].title}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-medium text-slate-500">Tiến độ</span>
                      <span className="text-xs font-bold text-blue-600">{Math.round((currentStep / 3) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-linear-to-r from-blue-500 to-cyan-500 rounded-full"
                        initial={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                        animate={{ width: `${(currentStep / 3) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  <form onSubmit={currentStep === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={currentStep}
                        custom={currentStep}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                      >
                        {/* Step 1: Thông tin cá nhân */}
                        {currentStep === 1 && (
                          <div className="space-y-4">
                            <div>
                              <label htmlFor="username" className="block text-sm font-bold text-slate-700 mb-2">
                                {t('auth.full_name')} <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                  <span className="text-slate-400 text-lg">👤</span>
                                </div>
                                <input
                                  value={hoVaTen}
                                  onChange={(e) => { setHoVaTen(e.target.value); setFieldErrors(prev => ({ ...prev, hoVaTen: '' })); }}
                                  id="username"
                                  type="text"
                                  className={`w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-slate-700 font-medium ${
                                    fieldErrors.hoVaTen ? 'border-red-300' : 'border-slate-200'
                                  }`}
                                  placeholder={t('auth.full_name')}
                                  autoComplete="name"
                                />
                              </div>
                              {fieldErrors.hoVaTen && <p className="text-red-500 text-xs mt-1">{fieldErrors.hoVaTen}</p>}
                            </div>

                            <div>
                              <label htmlFor="dob" className="block text-sm font-bold text-slate-700 mb-2">
                                {t('auth.dob')} <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                  <span className="text-slate-400 text-lg">🎂</span>
                                </div>
                                <input
                                  value={ngaySinh}
                                  onChange={(e) => { setNgaySinh(e.target.value); setFieldErrors(prev => ({ ...prev, ngaySinh: '' })); }}
                                  id="dob"
                                  type="date"
                                  className={`w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-slate-700 font-medium ${
                                    fieldErrors.ngaySinh ? 'border-red-300' : 'border-slate-200'
                                  }`}
                                  autoComplete="bday"
                                />
                              </div>
                              {fieldErrors.ngaySinh && <p className="text-red-500 text-xs mt-1">{fieldErrors.ngaySinh}</p>}
                            </div>
                          </div>
                        )}

                        {/* Step 2: Thông tin liên hệ */}
                        {currentStep === 2 && (
                          <div className="space-y-4">
                            <div>
                              <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                                {t('auth.email_phone')} <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                  <span className="text-slate-400 text-lg">📧</span>
                                </div>
                                <input
                                  value={email}
                                  onChange={(e) => { setEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: '' })); }}
                                  id="email"
                                  type="email"
                                  className={`w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-slate-700 font-medium ${
                                    fieldErrors.email ? 'border-red-300' : 'border-slate-200'
                                  }`}
                                  placeholder={t('auth.email_phone')}
                                  autoComplete="email"
                                />
                              </div>
                              {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
                            </div>

                            <div>
                              <label htmlFor="phone" className="block text-sm font-bold text-slate-700 mb-2">
                                {t('auth.phone')} <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                  <span className="text-slate-400 text-lg">📱</span>
                                </div>
                                <input
                                  value={soDienThoai}
                                  onChange={(e) => { setSoDienThoai(e.target.value); setFieldErrors(prev => ({ ...prev, soDienThoai: '' })); }}
                                  id="phone"
                                  type="tel"
                                  className={`w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-slate-700 font-medium ${
                                    fieldErrors.soDienThoai ? 'border-red-300' : 'border-slate-200'
                                  }`}
                                  placeholder={t('auth.phone')}
                                  autoComplete="tel"
                                />
                              </div>
                              {fieldErrors.soDienThoai && <p className="text-red-500 text-xs mt-1">{fieldErrors.soDienThoai}</p>}
                            </div>
                          </div>
                        )}

                        {/* Step 3: Bảo mật */}
                        {currentStep === 3 && (
                          <div className="space-y-4">
                            <div>
                              <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2">
                                Mật khẩu <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                  <span className="text-slate-400 text-lg">🔒</span>
                                </div>
                                <input
                                  value={matKhau}
                                  onChange={(e) => { setMatKhau(e.target.value); setFieldErrors(prev => ({ ...prev, matKhau: '' })); }}
                                  id="password"
                                  type={showPass ? "text" : "password"}
                                  className={`w-full pl-12 pr-12 py-3.5 bg-slate-50/50 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-slate-700 font-medium ${
                                    fieldErrors.matKhau ? 'border-red-300' : 'border-slate-200'
                                  }`}
                                  placeholder={t('auth.password_hint') || 'Tối thiểu 6 ký tự'}
                                  autoComplete="new-password"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPass(!showPass)}
                                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                  {showPass ? "👁️" : "👁️‍🗨️"}
                                </button>
                              </div>
                              {fieldErrors.matKhau && <p className="text-red-500 text-xs mt-1">{fieldErrors.matKhau}</p>}
                            </div>

                            <div>
                              <label htmlFor="confirm-password" className="block text-sm font-bold text-slate-700 mb-2">
                                {t('auth.confirm_password')} <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                  <span className="text-slate-400 text-lg">🔐</span>
                                </div>
                                <input
                                  value={xacNhanMatKhau}
                                  onChange={(e) => { setXacNhanMatKhau(e.target.value); setFieldErrors(prev => ({ ...prev, xacNhanMatKhau: '' })); }}
                                  id="confirm-password"
                                  type={showPass ? "text" : "password"}
                                  className={`w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-slate-700 font-medium ${
                                    fieldErrors.xacNhanMatKhau ? 'border-red-300' : 'border-slate-200'
                                  }`}
                                  placeholder="Nhập lại mật khẩu"
                                  autoComplete="new-password"
                                />
                              </div>
                              {fieldErrors.xacNhanMatKhau && <p className="text-red-500 text-xs mt-1">{fieldErrors.xacNhanMatKhau}</p>}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    {/* Error/Message Messages */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-3 bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-2xl flex items-center gap-3 text-red-600"
                        >
                          <span className="text-lg">⚠️</span>
                          <p className="text-sm font-medium">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 pt-2">
                      {currentStep > 1 && (
                        <motion.button
                          type="button"
                          onClick={handleBack}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-6 py-3.5 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
                        >
                          <span>←</span> Quay lại
                        </motion.button>
                      )}
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex-1 py-3.5 bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 ${
                          isLoading ? 'cursor-wait' : ''
                        }`}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t('common.processing')}
                          </>
                        ) : currentStep < 3 ? (
                          <>
                            Tiếp tục <span>→</span>
                          </>
                        ) : (
                          <>
                            <span>📝</span> {t('common.register')}
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>

                  {/* Social Login */}
                  {currentStep === 1 && (
                    <>
                      <div className="flex items-center text-center my-6">
                        <div className="flex-1 border-b border-slate-200"></div>
                        <span className="px-4 text-slate-400 text-sm font-medium">{t('common.or')}</span>
                        <div className="flex-1 border-b border-slate-200"></div>
                      </div>

                      <button
                        type="button"
                        onClick={handleGoogleRegister}
                        className="w-full py-3.5 bg-white border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-700 flex items-center justify-center gap-3 transition-all hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-px hover:shadow-lg"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 48 48">
                          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C44.438,36.338,48,30.638,48,24c0-2.659-0.238-5.35-0.689-7.917H43.611z" />
                        </svg>
                        <span>{t('auth.login_google')}</span>
                      </button>

                      <p className="text-center mt-4 text-sm text-slate-600">
                        {t('auth.has_account') || 'Đã có tài khoản?'}{" "}
                        <a href="/dang-nhap-client" className="text-blue-600 font-bold hover:text-blue-700 hover:underline">
                          {t('common.login')}
                        </a>
                      </p>
                    </>
                  )}
                </>
              ) : (
                /* Email Verification Prompt */
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mb-6"
                  >
                    <div className="w-20 h-20 bg-linear-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-4xl">📧</span>
                    </div>
                  </motion.div>
                  <h3 className="text-2xl font-extrabold text-slate-800 mb-3">Xác thực email</h3>
                  <p className="text-sm text-slate-600 mb-2">
                    Gửi đến <strong className="text-blue-600">{email}</strong>
                  </p>
                  <p className="text-xs text-slate-500 mb-6">
                    Xác thực email giúp bảo mật tài khoản
                  </p>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3 bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-2xl flex items-center gap-3 text-red-600 mb-4"
                      >
                        <span className="text-lg">⚠️</span>
                        <p className="text-sm font-medium">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {message && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3 bg-green-50/80 backdrop-blur-sm border-2 border-green-200 rounded-2xl flex items-center gap-3 text-green-600 mb-4"
                      >
                        <span className="text-lg">✅</span>
                        <p className="text-sm font-medium">{message}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSendVerification}
                      disabled={isLoading}
                      className="flex-1 py-3.5 bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <span>📩</span>
                          Gửi xác thực
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleSkipVerification}
                      disabled={isLoading}
                      className="px-4 py-3.5 bg-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-300 transition-all disabled:opacity-50"
                    >
                      Bỏ qua
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default DangKy;
