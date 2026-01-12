import React, { useState } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaTags, FaTimes } from 'react-icons/fa';
import Card from '../../components/QuanLy/CardChucNang';

const QuanLyKhuyenMai = () => {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState(null);
    const itemsPerPage = 5;

    // Dữ liệu mẫu hard code
    const [promotions, setPromotions] = useState([
        {
            maKhuyenMai: 'KM001',
            tenKhuyenMai: 'Giảm giá 20% mùa hè',
            maGiamGia: 'SUMMER20',
            loaiKhuyenMai: 'PHAN_TRAM',
            giaTriGiam: 20,
            giaTriDonHangToiThieu: 2000000,
            soLuong: 100,
            soLuongDaSuDung: 35,
            ngayBatDau: '2025-06-01',
            ngayKetThuc: '2025-08-31',
            trangThai: 'ACTIVE'
        },
        {
            maKhuyenMai: 'KM002',
            tenKhuyenMai: 'Giảm 500k cho vé quốc tế',
            maGiamGia: 'INTL500',
            loaiKhuyenMai: 'TIEN_MAT',
            giaTriGiam: 500000,
            giaTriDonHangToiThieu: 5000000,
            soLuong: 50,
            soLuongDaSuDung: 12,
            ngayBatDau: '2025-07-01',
            ngayKetThuc: '2025-12-31',
            trangThai: 'ACTIVE'
        },
        {
            maKhuyenMai: 'KM003',
            tenKhuyenMai: 'Vé đi tặng vé về',
            maGiamGia: 'BUY1GET1',
            loaiKhuyenMai: 'KHAC',
            giaTriGiam: 100,
            giaTriDonHangToiThieu: 3000000,
            soLuong: 20,
            soLuongDaSuDung: 8,
            ngayBatDau: '2025-01-01',
            ngayKetThuc: '2025-03-31',
            trangThai: 'INACTIVE'
        },
        {
            maKhuyenMai: 'KM004',
            tenKhuyenMai: 'Giảm 15% hạng thương gia',
            maGiamGai: 'BUSINESS15',
            loaiKhuyenMai: 'PHAN_TRAM',
            giaTriGiam: 15,
            giaTriDonHangToiThieu: 10000000,
            soLuong: 30,
            soLuongDaSuDung: 5,
            ngayBatDau: '2025-07-15',
            ngayKetThuc: '2025-09-15',
            trangThai: 'ACTIVE'
        },
        {
            maKhuyenMai: 'KM005',
            tenKhuyenMai: 'Khuyến mãi thành viên mới',
            maGiamGia: 'NEWUSER',
            loaiKhuyenMai: 'PHAN_TRAM',
            giaTriGiam: 10,
            giaTriDonHangToiThieu: 500000,
            soLuong: 200,
            soLuongDaSuDung: 150,
            ngayBatDau: '2025-01-01',
            ngayKetThuc: '2025-12-31',
            trangThai: 'ACTIVE'
        }
    ]);

    const filteredPromotions = promotions.filter(km =>
        km.tenKhuyenMai?.toLowerCase().includes(search.toLowerCase()) ||
        km.maGiamGia?.toLowerCase().includes(search.toLowerCase()) ||
        km.maKhuyenMai?.toLowerCase().includes(search.toLowerCase())
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

    const handleDelete = (maKhuyenMai) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) {
            setPromotions(promotions.filter(km => km.maKhuyenMai !== maKhuyenMai));
        }
    };

    const handleToggleStatus = (maKhuyenMai, currentStatus) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        setPromotions(promotions.map(km =>
            km.maKhuyenMai === maKhuyenMai ? { ...km, trangThai: newStatus } : km
        ));
    };

    const formatCurrency = (value) => {
        if (!value) return '0đ';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const getLoaiKhuyenMaiText = (loai) => {
        switch (loai) {
            case 'PHAN_TRAM': return 'Phần trăm';
            case 'TIEN_MAT': return 'Tiền mặt';
            case 'KHAC': return 'Khác';
            default: return loai;
        }
    };

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
                    className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-5 py-3 rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl font-semibold w-full md:w-auto"
                >
                    <FaPlus />
                    <span>Thêm khuyến mãi</span>
                </button>
            </div>

            {/* Bảng dữ liệu */}
            <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-pink-600 to-rose-600 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left font-semibold">Mã KM</th>
                                <th className="px-6 py-4 text-left font-semibold">Tên khuyến mãi</th>
                                <th className="px-6 py-4 text-left font-semibold">Mã giảm giá</th>
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
                                                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                                                    <FaTags className="text-pink-600" />
                                                </div>
                                                <span className="font-medium text-gray-900">{km.tenKhuyenMai}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold">
                                                {km.maGiamGia || km.maGiamGai}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">{getLoaiKhuyenMaiText(km.loaiKhuyenMai)}</td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                            {km.loaiKhuyenMai === 'PHAN_TRAM' ? `${km.giaTriGiam}%` : formatCurrency(km.giaTriGiam)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-gray-700">{km.soLuongDaSuDung}/{km.soLuong}</span>
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
                                                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                    title="Chỉnh sửa"
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
                    onSave={(data) => {
                        if (selectedPromotion) {
                            setPromotions(promotions.map(km => km.maKhuyenMai === selectedPromotion.maKhuyenMai ? data : km));
                        } else {
                            setPromotions([...promotions, { ...data, maKhuyenMai: `KM00${promotions.length + 1}` }]);
                        }
                        handleCloseModal();
                    }}
                />
            )}
        </Card>
    );
};

