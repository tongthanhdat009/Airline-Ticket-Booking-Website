import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ onSubmit, onGoogleLogin, isLoading }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Email không được để trống!");
      return;
    }
    if (!validateEmail(email)) {
      setError("Định dạng email không hợp lệ!");
      return;
    }
    if (!matKhau.trim()) {
      setError("Mật khẩu không được để trống!");
      return;
    }

    try {
      await onSubmit({ email, matKhau });
      setMessage("🎉 Đăng nhập thành công!");
      setEmail("");
      setMatKhau("");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(`❌ ${err.message || "Đã có lỗi xảy ra. Vui lòng thử lại."}`);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2 text-center">{t('common.login')}</h1>
        <p className="text-sm text-slate-600 text-center">{t('auth.welcome_back')} ✈️</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
            {t('auth.email_phone')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-slate-400 text-lg">📧</span>
            </div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              type="email"
              className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-slate-700 font-medium"
              placeholder={t('auth.email_phone')}
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2">
            {t('auth.password')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-slate-400 text-lg">🔒</span>
            </div>
            <input
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              id="password"
              type={showPass ? "text" : "password"}
              className="w-full pl-12 pr-12 py-4 bg-slate-50/50 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-slate-700 font-medium"
              placeholder={t('auth.password')}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPass ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <span>Ghi nhớ đăng nhập</span>
          </label>
          <a href="/quen-mat-khau" className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline">
            {t('auth.forgot_password')}
          </a>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-2xl flex items-center gap-3 text-red-600"
          >
            <span className="text-xl">⚠️</span>
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-50/80 backdrop-blur-sm border-2 border-green-200 rounded-2xl flex items-center gap-3 text-green-600"
          >
            <span className="text-xl">✅</span>
            <p className="text-sm font-medium">{message}</p>
          </motion.div>
        )}

        <button
          type="submit"
          className="w-full py-4 bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
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
          ) : (
            <>
              <span>🔐</span>
              {t('common.login')}
            </>
          )}
        </button>

        <div className="flex items-center text-center my-6">
          <div className="flex-1 border-b border-slate-200"></div>
          <span className="px-4 text-slate-400 text-sm font-medium">{t('common.or')}</span>
          <div className="flex-1 border-b border-slate-200"></div>
        </div>

        <button
          type="button"
          onClick={onGoogleLogin}
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

        <p className="text-center mt-6 text-sm text-slate-600">
          {t('auth.no_account')} {" "}
          <a href="/dang-ky-client" className="text-blue-600 font-bold hover:text-blue-700 hover:underline">
            {t('auth.register_now')}
          </a>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
