import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaToggleOn, FaToggleOff, FaPlane } from 'react-icons/fa';
import { getAllSanBay, addSanBay, updateTrangThaiSanBay } from '../../services/QLSanBayServices';
import Card from '../../components/QuanLy/CardChucNang';
import { MdLocalAirport } from 'react-icons/md';
import ViewToggleButton from '../../components/common/ViewToggleButton';
import CardView from '../../components/common/CardView';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import Toast from '../../components/common/Toast';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useViewToggle } from '../../hooks/useViewToggle';
import SanBayCard from '../../components/QuanLy/QuanLySanBay/SanBayCard';
import SanBayModal from '../../components/QuanLy/QuanLySanBay/SanBayModal';

const QuanLySanBay = () => {
    const [sanBayList, setSanBayList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const { viewMode, setViewMode: handleViewChange } = useViewToggle('ql-san-bay-view', 'table');

    // Toast state
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

    // ConfirmDialog state
    const [confirmDialog, setConfirmDialog] = useState({
        isVisible: false,
        title: '',
        message: '',
        type: 'warning',
        confirmText: 'Xác nhận',
        onConfirm: null
    });

    // Toast handlers
    const showToast = (message, type = 'success') => {
        setToast({ isVisible: true, message, type });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    const showConfirm = (title, message, type, confirmText, onConfirm) => {
        setConfirmDialog({
            isVisible: true,
            title,
            message,
            type,
            confirmText,
            onConfirm
        });
    };

    const hideConfirm = () => {
        setConfirmDialog(prev => ({ ...prev, isVisible: false }));
    };

    const fetchSanBay = async () => {
        try {
            setLoading(true);
            const res = await getAllSanBay();
            setSanBayList(Array.isArray(res.data) ? res.data : []);
        } catch {
            setError('Không thể tải dữ liệu sân bay.');
            setSanBayList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSanBay();
    }, []);

    const filteredSanBayList = Array.isArray(sanBayList) ? sanBayList.filter(sb =>
        sb.tenSanBay?.toLowerCase().includes(search.toLowerCase()) ||
        sb.thanhPhoSanBay?.toLowerCase().includes(search.toLowerCase()) ||
        sb.quocGiaSanBay?.toLowerCase().includes(search.toLowerCase()) ||
        sb.maIATA?.toLowerCase().includes(search.toLowerCase()) ||
        sb.maICAO?.toLowerCase().includes(search.toLowerCase())
    ) : [];

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredSanBayList.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredSanBayList.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleItemsPerPageChange = (e) => {
        const newValue = parseInt(e.target.value);
        setItemsPerPage(newValue);
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    const handleOpenModalForAdd = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSave = async (sanBayData) => {
        try {
            await addSanBay(sanBayData);
            showToast('Thêm sân bay thành công!', 'success');
            fetchSanBay();
            handleCloseModal();
        } catch (err) {
            if (err.response?.status === 409) {
                showToast('Sân bay này đã tồn tại trong hệ thống!', 'error');
            } else {
                showToast(err.response?.data?.message || 'Không thể lưu sân bay. Vui lòng thử lại!', 'error');
            }
        }
    };

    const handleToggleStatus = async (maSanBay, currentStatus) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const statusText = newStatus === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa';

        showConfirm(
            `Xác nhận ${statusText}`,
            `Bạn có chắc chắn muốn ${statusText} sân bay này?`,
            'warning',
            statusText === 'kích hoạt' ? 'Kích hoạt' : 'Vô hiệu hóa',
            async () => {
                try {
                    await updateTrangThaiSanBay(maSanBay, newStatus);
                    showToast(`${statusText.charAt(0).toUpperCase() + statusText.slice(1)} sân bay thành công!`, 'success');
                    fetchSanBay();
                    hideConfirm();
                } catch (err) {
                    showToast(err.response?.data?.message || 'Không thể cập nhật trạng thái sân bay. Vui lòng thử lại!', 'error');
                }
            }
        );
    };

    const handleDeleteSanBay = (sanBay) => {
        handleToggleStatus(sanBay.maSanBay, sanBay.trangThaiHoatDong);
    };

    return (
        <Card title="Quản lý sân bay">
            {/* Thanh công cụ */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sân bay theo tên, thành phố, quốc gia..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    />
                    <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                </div>
                <ViewToggleButton
                    currentView={viewMode}
                    onViewChange={handleViewChange}
                    className="shrink-0"
                />
                <button
                    onClick={handleOpenModalForAdd}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold w-full md:w-auto"
                >
                    <FaPlus />
                    <span>Thêm sân bay</span>
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

            {/* Thanh phân trang - Hiển thị trước bảng/thẻ */}
            {!loading && !error && filteredSanBayList.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 font-medium">
                            Hiển thị <span className="font-bold text-blue-600">{indexOfFirstItem + 1}</span> đến <span className="font-bold text-blue-600">{Math.min(indexOfLastItem, filteredSanBayList.length)}</span> của <span className="font-bold text-blue-600">{filteredSanBayList.length}</span> kết quả
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
            {!loading && !error && (
                <>
                    {viewMode === 'grid' ? (
                        /* Card View */
                        <CardView
                            items={currentItems}
                            renderCard={(sanBay, index) => (
                                <SanBayCard
                                    key={sanBay.maSanBay || index}
                                    data={sanBay}
                                    onDelete={handleDeleteSanBay}
                                />
                            )}
                            emptyMessage="Không tìm thấy sân bay nào."
                        />
                    ) : (
                        /* Table View */
                        <ResponsiveTable>
                            <table className="w-full text-sm">
                                <thead className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-semibold">Mã sân bay</th>
                                        <th className="px-6 py-4 text-left font-semibold">Mã IATA</th>
                                        <th className="px-6 py-4 text-left font-semibold">Mã ICAO</th>
                                        <th className="px-6 py-4 text-left font-semibold">Tên sân bay</th>
                                        <th className="px-6 py-4 text-left font-semibold">Thành phố</th>
                                        <th className="px-6 py-4 text-left font-semibold">Quốc gia</th>
                                        <th className="px-6 py-4 text-center font-semibold">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentItems.length > 0 ? (
                                        currentItems.map((sb, index) => (
                                            <tr key={sb.maSanBay} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                                                <td className="px-6 py-4 font-bold text-blue-600">#{sb.maSanBay}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                                        {sb.maIATA}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                                        {sb.maICAO}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                                            <MdLocalAirport className="text-blue-600 text-xl" />
                                                        </div>
                                                        <span className="font-medium text-gray-900">{sb.tenSanBay}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">{sb.thanhPhoSanBay}</td>
                                                <td className="px-6 py-4 text-gray-700">{sb.quocGiaSanBay}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center items-center gap-2">
                                                        <button
                                                            onClick={() => handleToggleStatus(sb.maSanBay, sb.trangThaiHoatDong)}
                                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                                                                sb.trangThaiHoatDong === 'ACTIVE'
                                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                            }`}
                                                            title={sb.trangThaiHoatDong === 'ACTIVE' ? 'Click để vô hiệu hóa' : 'Click để kích hoạt'}
                                                        >
                                                            {sb.trangThaiHoatDong === 'ACTIVE' ? (
                                                                <>
                                                                    <FaToggleOn size={20} />
                                                                    <span>Hoạt động</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <FaToggleOff size={20} />
                                                                    <span>Vô hiệu</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center py-12">
                                                <div className="flex flex-col items-center gap-3">
                                                    <MdLocalAirport className="text-gray-300 text-5xl" />
                                                    <p className="text-gray-500 font-medium">Không tìm thấy sân bay nào.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </ResponsiveTable>
                    )}
                </>
            )}

            {/* Modal */}
            {isModalOpen && (
                <SanBayModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}

            {/* Toast Component */}
            <Toast
                isVisible={toast.isVisible}
                message={toast.message}
                type={toast.type}
                onClose={hideToast}
            />

            {/* ConfirmDialog Component */}
            <ConfirmDialog
                isVisible={confirmDialog.isVisible}
                title={confirmDialog.title}
                message={confirmDialog.message}
                type={confirmDialog.type}
                confirmText={confirmDialog.confirmText}
                onConfirm={confirmDialog.onConfirm}
                onCancel={hideConfirm}
            />
        </Card>
    );
};

export default QuanLySanBay;

