import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaTimes, FaPaperPlane, FaSpinner } from 'react-icons/fa'
import axios from 'axios'

const TaoPhieuHoTroModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation()

  // State for form
  const [formData, setFormData] = useState({
    hoTen: '',
    email: '',
    soDienThoai: '',
    maDonHang: '',
    danhMuc: '',
    chuDe: '',
    noiDung: '',
    mucDoUuTien: 'trung_binh'
  })

  // State for validation errors
  const [errors, setErrors] = useState({})

  // State for submission
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validate email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  // Validate phone
  const validatePhone = (phone) => {
    const re = /(84|0[3|5|7|8|9])+([0-9]{8})\b/
    return re.test(phone)
  }

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    if (!formData.hoTen.trim()) {
      newErrors.hoTen = t('pages.support_page.ticket_required')
    }

    if (!formData.email.trim()) {
      newErrors.email = t('pages.support_page.ticket_required')
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('pages.support_page.ticket_invalid_email')
    }

    if (!formData.soDienThoai.trim()) {
      newErrors.soDienThoai = t('pages.support_page.ticket_required')
    } else if (!validatePhone(formData.soDienThoai)) {
      newErrors.soDienThoai = t('pages.support_page.ticket_invalid_phone')
    }

    if (!formData.danhMuc) {
      newErrors.danhMuc = t('pages.support_page.ticket_required')
    }

    if (!formData.chuDe.trim()) {
      newErrors.chuDe = t('pages.support_page.ticket_required')
    }

    if (!formData.noiDung.trim()) {
      newErrors.noiDung = t('pages.support_page.ticket_required')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Gọi API tạo phiếu hỗ trợ
      const response = await axios.post('/api/ho-tro/tao-phieu', {
        hoTen: formData.hoTen,
        email: formData.email,
        soDienThoai: formData.soDienThoai,
        maDonHang: formData.maDonHang || null,
        chuDe: formData.chuDe,
        danhMuc: formData.danhMuc,
        noiDung: formData.noiDung,
        mucDoUuTien: formData.mucDoUuTien
      })

      const ticketCode = response.data.maPhieu || 'PH' + Date.now()

      // Call onSuccess callback with ticket code
      if (onSuccess) {
        onSuccess(ticketCode)
      }

      // Reset form và đóng modal
      setFormData({
        hoTen: '',
        email: '',
        soDienThoai: '',
        maDonHang: '',
        danhMuc: '',
        chuDe: '',
        noiDung: '',
        mucDoUuTien: 'trung_binh'
      })
      setErrors({})
      onClose()

    } catch (error) {
      console.error('Error creating support ticket:', error)
      if (onSuccess) {
        onSuccess(null, error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form when modal closes
  const handleCloseModal = () => {
    setFormData({
      hoTen: '',
      email: '',
      soDienThoai: '',
      maDonHang: '',
      danhMuc: '',
      chuDe: '',
      noiDung: '',
      mucDoUuTien: 'trung_binh'
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{t('pages.support_page.ticket_modal_title')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('pages.support_page.ticket_modal_subtitle')}</p>
          </div>
          <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Họ tên */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('pages.support_page.ticket_full_name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="hoTen"
              value={formData.hoTen}
              onChange={handleInputChange}
              placeholder={t('pages.support_page.ticket_full_name_placeholder')}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.hoTen ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.hoTen && <p className="text-red-500 text-xs mt-1">{errors.hoTen}</p>}
          </div>

          {/* Email và Số điện thoại */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('pages.support_page.ticket_email')} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t('pages.support_page.ticket_email_placeholder')}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('pages.support_page.ticket_phone')} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="soDienThoai"
                value={formData.soDienThoai}
                onChange={handleInputChange}
                placeholder={t('pages.support_page.ticket_phone_placeholder')}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.soDienThoai ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.soDienThoai && <p className="text-red-500 text-xs mt-1">{errors.soDienThoai}</p>}
            </div>
          </div>

          {/* Mã đặt chỗ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('pages.support_page.ticket_booking_code')}
            </label>
            <input
              type="text"
              name="maDonHang"
              value={formData.maDonHang}
              onChange={handleInputChange}
              placeholder={t('pages.support_page.ticket_booking_code_placeholder')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">{t('pages.support_page.ticket_booking_code_note')}</p>
          </div>

          {/* Danh mục và Mức độ ưu tiên */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('pages.support_page.ticket_category')} <span className="text-red-500">*</span>
              </label>
              <select
                name="danhMuc"
                value={formData.danhMuc}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.danhMuc ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">{t('pages.support_page.ticket_category_placeholder')}</option>
                <option value="thanh_toan">{t('pages.support_page.ticket_category_payment')}</option>
                <option value="dat_ve">{t('pages.support_page.ticket_category_booking')}</option>
                <option value="hoan_tien">{t('pages.support_page.ticket_category_refund')}</option>
                <option value="check_in">{t('pages.support_page.ticket_category_checkin')}</option>
                <option value="thong_tin">{t('pages.support_page.ticket_category_info')}</option>
                <option value="gop_y">{t('pages.support_page.ticket_category_feedback')}</option>
              </select>
              {errors.danhMuc && <p className="text-red-500 text-xs mt-1">{errors.danhMuc}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('pages.support_page.ticket_priority')}
              </label>
              <select
                name="mucDoUuTien"
                value={formData.mucDoUuTien}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="thap">{t('pages.support_page.ticket_priority_low')}</option>
                <option value="trung_binh">{t('pages.support_page.ticket_priority_medium')}</option>
                <option value="cao">{t('pages.support_page.ticket_priority_high')}</option>
              </select>
            </div>
          </div>

          {/* Chủ đề */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('pages.support_page.ticket_subject')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="chuDe"
              value={formData.chuDe}
              onChange={handleInputChange}
              placeholder={t('pages.support_page.ticket_subject_placeholder')}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.chuDe ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.chuDe && <p className="text-red-500 text-xs mt-1">{errors.chuDe}</p>}
          </div>

          {/* Nội dung câu hỏi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('pages.support_page.ticket_content')} <span className="text-red-500">*</span>
            </label>
            <textarea
              name="noiDung"
              value={formData.noiDung}
              onChange={handleInputChange}
              placeholder={t('pages.support_page.ticket_content_placeholder')}
              rows={5}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none ${errors.noiDung ? 'border-red-500' : 'border-gray-300'}`}
            ></textarea>
            {errors.noiDung && <p className="text-red-500 text-xs mt-1">{errors.noiDung}</p>}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={isSubmitting}
              className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors disabled:opacity-50"
            >
              {t('pages.support_page.ticket_cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium transition-colors ${
                isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
              {isSubmitting ? t('pages.support_page.ticket_submitting') : t('pages.support_page.ticket_submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaoPhieuHoTroModal
