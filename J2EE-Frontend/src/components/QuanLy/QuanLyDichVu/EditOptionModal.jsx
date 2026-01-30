import React, { useState, useEffect } from 'react';

const EditOptionModal = ({ option, onClose, onSave, options }) => {
  const [formData, setFormData] = useState({
    tenLuaChon: option?.tenLuaChon || '',
    moTa: option?.moTa || '',
    gia: option?.gia || '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Load image preview when editing
  useEffect(() => {
    if (option?.anh) {
      setImagePreview(`http://localhost:8080/admin/dashboard/dichvu/luachon/anh/${option.anh}`);
    }
  }, [option]);

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
    }
  };

  const validateForm = () => {
    const trimmedTenLuaChon = formData.tenLuaChon.trim();
    const gia = parseFloat(formData.gia);

    if (!trimmedTenLuaChon) {
      setErrorMessage('Tên lựa chọn không được để trống.');
      return false;
    }

    // Check if name already exists in current service options (excluding current option)
    const nameExists = options.some(opt => 
      opt.maLuaChon !== option.maLuaChon && opt.tenLuaChon.toLowerCase() === trimmedTenLuaChon.toLowerCase()
    );
    if (nameExists) {
      setErrorMessage('Tên lựa chọn này đã tồn tại trong dịch vụ này.');
      return false;
    }

    if (isNaN(gia) || gia <= 0) {
      setErrorMessage('Giá phải là số dương lớn hơn 0.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous error
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSave(formData, selectedImage);
      // Cleanup preview URL
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    } catch (error) {
      console.error('Error saving option:', error);
      // Extract error message from API response
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Có lỗi xảy ra khi lưu lựa chọn. Vui lòng thử lại.');
      }
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
          <h2 className="text-2xl font-bold">Chỉnh sửa lựa chọn</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            <div>
              <label htmlFor="tenLuaChon" className="block text-sm font-bold text-gray-700 mb-2">Tên lựa chọn</label>
              <input 
                type="text" 
                name="tenLuaChon" 
                id="tenLuaChon" 
                value={formData.tenLuaChon} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                required 
                placeholder="Nhập tên lựa chọn"
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
                placeholder="Nhập mô tả lựa chọn"
                rows="3"
              />
            </div>
            <div>
              <label htmlFor="gia" className="block text-sm font-bold text-gray-700 mb-2">Giá (VNĐ)</label>
              <input 
                type="number" 
                name="gia" 
                id="gia" 
                value={formData.gia} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                required 
                placeholder="Nhập giá"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="anh" className="block text-sm font-bold text-gray-700 mb-2">Hình ảnh lựa chọn</label>
              <div className="space-y-3">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="flex justify-center">
                    <img 
                      src={imagePreview} 
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

export default EditOptionModal;