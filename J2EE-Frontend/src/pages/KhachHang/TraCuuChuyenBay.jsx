import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import DatChoService from "../../services/DatChoService";
import useTitle from '../../hooks/useTitle';

function TraCuuChuyenBay() {
  useTitle('Tra cứu chuyến bay - Airline Booking');
  const [bookingCode, setBookingCode] = useState("");
  const [passengerName, setPassengerName] = useState("");
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setBookingData(null);

    if (!bookingCode || !passengerName) {
      setError(t('pages.tra_cuu.error_empty'));
      return;
    }

    setLoading(true);

    try {
      const response = await DatChoService.searchDatCho(bookingCode, passengerName);
      
      if (response.success && response.data) {
        setBookingData(response.data);
      } else {
        setError(response.message || "Không tìm thấy thông tin đặt chỗ");
      }
    } catch (err) {
      console.error("Error searching booking:", err);
      setError(err.response?.data?.message || "Không tìm thấy thông tin đặt chỗ. Vui lòng kiểm tra lại mã đặt chỗ và tên hành khách.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        className="max-w-4xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            {t('pages.tra_cuu.title')}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {t('pages.tra_cuu.subtitle')}
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 md:p-10 mb-12">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">
                  {t('pages.tra_cuu.label_booking_code')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400">🎫</span>
                  </div>
                  <input
                    type="number"
                    value={bookingCode}
                    onChange={(e) => setBookingCode(e.target.value)}
                    placeholder={t('pages.tra_cuu.placeholder_booking_code')}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-700 font-medium"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">
                  {t('pages.tra_cuu.label_passenger_name')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400">👤</span>
                  </div>
                  <input
                    type="text"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    placeholder={t('pages.tra_cuu.placeholder_passenger_name')}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-700 font-medium"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl flex items-center gap-3 text-red-600"
              >
                <span>⚠️</span>
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('pages.tra_cuu.searching')}
                </>
              ) : (
                <>
                  <span>🔍</span>
                  {t('pages.tra_cuu.search_btn')}
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Booking Details */}
        {bookingData && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-12"
          >
            <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm">✓</span>
                {t('pages.shared_ui.booking_details_title')}
              </h2>
              <span className="px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium backdrop-blur-md">
                {bookingData.maDatCho}
              </span>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-sm text-slate-500 font-medium mb-1">{t('pages.tra_cuu.booking_date_label')}</p>
                  <p className="text-lg font-bold text-slate-800">{formatDate(bookingData.ngayDatCho)}</p>
                </div>
                
                {bookingData.hanhKhach && (
                  <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <p className="text-sm text-blue-600/80 font-medium mb-1">{t('pages.tra_cuu.passenger_label')}</p>
                    <p className="text-lg font-bold text-blue-900">{bookingData.hanhKhach.hoVaTen}</p>
                    <p className="text-sm text-blue-700/70 mt-1">{bookingData.hanhKhach.email}</p>
                  </div>
                )}
              </div>

              {bookingData.chiTietGhe?.chiTietChuyenBay && (
                <div className="p-6 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">✈️</span>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('pages.tra_cuu.flight_info_label')}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-2xl font-black text-slate-800 mb-1">
                        {bookingData.chiTietGhe.chiTietChuyenBay.soHieuChuyenBay}
                      </p>
                      <p className="text-slate-600 font-medium">
                        {formatDate(bookingData.chiTietGhe.chiTietChuyenBay.ngayDi)} • {bookingData.chiTietGhe.chiTietChuyenBay.gioDi}
                      </p>
                    </div>
                    
                    {bookingData.chiTietGhe.chiTietChuyenBay.tuyenBay && (
                      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100">
                        <div className="flex-1 text-center">
                          <p className="text-xl font-bold text-slate-800">{bookingData.chiTietGhe.chiTietChuyenBay.tuyenBay.sanBayDi?.maSanBay}</p>
                          <p className="text-xs text-slate-500 truncate">{bookingData.chiTietGhe.chiTietChuyenBay.tuyenBay.sanBayDi?.tenSanBay}</p>
                        </div>
                        <div className="text-slate-300">→</div>
                        <div className="flex-1 text-center">
                          <p className="text-xl font-bold text-slate-800">{bookingData.chiTietGhe.chiTietChuyenBay.tuyenBay.sanBayDen?.maSanBay}</p>
                          <p className="text-xs text-slate-500 truncate">{bookingData.chiTietGhe.chiTietChuyenBay.tuyenBay.sanBayDen?.tenSanBay}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {bookingData.chiTietGhe?.hangVe && (
                  <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-700/80 font-medium mb-1">{t('pages.tra_cuu.fare_class_label')}</p>
                      <p className="text-lg font-bold text-amber-900">{bookingData.chiTietGhe.hangVe.tenHangVe}</p>
                    </div>
                    <span className="text-3xl">🎫</span>
                  </div>
                )}

                {bookingData.thanhToan && (
                  <div className={`p-5 rounded-2xl border ${bookingData.thanhToan.daThanhToan === 'Y' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm font-medium mb-1 opacity-80">{t('pages.tra_cuu.payment_status_label')}</p>
                        <p className="text-2xl font-bold">{formatCurrency(bookingData.thanhToan.soTien)}</p>
                      </div>
                      {bookingData.thanhToan.daThanhToan === 'Y' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                          ✓ {t('pages.tra_cuu.paid_label')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                          ⏳ {t('pages.tra_cuu.unpaid_label')}
                        </span>
                      )}
                    </div>
                    
                    {bookingData.thanhToan.ngayHetHan && bookingData.thanhToan.daThanhToan !== 'Y' && (
                      <p className="text-xs font-medium opacity-70 flex items-center gap-1">
                        <span>⏰</span> {t('pages.tra_cuu.payment_deadline_label')} {formatDate(bookingData.thanhToan.ngayHetHan)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Info Cards */}
        <motion.div variants={containerVariants} className="grid md:grid-cols-3 gap-6">
          {[
            { icon: "✈️", title: t('pages.shared_ui.info_card_view_details_title'), desc: t('pages.shared_ui.info_card_view_details_desc') },
            { icon: "📝", title: t('pages.shared_ui.info_card_change_booking_title'), desc: t('pages.shared_ui.info_card_change_booking_desc') },
            { icon: "💳", title: t('pages.shared_ui.info_card_payment_title'), desc: t('pages.shared_ui.info_card_payment_desc') }
          ].map((card, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 transition-all"
            >
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl mb-4">
                {card.icon}
              </div>
              <h3 className="font-bold text-slate-800 mb-2 text-lg">{card.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default TraCuuChuyenBay;
