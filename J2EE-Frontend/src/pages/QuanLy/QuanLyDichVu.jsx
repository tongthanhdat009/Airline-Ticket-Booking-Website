import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaConciergeBell, FaEye } from 'react-icons/fa';
import Card from '../../components/QuanLy/CardChucNang';
import { getAllServices, fetchImageByName, getServiceOptions, createServiceOption, createService, updateServiceImage, updateService, deleteService, updateOption, deleteOption, updateOptionImage } from '../../services/QLDichVuService';
import ServiceModal from '../../components/QuanLy/QuanLyDichVu/ServiceModal';
import DeleteConfirmationModal from '../../components/QuanLy/QuanLyDichVu/DeleteConfirmationModal';
import ServiceDetailModal from '../../components/QuanLy/QuanLyDichVu/ServiceDetailModal';
import Toast from '../../components/common/Toast';

const QuanLyDichVu = () => {
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [currentServiceDetail, setCurrentServiceDetail] = useState(null);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageCache, setImageCache] = useState({}); // Cache để lưu ảnh đã tải
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const itemsPerPage = 5;

  useEffect(() => {
    fetchServices();
  }, []);

  // Load ảnh từ API
  useEffect(() => {
    const loadImages = async () => {
      const cache = {};
      for (const service of services) {
        if (service.anh && !imageCache[service.anh]) {
          try {
            // Lấy tên file từ đường dẫn (ví dụ: /AnhDichVuCungCap/1.svg -> 1.svg)
            const imageName = service.anh.split('/').pop();
            const response = await fetchImageByName(imageName);
            // Tạo URL từ blob
            const imageUrl = URL.createObjectURL(response.data);
            cache[service.anh] = imageUrl;
          } catch (error) {
            console.error(`Error loading image ${service.anh}:`, error);
            cache[service.anh] = null; // Đánh dấu ảnh lỗi
          }
        }
      }
      if (Object.keys(cache).length > 0) {
        setImageCache(prev => ({ ...prev, ...cache }));
      }
    };

    if (services.length > 0) {
      loadImages();
    }

    // Cleanup: revoke object URLs khi component unmount
    return () => {
      Object.values(imageCache).forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [services, imageCache]);

  const fetchServices = async () => {
    try{
      const response = await getAllServices();
      console.log("Fetched services:", response);
      // Lấy mảng dữ liệu từ response.data.data
      if (response.data && Array.isArray(response.data.data)) {
        setServices(response.data.data);
      } else if (Array.isArray(response.data)) {
        // Fallback nếu response.data trực tiếp là mảng
        setServices(response.data);
      } else {
        console.error("Invalid data format:", response);
        setServices([]);
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
      setServices([]);
    }
  };

  const handleAddNew = () => {
    setCurrentService(null);
    setIsModalOpen(true);
  };

  const handleEdit = (service) => {
    setCurrentService(service);
    setIsModalOpen(true);
  };

  const handleDelete = (service) => {
    setCurrentService(service);
    setIsDeleteConfirmOpen(true);
  };

  const handleSave = async (serviceData, selectedImage) => {
    try {
      if (currentService) {
        // Editing existing service
        // Step 1: Update service data first
        const updateResponse = await updateService(currentService.maDichVu, {
          tenDichVu: serviceData.tenDichVu,
          moTa: serviceData.moTa,
        });

        let updatedService = updateResponse.data.data;

        // Step 2: If there's a new image, upload it
        if (selectedImage) {
          try {
            const uploadResponse = await updateServiceImage(currentService.maDichVu, selectedImage);
            if (uploadResponse.data && uploadResponse.data.data) {
              updatedService = uploadResponse.data.data;
            }
          } catch (imageError) {
            console.error('Error uploading image:', imageError);
            // Continue with updated service data even if image upload fails
          }
        }

        // Update local state
        setServices(services.map(s => s.maDichVu === currentService.maDichVu ? updatedService : s));
      } else {
        // Creating new service
        // Step 1: Create service without image first
        const createResponse = await createService({
          tenDichVu: serviceData.tenDichVu,
          moTa: serviceData.moTa,
          // Don't include anh field initially
        });

        if (createResponse.data && createResponse.data.data) {
          let newService = createResponse.data.data;
          const maDichVu = newService.maDichVu;

          // Step 2: If there's an image, upload it and update the service
          if (selectedImage) {
            try {
              const uploadResponse = await updateServiceImage(maDichVu, selectedImage);
              
              if (uploadResponse.data && uploadResponse.data.data) {
                // Update local state with the updated service data from response
                newService = uploadResponse.data.data;
              }
            } catch (imageError) {
              console.error('Error uploading image:', imageError);
              // Continue without image if upload fails
            }
          }

          // Add new service to local state
          setServices(prev => [...prev, newService]);
        }
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving service:', error);
      throw error; // Re-throw error to be caught by ServiceModal
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteService(currentService.maDichVu);
      // Remove from local state only after successful deletion
      const updatedServices = services.filter(s => s.maDichVu !== currentService.maDichVu);
      setServices(updatedServices);

      showToast('Xóa dịch vụ thành công', 'success');

      // Reset về trang đầu tiên sau khi xóa
      setCurrentPage(1);

      setIsDeleteConfirmOpen(false);
      setCurrentService(null);
    } catch (error) {
      console.error('Lỗi khi xóa dịch vụ:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Không thể xóa dịch vụ. Vui lòng thử lại.';
      showToast(errorMsg, 'error');
    }
  };

  // Toast functions
  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, isVisible: false });
  };

  const handleViewDetail = async (service) => {
    setCurrentServiceDetail(service);
    setIsDetailModalOpen(true);
    
    try {
      const response = await getServiceOptions(service.maDichVu);
      console.log("Fetched service options:", response);
      if (response.data && Array.isArray(response.data.data)) {
        setServiceOptions(response.data.data);
      } else if (Array.isArray(response.data)) {
        setServiceOptions(response.data);
      } else {
        setServiceOptions([]);
      }
    } catch (error) {
      console.error("Failed to fetch service options:", error);
      setServiceOptions([]);
    }
  };

  const handleCreateOption = async (optionData, selectedImage) => {
    try {
      const response = await createServiceOption(currentServiceDetail.maDichVu, optionData);
      let newOption = response.data.data;

      if (selectedImage) {
        try {
          const uploadResponse = await updateOptionImage(currentServiceDetail.maDichVu, newOption.maLuaChon, selectedImage);
          if (uploadResponse.data && uploadResponse.data.data) {
            newOption = uploadResponse.data.data;
          }
        } catch (imageError) {
          console.error('Error uploading option image:', imageError);
          // Continue with new option data even if image upload fails
        }
      }

      // Add to local state
      setServiceOptions(prev => [...prev, newOption]);
    } catch (error) {
      console.error("Failed to create service option:", error);
    }
  };

  const handleEditOption = async (luachonId, optionData, selectedImage) => {
    try {
      // Step 1: Update option data first
      const updateResponse = await updateOption(currentServiceDetail.maDichVu, luachonId, {
        tenLuaChon: optionData.tenLuaChon,
        moTa: optionData.moTa,
        gia: optionData.gia,
      });

      let updatedOption = updateResponse.data.data;

      // Step 2: If there's a new image, upload it
      if (selectedImage) {
        try {
          const uploadResponse = await updateOptionImage(currentServiceDetail.maDichVu, luachonId, selectedImage);
          if (uploadResponse.data && uploadResponse.data.data) {
            updatedOption = uploadResponse.data.data;
          }
        } catch (imageError) {
          console.error('Error uploading option image:', imageError);
          // Continue with updated option data even if image upload fails
        }
      }

      // Update local state
      setServiceOptions(serviceOptions.map(opt => opt.maLuaChon === luachonId ? updatedOption : opt));
    } catch (error) {
      console.error("Failed to edit service option:", error);
      throw error; // Re-throw to be caught by EditOptionModal
    }
  };

  const handleDeleteOption = async (luachonId) => {
    try {
      await deleteOption(currentServiceDetail.maDichVu, luachonId);
      // Remove from local state
      setServiceOptions(serviceOptions.filter(opt => opt.maLuaChon !== luachonId));
    } catch (error) {
      console.error("Failed to delete service option:", error);
      throw error; // Re-throw to show error
    }
  };

  const filteredServices = services.filter(service =>
    service.tenDichVu.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredServices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Helper để lấy URL ảnh từ cache hoặc trả về placeholder
  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath.trim() === '') return '/no-product.png';
    return imageCache[imagePath] || '/no-product.png';
  };

  return (
    <Card title="Quản lý Dịch vụ Chuyến bay">
      {/* Toast notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Tìm kiếm dịch vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-5 rounded-lg shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
        >
          <FaPlus size={18} />
          <span>Thêm dịch vụ mới</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden bg-white shadow-lg rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Tên dịch vụ</th>
                <th className="px-6 py-4 text-left font-semibold">Mô tả</th>
                <th className="px-6 py-4 text-left font-semibold">Hình ảnh</th>
                <th className="px-6 py-4 text-center font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((service, index) => (
                  <tr key={service.maDichVu} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <FaConciergeBell className="text-purple-600" />
                        </div>
                        <span className="font-medium text-gray-900">{service.tenDichVu}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 max-w-md">
                      <p className="line-clamp-2">{service.moTa}</p>
                    </td>
                    <td className="px-6 py-4">
                      <img 
                        src={getImageUrl(service.anh)} 
                        alt={service.tenDichVu} 
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/no-product.png';
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleViewDetail(service)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <FaEye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(service)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(service)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <FaConciergeBell className="text-gray-300 text-5xl" />
                      <p className="text-gray-500 font-medium">Không tìm thấy dịch vụ nào.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Thanh phân trang */}
      {filteredServices.length > itemsPerPage && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <span className="text-sm text-gray-600 font-medium">
            Hiển thị <span className="font-bold text-blue-600">{indexOfFirstItem + 1}</span> đến <span className="font-bold text-blue-600">{Math.min(indexOfLastItem, filteredServices.length)}</span> của <span className="font-bold text-blue-600">{filteredServices.length}</span> kết quả
          </span>
          <nav>
            <ul className="flex gap-2">
              <li>
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-sm"
                >
                  ← Trước
                </button>
              </li>
              {[...Array(totalPages)].map((_, index) => (
                <li key={index}>
                  <button
                    onClick={() => paginate(index + 1)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === index + 1
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-sm"
                >
                  Sau →
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Modals */}
      {isModalOpen && (
        <ServiceModal 
          service={currentService}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}

      {isDeleteConfirmOpen && (
        <DeleteConfirmationModal
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={confirmDelete}
          serviceName={currentService?.tenDichVu}
        />
      )}

      {isDetailModalOpen && (
        <ServiceDetailModal
          service={currentServiceDetail}
          options={serviceOptions}
          onClose={() => setIsDetailModalOpen(false)}
          onCreateOption={handleCreateOption}
          onEditOption={handleEditOption}
          onDeleteOption={handleDeleteOption}
        />
      )}
    </Card>
  );
};

export default QuanLyDichVu;