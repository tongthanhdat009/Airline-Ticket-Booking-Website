import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaTicketAlt } from 'react-icons/fa';
import { getAllHangVe, createHangVe, updateHangVe, deleteHangVe } from '../../services/QLHangVeService';
import Card from '../../components/QuanLy/CardChucNang';

const QuanLyHangVe = () => {
    const [hangVeList, setHangVeList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentHangVe, setCurrentHangVe] = useState(null);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fetchHangVe = async () => {
        try {
            setLoading(true);
            const res = await getAllHangVe();
            setHangVeList(Array.isArray(res.data) ? res.data : []);
            console.log(res.data);
        } catch (err) {
            setError('Không thể tải dữ liệu hạng vé.');
            console.error(err);
            setHangVeList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHangVe();
    }, []);

    const filteredHangVeList = Array.isArray(hangVeList) ? hangVeList.filter(hv =>
        hv.tenHangVe?.toLowerCase().includes(search.toLowerCase())
    ) : [];

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredHangVeList.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredHangVeList.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleOpenModalForAdd = () => {
        setIsEditMode(false);
        setCurrentHangVe(null);
        setIsModalOpen(true);
    };

    const handleOpenModalForEdit = (hangVe) => {
        setIsEditMode(true);
        setCurrentHangVe(hangVe);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentHangVe(null);
        setIsEditMode(false);
    };

    const handleSave = async (hangVeData) => {
        try {
            if (isEditMode && currentHangVe) {
                await updateHangVe(currentHangVe.maHangVe, hangVeData);
                alert('Cập nhật hạng vé thành công!');
            } else {
                await createHangVe(hangVeData);
                alert('Thêm hạng vé mới thành công!');
            }
            fetchHangVe();
            handleCloseModal();
        } catch (err) {
            alert(`Lỗi: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleDelete = async (maHangVe, tenHangVe) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa hạng vé "${tenHangVe}"?`)) {
            try {
                await deleteHangVe(maHangVe);
                alert('Xóa hạng vé thành công!');
                fetchHangVe();
            } catch (err) {
                alert(`Lỗi: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    return (
        <Card title="Quản lý hạng vé">
            {/* Thanh công cụ */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Tìm kiếm hạng vé theo tên..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    />
                    <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                </div>
                <button
                    onClick={handleOpenModalForAdd}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold w-full md:w-auto"
                >
                    <FaPlus />
                    <span>Thêm hạng vé</span>
                </button>
            </div>

            {/* Loading và Error */}
            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-red-600 font-medium">{error}</p>
                </div>
            )}

            {/* Bảng dữ liệu */}
            {!loading && !error && (
                <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold">Mã hạng vé</th>
                                    <th className="px-6 py-4 text-left font-semibold">Tên hạng vé</th>
                                    <th className="px-6 py-4 text-center font-semibold">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {currentItems.length > 0 ? (
                                    currentItems.map((hv, index) => (
                                        <tr key={hv.maHangVe} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                                            <td className="px-6 py-4 font-bold text-blue-600">#{hv.maHangVe}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                        <FaTicketAlt className="text-purple-600 text-xl" />
                                                    </div>
                                                    <span className="font-medium text-gray-900">{hv.tenHangVe}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button
                                                        onClick={() => handleOpenModalForEdit(hv)}
                                                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                                        title="Sửa hạng vé"
                                                    >
                                                        <FaEdit />
                                                        <span>Sửa</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(hv.maHangVe, hv.tenHangVe)}
                                                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all bg-red-100 text-red-700 hover:bg-red-200"
                                                        title="Xóa hạng vé"
                                                    >
                                                        <FaTrash />
                                                        <span>Xóa</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-12">
                                            <div className="flex flex-col items-center gap-3">
                                                <FaTicketAlt className="text-gray-300 text-5xl" />
                                                <p className="text-gray-500 font-medium">Không tìm thấy hạng vé nào.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Thanh phân trang */}
            {!loading && !error && filteredHangVeList.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                    <span className="text-sm text-gray-600 font-medium">
                        Hiển thị <span className="font-bold text-blue-600">{indexOfFirstItem + 1}</span> đến <span className="font-bold text-blue-600">{Math.min(indexOfLastItem, filteredHangVeList.length)}</span> của <span className="font-bold text-blue-600">{filteredHangVeList.length}</span> kết quả
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

            {/* Modal */}
            {isModalOpen && (
                <HangVeModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    isEditMode={isEditMode}
                    hangVe={currentHangVe}
                />
            )}
        </Card>
    );
};

// Modal Component
const HangVeModal = ({ isOpen, onClose, onSave, isEditMode, hangVe }) => {
    const [formData, setFormData] = useState({
        tenHangVe: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && hangVe) {
                setFormData({
                    tenHangVe: hangVe.tenHangVe || ''
                });
            } else {
                setFormData({ tenHangVe: '' });
            }
            setErrors({});
        }
    }, [isOpen, isEditMode, hangVe]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.tenHangVe || formData.tenHangVe.trim() === '') {
            newErrors.tenHangVe = 'Tên hạng vé không được để trống';
        } else if (formData.tenHangVe.length < 2) {
            newErrors.tenHangVe = 'Tên hạng vé phải có ít nhất 2 ký tự';
        } else if (formData.tenHangVe.length > 100) {
            newErrors.tenHangVe = 'Tên hạng vé không được quá 100 ký tự';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSave(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">
                            {isEditMode ? 'Cập nhật hạng vé' : 'Thêm hạng vé mới'}
                        </h2>
                        <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                            ✕
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Tên hạng vé <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="tenHangVe"
                                placeholder="Nhập tên hạng vé (VD: Economy, Business, First Class)"
                                value={formData.tenHangVe}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm ${
                                    errors.tenHangVe ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            />
                            {errors.tenHangVe && (
                                <p className="text-red-500 text-sm mt-1">{errors.tenHangVe}</p>
                            )}
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
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 font-semibold transition-all shadow-lg"
                        >
                            {isEditMode ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuanLyHangVe;
