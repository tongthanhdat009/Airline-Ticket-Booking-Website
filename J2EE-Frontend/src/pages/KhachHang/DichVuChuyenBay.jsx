import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ClientDichVuService from "../../services/ClientDichVuService";

function DichVuChuyenBay() {
  const { t } = useTranslation();
  const [maDatCho, setMaDatCho] = useState("");
  const [loading, setLoading] = useState(false);
  const [availableServices, setAvailableServices] = useState([]);
  const [bookedServices, setBookedServices] = useState([]);
  const [bookingInfo, setBookingInfo] = useState(null);
  const [error, setError] = useState("");
  const [selectedServices, setSelectedServices] = useState({});


  const handleSearchServices = async (e) => {
    e.preventDefault();
    setError("");
    setAvailableServices([]);
    setBookingInfo(null);

    if (!maDatCho) {
      setError(t('pages.dich_vu_chuyen_bay.label_booking_code') + ' ' + t('pages.dich_vu_chuyen_bay.error_empty') || t('pages.dich_vu_chuyen_bay.select_service_error'));
      return;
    }

    setLoading(true);

    try {
      const response = await ClientDichVuService.getAvailableServices(maDatCho);
      
      if (response.success && response.data) {
        setAvailableServices(response.data);
        setBookingInfo(response.datCho);
        
        // Load booked services
        const bookedResponse = await ClientDichVuService.getBookedServices(maDatCho);
        if (bookedResponse.success) {
          setBookedServices(bookedResponse.data);
        }
      } else {
        setError(response.message || "Không tìm thấy thông tin đặt chỹ");
      }
    } catch (err) {
      console.error("Error fetching services:", err);
      setError(err.response?.data?.message || t('pages.dich_vu_chuyen_bay.error_not_found'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectService = (maDichVu, maLuaChon, gia) => {
    setSelectedServices(prev => {
      const key = `${maDichVu}-${maLuaChon}`;
      if (prev[key]) {
        const newSelected = { ...prev };
        delete newSelected[key];
        return newSelected;
      } else {
        return {
          ...prev,
          [key]: { maDichVu, maLuaChon, gia, soLuong: 1 }
        };
      }
    });
  };

  const calculateTotal = () => {
    return Object.values(selectedServices).reduce((total, service) => {
      return total + (service.gia * service.soLuong);
    }, 0);
  };

  const handlePayment = async () => {
    if (Object.keys(selectedServices).length === 0) {
      setError("Vui lòng chọn ít nhất một dịch vụ");
      return;
    }

    setLoading(true);
    setError("");

    try {
      for (const service of Object.values(selectedServices)) {
        await ClientDichVuService.addService(maDatCho, service.maLuaChon, service.soLuong);
      }
      
      alert("Thêm dịch vụ thành công! Vui lòng thanh toán để hoàn tất đặt chỗ.");
      
      // Refresh data
      const bookedResponse = await ClientDichVuService.getBookedServices(maDatCho);
      if (bookedResponse.success) {
        setBookedServices(bookedResponse.data);
      }
      
      setSelectedServices({});
      
    } catch (err) {
      console.error("Error adding services:", err);
      setError(err.response?.data?.message || "Không thể thêm dịch vụ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-pink-50 via-yellow-50 to-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-red-600 mb-3">{t('pages.dich_vu_chuyen_bay.title')}</h1>
          <p className="text-gray-600 text-lg">{t('pages.dich_vu_chuyen_bay.subtitle')}</p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <form onSubmit={handleSearchServices} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('pages.dich_vu_chuyen_bay.label_booking_code')}
                </label>
                <input
                  type="number"
                  value={maDatCho}
                  onChange={(e) => setMaDatCho(e.target.value)}
                  placeholder={t('pages.dich_vu_chuyen_bay.placeholder_booking_code')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-all"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-linear-to-r from-red-600 to-red-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50"
              >
                {loading ? t('pages.dich_vu_chuyen_bay.searching') : t('pages.dich_vu_chuyen_bay.search_btn')}
              </button>
            </form>
          </div>

          {/* Booking Info */}
          {bookingInfo && (
            <div className="bg-blue-50 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-lg mb-2">{t('pages.dich_vu_chuyen_bay.booking_info_title')}</h3>
              <p className="text-gray-700">{t('pages.dich_vu_chuyen_bay.booking_code_label')} <span className="font-bold">{bookingInfo.maDatCho}</span></p>
              <p className="text-gray-700">{t('pages.dich_vu_chuyen_bay.passenger_label')} <span className="font-bold">{bookingInfo.tenHanhKhach}</span></p>
              <p className="text-gray-700">{t('pages.dich_vu_chuyen_bay.flight_code_label')} <span className="font-bold">{bookingInfo.maChuyenBay}</span></p>
            </div>
          )}

          {/* Booked Services */}
          {bookedServices.length > 0 && (
            <div className="bg-green-50 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-lg mb-4">{t('pages.dich_vu_chuyen_bay.booked_services_title')}</h3>
              <div className="space-y-3">
                {bookedServices.map((service, index) => (
                  <div key={index} className="flex justify-between items-center bg-white p-4 rounded-lg">
                    <div>
                      <p className="font-semibold">{service.luaChon?.tenDichVu} - {service.luaChon?.tenLuaChon}</p>
                      <p className="text-sm text-gray-600">{t('pages.dich_vu_chuyen_bay.quantity_label')} {service.soLuong}</p>
                    </div>
                    <p className="font-bold text-red-600">{formatCurrency(service.donGia * service.soLuong)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Services */}
          {availableServices.length > 0 && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('pages.dich_vu_chuyen_bay.available_services_title')}</h2>
              
              <div className="space-y-8 mb-12">
                {availableServices.map((service) => (
                  <div key={service.maDichVu} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-start mb-4">
                      {service.anh && (
                        <img 
                          src={`http://localhost:8080/admin/dashboard/dichvu/anh/${service.anh}`}
                          alt={service.tenDichVu}
                          className="w-16 h-16 object-contain mr-4"
                        />
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{service.tenDichVu}</h3>
                        <p className="text-gray-600">{service.moTa}</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {service.luaChon.map((option) => {
                        const isSelected = selectedServices[`${service.maDichVu}-${option.maLuaChon}`];
                        return (
                          <div 
                            key={option.maLuaChon}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                              isSelected ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-red-300'
                            }`}
                            onClick={() => handleSelectService(service.maDichVu, option.maLuaChon, option.gia)}
                          >
                            {option.anh && (
                              <img 
                                src={`http://localhost:8080/admin/dashboard/dichvu/luachon/anh/${option.anh}`}
                                alt={option.tenLuaChon}
                                className="w-full h-32 object-cover rounded-lg mb-3"
                              />
                            )}
                            <h4 className="font-bold text-gray-800 mb-1">{option.tenLuaChon}</h4>
                            <p className="text-sm text-gray-600 mb-2">{option.moTa}</p>
                            <p className="text-red-600 font-bold">{formatCurrency(option.gia)}</p>
                            {isSelected && (
                              <div className="mt-2 text-sm text-red-600 font-semibold">✓ {t('pages.dich_vu_chuyen_bay.selected_label')}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Section */}
              {Object.keys(selectedServices).length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-8 sticky bottom-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">{t('pages.dich_vu_chuyen_bay.total_label')}</h3>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(calculateTotal())}</p>
                  </div>
                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full py-3 bg-linear-to-r from-red-600 to-red-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50"
                  >
                    {loading ? t('pages.dich_vu_chuyen_bay.processing') : t('pages.dich_vu_chuyen_bay.process_btn')}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Info Banner */}
          {!availableServices.length && !loading && !error && (
            <div className="bg-linear-to-r from-red-600 to-red-700 rounded-2xl p-8 text-white">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-2xl font-bold mb-4">🎁 {t('pages.dich_vu_chuyen_bay_extra.info_banner_title')}</h2>
                <p className="text-lg mb-6">
                  {t('pages.dich_vu_chuyen_bay_extra.info_banner_desc')}
                </p>
                <div className="text-sm opacity-90">
                  {t('pages.dich_vu_chuyen_bay.info_enter_code', 'Enter booking code above to see available services for your flight')}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default DichVuChuyenBay;