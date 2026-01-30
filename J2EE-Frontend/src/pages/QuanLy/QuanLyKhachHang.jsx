import React, { useState, useMemo, useEffect } from 'react';
import { FaSearch, FaUserPlus, FaFileExport, FaEdit, FaTrash, FaBan, FaEye } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import Card from '../../components/QuanLy/CardChucNang';
import Toast from '../../components/common/Toast';
import { getAllKhachHang, createKhachHang, updateKhachHang, deleteKhachHang } from '../../services/QLKhachHangService';
import { getAllCountries } from '../../services/CountryService';
import ViewKhachHangModal from '../../components/QuanLy/ViewKhachHangModal';

const QuanLyKhachHang = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState(null);
    const [formData, setFormData] = useState({});
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
    const [countries, setCountries] = useState([]);
    const itemsPerPage = 5;
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewCustomer, setViewCustomer] = useState(null);

    // Fetch data from API
    useEffect(() => {
        fetchCustomers();
        fetchCountries();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await getAllKhachHang();
            setCustomers(response.data || []);
        } catch (err) {
            setError('Không thể tải dữ liệu khách hàng. Vui lòng thử lại.');
            console.error('Error fetching customers:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCountries = async () => {
        try {
            const countriesData = await getAllCountries();
            setCountries(countriesData);
        } catch (err) {
            console.error('Error fetching countries:', err);
        }
    };

    const filteredCustomers = useMemo(() => {
        return customers.filter(customer =>
            customer.hoVaTen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.soDienThoai?.includes(searchTerm)
        );
    }, [searchTerm, customers]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const showToast = (message, type = 'success') => {
        setToast({ isVisible: true, message, type });
    };

    const hideToast = () => {
        setToast({ ...toast, isVisible: false });
    };

    const handleOpenModal = (customer = null) => {
        setCurrentCustomer(customer);
        setFormData(customer || {
            hoVaTen: '',
            email: '',
            soDienThoai: '',
            gioiTinh: '',
            ngaySinh: '',
            quocGia: '',
            maDinhDanh: '',
            diaChi: ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentCustomer(null);
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentCustomer) {
                await updateKhachHang(currentCustomer.maHanhKhach, formData);
                showToast('Cập nhật khách hàng thành công!', 'success');
            } else {
                await createKhachHang(formData);
                showToast('Thêm mới khách hàng thành công!', 'success');
            }
            await fetchCustomers();
            handleCloseModal();
        } catch (err) {
            console.error('Error saving customer:', err);
            
            // Xử lý lỗi từ backend
            if (err.response && err.response.data) {
                // Lấy message từ response.data.message (format ApiResponse)
                const errorMessage = err.response.data.message || 'Có lỗi xảy ra khi lưu khách hàng.';
                showToast(errorMessage, 'error');
            } else if (err.message) {
                showToast(err.message, 'error');
            } else {
                showToast('Có lỗi xảy ra khi lưu khách hàng. Vui lòng thử lại.', 'error');
            }
        }
    };

    // Helper function: Điều chỉnh trang sau khi xóa
    const adjustPageAfterDelete = (totalItemsAfterDelete) => {
        const newTotalPages = Math.ceil(totalItemsAfterDelete / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
            try {
                await deleteKhachHang(id);
                showToast('Xóa khách hàng thành công!', 'success');
                await fetchCustomers();
                
                // Điều chỉnh trang sau khi xóa
                const remainingItems = filteredCustomers.length - 1;
                adjustPageAfterDelete(remainingItems);
                
            } catch (err) {
                console.error('Error deleting customer:', err);
                
                // Xử lý lỗi từ backend
                if (err.response && err.response.data) {
                    const errorMessage = err.response.data.message || 'Có lỗi xảy ra khi xóa khách hàng.';
                    showToast(errorMessage, 'error');
                } else if (err.message) {
                    showToast(err.message, 'error');
                } else {
                    showToast('Có lỗi xảy ra khi xóa khách hàng. Vui lòng thử lại.', 'error');
                }
            }
        }
    };

    const handleExportExcel = () => {
        if (currentItems.length === 0) {
            showToast('Không có dữ liệu để xuất!', 'warning');
            return;
        }

        try {
            // Chuẩn bị dữ liệu để xuất
            const exportData = currentItems.map((customer, index) => ({
                'STT': indexOfFirstItem + index + 1,
                'Mã KH': customer.maHanhKhach,
                'Họ và tên': customer.hoVaTen || '',
                'Email': customer.email || '',
                'Số điện thoại': customer.soDienThoai || '',
                'Giới tính': customer.gioiTinh || '',
                'Ngày sinh': customer.ngaySinh ? new Date(customer.ngaySinh).toLocaleDateString('vi-VN') : '',
                'Quốc gia': customer.quocGia || '',
                'Mã định danh': customer.maDinhDanh || '',
                'Địa chỉ': customer.diaChi || ''
            }));

            // Tạo worksheet
            const ws = XLSX.utils.json_to_sheet(exportData);

            // Tự động điều chỉnh độ rộng cột
            const colWidths = [
                { wch: 5 },  // STT
                { wch: 10 }, // Mã KH
                { wch: 25 }, // Họ và tên
                { wch: 30 }, // Email
                { wch: 15 }, // Số điện thoại
                { wch: 10 }, // Giới tính
                { wch: 12 }, // Ngày sinh
                { wch: 15 }, // Quốc gia
                { wch: 15 }, // Mã định danh
                { wch: 30 }  // Địa chỉ
            ];
            ws['!cols'] = colWidths;

            // Tạo workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Danh sách khách hàng');

            // Tạo tên file với timestamp
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const fileName = `DanhSachKhachHang_${timestamp}.xlsx`;

            // Xuất file
            XLSX.writeFile(wb, fileName);

            showToast(`Đã xuất thành công ${currentItems.length} khách hàng ra file Excel!`, 'success');
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            showToast('Có lỗi xảy ra khi xuất file Excel!', 'error');
        }
    };

    const handleViewCustomer = (customer) => {
        setViewCustomer(customer);
        setIsViewModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setViewCustomer(null);
    };

    if (loading) return <div className="flex justify-center items-center h-64"><div className="text-lg">Đang tải...</div></div>;
    if (error) return <div className="flex justify-center items-center h-64"><div className="text-lg text-red-500">{error}</div></div>;

    return (
        <Card title="Quản lý tài khoản khách hàng">
            <Toast 
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
                duration={3000}
            />

            {/* Thanh công cụ */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, email, SĐT..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                    <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 bg-linear-to-r from-green-500 to-emerald-600 text-white px-5 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
                    >
                        <FaFileExport />
                        <span className="font-semibold">Xuất Excel</span>
                    </button>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-linear-to-r from-blue-500 to-blue-600 text-white px-5 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
                    >
                        <FaUserPlus />
                        <span className="font-semibold">Thêm mới</span>
                    </button>
                </div>
            </div>

            {/* Bảng dữ liệu */}
            <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-linear-to-r from-slate-700 to-slate-800 text-white">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left font-semibold">Mã KH</th>
                                <th scope="col" className="px-6 py-4 text-left font-semibold">Họ và tên</th>
                                <th scope="col" className="px-6 py-4 text-left font-semibold">Thông tin liên hệ</th>
                                <th scope="col" className="px-6 py-4 text-left font-semibold">Giới tính</th>
                                <th scope="col" className="px-6 py-4 text-left font-semibold">Quốc gia</th>
                                <th scope="col" className="px-6 py-4 text-center font-semibold">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentItems.length > 0 ? (
                                currentItems.map((customer, index) => (
                                    <tr key={customer.maHanhKhach} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                                        <td className="px-6 py-4 font-semibold text-blue-600">#{customer.maHanhKhach}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{customer.hoVaTen}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm text-gray-700">{customer.email}</span>
                                                <span className="text-xs text-gray-500 font-medium">{customer.soDienThoai}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{customer.gioiTinh || '-'}</td>
                                        <td className="px-6 py-4 text-gray-600">{customer.quocGia || '-'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <button 
                                                    onClick={() => handleViewCustomer(customer)}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" 
                                                    title="Xem thông tin"
                                                >
                                                    <FaEye size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleOpenModal(customer)}
                                                    className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors" 
                                                    title="Chỉnh sửa"
                                                >
                                                    <FaEdit size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(customer.maHanhKhach)}
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
                                    <td colSpan="6" className="text-center py-12">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="text-gray-400 text-5xl">📭</div>
                                            <p className="text-gray-500 font-medium">Không tìm thấy khách hàng nào.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Thanh phân trang */}
            {filteredCustomers.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                    <span className="text-sm text-gray-600 font-medium">
                        Hiển thị <span className="font-bold text-blue-600">{indexOfFirstItem + 1}</span> đến <span className="font-bold text-blue-600">{Math.min(indexOfLastItem, filteredCustomers.length)}</span> của <span className="font-bold text-blue-600">{filteredCustomers.length}</span> kết quả
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

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-linear-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold">
                                {currentCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-white hover:text-gray-200">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên *</label>
                                    <input
                                        type="text"
                                        name="hoVaTen"
                                        value={formData.hoVaTen || ''}
                                        onChange={handleFormChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email || ''}
                                        onChange={handleFormChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại *</label>
                                    <input
                                        type="tel"
                                        name="soDienThoai"
                                        value={formData.soDienThoai || ''}
                                        onChange={handleFormChange}
                                        required
                                        pattern="^(0|\+84)(3|5|7|8|9)\d{8}$"
                                        title="Số điện thoại phải bắt đầu bằng 0 hoặc +84, theo sau là đầu số 3/5/7/8/9 và 8 chữ số. VD: 0987654321 hoặc +84987654321"
                                        placeholder="VD: 0987654321"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Định dạng: 0/+84 + 3/5/7/8/9 + 8 số</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
                                    <select
                                        name="gioiTinh"
                                        value={formData.gioiTinh || ''}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Chọn giới tính</option>
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
                                    <input
                                        type="date"
                                        name="ngaySinh"
                                        value={formData.ngaySinh || ''}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quốc gia</label>
                                    <select
                                        name="quocGia"
                                        value={formData.quocGia || ''}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Chọn quốc gia</option>
                                        {countries.map(country => (
                                            <option key={country.alpha2Code} value={country.name}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mã định danh</label>
                                    <input
                                        type="text"
                                        name="maDinhDanh"
                                        value={formData.maDinhDanh || ''}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                                    <textarea
                                        name="diaChi"
                                        value={formData.diaChi || ''}
                                        onChange={handleFormChange}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    {currentCustomer ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {isViewModalOpen && (
                <ViewKhachHangModal 
                    isOpen={isViewModalOpen}
                    customer={viewCustomer} 
                    onClose={handleCloseViewModal} 
                />
            )}
        </Card>
    );
};

export default QuanLyKhachHang;