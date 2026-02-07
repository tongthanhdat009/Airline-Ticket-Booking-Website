import React, { useState, useEffect } from 'react';

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
    <div className="fixed inset-0 flex justify-center items-center z-50 p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative">
        <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
          <h2 className="text-2xl font-bold">{service ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            <div>
              <label htmlFor="tenDichVu" className="block text-sm font-bold text-gray-700 mb-2">Tên dịch vụ</label>
              <input 
                type="text" 
                name="tenDichVu" 
                id="tenDichVu" 
                value={formData.tenDichVu} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                required 
                placeholder="Nhập tên dịch vụ"
              />
            </div>
            <div>
              <label htmlFor="moTa" className="block text-sm font-bold text-gray-700 mb-2">Mô tả</label>
              <textarea 
                name="moTa" 
                id="moTa" 
                value={formData.moTa} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                required 
                placeholder="Nhập mô tả dịch vụ"
                rows="4"
              />
            </div>
            <div>
              <label htmlFor="anh" className="block text-sm font-bold text-gray-700 mb-2">Hình ảnh dịch vụ</label>
              <div className="space-y-3">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="flex justify-center">
                    <img 
                      src={imagePreview.startsWith('blob:') ? imagePreview : `http://localhost:8080${imagePreview}`} 
                      alt="Preview" 
                      className="w-24 h-24 object-contain border border-gray-300 rounded-lg"
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
                  className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-sm text-gray-500">Chọn file ảnh (SVG, PNG, JPG) để upload</p>
              </div>
            </div>
          </div>
          {errorMessage && (
            <p className="text-sm text-red-500 mt-4">{errorMessage}</p>
          )}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="px-6 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold transition-all shadow-lg"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceModal;