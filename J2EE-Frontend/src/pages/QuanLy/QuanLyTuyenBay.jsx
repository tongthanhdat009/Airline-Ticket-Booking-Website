import React, { useState, useMemo, useEffect } from 'react';
import Card from '../../components/QuanLy/CardChucNang';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaPlane } from 'react-icons/fa';
import { getAllTuyenBay, addTuyenBay, updateTuyenBay, deleteTuyenBay } from '../../services/QLTuyenBayServices';
import { getSanBayActive } from '../../services/QLSanBayServices';
import ViewToggleButton from '../../components/common/ViewToggleButton';
import CardView from '../../components/common/CardView';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import Toast from '../../components/common/Toast';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useViewToggle } from '../../hooks/useViewToggle';
import TuyenBayCard from '../../components/QuanLy/QuanLyTuyenBay/TuyenBayCard';
import TuyenBayModal from '../../components/QuanLy/QuanLyTuyenBay/TuyenBayModal';

const QuanLyTuyenBay = () => {
    const [routes, setRoutes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRoute, setCurrentRoute] = useState(null);
    const [formData, setFormData] = useState({ sanBayDi: { maSanBay: '' }, sanBayDen: { maSanBay: '' } });
    const [searchTerm, setSearchTerm] = useState('');
    const [airports, setAirports] = useState([]);
    const [loading, setLoading] = useState(false);
    const { viewMode, setViewMode: handleViewChange } = useViewToggle('ql-tuyen-bay-view', 'table');

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

    const showToast = (message, type = 'success') => {
        setToast({ isVisible: true, message, type });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    const showConfirm = (title, message, type, confirmText, onConfirm) => {
        setConfirmDialog({ isVisible: true, title, message, type, confirmText, onConfirm });
    };

    const hideConfirm = () => {
        setConfirmDialog(prev => ({ ...prev, isVisible: false }));
    };

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        try{
            setLoading(true);
            const res = await getAllTuyenBay();
            setRoutes(res.data);
        }
        catch (error){
            console.error("Lỗi khi fetch danh sách tuyến bay", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchActiveAirports = async () => {
        try{
            const res = await getSanBayActive();
            const activeAirports = res.data.filter(airport => airport.trangThaiHoatDong === 'ACTIVE');
            setAirports(activeAirports);
        }
        catch (error){
            console.error("Lỗi khi fetch danh sách sân bay hoạt động", error);
        }
    };

    // --- LOGIC LỌC VÀ TÌM KIẾM ---
    const filteredRoutes = useMemo(() => {
        if (!searchTerm) return routes;
        return routes.filter(route => {
            const fromAirport = route.sanBayDi?.tenSanBay?.toLowerCase() || '';
            const toAirport = route.sanBayDen?.tenSanBay?.toLowerCase() || '';
            return fromAirport.includes(searchTerm.toLowerCase()) || toAirport.includes(searchTerm.toLowerCase());
        });
    }, [searchTerm, routes]);

    // --- EVENT HANDLERS ---
    const handleOpenModal = (route = null) => {
        setCurrentRoute(route);
        fetchActiveAirports();
        if (route) {
            setFormData({ 
                sanBayDi: { maSanBay: route.sanBayDi.maSanBay }, 
                sanBayDen: { maSanBay: route.sanBayDen.maSanBay }
            });
        } else {
            setFormData({ 
                sanBayDi: { maSanBay: '' }, 
                sanBayDen: { maSanBay: '' }
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentRoute(null);
        setFormData({ 
            sanBayDi: { maSanBay: '' }, 
            sanBayDen: { maSanBay: '' }
        });
    };
    
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: { maSanBay: parseInt(value) }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.sanBayDi.maSanBay || !formData.sanBayDen.maSanBay) {
            showToast("Vui lòng chọn cả sân bay đi và sân bay đến.", "error");
            return;
        }
        if (formData.sanBayDi.maSanBay === formData.sanBayDen.maSanBay) {
            showToast("Sân bay đi và sân bay đến không được trùng nhau.", "error");
            return;
        }

        try {
            // Fetch lại danh sách sân bay active để kiểm tra trạng thái mới nhất
            await fetchActiveAirports();

            // Kiểm tra xem các sân bay đã chọn còn ACTIVE không
            const sanBayDiActive = airports.find(a => a.maSanBay === formData.sanBayDi.maSanBay);
            const sanBayDenActive = airports.find(a => a.maSanBay === formData.sanBayDen.maSanBay);

            if (!sanBayDiActive) {
                showToast("Sân bay đi đã bị vô hiệu hóa. Vui lòng chọn sân bay khác.", "error");
                return;
            }

            if (!sanBayDenActive) {
                showToast("Sân bay đến đã bị vô hiệu hóa. Vui lòng chọn sân bay khác.", "error");
                return;
            }

            if (currentRoute) {
                // Chế độ chỉnh sửa
                await updateTuyenBay(currentRoute.maTuyenBay, formData);
                showToast("Cập nhật tuyến bay thành công!", "success");
            } else {
                // Chế độ thêm mới
                await addTuyenBay(formData);
                showToast("Thêm tuyến bay thành công!", "success");
            }
            fetchRoutes();
            handleCloseModal();
        } catch (error) {
            console.error("Chi tiết lỗi:", error);
            showToast(error.response?.data?.message || "Không thể lưu tuyến bay. Vui lòng thử lại!", "error");
        }
    };

    const handleDelete = async (routeId) => {
        showConfirm(
            'Xác nhận xóa',
            'Bạn có chắc chắn muốn xóa tuyến bay này?',
            'danger',
            'Xóa',
            async () => {
                try {
                    await deleteTuyenBay(routeId);
                    showToast("Xóa tuyến bay thành công!", "success");
                    fetchRoutes();
                    hideConfirm();
                } catch (error) {
                    showToast(error.response?.data?.message || "Không thể xóa tuyến bay. Vui lòng thử lại!", "error");
                }
            }
        );
    };

    return (
        <Card title="Quản lý tuyến bay">
            {/* Thanh công cụ */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Tìm kiếm tuyến bay..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                </div>
                <ViewToggleButton
                    currentView={viewMode}
                    onViewChange={handleViewChange}
                    className="shrink-0"
                />
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold w-full md:w-auto"
                >
                    <FaPlus />
                    <span>Thêm tuyến bay</span>
                </button>
            </div>

            {/* Loading */}
            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
                </div>
            )}

            {/* View Mode: Card or Table */}
            {!loading && (
                <>
                    {viewMode === 'grid' ? (
                        /* Card View */
                        <CardView
                            items={filteredRoutes}
                            renderCard={(route, index) => (
                                <TuyenBayCard
                                    key={route.maTuyenBay || index}
                                    data={route}
                                    onView={handleOpenModal}
                                    onEdit={handleOpenModal}
                                    onDelete={() => handleDelete(route.maTuyenBay)}
                                />
                            )}
                            emptyMessage="Không có tuyến bay nào."
                        />
                    ) : (
                        /* Table View */
                        <ResponsiveTable>
                            <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                                            <tr>
                                                <th scope="col" className="px-6 py-4 text-left font-semibold">Mã tuyến bay</th>
                                                <th scope="col" className="px-6 py-4 text-left font-semibold">Sân bay đi</th>
                                                <th scope="col" className="px-6 py-4 text-left font-semibold">Sân bay đến</th>
                                                <th scope="col" className="px-6 py-4 text-center font-semibold">Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {filteredRoutes.map((route, index) => (
                                                <tr key={route.maTuyenBay} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                                                    <td className="px-6 py-4 font-bold text-blue-600">#{route.maTuyenBay}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                                                <FaPlane className="text-green-600 transform -rotate-45" />
                                                            </div>
                                                            <span className="font-medium text-gray-900">{route.sanBayDi.tenSanBay}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                                <FaPlane className="text-blue-600 transform rotate-45" />
                                                            </div>
                                                            <span className="font-medium text-gray-900">{route.sanBayDen.tenSanBay}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-center gap-2">
                                                            <button
                                                                onClick={() => handleOpenModal(route)}
                                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                                title="Chỉnh sửa"
                                                            >
                                                                <FaEdit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(route.maTuyenBay)}
                                                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                                title="Xóa"
                                                            >
                                                                <FaTrash size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredRoutes.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-12">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <FaPlane className="text-gray-300 text-5xl" />
                                                            <p className="text-gray-500 font-medium">Không có tuyến bay nào.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </ResponsiveTable>
                    )}
                </>
            )}

            {/* Modal */}
            {isModalOpen && (
                <TuyenBayModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSubmit={handleSubmit}
                    formData={formData}
                    handleFormChange={handleFormChange}
                    airports={airports}
                    currentRoute={currentRoute}
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

export default QuanLyTuyenBay;