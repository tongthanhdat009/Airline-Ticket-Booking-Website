import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaFighterJet, FaChair, FaWrench } from 'react-icons/fa';
import Card from '../../components/QuanLy/CardChucNang';
import Toast from '../../components/common/Toast';
import ViewToggleButton from '../../components/common/ViewToggleButton';
import CardView from '../../components/common/CardView';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import { useViewToggle } from '../../hooks/useViewToggle';
import MayBayModal from '../../components/QuanLy/QuanLyMayBay/MayBayModal';
import MayBayCard from '../../components/QuanLy/QuanLyMayBay/MayBayCard';
import SeatLayoutViewer from '../../components/QuanLy/QuanLyMayBay/SeatLayoutViewer';
import * as QLMayBayService from '../../services/QLMayBayService';

const QuanLyMayBay = () => {
    const navigate = useNavigate();
    const { viewMode, setViewMode: handleViewChange } = useViewToggle('ql-may-bay-view', 'table');
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAircraft, setSelectedAircraft] = useState(null);
    const [aircrafts, setAircrafts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [aircraftToDelete, setAircraftToDelete] = useState(null);
    const [seatViewerAircraft, setSeatViewerAircraft] = useState(null);
    const itemsPerPage = 5;

    // Toast functions
    const showToast = (message, type = 'success') => {
        setToast({ isVisible: true, message, type });
    };

    const hideToast = () => {
        setToast({ ...toast, isVisible: false });
    };

    // Load aircrafts from API
    const loadAircrafts = async () => {
        try {
            setLoading(true);
            const response = await QLMayBayService.getAllMayBay();
            setAircrafts(response.data || []);
        } catch (error) {
            console.error('Lỗi khi tải danh sách máy bay:', error);
            showToast('Không thể tải danh sách máy bay', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAircrafts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredAircrafts = aircrafts.filter(mb =>
        mb.tenMayBay?.toLowerCase().includes(search.toLowerCase()) ||
        mb.hangMayBay?.toLowerCase().includes(search.toLowerCase()) ||
        mb.maMayBay?.toString().includes(search.toLowerCase()) ||
        mb.loaiMayBay?.toLowerCase().includes(search.toLowerCase()) ||
        mb.soHieu?.toLowerCase().includes(search.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAircrafts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAircrafts.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleOpenModalForAdd = () => {
        setSelectedAircraft(null);
        setIsModalOpen(true);
    };

    const handleOpenModalForEdit = (aircraft) => {
        setSelectedAircraft(aircraft);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAircraft(null);
    };

    const handleDelete = async (maMayBay) => {
        setAircraftToDelete(maMayBay);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!aircraftToDelete) return;

        try {
            await QLMayBayService.deleteMayBay(aircraftToDelete);
            showToast('Xóa máy bay thành công');
            loadAircrafts();
        } catch (error) {
            console.error('Lỗi khi xóa máy bay:', error);
            const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Không thể xóa máy bay';
            showToast(errorMsg, 'error');
        } finally {
            setShowDeleteConfirm(false);
            setAircraftToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setAircraftToDelete(null);
    };

    const handleSave = async (data) => {
        try {
            if (selectedAircraft) {
                // Update existing aircraft
                await QLMayBayService.updateMayBay(selectedAircraft.maMayBay, data);
                showToast('Cập nhật máy bay thành công');
            } else {
                // Create new aircraft
                await QLMayBayService.addMayBay(data);
                showToast('Thêm máy bay thành công');
            }
            loadAircrafts();
            handleCloseModal();
        } catch (error) {
            console.error('Lỗi khi lưu máy bay:', error);
            const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Không thể lưu máy bay';
            showToast(errorMsg, 'error');
            throw error; // Re-throw to prevent modal from closing
        }
    };

    const getTrangThaiText = (trangThai) => {
        switch (trangThai) {
            case 'Active': return { text: 'Active', color: 'bg-green-100 text-green-700' };
            case 'Maintenance': return { text: 'Maintenance', color: 'bg-yellow-100 text-yellow-700' };
            case 'Inactive': return { text: 'Inactive', color: 'bg-red-100 text-red-700' };
            default: return { text: trangThai, color: 'bg-gray-100 text-gray-700' };
        }
    };

    const handleEditSeatLayout = (aircraft) => {
        if (aircraft.trangThai === 'Active') {
            showToast('Không thể chỉnh sửa sơ đồ ghế khi máy bay đang hoạt động. Vui lòng chuyển sang trạng thái Inactive hoặc Maintenance.', 'error');
            return;
        }
        navigate(`/admin/dashboard/MayBay/${aircraft.maMayBay}/ghe`);
    };

    if (loading) {
        return (
            <Card title="Quản lý máy bay">
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
                </div>
            </Card>
        );
    }

    return (
        <Card title="Quản lý máy bay">
            {/* Toast notification */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />

            {/* Delete confirmation dialog */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 flex justify-center items-center z-50 p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={cancelDelete}></div>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Xác nhận xóa</h3>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc chắn muốn xóa máy bay này không? Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={cancelDelete}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Thanh công cụ */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Tìm kiếm máy bay theo tên, hãng, số hiệu..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-sm"
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
                    className="flex items-center gap-2 bg-linear-to-r from-sky-500 to-blue-600 text-white px-5 py-3 rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold w-full md:w-auto"
                >
                    <FaPlus />
                    <span>Thêm máy bay</span>
                </button>
            </div>

            {/* Thống kê tổng quan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-linear-to-br from-sky-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Tổng số máy bay</p>
                            <p className="text-3xl font-bold mt-2">{aircrafts.length}</p>
                        </div>
                        <FaFighterJet size={40} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-linear-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Đang hoạt động</p>
                            <p className="text-3xl font-bold mt-2">{aircrafts.filter(a => a.trangThai === 'Active').length}</p>
                        </div>
                        <FaFighterJet size={40} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-linear-to-br from-yellow-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Đang bảo trì</p>
                            <p className="text-3xl font-bold mt-2">{aircrafts.filter(a => a.trangThai === 'Maintenance').length}</p>
                        </div>
                        <FaFighterJet size={40} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-linear-to-br from-purple-500 to-violet-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Tổng số ghế</p>
                            <p className="text-3xl font-bold mt-2">{aircrafts.reduce((sum, a) => sum + (a.tongSoGhe || 0), 0).toLocaleString()}</p>
                        </div>
                        <FaFighterJet size={40} className="opacity-80" />
                    </div>
                </div>
            </div>

            {/* View Mode: Card or Table */}
            {viewMode === 'grid' ? (
                /* Card View */
                <CardView
                    items={currentItems}
                    renderCard={(mb, index) => (
                        <MayBayCard
                            key={mb.maMayBay || index}
                            data={mb}
                            onEdit={handleOpenModalForEdit}
                            onDelete={() => handleDelete(mb.maMayBay)}
                        />
                    )}
                    emptyMessage="Không tìm thấy máy bay nào."
                />
            ) : (
                /* Table View */
                <ResponsiveTable>
                    <table className="w-full text-sm">
                        <thead className="bg-linear-to-r from-slate-700 to-slate-800 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left font-semibold">Mã máy bay</th>
                                <th className="px-6 py-4 text-left font-semibold">Tên máy bay</th>
                                <th className="px-6 py-4 text-left font-semibold">Hãng SX</th>
                                <th className="px-6 py-4 text-left font-semibold">Số hiệu</th>
                                <th className="px-6 py-4 text-center font-semibold">Năm KH</th>
                                <th className="px-6 py-4 text-center font-semibold">Tổng ghế</th>
                                <th className="px-6 py-4 text-center font-semibold">Trạng thái</th>
                                <th className="px-6 py-4 text-center font-semibold">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentItems.length > 0 ? (
                                currentItems.map((mb, index) => {
                                    const status = getTrangThaiText(mb.trangThai);
                                    return (
                                        <tr key={mb.maMayBay} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-sky-50 transition-colors`}>
                                            <td className="px-6 py-4 font-bold text-sky-600">#{mb.maMayBay}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                                                        <FaFighterJet className="text-sky-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{mb.tenMayBay}</p>
                                                        <p className="text-xs text-gray-500">{mb.loaiMayBay}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">{mb.hangMayBay}</td>
                                            <td className="px-6 py-4 text-gray-700">{mb.soHieu}</td>
                                            <td className="px-6 py-4 text-gray-700">{mb.namKhaiThac || '-'}</td>
                                            <td className="px-6 py-4 text-center font-bold text-sky-600">{mb.tongSoGhe}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                                                    {status.text}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button
                                                        onClick={() => handleOpenModalForEdit(mb)}
                                                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                        title="Chỉnh sửa thông tin"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => setSeatViewerAircraft(mb.maMayBay)}
                                                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                                        title="Xem sơ đồ ghế"
                                                    >
                                                        <FaChair />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditSeatLayout(mb)}
                                                        className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                                                        title="Chỉnh sửa sơ đồ ghế"
                                                    >
                                                        <FaWrench />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(mb.maMayBay)}
                                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                        title="Xóa"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-12">
                                        <div className="flex flex-col items-center gap-3">
                                            <FaFighterJet className="text-gray-300 text-5xl" />
                                            <p className="text-gray-500 font-medium">Không tìm thấy máy bay nào.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </ResponsiveTable>
            )}

            {/* Thanh phân trang */}
            {filteredAircrafts.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                    <span className="text-sm text-gray-600 font-medium">
                        Hiển thị <span className="font-bold text-sky-600">{indexOfFirstItem + 1}</span> đến <span className="font-bold text-sky-600">{Math.min(indexOfLastItem, filteredAircrafts.length)}</span> của <span className="font-bold text-sky-600">{filteredAircrafts.length}</span> kết quả
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
                                                ? 'bg-sky-600 text-white shadow-lg'
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
                <MayBayModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    aircraft={selectedAircraft}
                    onSave={handleSave}
                />
            )}

            {/* Seat Layout Viewer Modal */}
            {seatViewerAircraft && (
                <SeatLayoutViewer
                    maMayBay={seatViewerAircraft}
                    onClose={() => setSeatViewerAircraft(null)}
                />
            )}
        </Card>
    );
};

export default QuanLyMayBay;
