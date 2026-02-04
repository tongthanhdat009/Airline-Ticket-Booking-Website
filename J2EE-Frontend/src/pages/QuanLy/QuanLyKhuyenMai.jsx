import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaTags } from 'react-icons/fa';
import Card from '../../components/QuanLy/CardChucNang';
import Toast from '../../components/common/Toast';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import KhuyenMaiModal from '../../components/QuanLy/QuanLyKhuyenMai/KhuyenMaiModal';
import { getAllPromotions, deletePromotionById, updatePromotionStatus } from '../../services/PromotionService';

const QuanLyKhuyenMai = () => {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState(null);
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [promotionToDelete, setPromotionToDelete] = useState(null);
    const itemsPerPage = 5;

    // Toast functions
    const showToast = (message, type = 'success') => {
        setToast({ isVisible: true, message, type });
    };

    const hideToast = () => {
        setToast({ ...toast, isVisible: false });
    };

    // Load promotions from API
    const loadPromotions = async () => {
        try {
            setLoading(true);
            const data = await getAllPromotions();
            setPromotions(data);
        } catch (error) {
            console.error('Lỗi khi tải danh sách khuyến mãi:', error);
            showToast('Không thể tải danh sách khuyến mãi', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Load promotions from API
    useEffect(() => {
        loadPromotions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredPromotions = promotions.filter(km =>
        km.tenKhuyenMai?.toLowerCase().includes(search.toLowerCase()) ||
        km.maKM?.toLowerCase().includes(search.toLowerCase()) ||
        km.maKhuyenMai?.toString().includes(search.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPromotions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleOpenModalForAdd = () => {
        setSelectedPromotion(null);
        setIsModalOpen(true);
    };

    const handleOpenModalForEdit = (promotion) => {
        setSelectedPromotion(promotion);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPromotion(null);
    };

    const handleDelete = async (maKhuyenMai) => {
        setPromotionToDelete(maKhuyenMai);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!promotionToDelete) return;

        try {
            await deletePromotionById(promotionToDelete);
            showToast('Xóa khuyến mãi thành công');
            loadPromotions();
        } catch (error) {
            console.error('Lỗi khi xóa khuyến mãi:', error);
            showToast(error.response?.data?.message || 'Không thể xóa khuyến mãi', 'error');
        } finally {
            setShowDeleteConfirm(false);
            setPromotionToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setPromotionToDelete(null);
    };

    const handleToggleStatus = async (maKhuyenMai, currentStatus) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            await updatePromotionStatus(maKhuyenMai, newStatus);
            showToast(`Đã ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa'} khuyến mãi`);
            loadPromotions();
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái:', error);
            showToast(error.response?.data?.message || 'Không thể cập nhật trạng thái', 'error');
        }
    };

    const formatCurrency = (value) => {
        if (!value) return '0đ';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const getLoaiKhuyenMaiText = (loai) => {
        switch (loai) {
            case 'PERCENT': return 'Phần trăm';
            case 'FIXED': return 'Tiền mặt';
            default: return loai;
        }
    };

    if (loading) {
        return (
            <Card title="Quản lý khuyến mãi">
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                </div>
            </Card>
        );
    }

    return (
        <Card title="Quản lý khuyến mãi">
            {/* Thanh công cụ */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Tìm kiếm khuyến mãi theo tên, mã..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm"
                    />
                    <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                </div>
                <button
                    onClick={handleOpenModalForAdd}
                    className="flex items-center gap-2 bg-linear-to-r from-pink-500 to-rose-500 text-white px-5 py-3 rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl font-semibold w-full md:w-auto"
                >
                    <FaPlus />
                    <span>Thêm khuyến mãi</span>
                </button>
            </div>

            {/* Bảng dữ liệu */}
            <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-linear-to-r from-slate-700 to-slate-800 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left font-semibold">ID</th>
                                <th className="px-6 py-4 text-left font-semibold">Tên khuyến mãi</th>
                                <th className="px-6 py-4 text-left font-semibold">Mã KM</th>
                                <th className="px-6 py-4 text-left font-semibold">Loại</th>
                                <th className="px-6 py-4 text-left font-semibold">Giá trị giảm</th>
                                <th className="px-6 py-4 text-center font-semibold">Số lượng</th>
                                <th className="px-6 py-4 text-center font-semibold">Ngày bắt đầu</th>
                                <th className="px-6 py-4 text-center font-semibold">Ngày kết thúc</th>
                                <th className="px-6 py-4 text-center font-semibold">Trạng thái</th>
                                <th className="px-6 py-4 text-center font-semibold">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentItems.length > 0 ? (
                                currentItems.map((km, index) => (
                                    <tr key={km.maKhuyenMai} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-pink-50 transition-colors`}>
                                        <td className="px-6 py-4 font-bold text-pink-600">#{km.maKhuyenMai}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                                                    <FaTags className="text-pink-600" />
                                                </div>
                                                <span className="font-medium text-gray-900">{km.tenKhuyenMai}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold">
                                                {km.maKM}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">{getLoaiKhuyenMaiText(km.loaiKhuyenMai)}</td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                            {km.loaiKhuyenMai === 'PERCENT' ? `${km.giaTriGiam}%` : formatCurrency(km.giaTriGiam)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-gray-700">{km.soLuongDaDuocDung || 0}/{km.soLuong || '∞'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-700">{formatDate(km.ngayBatDau)}</td>
                                        <td className="px-6 py-4 text-center text-gray-700">{formatDate(km.ngayKetThuc)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center items-center gap-2">
                                                <button
                                                    onClick={() => handleToggleStatus(km.maKhuyenMai, km.trangThai)}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                                                        km.trangThai === 'ACTIVE'
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    }`}
                                                    title={km.trangThai === 'ACTIVE' ? 'Click để vô hiệu hóa' : 'Click để kích hoạt'}
                                                >
                                                    {km.trangThai === 'ACTIVE' ? (
                                                        <>
                                                            <FaToggleOn size={18} />
                                                            <span>Hoạt động</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaToggleOff size={18} />
                                                            <span>Vô hiệu</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center items-center gap-2">
                                                <button
                                                    onClick={() => handleOpenModalForEdit(km)}
                                                    disabled={km.trangThai !== 'INACTIVE'}
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        km.trangThai === 'INACTIVE'
                                                            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    }`}
                                                    title={km.trangThai === 'INACTIVE' ? 'Chỉnh sửa' : 'Chỉ sửa khi INACTIVE'}
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(km.maKhuyenMai)}
                                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                    title="Xóa"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="text-center py-12">
                                        <div className="flex flex-col items-center gap-3">
                                            <FaTags className="text-gray-300 text-5xl" />
                                            <p className="text-gray-500 font-medium">Không tìm thấy khuyến mãi nào.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Thanh phân trang */}
            {filteredPromotions.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                    <span className="text-sm text-gray-600 font-medium">
                        Hiển thị <span className="font-bold text-pink-600">{indexOfFirstItem + 1}</span> đến <span className="font-bold text-pink-600">{Math.min(indexOfLastItem, filteredPromotions.length)}</span> của <span className="font-bold text-pink-600">{filteredPromotions.length}</span> kết quả
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
                                                ? 'bg-pink-600 text-white shadow-lg'
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

            {/* Modal */}
            {isModalOpen && (
                <KhuyenMaiModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    promotion={selectedPromotion}
                    onSave={() => {
                        loadPromotions();
                        handleCloseModal();
                    }}
                    showToast={showToast}
                />
            )}
            <Toast
                isVisible={toast.isVisible}
                message={toast.message}
                type={toast.type}
                onClose={hideToast}
            />
            <ConfirmDialog
                isVisible={showDeleteConfirm}
                title="Xác nhận xóa"
                message="Bạn có chắc chắn muốn xóa khuyến mãi này? Hành động này không thể hoàn tác."
                type="danger"
                confirmText="Xóa"
                cancelText="Hủy"
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        </Card>
    );
};

export default QuanLyKhuyenMai;
