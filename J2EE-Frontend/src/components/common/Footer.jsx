import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
          {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Column 1 - Đề cố chuyến bay tốt đẹp */}
          <div>
            <h3 className="text-red-500 font-bold mb-4 flex items-center gap-2">
              <span>✈️</span>
              {t('footer.about_us')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-red-500 transition-colors">Điều lệ vận chuyển</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Điều kiện vé</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">SGU e-Voucher</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Phiếu quà tặng trực tuyến (e-Forms)</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Thông tin bồi thường</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Phí và lệ phí</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Giấy tờ tùy thân</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Sân bay và phát triển quốc tế</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Quy định hành lý</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Tìm kiếm hành lý</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Hành lý lớn khi Quốc tế</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Thông tin nội chuyện</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Kênh thanh toán</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Hóa đơn VAT</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Hướng dẫn làm thủ tục chuyến bay</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Khuyến cáo đi chuyến</Link></li>
            </ul>
          </div>

          {/* Column 2 - Mua hành lý, suất ăn... */}
          <div>
            <h3 className="text-red-500 font-bold mb-4 flex items-center gap-2">
              <span>✈️</span>
              {t('footer.follow_us')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-red-500 transition-colors">Chọn chỗ ngồi ưu tiên</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Mua trước hành lý</Link></li>
              <li><Link to="/dich-vu-chuyen-bay" className="hover:text-red-500 transition-colors">Đặt trước suất ăn - Vikafe</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Hàng miễn thuế</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Quà lưu niệm</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Giải trí</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Dịch vụ vận chuyển thú cưng</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Dịch vụ trẻ em đi một mình</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Dịch vụ hỗ trợ "Bay cùng bạn"</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Mua thêm chỗ ngồi bên cạnh</Link></li>
            </ul>

            <h3 className="text-red-500 font-bold mb-4 mt-6 flex items-center gap-2">
              <span>✈️</span>
              {t('footer.about_us')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-red-500 transition-colors">Giới thiệu công ty</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Nhà đầu tư</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Cơ hội nghề nghiệp</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Tin tức</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Khuyến mại</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Cẩm nang du lịch</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Tổng đài phục vụ khách hàng</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Quy định về tiếp nhận và xử lý phản hồi của hành khách</Link></li>
            </ul>
          </div>

          {/* Column 3 - Dịch vụ cao cấp */}
          <div>
            <h3 className="text-red-500 font-bold mb-4 flex items-center gap-2">
              <span>🌟</span>
              {t('footer.policy')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-red-500 transition-colors">Hạng vé thương gia - Business</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Hạng vé Skyboss</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Phòng chờ sang trọng</Link></li>
            </ul>

            <h3 className="text-red-500 font-bold mb-4 mt-6 flex items-center gap-2">
              <span>💰</span>
              Mua vé ở đâu?
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-red-500 transition-colors">Tổng đài bán vé</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Phòng bán vé</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Đại lý bán vé</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">IOSS / Chuyển Bán Trực Tuyến Danh</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Đăng ký khách hàng Doanh nghiệp</Link></li>
              <li><Link to="/" className="hover:text-red-500 transition-colors">Đăng ký làm đại lý online</Link></li>
            </ul>

            <h3 className="text-red-500 font-bold mb-4 mt-6 flex items-center gap-2">
              <span>🔍</span>
              Tìm vật phẩm bỏ quên
            </h3>
          </div>

          {/* Column 4 - Các dịch vụ khác */}
          <div>
            <h3 className="text-red-500 font-bold mb-4 flex items-center gap-2">
              <span>🎯</span>
              {t('footer.contact')}
            </h3>
            
            <h3 className="text-red-500 font-bold mb-4 mt-6 flex items-center gap-2">
              <span>📝</span>
              Đăng nhập đại lý
            </h3>
            
            <h3 className="text-red-500 font-bold mb-4 mt-6 flex items-center gap-2">
              <span>📦</span>
              Dịch vụ hàng hóa
            </h3>
            
            <h3 className="text-red-500 font-bold mb-4 mt-6 flex items-center gap-2">
              <span>📜</span>
              Chính sách về quyền riêng tư
            </h3>
            
            <h3 className="text-red-500 font-bold mb-4 mt-6 flex items-center gap-2">
              <span>🔒</span>
              Chính sách bảo vệ quyền lợi khách hàng để bị tổn thương
            </h3>
            
            <h3 className="text-red-500 font-bold mb-4 mt-6 flex items-center gap-2">
              <span>⚙️</span>
              Quy trình xử lý đối, hoàn, hủy vé
            </h3>
          </div>
        </div>

          {/* Download App Section */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-bold mb-4">{t('footer.download_app')}</h3>
              <p className="text-gray-400 mb-4">{t('footer.download_app_desc')}</p>
              <div className="flex gap-4">
                <a href="#" className="hover:opacity-80 transition-opacity">
                  <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" className="h-10" />
                </a>
                <a href="#" className="hover:opacity-80 transition-opacity">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-10" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">{t('footer.payment_help_title')}</h3>
              <p className="text-gray-400">{t('footer.payment_help_desc')}</p>
            </div>
          </div>
        </div>

        {/* Social Media & Company Info */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Kết nối với SGU Airline</span>
              <div className="flex gap-3">
                {/* Facebook */}
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                
                {/* Instagram */}
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-linear-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center hover:from-purple-700 hover:to-pink-700 transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                
                {/* Twitter/X */}
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                
                {/* Zalo */}
                <a href="https://zalo.me" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 4.973 0 11.111c0 3.497 1.745 6.616 4.472 8.652L4 24l4.735-2.121C9.753 22.265 10.847 22.5 12 22.5c6.627 0 12-4.973 12-11.111C24 4.973 18.627 0 12 0zm.145 17.157h-.29l-3.272-4.407v4.407H6.5V6.843h2.083l3.272 4.406V6.843h2.083v10.314h-.793z"/>
                  </svg>
                </a>
                
                {/* YouTube */}
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                
                {/* TikTok */}
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-900 transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="text-center md:text-right">
                <p className="text-sm text-gray-400 mb-2">
                <strong>CÔNG TY CỔ PHẦN HÀNG KHÔNG SGU AIRLINE</strong>
              </p>
              <p className="text-xs text-gray-500">
                302/3 Phố Kim Mã, Phường Ngọc Hà, TP. Hà Nội, Việt Nam.
              </p>
              <p className="text-xs text-gray-500">
                Chịu trách nhiệm nội dung: <strong>Ông Nguyễn Thanh Sơn</strong>
              </p>
              <div className="mt-2">
                <img src="http://online.gov.vn/Content/EndUser/LogoCCDVSaleNoti/logoSaleNoti.png" alt="Đã thông báo Bộ Công Thương" className="h-8 mx-auto md:ml-auto" />
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500">
          <p>&copy; 2025 SGU Airline. All rights reserved. Developed by SGU Team</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
