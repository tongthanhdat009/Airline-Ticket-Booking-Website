import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ClientDichVuService from "../../services/ClientDichVuService";
import { getAssetUrl } from "../../config/api.config";
import useTitle from '../../hooks/useTitle';

function DichVuChuyenBay() {
  const { t } = useTranslation();
  useTitle('Dịch vụ chuyến bay - Airline Booking');
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
        setError(response.message || "Không tìm thấy thông tin đặt chỗ");
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
        className="max-w-5xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            {t('pages.dich_vu_chuyen_bay.title')}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {t('pages.dich_vu_chuyen_bay.subtitle')}
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 md:p-10 mb-12 max-w-2xl mx-auto">
          <form onSubmit={handleSearchServices} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">
                {t('pages.dich_vu_chuyen_bay.label_booking_code')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400">🎫</span>
                </div>
                <input
                  type="number"
                  value={maDatCho}
                  onChange={(e) => setMaDatCho(e.target.value)}
                  placeholder={t('pages.dich_vu_chuyen_bay.placeholder_booking_code')}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-700 font-medium"
                  disabled={loading}
                />
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
                  {t('pages.dich_vu_chuyen_bay.searching')}
                </>
              ) : (
                <>
                  <span>🔍</span>
                  {t('pages.dich_vu_chuyen_bay.search_btn')}
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Booking Info & Booked Services */}
        <AnimatePresence>
          {(bookingInfo || bookedServices.length > 0) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-6 mb-12"
            >
              {bookingInfo && (
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                  <div className="bg-slate-900 p-5 text-white flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">ℹ️</span>
                    <h3 className="font-bold text-lg">{t('pages.dich_vu_chuyen_bay.booking_info_title')}</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                      <span className="text-slate-500">{t('pages.dich_vu_chuyen_bay.booking_code_label')}</span>
                      <span className="font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg">{bookingInfo.maDatCho}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                      <span className="text-slate-500">{t('pages.dich_vu_chuyen_bay.passenger_label')}</span>
                      <span className="font-bold text-slate-800">{bookingInfo.tenHanhKhach}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">{t('pages.dich_vu_chuyen_bay.flight_code_label')}</span>
                      <span className="font-bold text-blue-600">{bookingInfo.maChuyenBay}</span>
                    </div>
                  </div>
                </div>
              )}

              {bookedServices.length > 0 && (
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                  <div className="bg-emerald-600 p-5 text-white flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center">✓</span>
                    <h3 className="font-bold text-lg">{t('pages.dich_vu_chuyen_bay.booked_services_title')}</h3>
                  </div>
                  <div className="p-6 space-y-4 max-h-[250px] overflow-y-auto custom-scrollbar">
                    {bookedServices.map((service, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                          <p className="font-bold text-slate-800">{service.luaChon?.tenDichVu}</p>
                          <p className="text-sm text-slate-500">{service.luaChon?.tenLuaChon} • SL: {service.soLuong}</p>
                        </div>
                        <p className="font-bold text-emerald-600">{formatCurrency(service.donGia * service.soLuong)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Available Services */}
        <AnimatePresence>
          {availableServices.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-3xl font-bold text-slate-800">{t('pages.dich_vu_chuyen_bay.available_services_title')}</h2>
                <div className="h-px flex-1 bg-slate-200"></div>
              </div>
              
              <div className="space-y-10 mb-24">
                {availableServices.map((service, sIdx) => (
                  <motion.div 
                    key={service.maDichVu}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: sIdx * 0.1 }}
                    className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
                  >
                    <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex items-start gap-6">
                      {service.anh ? (
                        <div className="w-20 h-20 rounded-2xl bg-white shadow-sm border border-slate-100 p-2 flex-shrink-0">
                          <img 
                            src={getAssetUrl(`/admin/dashboard/dichvu/anh/${service.anh}`)}
                            alt={service.tenDichVu}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center text-3xl flex-shrink-0">
                          ✨
                        </div>
                      )}
                      <div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">{service.tenDichVu}</h3>
                        <p className="text-slate-600 leading-relaxed">{service.moTa}</p>
                      </div>
                    </div>
                    
                    <div className="p-6 md:p-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {service.luaChon.map((option) => {
                        const isSelected = selectedServices[`${service.maDichVu}-${option.maLuaChon}`];
                        return (
                          <motion.div 
                            key={option.maLuaChon}
                            whileHover={{ y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            className={`relative rounded-2xl p-5 cursor-pointer transition-all border-2 overflow-hidden group ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-50/30 shadow-md shadow-blue-500/10' 
                                : 'border-slate-100 hover:border-blue-300 hover:shadow-lg hover:shadow-slate-200/50 bg-white'
                            }`}
                            onClick={() => handleSelectService(service.maDichVu, option.maLuaChon, option.gia)}
                          >
                            {isSelected && (
                              <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500 rounded-bl-3xl flex items-start justify-end p-2 z-10">
                                <span className="text-white text-sm font-bold">✓</span>
                              </div>
                            )}
                            
                            {option.anh && (
                              <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-slate-50">
                                <img 
                                  src={getAssetUrl(`/admin/dashboard/dichvu/luachon/anh/${option.anh}`)}
                                  alt={option.tenLuaChon}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              </div>
                            )}
                            
                            <h4 className="font-bold text-slate-800 mb-2 text-lg pr-6">{option.tenLuaChon}</h4>
                            <p className="text-sm text-slate-500 mb-4 line-clamp-2">{option.moTa}</p>
                            
                            <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Giá</span>
                              <span className={`font-bold text-lg ${isSelected ? 'text-blue-600' : 'text-slate-800'}`}>
                                {formatCurrency(option.gia)}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Sticky Payment Bar */}
              <AnimatePresence>
                {Object.keys(selectedServices).length > 0 && (
                  <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none"
                  >
                    <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 pointer-events-auto">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
                          {Object.keys(selectedServices).length}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500">{t('pages.dich_vu_chuyen_bay.total_label')}</p>
                          <p className="text-2xl font-black text-blue-600">{formatCurrency(calculateTotal())}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t('pages.dich_vu_chuyen_bay.processing')}
                          </>
                        ) : (
                          <>
                            {t('pages.dich_vu_chuyen_bay.process_btn')}
                            <span>→</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Banner */}
        <AnimatePresence>
          {!availableServices.length && !loading && !error && (
            <motion.div 
              variants={itemVariants}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="max-w-3xl mx-auto text-center relative z-10">
                <div className="text-6xl mb-6">✨</div>
                <h2 className="text-3xl font-bold mb-4">{t('pages.dich_vu_chuyen_bay_extra.info_banner_title')}</h2>
                <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                  {t('pages.dich_vu_chuyen_bay_extra.info_banner_desc')}
                </p>
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium text-slate-200 border border-white/10">
                  <span>💡</span>
                  {t('pages.dich_vu_chuyen_bay.info_enter_code', 'Nhập mã đặt chỗ ở trên để xem các dịch vụ có sẵn cho chuyến bay của bạn')}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default DichVuChuyenBay;