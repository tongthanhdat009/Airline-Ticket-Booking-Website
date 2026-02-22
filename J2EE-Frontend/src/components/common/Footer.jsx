import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-3xl"></div>
        <div className="absolute top-[60%] -left-[10%] w-[40%] h-[40%] rounded-full bg-cyan-900/20 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
          {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Column 1 - Đề cố chuyến bay tốt đẹp */}
          <div>
            <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-lg">
              <span className="text-blue-400">✈️</span>
              {t('footer.about_us')}
            </h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Điều lệ vận chuyển</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Điều kiện vé</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>JadT e-Voucher</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Phiếu quà tặng trực tuyến (e-Forms)</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Thông tin bồi thường</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Phí và lệ phí</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Giấy tờ tùy thân</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Sân bay và phát triển quốc tế</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Quy định hành lý</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Tìm kiếm hành lý</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Hành lý lớn khi Quốc tế</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Thông tin nội chuyện</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Kênh thanh toán</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Hóa đơn VAT</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Hướng dẫn làm thủ tục chuyến bay</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Khuyến cáo đi chuyến</Link></li>
            </ul>
          </div>

          {/* Column 2 - Mua hành lý, suất ăn... */}
          <div>
            <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-lg">
              <span className="text-blue-400">✈️</span>
              {t('footer.follow_us')}
            </h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Chọn chỗ ngồi ưu tiên</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Mua trước hành lý</Link></li>
              <li><Link to="/dich-vu-chuyen-bay" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Đặt trước suất ăn - Vikafe</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Hàng miễn thuế</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Quà lưu niệm</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Giải trí</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Dịch vụ vận chuyển thú cưng</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Dịch vụ trẻ em đi một mình</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Dịch vụ hỗ trợ "Bay cùng bạn"</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Mua thêm chỗ ngồi bên cạnh</Link></li>
            </ul>

            <h3 className="text-white font-bold mb-6 mt-10 flex items-center gap-2 text-lg">
              <span className="text-blue-400">✈️</span>
              {t('footer.about_us')}
            </h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Giới thiệu công ty</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Nhà đầu tư</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Cơ hội nghề nghiệp</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Tin tức</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Khuyến mại</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Cẩm nang du lịch</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Tổng đài phục vụ khách hàng</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Quy định về tiếp nhận và xử lý phản hồi của hành khách</Link></li>
            </ul>
          </div>

          {/* Column 3 - Dịch vụ cao cấp */}
          <div>
            <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-lg">
              <span className="text-yellow-400">🌟</span>
              {t('footer.policy')}
            </h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Hạng vé thương gia - Business</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Hạng vé Skyboss</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Phòng chờ sang trọng</Link></li>
            </ul>

            <h3 className="text-white font-bold mb-6 mt-10 flex items-center gap-2 text-lg">
              <span className="text-emerald-400">💰</span>
              Mua vé ở đâu?
            </h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Tổng đài bán vé</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Phòng bán vé</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>Đại lý bán vé</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600"></span>IOSS / Chuyển Bán Trực Tuyến Danh</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>Đăng ký khách hàng Doanh nghiệp</Link></li>
              <li><Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>Đăng ký làm đại lý online</Link></li>
            </ul>

            <h3 className="text-white font-bold mb-6 mt-10 flex items-center gap-2 text-lg">
              <span className="text-cyan-400">🔍</span>
              Tìm vật phẩm bỏ quên
            </h3>
          </div>

          {/* Column 4 - Các dịch vụ khác */}
          <div>
            <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-lg">
              <span className="text-blue-400">🎯</span>
              {t('footer.contact')}
            </h3>
            
            <ul className="space-y-4 text-slate-300">
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-3 group">
                  <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">📝</span>
                  Đăng nhập đại lý
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-3 group">
                  <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">📦</span>
                  Dịch vụ hàng hóa
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-3 group">
                  <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">📜</span>
                  Chính sách về quyền riêng tư
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-3 group">
                  <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">🔒</span>
                  Chính sách bảo vệ quyền lợi khách hàng
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-3 group">
                  <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">⚙️</span>
                  Quy trình xử lý đổi, hoàn, hủy vé
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Download App Section */}
        <div className="border-t border-slate-800 pt-8 mb-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center bg-slate-800/50 rounded-2xl p-8 backdrop-blur-sm border border-slate-700/50">
            <div>
              <h3 className="text-xl font-bold mb-2 text-white">{t('footer.download_app')}</h3>
              <p className="text-slate-400 mb-6">{t('footer.download_app_desc')}</p>
              <div className="flex gap-4">
                <a href="#" className="hover:scale-105 transition-transform">
                  <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" className="h-10" />
                </a>
                <a href="#" className="hover:scale-105 transition-transform">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-10" />
                </a>
              </div>
            </div>
            
            <div className="md:border-l md:border-slate-700 md:pl-8">
              <h3 className="text-xl font-bold mb-2 text-white">{t('footer.payment_help_title')}</h3>
              <p className="text-slate-400">{t('footer.payment_help_desc')}</p>
            </div>
          </div>
        </div>

        {/* Social Media & Company Info */}
        <div className="border-t border-slate-800 pt-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-4">
              <span className="text-sm text-slate-400 font-medium uppercase tracking-wider">Kết nối với JadT Airline</span>
              <div className="flex gap-3">
                {/* Social Icons with modern hover effects */}
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-600 hover:scale-110 transition-all duration-300 text-slate-400 hover:text-white">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 hover:scale-110 transition-all duration-300 text-slate-400 hover:text-white">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-sky-500 hover:scale-110 transition-all duration-300 text-slate-400 hover:text-white">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-red-600 hover:scale-110 transition-all duration-300 text-slate-400 hover:text-white">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-800 mt-8 pt-6 text-center text-sm text-slate-500 relative z-10">
          <p>&copy; {new Date().getFullYear()} JadT Airline. All rights reserved. Developed by JadT Team</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
