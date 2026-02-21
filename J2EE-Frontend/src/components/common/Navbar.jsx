import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getClientAccessToken, getClientUserEmail } from "../../utils/cookieUtils";
import { logoutClient } from "../../services/ClientAuthService";

function Navbar() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(localStorage.getItem('language') || 'vi');
  const [, setAuthUpdate] = useState(0); // Trigger re-render when auth state changes

  // Hàm kiểm tra và cập nhật trạng thái đăng nhập
  const checkAuthStatus = () => {
    const token = getClientAccessToken();
    const email = getClientUserEmail();
    if (token && email) {
      setIsLoggedIn(true);
      setUserName(email);
    } else {
      setIsLoggedIn(false);
      setUserName("");
    }
  };

  useEffect(() => {
    // Kiểm tra trạng thái ban đầu
    checkAuthStatus();

    // Lắng nghe sự kiện thay đổi storage/cookie từ các tab khác
    const handleStorageChange = (e) => {
      if (e.key === 'auth_update' || e.key === null) {
        checkAuthStatus();
        setAuthUpdate(prev => prev + 1);
      }
    };

    // Polling để kiểm tra cookie mỗi 500ms (chỉ khi component mounted)
    const pollingInterval = setInterval(() => {
      checkAuthStatus();
    }, 500);

    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollingInterval);
    };
  }, []);

  const handleLogout = async () => {
    // Gọi API logout để revoke refresh token trên server
    await logoutClient();
    
    setIsLoggedIn(false);

    // Dispatch event để thông báo cho các component khác
    window.dispatchEvent(new Event('storage'));
    localStorage.setItem('auth_update', Date.now().toString());

    navigate("/");
    setMobileMenuOpen(false);
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setCurrentLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-xl shadow-[0_4px_30px_rgb(0,0,0,0.05)] sticky top-0 z-[1000] border-b border-white/20 transition-all duration-300">
      {/* Top Bar - Right aligned items */}
      <div className="bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2 flex justify-end items-center gap-4 text-xs font-medium tracking-wide">
          <Link to="/ho-tro" className="hover:text-white transition-colors flex items-center gap-1.5">
            <span className="text-blue-400">🏠</span>
            <span>{t('common.support')}</span>
          </Link>
          
          {isLoggedIn ? (
            <>
              <span className="text-slate-600">|</span>
              <Link 
                to="/ca-nhan" 
                className="hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span className="text-blue-400">👤</span>
                <span className="font-semibold text-white">{userName}</span>
              </Link>
              <span className="text-slate-600">|</span>
              <button 
                onClick={handleLogout}
                className="hover:text-red-400 transition-colors font-semibold"
              >
                {t('common.logout')}
              </button>
            </>
          ) : (
            <>
              <span className="text-slate-600">|</span>
              <Link 
                to="/dang-ky-client"
                className="hover:text-white transition-colors font-semibold"
              >
                {t('common.register')}
              </Link>
              <span className="text-slate-600">|</span>
              <Link 
                to="/dang-nhap-client"
                className="hover:text-white transition-colors font-semibold"
              >
                {t('common.login')}
              </Link>
            </>
          )}
          
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-blue-400">🌐</span>
            <select 
              value={currentLanguage}
              onChange={handleLanguageChange}
              className="bg-transparent text-slate-300 text-xs border border-slate-700 rounded-md px-2 py-1 focus:outline-none focus:border-blue-500 cursor-pointer hover:text-white transition-colors"
            >
              <option value="vi" className="bg-slate-800">Tiếng Việt</option>
              <option value="en" className="bg-slate-800">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group" onClick={closeMobileMenu}>
          <img
            src="/logo/jadt-logo.svg"
            alt="JadT Airline Logo"
            className="h-10 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        
        {/* Desktop Menu */}
        <ul className="hidden lg:flex list-none gap-8 m-0 p-0 items-center">
          <li>
            <Link 
              to="/tra-cuu-chuyen-bay" 
              className="text-slate-700 no-underline font-bold text-sm uppercase tracking-wider hover:text-blue-600 transition-colors relative after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 hover:after:w-full after:transition-all after:duration-300"
            >
              {t('navbar.lookup_flight')}
            </Link>
          </li>
          <li>
            <Link 
              to="/online-check-in" 
              className="text-slate-700 no-underline font-bold text-sm uppercase tracking-wider hover:text-blue-600 transition-colors relative after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 hover:after:w-full after:transition-all after:duration-300"
            >
              {t('navbar.online_checkin')}
            </Link>
          </li>
          <li>
            <Link 
              to="/dich-vu-chuyen-bay" 
              className="text-slate-700 no-underline font-bold text-sm uppercase tracking-wider hover:text-blue-600 transition-colors relative after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 hover:after:w-full after:transition-all after:duration-300"
            >
              {t('navbar.flight_services')}
            </Link>
          </li>
          <li>
            <Link 
              to="/dich-vu-khac" 
              className="text-slate-700 no-underline font-bold text-sm uppercase tracking-wider hover:text-blue-600 transition-colors relative after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 hover:after:w-full after:transition-all after:duration-300"
            >
              {t('navbar.other_services')}
            </Link>
          </li>
        </ul>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 pt-2 bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-inner">
          {/* Mobile Top Actions */}
          <div className="mb-3 pb-3 border-b border-slate-200">
            <div className="flex flex-col gap-2 text-sm font-medium">
              <Link 
                to="/ho-tro" 
                className="text-slate-700 py-2.5 px-4 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                onClick={closeMobileMenu}
              >
                <span className="text-blue-500">🏠</span> {t('common.support')}
              </Link>
              
              {isLoggedIn ? (
                <>
                  <Link
                    to="/ca-nhan"
                    className="text-blue-700 py-2.5 px-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-2 font-bold"
                    onClick={closeMobileMenu}
                  >
                    <span className="text-blue-500">👤</span> {userName}
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-red-600 py-2.5 px-4 rounded-xl hover:bg-red-50 transition-colors text-left font-bold"
                  >
                    {t('common.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/dang-ky-client"
                    className="text-slate-700 py-2.5 px-4 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    {t('common.register')}
                  </Link>
                  <Link 
                    to="/dang-nhap-client"
                    className="text-slate-700 py-2.5 px-4 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    {t('common.login')}
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Main Menu */}
          <ul className="flex flex-col gap-1">
            <li>
              <Link 
                to="/" 
                className="block text-slate-800 py-3 px-4 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors font-bold uppercase text-sm tracking-wide"
                onClick={closeMobileMenu}
              >
                {t('common.home')}
              </Link>
            </li>
            <li>
              <Link 
                to="/tra-cuu-chuyen-bay" 
                className="block text-slate-800 py-3 px-4 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors font-bold uppercase text-sm tracking-wide"
                onClick={closeMobileMenu}
              >
                {t('navbar.lookup_flight')}
              </Link>
            </li>
            <li>
              <Link 
                to="/online-check-in" 
                className="block text-slate-800 py-3 px-4 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors font-bold uppercase text-sm tracking-wide"
                onClick={closeMobileMenu}
              >
                {t('navbar.online_checkin')}
              </Link>
            </li>
            <li>
              <Link 
                to="/dich-vu-chuyen-bay" 
                className="block text-slate-800 py-3 px-4 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors font-bold uppercase text-sm tracking-wide"
                onClick={closeMobileMenu}
              >
                {t('navbar.flight_services')}
              </Link>
            </li>
            <li>
              <Link 
                to="/dich-vu-khac" 
                className="block text-slate-800 py-3 px-4 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors font-bold uppercase text-sm tracking-wide"
                onClick={closeMobileMenu}
              >
                {t('navbar.other_services')}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
