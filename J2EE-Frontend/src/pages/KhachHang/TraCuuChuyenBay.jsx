import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-[#F5F7FA] via-[#E3F2FD] to-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#1E88E5] mb-3">{t('pages.tra_cuu.title')}</h1>
            <p className="text-gray-600">{t('pages.tra_cuu.subtitle')}</p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('pages.tra_cuu.label_booking_code')}
                </label>
                <input
                  type="number"
                  value={bookingCode}
                  onChange={(e) => setBookingCode(e.target.value)}
                  placeholder={t('pages.tra_cuu.placeholder_booking_code')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1E88E5] focus:outline-none transition-all"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('pages.tra_cuu.label_passenger_name')}
                </label>
                <input
                  type="text"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  placeholder={t('pages.tra_cuu.placeholder_passenger_name')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1E88E5] focus:outline-none transition-all"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-[#1E88E5] text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-linear-to-r from-[#1E88E5] to-[#1565C0] text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('pages.tra_cuu.searching') : t('pages.tra_cuu.search_btn')}
              </button>
            </form>
          </div>

          {/* Booking Details */}
          {bookingData && (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                {t('pages.shared_ui.booking_details_title')}
              </h2>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">{t('pages.tra_cuu.booking_code_label')}</p>
                    <p className="text-lg font-bold text-gray-800">{bookingData.maDatCho}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">{t('pages.tra_cuu.booking_date_label')}</p>
                    <p className="text-lg font-bold text-gray-800">{formatDate(bookingData.ngayDatCho)}</p>
                  </div>
                </div>

                {bookingData.hanhKhach && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">{t('pages.tra_cuu.passenger_label')}</p>
                    <p className="text-lg font-bold text-gray-800">{bookingData.hanhKhach.hoVaTen}</p>
                    <p className="text-sm text-gray-600 mt-1">{bookingData.hanhKhach.email}</p>
                  </div>
                )}

                {bookingData.chiTietGhe?.chiTietChuyenBay && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">{t('pages.tra_cuu.flight_info_label')}</p>
                    <div className="space-y-2">
                      <p className="font-bold text-gray-800">
                        {t('pages.tra_cuu.flight_number_prefix')} {bookingData.chiTietGhe.chiTietChuyenBay.soHieuChuyenBay}
                      </p>
                      <p className="text-gray-700">
                        {t('pages.tra_cuu.flight_date_label')} {formatDate(bookingData.chiTietGhe.chiTietChuyenBay.ngayDi)}
                      </p>
                      <p className="text-gray-700">
                        {t('pages.tra_cuu.departure_time_label')} {bookingData.chiTietGhe.chiTietChuyenBay.gioDi}
                      </p>
                      {bookingData.chiTietGhe.chiTietChuyenBay.tuyenBay && (
                        <p className="text-gray-700">
                          {t('pages.tra_cuu.route_label')} {bookingData.chiTietGhe.chiTietChuyenBay.tuyenBay.sanBayDi?.tenSanBay} → {bookingData.chiTietGhe.chiTietChuyenBay.tuyenBay.sanBayDen?.tenSanBay}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {bookingData.chiTietGhe?.hangVe && (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">{t('pages.tra_cuu.fare_class_label')}</p>
                    <p className="text-lg font-bold text-gray-800">{bookingData.chiTietGhe.hangVe.tenHangVe}</p>
                  </div>
                )}

                {bookingData.thanhToan && (
                  <div className={`p-4 rounded-lg ${bookingData.thanhToan.daThanhToan === 'Y' ? 'bg-green-50' : 'bg-orange-50'}`}>
                    <p className="text-sm text-gray-600 mb-2">{t('pages.tra_cuu.payment_status_label')}</p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">{t('pages.tra_cuu.total_label')}</span>
                      <span className="text-xl font-bold text-[#1E88E5]">{formatCurrency(bookingData.thanhToan.soTien)}</span>
                    </div>
                    <div className="flex items-center">
                      {bookingData.thanhToan.daThanhToan === 'Y' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                          <span className="mr-1">✓</span> {t('pages.tra_cuu.paid_label')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800">
                          <span className="mr-1">⏳</span> {t('pages.tra_cuu.unpaid_label')}
                        </span>
                      )}
                    </div>
                    {bookingData.thanhToan.ngayHetHan && (
                      <p className="text-sm text-gray-600 mt-2">
                        {t('pages.tra_cuu.payment_deadline_label')} {formatDate(bookingData.thanhToan.ngayHetHan)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl mb-3">✈️</div>
              <h3 className="font-bold text-gray-800 mb-2">{t('pages.shared_ui.info_card_view_details_title')}</h3>
              <p className="text-sm text-gray-600">{t('pages.shared_ui.info_card_view_details_desc')}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl mb-3">📝</div>
              <h3 className="font-bold text-gray-800 mb-2">{t('pages.shared_ui.info_card_change_booking_title')}</h3>
              <p className="text-sm text-gray-600">{t('pages.shared_ui.info_card_change_booking_desc')}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl mb-3">💳</div>
              <h3 className="font-bold text-gray-800 mb-2">{t('pages.shared_ui.info_card_payment_title')}</h3>
              <p className="text-sm text-gray-600">{t('pages.shared_ui.info_card_payment_desc')}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TraCuuChuyenBay;
