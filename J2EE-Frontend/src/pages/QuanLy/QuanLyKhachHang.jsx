import React, { useState, useMemo, useEffect } from 'react';
import { FaSearch, FaUserPlus, FaEdit, FaTrash, FaBan, FaEye } from 'react-icons/fa';
import Card from '../../components/QuanLy/CardChucNang';
import Toast from '../../components/common/Toast';
import ViewToggleButton from '../../components/common/ViewToggleButton';
import CardView from '../../components/common/CardView';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import { useViewToggle } from '../../hooks/useViewToggle';
import { getAllKhachHang, createKhachHang, deleteKhachHang } from '../../services/QLKhachHangService';
import { getAllCountries } from '../../services/CountryService';
import ViewKhachHangModal from '../../components/QuanLy/QuanLyKhachHang/ViewKhachHangModal';
import KhachHangCard from '../../components/QuanLy/KhachHang/KhachHangCard';

const QuanLyKhachHang = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
    const [countries, setCountries] = useState([]);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewCustomer, setViewCustomer] = useState(null);
    const [viewModalMode, setViewModalMode] = useState('view'); // 'view' or 'edit'
    const { viewMode, setViewMode: handleViewChange } = useViewToggle('ql-khach-hang-view', 'table');

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

    const handleItemsPerPageChange = (e) => {
        const newValue = parseInt(e.target.value);
        setItemsPerPage(newValue);
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    const showToast = (message, type = 'success') => {
        setToast({ isVisible: true, message, type });
    };

    const hideToast = () => {
        setToast({ ...toast, isVisible: false });
    };

    const handleOpenModal = () => {
        setFormData({
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
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createKhachHang(formData);
            showToast('Thêm mới khách hàng thành công!', 'success');
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

    const handleViewCustomer = (customer, mode = 'view') => {
        setViewCustomer(customer);
        setViewModalMode(mode);
        setIsViewModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setViewCustomer(null);
        setViewModalMode('view');
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
                <ViewToggleButton
                    currentView={viewMode}
                    onViewChange={handleViewChange}
                    className="shrink-0"
                />
                <div className="flex gap-2">
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
                    >
                        <FaUserPlus />
                        <span className="font-semibold">Thêm mới</span>
                    </button>
                </div>
            </div>

            {/* Thanh phân trang */}
            {filteredCustomers.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 font-medium">
                            Hiển thị <span className="font-bold text-blue-600">{indexOfFirstItem + 1}</span> đến <span className="font-bold text-blue-600">{Math.min(indexOfLastItem, filteredCustomers.length)}</span> của <span className="font-bold text-blue-600">{filteredCustomers.length}</span> kết quả
                        </span>
                        <select
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white"
                        >
                            <option value={5}>5 / trang</option>
                            <option value={10}>10 / trang</option>
                            <option value={20}>20 / trang</option>
                            <option value={50}>50 / trang</option>
                        </select>
                    </div>
                    {totalPages > 1 && (
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
                    )}
                </div>
            )}

            {/* View Mode: Card or Table */}
            {viewMode === 'grid' ? (
                /* Card View */
                <CardView
                    items={currentItems}
                    renderCard={(customer, index) => (
                        <KhachHangCard
                            key={customer.maHanhKhach || index}
                            data={customer}
                            onView={handleViewCustomer}
                            onEdit={(customer) => handleViewCustomer(customer, 'edit')}
                            onDelete={handleDelete}
                        />
                    )}
                    emptyMessage="Không tìm thấy khách hàng nào."
                />
            ) : (
                /* Table View */
                <ResponsiveTable>
                    <table className="w-full text-sm">
                        <thead className="bg-blue-600 text-white">
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
                                                    onClick={() => handleViewCustomer(customer, 'edit')}
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
                </ResponsiveTable>
            )}


            {/* Modal Form - Chỉ dùng cho thêm mới */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-black/50" onClick={handleCloseModal}></div>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center sticky top-0">
                            <h3 className="text-xl font-bold">Thêm khách hàng mới</h3>
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
                                    Thêm mới
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
                    onCustomerUpdate={fetchCustomers}
                    defaultTab="thong-tin"
                    initialEditMode={viewModalMode === 'edit'}
                />
            )}
        </Card>
    );
};

export default QuanLyKhachHang;