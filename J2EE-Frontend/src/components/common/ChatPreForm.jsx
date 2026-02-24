import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';

/**
 * Form nhập thông tin trước khi bắt đầu chat
 * @param {Function} onSubmit - Callback khi submit form { hoTen, email, soDienThoai }
 * @param {boolean} loading - Trạng thái loading
 */
const ChatPreForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    hoTen: '',
    email: '',
    soDienThoai: '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.hoTen.trim()) {
      newErrors.hoTen = 'Vui lòng nhập họ tên';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.soDienThoai.trim()) {
      newErrors.soDienThoai = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(formData.soDienThoai)) {
      newErrors.soDienThoai = 'Số điện thoại không hợp lệ';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="text-center mb-4">
        <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Bắt đầu chat</h3>
        <p className="text-sm text-gray-500 mt-1">
          Vui lòng nhập thông tin để được hỗ trợ
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Họ tên */}
        <div>
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Họ và tên"
              value={formData.hoTen}
              onChange={(e) => handleChange('hoTen', e.target.value)}
              className={`w-full pl-10 pr-3 py-2.5 rounded-xl border ${
                errors.hoTen ? 'border-red-400 bg-red-50' : 'border-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm transition-all`}
            />
          </div>
          {errors.hoTen && (
            <p className="text-xs text-red-500 mt-1 ml-1">{errors.hoTen}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full pl-10 pr-3 py-2.5 rounded-xl border ${
                errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm transition-all`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 mt-1 ml-1">{errors.email}</p>
          )}
        </div>

        {/* Số điện thoại */}
        <div>
          <div className="relative">
            <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              placeholder="Số điện thoại"
              value={formData.soDienThoai}
              onChange={(e) => handleChange('soDienThoai', e.target.value)}
              className={`w-full pl-10 pr-3 py-2.5 rounded-xl border ${
                errors.soDienThoai ? 'border-red-400 bg-red-50' : 'border-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm transition-all`}
            />
          </div>
          {errors.soDienThoai && (
            <p className="text-xs text-red-500 mt-1 ml-1">{errors.soDienThoai}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Đang kết nối...
            </>
          ) : (
            'Bắt đầu chat'
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatPreForm;
