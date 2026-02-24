import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaTicketAlt } from 'react-icons/fa'
import Footer from '../../components/common/Footer'
import Chatbot from '../../components/common/Chatbot'
import Toast from '../../components/common/Toast'
import TaoPhieuHoTroModal from '../../components/KhachHang/TaoPhieuHoTroModal'
import useTitle from '../../hooks/useTitle'

function HoTro() {
  const { t } = useTranslation()
  useTitle('Hỗ trợ - Airline Booking')

  // State for modal
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)

  // Toast state
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type })
  }

  // Handle ticket submit success
  const handleTicketSuccess = (ticketCode, error) => {
    if (error) {
      showToast(t('pages.support_page.ticket_error'), 'error')
    } else {
      showToast(
        t('pages.support_page.ticket_success') + ticketCode,
        'success'
      )
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#F5F7FA] to-[#E3F2FD]">
      <div className="container mx-auto px-4 lg:px-20 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">{t('pages.support_page.title')}</h1>
          <p className="text-lg text-gray-600">{t('pages.support_page.subtitle')}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
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
            <a href="mailto:support@jadtairline.example" className="inline-block px-4 py-2 bg-[#64B5F6] text-white rounded-lg font-semibold hover:bg-[#42A5F5]">{t('pages.support_page.email_cta')}</a>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border-t-4 border-[#7E57C2] cursor-pointer" onClick={() => setIsTicketModalOpen(true)}>
            <div className="text-3xl mb-3">🎫</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('pages.support_page.ticket_title')}</h3>
            <p className="text-gray-600 mb-4">{t('pages.support_page.ticket_desc')}</p>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#7E57C2] text-white rounded-lg font-semibold hover:bg-[#5E35B1]">
              <FaTicketAlt />
              {t('pages.support_page.ticket_cta')}
            </button>
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

      {/* Modal tạo phiếu hỗ trợ */}
      <TaoPhieuHoTroModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onSuccess={handleTicketSuccess}
      />

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />

      <Chatbot />
      <Footer />
    </div>
  )
}

export default HoTro
