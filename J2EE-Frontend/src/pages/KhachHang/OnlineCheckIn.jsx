import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import CheckInService from '../../services/CheckInService';
import useTitle from '../../hooks/useTitle';

function OnlineCheckIn() {
  const { t } = useTranslation();
  useTitle('Online Check-in - JadT Airline');
  const [bookingCode, setBookingCode] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingInfo, setBookingInfo] = useState(null);
  const [error, setError] = useState("");
  const [checkInSuccess, setCheckInSuccess] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setBookingInfo(null);
    setCheckInSuccess(false);

    if (!bookingCode || !lastName) {
      setError(t('pages.online_checkin.error_required'));
      return;
    }

    setLoading(true);
    try {
      const response = await CheckInService.searchBooking(bookingCode, lastName);

      if (response.success && response.bookingInfo) {
        setBookingInfo(response.bookingInfo);
      } else {
        setError(response.message || t('pages.tra_cuu.error_not_found'));
      }
    } catch (err) {
      setError(t('pages.online_checkin.error_connection'));
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCheckIn = async () => {
    if (!bookingInfo) return;

    setLoading(true);
    try {
      const response = await CheckInService.confirmCheckIn(bookingInfo.maDatCho);

      if (response.success) {
        setCheckInSuccess(true);
      } else {
        setError(response.message || t('pages.online_checkin.error_connection'));
      }
    } catch (err) {
      setError(t('pages.online_checkin.error_connection'));
      console.error("Check-in error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const resetForm = () => {
    setBookingCode("");
    setLastName("");
    setBookingInfo(null);
    setError("");
    setCheckInSuccess(false);
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

  const benefits = [
    { icon: "⏰", title: t('pages.online_checkin_extra.benefit_time_desc'), desc: "Không cần xếp hàng, check-in trong vài phút" },
    { icon: "🎫", title: t('pages.online_checkin_extra.benefit_boarding_pass'), desc: "Nhận thẻ lên máy bay điện tử ngay trên điện thoại" },
    { icon: "💺", title: t('pages.online_checkin_extra.benefit_seat'), desc: "Xem và chọn chỗ ngồi yêu thích của bạn" },
    { icon: "🎒", title: t('pages.online_checkin_extra.benefit_baggage'), desc: "Mua thêm hành lý với giá ưu đãi" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-blue-600/10 to-transparent pointer-events-none" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        className="max-w-6xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            ✈️ {t('pages.online_checkin.title')}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {t('pages.online_checkin.subtitle')}
          </p>
        </motion.div>

        {!checkInSuccess ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left - Form Section */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 md:p-10">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">📋</span>
                  {t('pages.online_checkin.passenger_info_title')}
                </h2>

                {!bookingInfo ? (
                  <form onSubmit={handleSearch} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        {t('pages.online_checkin.label_booking_code')}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-slate-400 text-lg">🎫</span>
                        </div>
                        <input
                          type="number"
                          value={bookingCode}
                          onChange={(e) => setBookingCode(e.target.value)}
                          placeholder={t('pages.online_checkin.placeholder_booking_code')}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-slate-700 font-medium"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        {t('pages.online_checkin.label_last_name')}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-slate-400 text-lg">👤</span>
                        </div>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder={t('pages.online_checkin.placeholder_last_name')}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-slate-700 font-medium"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4 bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-2xl flex items-center gap-3 text-red-600"
                        >
                          <span className="text-xl">⚠️</span>
                          <p className="text-sm font-medium">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

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
                          {t('pages.online_checkin.searching')}
                        </>
                      ) : (
                        <>
                          <span>🔍</span>
                          {t('pages.online_checkin.checkin_btn')}
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    {/* Booking Code Success */}
                    <div className="flex items-center justify-between p-5 bg-linear-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">✓</div>
                        <div>
                          <p className="text-sm text-green-700 font-medium">{t('pages.online_checkin.booking_code_display')}</p>
                          <p className="text-2xl font-extrabold text-green-700">#{bookingInfo.maDatCho}</p>
                        </div>
                      </div>
                    </div>

                    {/* Passenger Info */}
                    <div className="p-5 bg-linear-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                      <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <span className="text-2xl">👤</span> {t('pages.online_checkin.passenger_info_section')}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-slate-700"><span className="font-semibold">{t('pages.online_checkin.full_name')}:</span> {bookingInfo.hoVaTen}</p>
                        <p className="text-slate-700"><span className="font-semibold">{t('pages.online_checkin.email')}:</span> {bookingInfo.email}</p>
                        <p className="text-slate-700"><span className="font-semibold">{t('pages.online_checkin.phone')}:</span> {bookingInfo.soDienThoai}</p>
                      </div>
                    </div>

                    {/* Flight Info */}
                    <div className="p-5 bg-linear-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-100">
                      <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <span className="text-2xl">✈️</span> {t('pages.online_checkin.flight_info_section')}
                      </h3>
                      <div className="space-y-3">
                        <p className="text-xl font-black text-blue-600">{bookingInfo.soHieuChuyenBay}</p>
                        <div className="flex items-center justify-between bg-white/70 p-4 rounded-xl">
                          <div className="text-center">
                            <p className="font-bold text-slate-800">{bookingInfo.maSanBayDi}</p>
                            <p className="text-xs text-slate-500">{bookingInfo.tenSanBayDi}</p>
                            <p className="text-lg font-bold text-blue-600">{bookingInfo.gioDi}</p>
                            <p className="text-xs text-slate-600">{formatDate(bookingInfo.ngayDi)}</p>
                          </div>
                          <div className="text-3xl text-blue-400">→</div>
                          <div className="text-center">
                            <p className="font-bold text-slate-800">{bookingInfo.maSanBayDen}</p>
                            <p className="text-xs text-slate-500">{bookingInfo.tenSanBayDen}</p>
                            <p className="text-lg font-bold text-blue-600">{bookingInfo.gioDen}</p>
                            <p className="text-xs text-slate-600">{formatDate(bookingInfo.ngayDen)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Seat Info */}
                    <div className="p-5 bg-linear-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                      <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <span className="text-2xl">💺</span> {t('pages.online_checkin.seat_info_section')}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-slate-700"><span className="font-semibold">{t('pages.online_checkin.seat_number')}:</span> <span className="text-lg font-bold text-purple-600">{bookingInfo.maGhe}</span></p>
                        <p className="text-slate-700"><span className="font-semibold">{t('pages.online_checkin.fare_class')}:</span> <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">{bookingInfo.tenHangVe}</span></p>
                      </div>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4 bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-2xl flex items-center gap-3 text-red-600"
                        >
                          <span className="text-xl">⚠️</span>
                          <p className="text-sm font-medium">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex gap-3">
                      <button
                        onClick={handleConfirmCheckIn}
                        disabled={loading}
                        className="flex-1 py-4 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? t('pages.online_checkin.processing') : (
                          <>
                            <span>✓</span>
                            {t('pages.online_checkin.confirm_checkin_btn')}
                          </>
                        )}
                      </button>
                      <button
                        onClick={resetForm}
                        disabled={loading}
                        className="px-6 py-4 bg-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-300 transition-all disabled:opacity-50"
                      >
                        {t('pages.online_checkin.cancel_btn')}
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-6 p-4 bg-amber-50/80 backdrop-blur-sm rounded-2xl border border-amber-200">
                  <p className="text-sm text-amber-800 flex items-start gap-2">
                    <span className="text-lg">⏰</span>
                    <span><strong>{t('pages.online_checkin.note_title')}:</strong> {t('pages.online_checkin_extra.note')}</span>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right - Benefits */}
            <motion.div variants={itemVariants} className="space-y-4">
              {benefits.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-slate-200/50 border border-white/50 transition-all hover:shadow-xl"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-linear-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 mb-1">{benefit.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{benefit.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ) : (
          /* Success Message */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-12 text-center relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-green-400 via-emerald-500 to-green-600"></div>
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-400/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl"></div>

              <div className="relative z-10">
                <div className="text-8xl mb-6 animate-bounce">🎉</div>
                <h2 className="text-4xl font-extrabold text-green-600 mb-4">{t('pages.online_checkin.success_title')}</h2>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                  {t('pages.online_checkin.success_message')}
                </p>

                <div className="bg-linear-to-br from-slate-50 to-blue-50 p-6 rounded-3xl mb-8 space-y-3">
                  <div className="flex items-center justify-center gap-3 p-3 bg-white rounded-2xl shadow-sm">
                    <span className="text-2xl">✈️</span>
                    <span className="font-semibold text-slate-700">{t('pages.online_checkin.flight_label')} <strong className="text-blue-600">{bookingInfo?.soHieuChuyenBay}</strong></span>
                  </div>
                  <div className="flex items-center justify-center gap-3 p-3 bg-white rounded-2xl shadow-sm">
                    <span className="text-2xl">📍</span>
                    <span className="font-semibold text-slate-700">{bookingInfo?.maSanBayDi} → {bookingInfo?.maSanBayDen}</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 p-3 bg-white rounded-2xl shadow-sm">
                    <span className="text-2xl">🕐</span>
                    <span className="font-semibold text-slate-700">{t('pages.online_checkin.departure_time')} <strong className="text-blue-600">{bookingInfo?.gioDi}</strong> - {formatDate(bookingInfo?.ngayDi)}</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 p-3 bg-white rounded-2xl shadow-sm">
                    <span className="text-2xl">💺</span>
                    <span className="font-semibold text-slate-700">{t('pages.online_checkin.seat_label')} <strong className="text-purple-600">{bookingInfo?.maGhe}</strong> <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">{bookingInfo?.tenHangVe}</span></span>
                  </div>
                </div>

                <button
                  onClick={resetForm}
                  className="px-8 py-4 bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all"
                >
                  {t('pages.online_checkin.search_another')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default OnlineCheckIn;
