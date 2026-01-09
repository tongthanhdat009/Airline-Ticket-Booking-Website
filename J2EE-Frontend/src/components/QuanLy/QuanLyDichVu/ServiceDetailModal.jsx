import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaConciergeBell } from 'react-icons/fa';
import CreateOptionModal from './CreateOptionModal';
import EditOptionModal from './EditOptionModal';

const ServiceDetailModal = ({ service, options, onClose, onCreateOption, onEditOption, onDeleteOption }) => {
  const [isCreateOptionModalOpen, setIsCreateOptionModalOpen] = useState(false);
  const [isEditOptionModalOpen, setIsEditOptionModalOpen] = useState(false);
  const [currentOption, setCurrentOption] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOptions = options.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(options.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleCreateOption = (optionData, selectedImage) => {
    onCreateOption(optionData, selectedImage);
    setIsCreateOptionModalOpen(false);
  };

  const handleEditOptionClick = (option) => {
    setCurrentOption(option);
    setIsEditOptionModalOpen(true);
  };

  const handleEditOptionSave = (optionData, selectedImage) => {
    onEditOption(currentOption.maLuaChon, optionData, selectedImage);
    setIsEditOptionModalOpen(false);
    setCurrentOption(null);
  };

  const handleDeleteOptionClick = (option) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa lựa chọn "${option.tenLuaChon}"?`)) {
      onDeleteOption(option.maLuaChon);
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl flex-shrink-0">
            <h2 className="text-2xl font-bold">Chi tiết dịch vụ: {service.tenDichVu}</h2>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Service Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin dịch vụ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tên dịch vụ</p>
                  <p className="font-medium text-gray-900">{service.tenDichVu}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mô tả</p>
                  <p className="font-medium text-gray-900">{service.moTa}</p>
                </div>
              </div>
            </div>

            {/* Options Section */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Danh sách lựa chọn</h3>
              <button
                onClick={() => setIsCreateOptionModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                <FaPlus size={14} />
                <span>Tạo lựa chọn mới</span>
              </button>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {currentOptions.length > 0 ? (
                currentOptions.map((option, index) => (
                  <div key={option.maLuaChon || index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 flex gap-4">
                        <img 
                          src={option.anh ? `http://localhost:8080/admin/dashboard/dichvu/luachon/anh/${option.anh}` : '/no-product.png'} 
                          alt={option.tenLuaChon} 
                          className="w-16 h-16 object-contain border border-gray-300 rounded-lg flex-shrink-0"
                          onError={(e) => {
                            e.target.src = '/no-product.png';
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{option.tenLuaChon}</h4>
                          <p className="text-sm text-gray-600 mt-1">{option.moTa}</p>
                          <p className="text-sm font-semibold text-green-600 mt-2">
                            Giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(option.gia)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button 
                          onClick={() => handleEditOptionClick(option)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" 
                          title="Chỉnh sửa"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteOptionClick(option)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" 
                          title="Xóa"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FaConciergeBell className="text-gray-300 text-4xl mx-auto mb-3" />
                  <p className="text-gray-500">Chưa có lựa chọn nào cho dịch vụ này.</p>
                </div>
              )}
            </div>

            {/* Thanh phân trang */}
            {options.length > itemsPerPage && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                <span className="text-sm text-gray-600 font-medium">
                  Hiển thị <span className="font-bold text-blue-600">{indexOfFirstItem + 1}</span> đến <span className="font-bold text-blue-600">{Math.min(indexOfLastItem, options.length)}</span> của <span className="font-bold text-blue-600">{options.length}</span> kết quả
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
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Create Option Modal */}
      {isCreateOptionModalOpen && (
        <CreateOptionModal
          onClose={() => setIsCreateOptionModalOpen(false)}
          onSave={handleCreateOption}
          options={options}
        />
      )}

      {/* Edit Option Modal */}
      {isEditOptionModalOpen && (
        <EditOptionModal
          option={currentOption}
          onClose={() => setIsEditOptionModalOpen(false)}
          onSave={handleEditOptionSave}
          options={options}
        />
      )}
    </>
  );
};

export default ServiceDetailModal;