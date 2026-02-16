import React, { useState, useEffect } from 'react';
import { getAssetUrl } from '../../../config/api.config';

const ServiceModal = ({ service, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    tenDichVu: service?.tenDichVu || '',
    moTa: service?.moTa || '',
    anh: service?.anh || '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Load image preview when editing
  useEffect(() => {
    if (service?.anh) {
      // If editing, try to get image from cache or API
      const _imageName = service.anh.split('/').pop();
      // For now, just set the path, we'll handle preview in the component
      setImagePreview(service.anh);
    }
  }, [service]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      // Update form data with file name
      setFormData(prev => ({ ...prev, anh: file.name }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous error
    
    try {
      await onSave(formData, selectedImage);
      // Cleanup preview URL
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    } catch (error) {
      console.error('Error saving service:', error);
      // Extract error message from API response
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Có lỗi xảy ra khi lưu dịch vụ. Vui lòng thử lại.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>

      {/* Modal - Full screen on mobile, centered modal on desktop */}
      <div className="relative z-10 h-full w-full md:h-auto md:max-w-2xl md:mx-auto md:my-8 md:rounded-xl bg-white md:shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="[background:linear-gradient(to_right,rgb(37,99,235),rgb(29,78,216))] text-white px-4 md:px-6 py-3 md:py-4 flex justify-between items-center shrink-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg md:text-xl font-bold truncate">{service ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors p-1 hover:bg-white/10 rounded-lg ml-2 shrink-0"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-4 md:space-y-5">
            {/* Service Name */}
            <div>
              <label htmlFor="tenDichVu" className="block text-sm font-bold text-gray-700 mb-2">Tên dịch vụ</label>
              <input
                type="text"
                name="tenDichVu"
                id="tenDichVu"
                value={formData.tenDichVu}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg shadow-sm py-2 md:py-3 px-3 md:px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                required
                placeholder="Nhập tên dịch vụ"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="moTa" className="block text-sm font-bold text-gray-700 mb-2">Mô tả</label>
              <textarea
                name="moTa"
                id="moTa"
                value={formData.moTa}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg shadow-sm py-2 md:py-3 px-3 md:px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                required
                placeholder="Nhập mô tả dịch vụ"
                rows="4"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label htmlFor="anh" className="block text-sm font-bold text-gray-700 mb-2">Hình ảnh dịch vụ</label>
              <div className="space-y-3">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="flex justify-center">
                    <img
                      src={getAssetUrl(imagePreview)}
                      alt="Preview"
                      className="w-20 h-20 md:w-24 md:h-24 object-contain border border-gray-300 rounded-lg"
                      onError={(e) => {
                        e.target.src = '/no-product.png';
                      }}
                    />
                  </div>
                )}

                {/* File Input */}
                <input
                  type="file"
                  name="anh"
                  id="anh"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border border-gray-300 rounded-lg shadow-sm py-2 md:py-3 px-3 md:px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-1 md:file:py-2 file:px-2 md:file:px-4 file:rounded-full file:border-0 file:text-xs md:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-xs md:text-sm"
                />
                <p className="text-xs md:text-sm text-gray-500">Chọn file ảnh (SVG, PNG, JPG) để upload</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <p className="text-xs md:text-sm text-red-500 mt-4">{errorMessage}</p>
          )}
        </form>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse md:flex-row justify-end gap-2 md:gap-3 p-4 md:p-6 border-t bg-gray-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full md:w-auto px-4 md:px-6 py-2 md:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors text-sm md:text-base"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="w-full md:w-auto px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors shadow-sm text-sm md:text-base"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;