import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import Footer from "../../components/common/Footer";
import Chatbot from "../../components/common/Chatbot";
import ProfileCompleteBanner from "../../components/common/ProfileCompleteBanner";
import TimChuyenBayForm from '../../components/KhachHang/TimChuyenBayForm'
import useTitle from '../../hooks/useTitle';

function TrangChu() {
  const { t } = useTranslation();
  useTitle('Trang chủ - Đặt vé máy bay trực tuyến | Airline Booking');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showBanner, setShowBanner] = useState(true);
  const [activeFaq, setActiveFaq] = useState(null);

  const slides = [
    {
      id: 1,
      image: "/banner/1topbannerpc-1756961025580.jpg",
      title: "Khám phá thế giới",
      subtitle: "Cùng SGU Airline"
    },
    {
      id: 2,
      image: "/banner/1websitetopbanner1920x960saleskybossvn-1761643850128.jpg",
      title: "Trải nghiệm đẳng cấp",
      subtitle: "Dịch vụ SkyBoss"
    },
    {
      id: 3,
      image: "/banner/4websitetopbanner1920x960salephilipinesob-1762138731074.jpg",
      title: "Bay xa hơn nữa",
      subtitle: "Ưu đãi ngập tràn"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="bg-[#F8FAFC] overflow-hidden">
      {/* Profile Complete Banner */}
      <ProfileCompleteBanner />
      
      {/* Announcement Banner - Modernized */}
      <AnimatePresence>
        {showBanner && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative isolate flex items-center gap-x-6 overflow-hidden bg-linear-to-r from-indigo-600 via-blue-600 to-indigo-600 px-6 py-3 sm:px-3.5 sm:before:flex-1 shadow-md z-50"
          >
            <div className="absolute left-[max(-7rem,calc(50%-52rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl" aria-hidden="true">
              <div className="aspect-[577/310] w-[36.0625rem] bg-linear-to-r from-cyan-400 to-blue-500 opacity-40" style={{ clipPath: 'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)' }}></div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="text-sm leading-6 text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">✨</span>
                <strong className="font-semibold">{t('home_page.announcement_title')}</strong>
                <span className="hidden md:inline">&bull;</span>
                <span className="opacity-90">{t('home_page.announcement_desc')}</span>
              </p>
              <a href="/" className="flex-none rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-white hover:text-blue-600 transition-all duration-300">
                {t('home_page.book_now')} <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
            <div className="flex flex-1 justify-end">
              <button type="button" onClick={() => setShowBanner(false)} className="-m-3 p-3 focus-visible:outline-offset-[-4px] hover:rotate-90 transition-transform duration-300">
                <span className="sr-only">{t('home_page.close')}</span>
                <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section - Phá cách với Split Layout & Glassmorphism */}
      <div className="relative min-h-[90vh] flex items-center justify-center pt-10 pb-20 lg:pt-0 lg:pb-0">
        {/* Dynamic Background Slider */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
            />
          </AnimatePresence>
          {/* Gradient Overlay for better readability */}
          <div className="absolute inset-0 bg-linear-to-r from-slate-900/80 via-slate-900/50 to-transparent"></div>
          <div className="absolute inset-0 bg-linear-to-t from-[#F8FAFC] via-transparent to-transparent h-full"></div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10 h-full flex flex-col lg:flex-row items-center gap-12 mt-10 lg:mt-0">
          {/* Left Content - Typography */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-full lg:w-5/12 text-white space-y-6"
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium tracking-wider mb-2">
              ✈️ JadT AIRLINE 2026
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentSlide}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="block text-blue-100 drop-shadow-[0_2px_10px_rgba(15,23,42,0.35)]"
                >
                  {slides[currentSlide].title}
                </motion.span>
              </AnimatePresence>
              <span className="block mt-2">{slides[currentSlide].subtitle}</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-md leading-relaxed">
              Trải nghiệm hành trình tuyệt vời với dịch vụ đẳng cấp, giá vé ưu đãi và hàng ngàn điểm đến hấp dẫn đang chờ đón bạn.
            </p>
            
            {/* Custom Slider Controls */}
            <div className="flex gap-3 pt-8">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    index === currentSlide
                      ? "w-12 bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]"
                      : "w-4 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* Right Content - Glassmorphism Booking Form */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="w-full lg:w-7/12"
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-6 lg:p-8 shadow-2xl relative overflow-hidden">
              {/* Decorative blur blobs inside form */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/30 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 bg-white rounded-[2rem] p-2 shadow-inner">
                <TimChuyenBayForm />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Services - Floating Cards Layout */}
      <div className="relative z-20 -mt-10 mb-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6"
          >
            {[
              { icon: "booking-1634319183743.svg", title: t('home_page.service_booking'), link: "/", color: "from-blue-500 to-indigo-600" },
              { icon: "buymore-1634319183745.svg", title: t('home_page.service_buy_more'), link: "/dich-vu-chuyen-bay", color: "from-orange-400 to-red-500" },
              { icon: "checkin-1634319183747.svg", title: t('home_page.service_checkin'), link: "/online-check-in", color: "from-emerald-400 to-teal-600" },
              { icon: "hotelbus-1634319183749.svg", title: t('home_page.service_hotel_car'), link: "/dich-vu-khac", color: "from-purple-500 to-fuchsia-600" }
            ].map((service, idx) => (
              <motion.a 
                key={idx}
                variants={fadeInUp}
                href={service.link} 
                className={`group relative overflow-hidden rounded-3xl p-6 bg-linear-to-br ${service.color} shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/20 transition-all"></div>
                <div className="relative z-10 flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center p-3 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 border border-white/30 shadow-inner">
                    <img src={`/service/${service.icon}`} alt={service.title} className="w-full h-full drop-shadow-md" />
                  </div>
                  <span className="text-white font-bold text-sm lg:text-base tracking-wide">{service.title}</span>
                </div>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bento Grid - Promotions & Banners */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="container mx-auto px-4 lg:px-8 py-16"
      >
        <div className="text-center mb-12">
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">
            Ưu đãi <span className="text-blue-600">Độc Quyền</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-slate-500 text-lg max-w-2xl mx-auto">Khám phá những chương trình khuyến mãi hấp dẫn nhất chỉ có tại SGU Airline.</motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
          {/* Large Banner - Spans 2 columns on desktop */}
          <motion.div variants={fadeInUp} className="md:col-span-2 relative rounded-[2rem] overflow-hidden shadow-lg group">
            <img src="/artboard/1200x600vn1647922449867-1695094342588.webp" alt="Promo" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <div className="inline-block px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full mb-3 uppercase tracking-wider">Hot Deal</div>
              <h3 className="text-3xl font-bold text-white mb-2">{t('home_page.promo_airline_title')}</h3>
              <p className="text-slate-200 mb-4 max-w-md">{t('home_page.promo_airline_desc')}</p>
              <button className="px-6 py-2.5 bg-white text-slate-900 rounded-full font-bold hover:bg-blue-50 transition-colors shadow-lg">
                {t('home_page.view_now')}
              </button>
            </div>
          </motion.div>

          {/* Small Banner 1 */}
          <motion.div variants={fadeInUp} className="relative rounded-[2rem] overflow-hidden shadow-lg group">
            <img src="/artboard/swift2471592284169014-1695094650429.webp" alt="Fast" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-linear-to-t from-blue-900/90 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <h3 className="text-xl font-bold text-white mb-2">{t('home_page.promo_fast_title')}</h3>
              <button className="mt-2 text-sm font-bold text-blue-300 hover:text-white transition-colors flex items-center gap-1">
                {t('home_page.buy_now')} <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
          </motion.div>

          {/* Small Banner 2 */}
          <motion.div variants={fadeInUp} className="relative rounded-[2rem] overflow-hidden shadow-lg group">
            <img src="/artboard/anhviber20240917110241588-1727233373363.jpg" alt="Card" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-linear-to-t from-purple-900/90 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <h3 className="text-xl font-bold text-white mb-2">{t('home_page.promo_card_title')}</h3>
              <button className="mt-2 text-sm font-bold text-purple-300 hover:text-white transition-colors flex items-center gap-1">
                {t('home_page.register_card')} <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
          </motion.div>

          {/* Small Banner 3 */}
          <motion.div variants={fadeInUp} className="md:col-span-2 relative rounded-[2rem] overflow-hidden shadow-lg group">
            <img src="/artboard/artboard216418031278341695094349731-1715833806513.webp" alt="Hotel" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-linear-to-r from-slate-900/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 w-full h-full flex flex-col justify-center">
              <h3 className="text-3xl font-bold text-white mb-2">Combo Khách Sạn & Vé Máy Bay</h3>
              <p className="text-slate-200 mb-4 max-w-sm">Tiết kiệm lên đến 30% khi đặt trọn gói hành trình của bạn.</p>
              <button className="w-fit px-6 py-2.5 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors shadow-lg">
                Khám phá ngay
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Why Choose Us - Modern Cards */}
      <div className="bg-white py-24 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-50/50 blur-3xl"></div>
          <div className="absolute top-[60%] -left-[10%] w-[40%] h-[40%] rounded-full bg-cyan-50/50 blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black text-slate-800 mb-4"
            >
              {t('home_page.why_choose')} <span className="text-blue-600">JadT Airline?</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-500 max-w-2xl mx-auto"
            >
              {t('home_page.why_choose_desc')}
            </motion.p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { icon: "💰", title: t('home_page.best_price'), desc: t('home_page.best_price_desc'), color: "bg-blue-50 text-blue-600" },
              { icon: "⚡", title: t('home_page.fast_booking'), desc: t('home_page.fast_booking_desc'), color: "bg-cyan-50 text-cyan-600" },
              { icon: "🎯", title: t('home_page.support_247'), desc: t('home_page.support_247_desc'), color: "bg-indigo-50 text-indigo-600" }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                variants={fadeInUp}
                className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 border border-slate-100 hover:-translate-y-1 group"
              >
                <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Popular Destinations - Masonry Style */}
      <div className="bg-slate-900 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/background/home/bgBannerHomePage.72a61446.webp')] opacity-10 bg-cover bg-center bg-fixed"></div>
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl"
            >
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                {t('home_page.popular_destinations')} <span className="text-blue-300">{t('home_page.popular_destinations_highlight')}</span>
              </h2>
              <p className="text-lg text-slate-400">
                {t('home_page.popular_destinations_desc')}
              </p>
            </motion.div>
            <motion.button 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="px-6 py-3 rounded-full border border-slate-700 text-white hover:bg-white hover:text-slate-900 transition-colors font-medium whitespace-nowrap"
            >
              Xem tất cả điểm đến
            </motion.button>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { id: 'tphcm', img: 'tphcm.jpg', tag: 'HOT', tagColor: 'bg-red-500', span: 'md:col-span-2 lg:col-span-2 lg:row-span-2' },
              { id: 'hanoi', img: 'hanoi.jpg', tag: 'SALE', tagColor: 'bg-orange-500', span: '' },
              { id: 'danang', img: 'danang.jpg', tag: 'NEW', tagColor: 'bg-blue-500', span: '' },
              { id: 'phuquoc', img: 'phuquoc.jpeg', tag: '🏝️', tagColor: 'bg-emerald-500', span: '' },
              { id: 'nhatrang', img: 'nha-trang.png', tag: '🌊', tagColor: 'bg-cyan-500', span: 'md:col-span-2 lg:col-span-2' }
            ].map((dest, idx) => (
              <motion.article 
                key={idx}
                variants={fadeInUp}
                className={`relative isolate flex flex-col justify-end overflow-hidden rounded-[2rem] bg-slate-800 group ${dest.span} min-h-[300px] lg:min-h-[400px]`}
              >
                <img src={`/destination/${dest.img}`} alt={t(`home_page.destinations.${dest.id}.title`)} className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 -z-10 bg-linear-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                
                <div className="absolute top-6 left-6">
                  <span className={`px-4 py-1.5 ${dest.tagColor} text-white rounded-full text-xs font-bold tracking-wider shadow-lg`}>
                    {dest.tag}
                  </span>
                </div>

                <div className="p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex items-center gap-4 text-sm text-slate-300 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    <span className="font-medium text-white">{t(`destinations.${dest.id}.price`)}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                    <span>Khứ hồi</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {t(`destinations.${dest.id}.title`)}
                  </h3>
                  <p className="text-slate-300 line-clamp-2 text-sm">
                    {t(`destinations.${dest.id}.desc`)}
                  </p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Modern FAQ Section */}
      <div className="bg-[#F8FAFC] py-24">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-black text-slate-800 mb-4"
            >
              {t('home_page.faq_title')} <span className="text-blue-600">{t('home_page.faq_highlight')}</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-500"
            >
              {t('home_page.faq_contact')} <a href="/ho-tro" className="text-blue-600 font-semibold hover:underline">{t('home_page.faq_contact_team')}</a> {t('home_page.faq_contact_help')}
            </motion.p>
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((num, idx) => (
              <motion.div 
                key={num}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
              >
                <button 
                  onClick={() => toggleFaq(num)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="font-bold text-slate-800 pr-8">{t(`home_page.faq_q${num}`)}</span>
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${activeFaq === num ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                    <svg className={`w-5 h-5 transition-transform duration-300 ${activeFaq === num ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                <AnimatePresence>
                  {activeFaq === num && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-5 text-slate-600 leading-relaxed border-t border-slate-50 pt-4">
                        {t(`home_page.faq_a${num}`)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Chatbot Component */}
      <Chatbot />

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default TrangChu

