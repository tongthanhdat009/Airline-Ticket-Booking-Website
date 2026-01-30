// src/pages/KhachHang/DichVuKhac.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';


function DichVuKhac() {
  const { t } = useTranslation();
  const otherServices = [
    { icon: "🏨", key: 'hotel', link: '#' },
    { icon: "🚗", key: 'car', link: '#' },
    { icon: "🎫", key: 'tour', link: '#' },
    { icon: "🎡", key: 'tickets', link: '#' },
    { icon: "💳", key: 'visa', link: '#' },
    { icon: "📱", key: 'sim', link: '#' },
    { icon: "💱", key: 'currency', link: '#' },
    { icon: "🎁", key: 'vouchers', link: '#' }
  ];

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-pink-50 via-yellow-50 to-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-red-600 mb-3">{t('pages.dich_vu_khac.title')}</h1>
            <p className="text-gray-600 text-lg">{t('pages.dich_vu_khac.subtitle')}</p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {otherServices.map((service, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 p-6">
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{t(`pages.other_services_list.${service.key}.title`)}</h3>
                <p className="text-sm text-gray-600 mb-4">{t(`pages.other_services_list.${service.key}.desc`)}</p>
                <a href={service.link} className="text-red-600 font-semibold hover:underline text-sm">
                  {t('pages.dich_vu_khac.learn_more')}
                </a>
              </div>
            ))}
          </div>

          {/* Partner Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{t('pages.dich_vu_khac.partners_title')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-red-600 transition-colors">
                <span className="text-2xl font-bold text-gray-400">Agoda</span>
              </div>
              <div className="flex items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-red-600 transition-colors">
                <span className="text-2xl font-bold text-gray-400">Booking.com</span>
              </div>
              <div className="flex items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-red-600 transition-colors">
                <span className="text-2xl font-bold text-gray-400">Grab</span>
              </div>
              <div className="flex items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-red-600 transition-colors">
                <span className="text-2xl font-bold text-gray-400">Klook</span>
              </div>
            </div>
          </div>

          {/* CTA Banner */}
          <div className="bg-linear-to-r from-red-600 to-red-700 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">{t('pages.dich_vu_khac.cta_title')}</h2>
            <p className="text-lg mb-6">{t('pages.dich_vu_khac.cta_desc')}</p>
            <button className="px-8 py-3 bg-yellow-400 text-gray-900 rounded-xl font-bold hover:bg-yellow-500 transition-colors">
              {t('pages.dich_vu_khac.cta_btn')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default DichVuKhac;
