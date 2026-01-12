import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getClientAccessToken, getClientUserEmail } from "../../utils/cookieUtils";
import { logoutClient } from "../../services/ClientAuthService";
import Cookies from "js-cookie";

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
    <nav className="bg-gradient-to-r from-red-600 to-red-700 shadow-lg sticky top-0 z-[1000]">
      {/* Top Bar - Right aligned items */}
      <div className="bg-red-700/50 border-b border-red-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-1.5 flex justify-end items-center gap-4 text-xs">
          <Link to="/ho-tro" className="text-white hover:text-yellow-400 transition-colors flex items-center gap-1">
            <span>🏠</span>
            <span>{t('common.support')}</span>
          </Link>
          
          {isLoggedIn ? (
            <>
              <span className="text-white/80">|</span>
              <Link 
                to="/ca-nhan" 
                className="text-white hover:text-yellow-400 transition-colors flex items-center gap-1"
              >
                <span>👤</span>
                <span className="font-medium">{userName}</span>
              </Link>
              <span className="text-white/80">|</span>
              <button 
                onClick={handleLogout}
                className="text-white hover:text-yellow-400 transition-colors font-medium"
              >
                {t('common.logout')}
              </button>
            </>
          ) : (
            <>
              <span className="text-white/80">|</span>
              <Link 
                to="/dang-ky-client"
                className="text-white hover:text-yellow-400 transition-colors font-medium"
              >
                {t('common.register')}
              </Link>
              <span className="text-white/80">|</span>
              <Link 
                to="/dang-nhap-client"
                className="text-white hover:text-yellow-400 transition-colors font-medium"
              >
                {t('common.login')}
              </Link>
            </>
          )}
          
          <span className="text-white/80">|</span>
          <div className="flex items-center gap-1">
            <span className="text-white">🌐</span>
            <select 
              value={currentLanguage}
              onChange={handleLanguageChange}
              className="bg-transparent text-white text-xs border border-white/30 rounded px-2 py-0.5 focus:outline-none focus:border-yellow-400 cursor-pointer"
            >
              <option value="vi" className="bg-red-700">Tiếng Việt</option>
              <option value="en" className="bg-red-700">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5" onClick={closeMobileMenu}>
          <img 
            src="/logo/white.png" 
            alt="SGU Airline Logo" 
            className="h-50 sm:h-12 w-auto object-contain"
          />
        </Link>
        
        {/* Desktop Menu */}
        <ul className="hidden lg:flex list-none gap-8 m-0 p-0 items-center">
          <li>
            <Link 
              to="/tra-cuu-chuyen-bay" 
              className="text-white no-underline font-semibold text-sm uppercase tracking-wide hover:text-yellow-400 transition-colors"
            >
              {t('navbar.lookup_flight')}
            </Link>
          </li>
          <li>
            <Link 
              to="/online-check-in" 
              className="text-white no-underline font-semibold text-sm uppercase tracking-wide hover:text-yellow-400 transition-colors"
            >
              {t('navbar.online_checkin')}
            </Link>
          </li>
          <li>
            <Link 
              to="/dich-vu-chuyen-bay" 
              className="text-white no-underline font-semibold text-sm uppercase tracking-wide hover:text-yellow-400 transition-colors"
            >
              {t('navbar.flight_services')}
            </Link>
          </li>
          <li>
            <Link 
              to="/dich-vu-khac" 
              className="text-white no-underline font-semibold text-sm uppercase tracking-wide hover:text-yellow-400 transition-colors"
            >
              {t('navbar.other_services')}
            </Link>
          </li>
        </ul>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
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
        <div className="px-4 pb-4 pt-2 bg-red-700/50 backdrop-blur-sm border-t border-red-800/30">
          {/* Mobile Top Actions */}
          <div className="mb-3 pb-3 border-b border-red-800/30">
            <div className="flex flex-col gap-2 text-sm">
              <Link 
                to="/ho-tro" 
                className="text-white py-2 px-3 rounded hover:bg-white/10 transition-colors"
                onClick={closeMobileMenu}
              >
                🏠 {t('common.support')}
              </Link>
              
              {isLoggedIn ? (
                <>
                  <Link
                    to="/ca-nhan"
                    className="text-white py-2 px-3 bg-white/10 rounded hover:bg-white/20 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    👤 {userName}
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-white py-2 px-3 rounded hover:bg-white/10 transition-colors text-left"
                  >
                    {t('common.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/dang-ky-client"
                    className="text-white py-2 px-3 rounded hover:bg-white/10 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    {t('common.register')}
                  </Link>
                  <Link 
                    to="/dang-nhap-client"
                    className="text-white py-2 px-3 rounded hover:bg-white/10 transition-colors"
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
                className="block text-white py-2.5 px-3 rounded hover:bg-white/10 transition-colors font-semibold uppercase text-sm"
                onClick={closeMobileMenu}
              >
                {t('common.home')}
              </Link>
            </li>
            <li>
              <Link 
                to="/chuyen-bay" 
                className="block text-white py-2.5 px-3 rounded hover:bg-white/10 transition-colors font-semibold uppercase text-sm"
                onClick={closeMobileMenu}
              >
                {t('navbar.my_flights')}
              </Link>
            </li>
            <li>
              <Link 
                to="/online-check-in" 
                className="block text-white py-2.5 px-3 rounded hover:bg-white/10 transition-colors font-semibold uppercase text-sm"
                onClick={closeMobileMenu}
              >
                {t('navbar.online_checkin')}
              </Link>
            </li>
            <li>
              <Link 
                to="/dich-vu-chuyen-bay" 
                className="block text-white py-2.5 px-3 rounded hover:bg-white/10 transition-colors font-semibold uppercase text-sm"
                onClick={closeMobileMenu}
              >
                {t('navbar.flight_services')}
              </Link>
            </li>
            <li>
              <Link 
                to="/dich-vu-khac" 
                className="block text-white py-2.5 px-3 rounded hover:bg-white/10 transition-colors font-semibold uppercase text-sm"
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
