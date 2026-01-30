import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CheckInService from '../../services/CheckInService';

function OnlineCheckIn() {
  const { t } = useTranslation();
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

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-pink-50 via-yellow-50 to-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-red-600 mb-3">{t('pages.online_checkin.title')}</h1>
            <p className="text-gray-600">{t('pages.online_checkin.subtitle')}</p>
          </div>

          {!checkInSuccess ? (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Side - Check-in Form */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('pages.online_checkin.passenger_info_title')}</h2>
                
                {!bookingInfo ? (
                  <form onSubmit={handleSearch} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('pages.online_checkin.label_booking_code')}
                      </label>
                      <input
                        type="number"
                        value={bookingCode}
                        onChange={(e) => setBookingCode(e.target.value)}
                        placeholder={t('pages.online_checkin.placeholder_booking_code')}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-all"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('pages.online_checkin.label_last_name')}
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder={t('pages.online_checkin.placeholder_last_name')}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-all"
                        required
                        disabled={loading}
                      />
                    </div>

                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-linear-to-r from-red-600 to-red-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? t('pages.online_checkin.searching') : t('pages.online_checkin.checkin_btn')}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    {/* Thông tin đặt chỗ */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <span className="text-4xl">✅</span>
                        <div className="flex-1 ml-4">
                          <p className="text-sm text-gray-600">{t('pages.online_checkin.booking_code_display')}</p>
                          <p className="text-xl font-bold text-green-700">#{bookingInfo.maDatCho}</p>
                        </div>
                      </div>

                      {/* Thông tin hành khách */}
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                          <span className="text-2xl mr-2">👤</span> {t('pages.online_checkin.passenger_info_section')}
                        </h3>
                        <div className="space-y-1 text-sm">
                          <p><strong>{t('pages.online_checkin.full_name')}</strong> {bookingInfo.hoVaTen}</p>
                          <p><strong>{t('pages.online_checkin.email')}</strong> {bookingInfo.email}</p>
                          <p><strong>{t('pages.online_checkin.phone')}</strong> {bookingInfo.soDienThoai}</p>
                        </div>
                      </div>

                      {/* Thông tin chuyến bay */}
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                          <span className="text-2xl mr-2">✈️</span> {t('pages.online_checkin.flight_info_section')}
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p className="text-lg font-bold text-red-600">{bookingInfo.soHieuChuyenBay}</p>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold">{bookingInfo.maSanBayDi}</p>
                              <p className="text-xs text-gray-600">{bookingInfo.tenSanBayDi}</p>
                              <p className="text-lg font-bold text-blue-600">{bookingInfo.gioDi}</p>
                              <p className="text-xs">{formatDate(bookingInfo.ngayDi)}</p>
                            </div>
                            <div className="text-2xl">→</div>
                            <div className="text-right">
                              <p className="font-bold">{bookingInfo.maSanBayDen}</p>
                              <p className="text-xs text-gray-600">{bookingInfo.tenSanBayDen}</p>
                              <p className="text-lg font-bold text-blue-600">{bookingInfo.gioDen}</p>
                              <p className="text-xs">{formatDate(bookingInfo.ngayDen)}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Thông tin ghế */}
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                          <span className="text-2xl mr-2">💺</span> {t('pages.online_checkin.seat_info_section')}
                        </h3>
                        <div className="space-y-1 text-sm">
                          <p><strong>{t('pages.online_checkin.seat_number')}</strong> {bookingInfo.maGhe}</p>
                          <p><strong>{t('pages.online_checkin.fare_class')}</strong> {bookingInfo.tenHangVe}</p>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={handleConfirmCheckIn}
                        disabled={loading}
                        className="flex-1 py-3 bg-linear-to-r from-green-600 to-green-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50"
                      >
                        {loading ? t('pages.online_checkin.processing') : t('pages.online_checkin.confirm_checkin_btn')}
                      </button>
                      <button
                        onClick={resetForm}
                        disabled={loading}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all disabled:opacity-50"
                      >
                        {t('pages.online_checkin.cancel_btn')}
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-700">
                    <strong>{t('pages.online_checkin.note_title', 'Lưu ý:')}</strong> {t('pages.online_checkin_extra.note', 'Bạn chỉ có thể check-in trong vòng 24 giờ trước giờ bay')}
                  </p>
                </div>
              </div>

              {/* Right Side - Benefits */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">⏰</div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2">{t('pages.online_checkin_extra.benefit_time', t('pages.online_checkin.benefit_time', 'Tiết kiệm thời gian'))}</h3>
                      <p className="text-sm text-gray-600">{t('pages.online_checkin_extra.benefit_time_desc', 'Check-in trực tuyến giúp bạn tránh xếp hàng tại sân bay')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🎫</div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2">{t('pages.online_checkin_extra.benefit_boarding_pass', t('pages.online_checkin.benefit_boarding_pass', 'Thẻ lên máy bay điện tử'))}</h3>
                      <p className="text-sm text-gray-600">{t('pages.online_checkin_extra.benefit_boarding_pass_desc', 'Nhận thẻ lên máy bay ngay trên điện thoại')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">💺</div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2">{t('pages.online_checkin_extra.benefit_seat', t('pages.online_checkin.benefit_seat', 'Chọn chỗ ngồi'))}</h3>
                      <p className="text-sm text-gray-600">{t('pages.online_checkin_extra.benefit_seat_desc', 'Xem thông tin chỗ ngồi của bạn')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🎒</div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2">{t('pages.online_checkin_extra.benefit_baggage', t('pages.online_checkin.benefit_baggage', 'Hành lý'))}</h3>
                      <p className="text-sm text-gray-600">{t('pages.online_checkin_extra.benefit_baggage_desc', 'Kiểm tra thông tin hành lý của bạn')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Success Message */
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="text-8xl mb-6">🎉</div>
                <h2 className="text-3xl font-bold text-green-600 mb-4">{t('pages.online_checkin.success_title')}</h2>
                <p className="text-gray-600 mb-8">
                  {t('pages.online_checkin.success_message')}
                </p>
                <div className="space-y-4 text-left bg-gray-50 p-6 rounded-lg mb-8">
                  <p className="flex items-center gap-2">
                    <span className="text-2xl">✈️</span>
                    <span>{t('pages.online_checkin.flight_label')} <strong>{bookingInfo?.soHieuChuyenBay}</strong></span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-2xl">📍</span>
                    <span>{bookingInfo?.maSanBayDi} → {bookingInfo?.maSanBayDen}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-2xl">🕐</span>
                    <span>{t('pages.online_checkin.departure_time')} <strong>{bookingInfo?.gioDi}</strong> - {formatDate(bookingInfo?.ngayDi)}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-2xl">💺</span>
                    <span>{t('pages.online_checkin.seat_label')} <strong>{bookingInfo?.maGhe}</strong> ({bookingInfo?.tenHangVe})</span>
                  </p>
                </div>
                <button
                  onClick={resetForm}
                  className="px-8 py-3 bg-linear-to-r from-red-600 to-red-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  {t('pages.online_checkin.search_another')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default OnlineCheckIn;
