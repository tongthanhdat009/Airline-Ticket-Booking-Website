import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { validatePassword, validateBirthDate, calculateAge } from '../../services/validationService';
import apiClient from '../../services/apiClient';

// Steps configuration
const STEPS = [
  { id: 1, title: 'Thông tin cá nhân', icon: '👤' },
  { id: 2, title: 'Liên hệ', icon: '📞' },
  { id: 3, title: 'Bảo mật', icon: '🔒' }
];

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

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

/**
 * Multi-step Register Form Component
 * @param {Object} props
 * @param {Function} props.onSubmit - Callback khi submit form thành công
 * @param {Function} props.onVerificationSent - Callback khi gửi email xác thực
 * @param {boolean} props.isLoading - Loading state
 */
const RegisterForm = ({ onSubmit, onVerificationSent, isLoading: externalLoading = false }) => {
  const { t } = useTranslation();
  const [showPass, setShowPass] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [hoVaTen, setHoVaTen] = useState("");
  const [email, setEmail] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [ngaySinh, setNgaySinh] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ valid: false, errors: [] });
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);

  // Debounced values for checking uniqueness
  const debouncedEmail = useDebounce(email, 500);
  const debouncedPhone = useDebounce(soDienThoai, 500);

  // Checking states
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [phoneExists, setPhoneExists] = useState(false);

  // Check email tồn tại
  useEffect(() => {
    const checkEmail = async () => {
      if (!debouncedEmail || debouncedEmail.trim().length === 0) {
        setEmailExists(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(debouncedEmail)) {
        return;
      }

      setCheckingEmail(true);
      try {
        const response = await apiClient.post('/check-email', { email: debouncedEmail });
        setEmailExists(response.data.exists || false);
      } catch (err) {
        console.error('Error checking email:', err);
        setEmailExists(false);
      } finally {
        setCheckingEmail(false);
      }
    };

    checkEmail();
  }, [debouncedEmail]);

  // Check số điện thoại tồn tại
  useEffect(() => {
    const checkPhone = async () => {
      if (!debouncedPhone || debouncedPhone.trim().length === 0) {
        setPhoneExists(false);
        return;
      }

      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(debouncedPhone)) {
        return;
      }

      setCheckingPhone(true);
      try {
        const response = await apiClient.post('/check-phone', { soDienThoai: debouncedPhone });
        setPhoneExists(response.data.exists || false);
      } catch (err) {
        console.error('Error checking phone:', err);
        setPhoneExists(false);
      } finally {
        setCheckingPhone(false);
      }
    };

    checkPhone();
  }, [debouncedPhone]);

  // Validate password real-time
  useEffect(() => {
    if (matKhau) {
      const result = validatePassword(matKhau);
      setPasswordStrength(result);
    } else {
      setPasswordStrength({ valid: false, errors: [] });
    }
  }, [matKhau]);

  const validateEmailFormat = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Validate từng bước
  const validateStep = (step) => {
    const errors = {};

    if (step === 1) {
      if (!hoVaTen.trim()) errors.hoVaTen = t('validation.required');
      if (!ngaySinh) errors.ngaySinh = t('validation.required');
      else {
        const birthDateValidation = validateBirthDate(ngaySinh);
        if (!birthDateValidation.valid) {
          errors.ngaySinh = birthDateValidation.error;
        }
      }
    } else if (step === 2) {
      if (!email.trim()) errors.email = t('validation.required');
      else if (!validateEmailFormat(email)) errors.email = t('validation.invalid_email');
      else if (emailExists) errors.email = 'Email đã được sử dụng';

      if (!soDienThoai.trim()) errors.soDienThoai = t('validation.required');
      else if (!/^[0-9]{10,11}$/.test(soDienThoai)) errors.soDienThoai = t('validation.invalid_phone');
      else if (phoneExists) errors.soDienThoai = 'Số điện thoại đã được sử dụng';
    } else if (step === 3) {
      if (!matKhau.trim()) errors.matKhau = t('validation.required');
      else if (!passwordStrength.valid) errors.matKhau = passwordStrength.errors[0];

      if (!xacNhanMatKhau) errors.xacNhanMatKhau = t('validation.required');
      else if (matKhau !== xacNhanMatKhau) errors.xacNhanMatKhau = 'Mật khẩu xác nhận không khớp';
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
    setError("");

    if (!validateStep(3)) return;

    try {
      const userData = { hoVaTen, email, soDienThoai, ngaySinh, matKhau };
      await onSubmit(userData);
      setShowVerificationPrompt(true);
    } catch (err) {
      setError(`❌ ${err.message || "Đã có lỗi xảy ra. Vui lòng thử lại."}`);
    }
  };

  const handleSendVerification = async () => {
    if (onVerificationSent) {
      await onVerificationSent(email);
    }
  };

  // Password strength indicator colors
  const getPasswordStrengthColor = () => {
    const errorCount = passwordStrength.errors.length;
    if (!matKhau) return 'bg-slate-200';
    if (errorCount === 0) return 'bg-green-500';
    if (errorCount <= 1) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPasswordStrengthText = () => {
    if (!matKhau) return '';
    if (passwordStrength.valid) return 'Mạnh';
    if (passwordStrength.errors.length <= 1) return 'Trung bình';
    return 'Yếu';
  };

  if (showVerificationPrompt) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 md:p-8">
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

          <div className="flex gap-3">
            <button
              onClick={handleSendVerification}
              disabled={externalLoading}
              className="flex-1 py-3.5 bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {externalLoading ? (
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 md:p-8">
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
                    <span className="text-slate-400 font-normal ml-2">(Từ 18 tuổi)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-400 text-lg">🎂</span>
                    </div>
                    <input
                      value={ngaySinh}
                      onChange={(e) => {
                        setNgaySinh(e.target.value);
                        setFieldErrors(prev => ({ ...prev, ngaySinh: '' }));
                      }}
                      id="dob"
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      className={`w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-slate-700 font-medium ${
                        fieldErrors.ngaySinh ? 'border-red-300' : 'border-slate-200'
                      }`}
                      autoComplete="bday"
                    />
                  </div>
                  {fieldErrors.ngaySinh ? (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.ngaySinh}</p>
                  ) : ngaySinh ? (
                    <p className="text-green-600 text-xs mt-1">Tuổi của bạn: {calculateAge(ngaySinh)} tuổi</p>
                  ) : null}
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
                      className={`w-full pl-12 pr-10 py-3.5 bg-slate-50/50 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-slate-700 font-medium ${
                        fieldErrors.email ? 'border-red-300' : emailExists ? 'border-orange-300' : 'border-slate-200'
                      }`}
                      placeholder={t('auth.email_phone')}
                      autoComplete="email"
                    />
                    {checkingEmail && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                      </div>
                    )}
                    {!checkingEmail && email && emailExists && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-orange-500">
                        <span className="text-lg">⚠️</span>
                      </div>
                    )}
                    {!checkingEmail && email && !emailExists && validateEmailFormat(email) && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-green-500">
                        <span className="text-lg">✓</span>
                      </div>
                    )}
                  </div>
                  {fieldErrors.email ? (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
                  ) : emailExists ? (
                    <p className="text-orange-500 text-xs mt-1">Email đã được sử dụng</p>
                  ) : checkingEmail ? (
                    <p className="text-slate-400 text-xs mt-1">Đang kiểm tra email...</p>
                  ) : null}
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
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setSoDienThoai(value);
                        setFieldErrors(prev => ({ ...prev, soDienThoai: '' }));
                      }}
                      id="phone"
                      type="tel"
                      maxLength={11}
                      className={`w-full pl-12 pr-10 py-3.5 bg-slate-50/50 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-slate-700 font-medium ${
                        fieldErrors.soDienThoai ? 'border-red-300' : phoneExists ? 'border-orange-300' : 'border-slate-200'
                      }`}
                      placeholder={t('auth.phone')}
                      autoComplete="tel"
                    />
                    {checkingPhone && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                      </div>
                    )}
                    {!checkingPhone && soDienThoai && phoneExists && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-orange-500">
                        <span className="text-lg">⚠️</span>
                      </div>
                    )}
                    {!checkingPhone && soDienThoai && !phoneExists && /^[0-9]{10,11}$/.test(soDienThoai) && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-green-500">
                        <span className="text-lg">✓</span>
                      </div>
                    )}
                  </div>
                  {fieldErrors.soDienThoai ? (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.soDienThoai}</p>
                  ) : phoneExists ? (
                    <p className="text-orange-500 text-xs mt-1">Số điện thoại đã được sử dụng</p>
                  ) : checkingPhone ? (
                    <p className="text-slate-400 text-xs mt-1">Đang kiểm tra số điện thoại...</p>
                  ) : null}
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
                      onChange={(e) => {
                        setMatKhau(e.target.value);
                        setFieldErrors(prev => ({ ...prev, matKhau: '' }));
                      }}
                      id="password"
                      type={showPass ? "text" : "password"}
                      className={`w-full pl-12 pr-12 py-3.5 bg-slate-50/50 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-slate-700 font-medium ${
                        fieldErrors.matKhau ? 'border-red-300' : 'border-slate-200'
                      }`}
                      placeholder="Tối thiểu 8 ký tự, viết hoa đầu, có ký tự đặc biệt"
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

                  {/* Password Requirements */}
                  {matKhau && (
                    <div className="mt-2 p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-600">Độ mạnh mật khẩu:</span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 bg-slate-200 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full ${getPasswordStrengthColor()}`}
                              initial={{ width: 0 }}
                              animate={{ width: passwordStrength.valid ? '100%' : passwordStrength.errors.length <= 1 ? '66%' : '33%' }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                          <span className={`text-xs font-bold ${
                            passwordStrength.valid ? 'text-green-600' : passwordStrength.errors.length <= 1 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                      </div>
                      <ul className="space-y-1">
                        {[
                          { text: 'Ít nhất 8 ký tự', valid: matKhau.length >= 8 },
                          { text: 'Ký tự đầu viết hoa', valid: /^[A-Z]/.test(matKhau) },
                          { text: 'Có ký tự đặc biệt (@#$%^&+=!)', valid: /[@#$%^&+=!]/.test(matKhau) }
                        ].map((req, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs">
                            <span className={req.valid ? 'text-green-500' : 'text-slate-400'}>
                              {req.valid ? '✓' : '○'}
                            </span>
                            <span className={req.valid ? 'text-green-700' : 'text-slate-500'}>{req.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

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
                      onChange={(e) => {
                        setXacNhanMatKhau(e.target.value);
                        setFieldErrors(prev => ({ ...prev, xacNhanMatKhau: '' }));
                      }}
                      id="confirm-password"
                      type={showPass ? "text" : "password"}
                      className={`w-full pl-12 pr-10 py-3.5 bg-slate-50/50 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-slate-700 font-medium ${
                        fieldErrors.xacNhanMatKhau ? 'border-red-300' : xacNhanMatKhau && matKhau === xacNhanMatKhau ? 'border-green-300' : 'border-slate-200'
                      }`}
                      placeholder="Nhập lại mật khẩu"
                      autoComplete="new-password"
                    />
                    {xacNhanMatKhau && matKhau === xacNhanMatKhau && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-green-500">
                        <span className="text-lg">✓</span>
                      </div>
                    )}
                  </div>
                  {fieldErrors.xacNhanMatKhau ? (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.xacNhanMatKhau}</p>
                  ) : xacNhanMatKhau && matKhau === xacNhanMatKhau ? (
                    <p className="text-green-500 text-xs mt-1">Mật khẩu khớp</p>
                  ) : null}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Error Messages */}
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
            className="flex-1 py-3.5 bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            disabled={externalLoading}
          >
            {externalLoading ? (
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
    </div>
  );
};

export default RegisterForm;
