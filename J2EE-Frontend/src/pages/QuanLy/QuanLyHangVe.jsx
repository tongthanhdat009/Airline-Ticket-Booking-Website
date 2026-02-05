import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaTicketAlt, FaRecycle, FaEyeSlash, FaEye } from 'react-icons/fa';
import { getAllHangVeAdmin, getAllDeleted, createHangVe, updateHangVe, deleteHangVe, restoreHangVe } from '../../services/QLHangVeService';
import Card from '../../components/QuanLy/CardChucNang';
import HangVeModal from '../../components/QuanLy/HangVeModal';
import Toast from '../../components/common/Toast';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const QuanLyHangVe = () => {
    const [hangVeList, setHangVeList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentHangVe, setCurrentHangVe] = useState(null);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleted, setShowDeleted] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
    const [confirmDialog, setConfirmDialog] = useState({ isVisible: false, onConfirm: null });
    const itemsPerPage = 5;

    // Toast functions
    const showToast = (message, type = 'success') => {
        setToast({ isVisible: true, message, type });
    };

    const hideToast = () => {
        setToast({ ...toast, isVisible: false });
    };

    const fetchHangVe = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = showDeleted ? await getAllDeleted() : await getAllHangVeAdmin();
            setHangVeList(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            const errorMsg = showDeleted
                ? 'Không thể tải dữ liệu hạng vé đã xóa.'
                : 'Không thể tải dữ liệu hạng vé.';
            setError(errorMsg);
            console.error(err);
            setHangVeList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHangVe();
    }, [showDeleted]);

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
            setActionLoading(true);
            if (isEditMode && currentHangVe) {
                await updateHangVe(currentHangVe.maHangVe, hangVeData);
                showToast(`Cập nhật hạng vé thành công! Đã cập nhật hạng vé "${hangVeData.tenHangVe}"`);
            } else {
                await createHangVe(hangVeData);
                showToast(`Thêm hạng vé mới thành công! Đã thêm hạng vé "${hangVeData.tenHangVe}"`);
            }
            fetchHangVe();
            handleCloseModal();
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message;
            showToast(`Thao tác thất bại! ${errorMsg}`, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (maHangVe, tenHangVe) => {
        setConfirmDialog({
            isVisible: true,
            title: 'Xác nhận xóa hạng vé',
            message: (
                <div>
                    <p>Bạn có chắc chắn muốn xóa hạng vé <strong>"{tenHangVe}"</strong>?</p>
                    <p className="mt-2 text-orange-600">
                        <strong>Lưu ý:</strong> Tất cả các ghế và giá chuyến bay liên quan đến hạng vé này cũng sẽ bị xóa.
                    </p>
                </div>
            ),
            type: 'danger',
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            onConfirm: async () => {
                try {
                    setActionLoading(true);
                    await deleteHangVe(maHangVe);
                    showToast(`Xóa hạng vé thành công! Đã xóa hạng vé "${tenHangVe}"`);
                    fetchHangVe();
                } catch (err) {
                    const errorMsg = err.response?.data?.message || err.message;
                    showToast(`Xóa hạng vé thất bại! ${errorMsg}`, 'error');
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    const handleRestore = async (maHangVe, tenHangVe) => {
        setConfirmDialog({
            isVisible: true,
            title: 'Xác nhận khôi phục hạng vé',
            message: (
                <div>
                    <p>Bạn có chắc chắn muốn khôi phục hạng vé <strong>"{tenHangVe}"</strong>?</p>
                    <p className="mt-2 text-gray-600">
                        Hạng vé sẽ được khôi phục lại với tên hiện tại.
                    </p>
                </div>
            ),
            type: 'info',
            confirmText: 'Khôi phục',
            cancelText: 'Hủy',
            onConfirm: async () => {
                try {
                    setActionLoading(true);
                    await restoreHangVe(maHangVe);
                    showToast(`Khôi phục hạng vé thành công! Đã khôi phục hạng vé "${tenHangVe}"`);
                    fetchHangVe();
                } catch (err) {
                    const errorMsg = err.response?.data?.message || err.message;
                    showToast(`Khôi phục hạng vé thất bại! ${errorMsg}`, 'error');
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    return (
        <Card title="Quản lý hạng vé">
            {/* Thanh công cụ */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
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
                        onClick={() => setShowDeleted(!showDeleted)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-lg font-semibold transition-all shadow-lg w-full sm:w-auto ${
                            showDeleted
                                ? 'bg-orange-500 text-white hover:bg-orange-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        title={showDeleted ? 'Hiển thị hạng vé đang hoạt động' : 'Hiển thị hạng vé đã xóa'}
                    >
                        {showDeleted ? <FaEye /> : <FaEyeSlash />}
                        <span>{showDeleted ? 'Đang xem đã xóa' : 'Xem đã xóa'}</span>
                    </button>
                </div>
                {!showDeleted && (
                    <button
                        onClick={handleOpenModalForAdd}
                        disabled={actionLoading}
                        className="flex items-center gap-2 bg-linear-to-r from-blue-500 to-blue-600 text-white px-5 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaPlus />
                        <span>Thêm hạng vé</span>
                    </button>
                )}
            </div>

            {/* Loading và Error */}
            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
                </div>
            )}

            {actionLoading && !loading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center mb-4">
                    <div className="inline-block w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <p className="text-blue-600 font-medium inline">Đang xử lý...</p>
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
                            <thead className="bg-linear-to-r from-slate-700 to-slate-800 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold">Mã hạng vé</th>
                                    <th className="px-6 py-4 text-left font-semibold">Tên hạng vé</th>
                                    {showDeleted && <th className="px-6 py-4 text-left font-semibold">Ngày xóa</th>}
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
                                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                                        <FaTicketAlt className="text-purple-600 text-xl" />
                                                    </div>
                                                    <span className="font-medium text-gray-900">{hv.tenHangVe}</span>
                                                    {showDeleted && hv.tenHangVe?.includes('_deleted_') && (
                                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Đã xóa</span>
                                                    )}
                                                </div>
                                            </td>
                                            {showDeleted && (
                                                <td className="px-6 py-4 text-gray-600">
                                                    {hv.deletedAt ? new Date(hv.deletedAt).toLocaleString('vi-VN') : '-'}
                                                </td>
                                            )}
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center items-center gap-2">
                                                    {showDeleted ? (
                                                        // Deleted view: chỉ hiện nút khôi phục
                                                        <button
                                                            onClick={() => handleRestore(hv.maHangVe, hv.tenHangVe)}
                                                            disabled={actionLoading}
                                                            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Khôi phục hạng vé"
                                                        >
                                                            <FaRecycle />
                                                            <span>Khôi phục</span>
                                                        </button>
                                                    ) : (
                                                        // Active view: hiện nút sửa và xóa
                                                        <>
                                                            <button
                                                                onClick={() => handleOpenModalForEdit(hv)}
                                                                disabled={actionLoading}
                                                                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all bg-yellow-100 text-yellow-700 hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                title="Sửa hạng vé"
                                                            >
                                                                <FaEdit />
                                                                <span>Sửa</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(hv.maHangVe, hv.tenHangVe)}
                                                                disabled={actionLoading}
                                                                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                title="Xóa hạng vé"
                                                            >
                                                                <FaTrash />
                                                                <span>Xóa</span>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={showDeleted ? 4 : 3} className="text-center py-12">
                                            <div className="flex flex-col items-center gap-3">
                                                <FaTicketAlt className="text-gray-300 text-5xl" />
                                                <p className="text-gray-500 font-medium">
                                                    {showDeleted ? 'Không tìm thấy hạng vé đã xóa nào.' : 'Không tìm thấy hạng vé nào.'}
                                                </p>
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
            <HangVeModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                isEditMode={isEditMode}
                hangVe={currentHangVe}
            />

            {/* Toast */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />

            {/* Confirm Dialog */}
            <ConfirmDialog
                isVisible={confirmDialog.isVisible}
                title={confirmDialog.title}
                message={confirmDialog.message}
                type={confirmDialog.type}
                confirmText={confirmDialog.confirmText}
                cancelText={confirmDialog.cancelText}
                onConfirm={() => {
                    if (confirmDialog.onConfirm) {
                        confirmDialog.onConfirm();
                        setConfirmDialog({ isVisible: false, onConfirm: null });
                    }
                }}
                onCancel={() => {
                    setConfirmDialog({ isVisible: false, onConfirm: null });
                }}
            />
        </Card>
    );
};

export default QuanLyHangVe;