// Modal Component
const KhuyenMaiModal = ({ isOpen, onClose, onSave, promotion }) => {
    const [formData, setFormData] = useState({
        tenKhuyenMai: '',
        maGiamGia: '',
        loaiKhuyenMai: 'PHAN_TRAM',
        giaTriGiam: '',
        giaTriDonHangToiThieu: '',
        soLuong: '',
        ngayBatDau: '',
        ngayKetThuc: '',
        trangThai: 'ACTIVE'
    });

    React.useEffect(() => {
        if (isOpen && promotion) {
            setFormData(promotion);
        } else if (isOpen) {
            setFormData({
                tenKhuyenMai: '',
                maGiamGia: '',
                loaiKhuyenMai: 'PHAN_TRAM',
                giaTriGiam: '',
                giaTriDonHangToiThieu: '',
                soLuong: '',
                ngayBatDau: '',
                ngayKetThuc: '',
                trangThai: 'ACTIVE'
            });
        }
    }, [isOpen, promotion]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white p-6 rounded-t-xl sticky top-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">{promotion ? 'Cập nhật khuyến mãi' : 'Thêm khuyến mãi mới'}</h2>
                        <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                            <FaTimes size={24} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Tên khuyến mãi <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="tenKhuyenMai"
                                value={formData.tenKhuyenMai}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Mã giảm giá <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="maGiamGia"
                                value={formData.maGiamGia}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm"
                                placeholder="VD: SUMMER20"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Loại khuyến mãi <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="loaiKhuyenMai"
                                value={formData.loaiKhuyenMai}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm"
                                required
                            >
                                <option value="PHAN_TRAM">Phần trăm</option>
                                <option value="TIEN_MAT">Tiền mặt</option>
                                <option value="KHAC">Khác</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Giá trị giảm <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="giaTriGiam"
                                value={formData.giaTriGiam}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm"
                                placeholder={formData.loaiKhuyenMai === 'PHAN_TRAM' ? 'VD: 20' : 'VD: 500000'}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Giá trị đơn hàng tối thiểu
                            </label>
                            <input
                                type="number"
                                name="giaTriDonHangToiThieu"
                                value={formData.giaTriDonHangToiThieu}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm"
                                placeholder="VD: 2000000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Số lượng <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="soLuong"
                                value={formData.soLuong}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Ngày bắt đầu <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="ngayBatDau"
                                value={formData.ngayBatDau}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Ngày kết thúc <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="ngayKetThuc"
                                value={formData.ngayKetThuc}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Trạng thái
                            </label>
                            <select
                                name="trangThai"
                                value={formData.trangThai}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm"
                            >
                                <option value="ACTIVE">Hoạt động</option>
                                <option value="INACTIVE">Vô hiệu</option>
                            </select>
                        </div>
                    </div>

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
                            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 font-semibold transition-all shadow-lg"
                        >
                            {promotion ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuanLyKhuyenMai;
