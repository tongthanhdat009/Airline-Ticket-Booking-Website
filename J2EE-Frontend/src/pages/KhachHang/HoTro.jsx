import React from 'react'
import { useTranslation } from 'react-i18next'
import Footer from '../../components/common/Footer'
import Chatbot from '../../components/common/Chatbot'
import useTitle from '../../hooks/useTitle';

function HoTro() {
  const { t } = useTranslation()
  useTitle('Hỗ trợ - Airline Booking')
  return (
    <div className="min-h-screen bg-linear-to-br from-[#F5F7FA] to-[#E3F2FD]">
      <div className="container mx-auto px-4 lg:px-20 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">{t('pages.support_page.title')}</h1>
          <p className="text-lg text-gray-600">{t('pages.support_page.subtitle')}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border-t-4 border-[#1E88E5]">
            <div className="text-3xl mb-3">📞</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('pages.support_page.phone_title')}</h3>
            <p className="text-gray-600 mb-4">{t('pages.support_page.phone_desc')}</p>
            <a href="tel:+840123456789" className="inline-block px-4 py-2 bg-[#1E88E5] text-white rounded-lg font-semibold hover:bg-[#1565C0]">{t('pages.support_page.phone_cta')}</a>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border-t-4 border-[#FF7043]">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('pages.support_page.chat_title')}</h3>
            <p className="text-gray-600 mb-4">{t('pages.support_page.chat_desc')}</p>
            <a href="/" className="inline-block px-4 py-2 bg-[#FF7043] text-white rounded-lg font-semibold hover:bg-[#F4511E]">{t('pages.support_page.chat_cta')}</a>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border-t-4 border-[#64B5F6]">
            <div className="text-3xl mb-3">✉️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('pages.support_page.email_title')}</h3>
            <p className="text-gray-600 mb-4">{t('pages.support_page.email_desc')}</p>
            <a href="mailto:support@sguairline.example" className="inline-block px-4 py-2 bg-[#64B5F6] text-white rounded-lg font-semibold hover:bg-[#42A5F5]">{t('pages.support_page.email_cta')}</a>
          </div>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t('pages.support_page.faq_title')}</h2>
          <div className="space-y-4">
            <details className="p-4 border border-gray-100 rounded-lg">
              <summary className="font-semibold cursor-pointer">{t('pages.support_page.faq_q1')}</summary>
              <p className="mt-2 text-gray-600">{t('pages.support_page.faq_a1')}</p>
            </details>

            <details className="p-4 border border-gray-100 rounded-lg">
              <summary className="font-semibold cursor-pointer">{t('pages.support_page.faq_q2')}</summary>
              <p className="mt-2 text-gray-600">{t('pages.support_page.faq_a2')}</p>
            </details>

            <details className="p-4 border border-gray-100 rounded-lg">
              <summary className="font-semibold cursor-pointer">{t('pages.support_page.faq_q3')}</summary>
              <p className="mt-2 text-gray-600">{t('pages.support_page.faq_a3')}</p>
            </details>
          </div>
        </div>
      </div>

      <Chatbot />
      <Footer />
    </div>
  )
}

export default HoTro