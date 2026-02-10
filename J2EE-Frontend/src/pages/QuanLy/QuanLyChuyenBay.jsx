import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/QuanLy/CardChucNang';
import { FaPlus, FaSearch, FaPlane, FaEdit, FaEye, FaRecycle, FaEyeSlash, FaTrash } from 'react-icons/fa';
import { getAllChuyenBay, createChuyenBay, updateChuyenBay, updateTrangThaiChuyenBay, updateDelay, updateCancel, getAllDeletedChuyenBay, restoreChuyenBay, deleteChuyenBay } from '../../services/QLChuyenBayService';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { getAllTuyenBay } from '../../services/QLTuyenBayService';
import { getActiveSanBay } from '../../services/QLSanBayService';
import { getAllServices } from '../../services/QLDichVuService';
import { getDichVuByChuyenBay, addDichVuToChuyenBay, removeDichVuFromChuyenBay } from '../../services/QLDichVuChuyenBayService';
import { getAllMayBay } from '../../services/QLMayBayService';
import EditFlightModal from '../../components/QuanLy/QuanLyChuyenBay/EditFlightModal';
import DelayFlightModal from '../../components/QuanLy/QuanLyChuyenBay/DelayFlightModal';
import CancelFlightModal from '../../components/QuanLy/QuanLyChuyenBay/CancelFlightModal';
import FlightDetailModal from '../../components/QuanLy/QuanLyChuyenBay/FlightDetailModal';
import Toast from '../../components/common/Toast';
import useWebSocket from '../../hooks/useWebSocket';
import ViewToggleButton from '../../components/common/ViewToggleButton';
import CardView from '../../components/common/CardView';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import { useViewToggle } from '../../hooks/useViewToggle';
import ChuyenBayCard from '../../components/QuanLy/QuanLyChuyenBay/ChuyenBayCard';

const QuanLyChuyenBay = () => {
    const navigate = useNavigate();

    // --- STATE MANAGEMENT ---
    const [airports, setAirports] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [flights, setFlights] = useState([]);
    const [services, setServices] = useState([]);
    const [aircraft, setAircraft] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentFlight, setCurrentFlight] = useState(null);
    const [formData, setFormData] = useState({});
    const [filters, setFilters] = useState({ keyword: '', date: '' });
    const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
    const [delayFlightId, setDelayFlightId] = useState(null);
    const [delayData, setDelayData] = useState({ lyDoDelay: '', thoiGianDiThucTe: '', thoiGianDenThucTe: '' });
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelFlightId, setCancelFlightId] = useState(null);
    const [cancelData, setCancelData] = useState({ lyDoHuy: '' });
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
    const [currentPage, setCurrentPage] = useState(1);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [showUpdateNotification, setShowUpdateNotification] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');
    const [showDeleted, setShowDeleted] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({ isVisible: false, onConfirm: null });
    const itemsPerPage = 5;

    // --- VIEW TOGGLE ---
    const { viewMode, setViewMode: handleViewChange } = useViewToggle('ql-chuyen-bay-view', 'table');

    // --- WEBSOCKET ---
    const { latestUpdate, isConnected, clearLatestUpdate } = useWebSocket();

    // --- FETCH DATA ---
    const fetchFlights = async () => {
        try {
            setLoading(true);
            setError(null);
            const [flightsRes, routesRes, airportsRes, servicesRes, aircraftRes] = await Promise.all([
                showDeleted ? getAllDeletedChuyenBay() : getAllChuyenBay(),
                getAllTuyenBay(),
                getActiveSanBay(),
                getAllServices(),
                getAllMayBay()
            ]);
            setFlights(flightsRes.data?.data || flightsRes.data || []);
            setRoutes(routesRes.data?.data || []);
            setAirports(airportsRes.data?.data || []);
            setServices(servicesRes.data?.data || servicesRes.data || []);
            setAircraft(aircraftRes.data?.data || aircraftRes.data || []);
        } catch (err) {
            const errorMsg = showDeleted
                ? 'Không thể tải dữ liệu chuyến bay đã xóa.'
                : 'Không thể tải dữ liệu chuyến bay.';
            setError(errorMsg);
            console.error('Error fetching data:', err);
            setFlights([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlights();
    }, [showDeleted]);

    // --- WEBSOCKET UPDATE HANDLER ---
    useEffect(() => {
        if (!latestUpdate || showDeleted) return;

        console.log('Processing flight update:', latestUpdate);

        // Cập nhật trạng thái và thời gian thực tế của chuyến bay
        setFlights(prevFlights =>
            prevFlights.map(flight =>
                flight.maChuyenBay === latestUpdate.maChuyenBay
                    ? {
                        ...flight,
                        trangThai: latestUpdate.newStatus,
                        thoiGianDiThucTe: latestUpdate.thoiGianDiThucTe,
                        thoiGianDenThucTe: latestUpdate.thoiGianDenThucTe,
                        lyDoDelay: latestUpdate.lyDoDelay,
                        lyDoHuy: latestUpdate.lyDoHuy
                    }
                    : flight
            )
        );

        // Tìm thông tin chuyến bay để hiển thị
        const updatedFlight = flights.find(f => f.maChuyenBay === latestUpdate.maChuyenBay);
        const flightNumber = updatedFlight?.soHieuChuyenBay || latestUpdate.maChuyenBay;

        // Hiển thị notification
        setUpdateMessage(`Chuyến bay ${flightNumber} đã chuyển từ "${latestUpdate.oldStatus}" sang "${latestUpdate.newStatus}"`);
        setShowUpdateNotification(true);

        // Tự động ẩn sau 5 giây
        setTimeout(() => {
            setShowUpdateNotification(false);
        }, 5000);

        // Clear latest update
        clearLatestUpdate();
    }, [latestUpdate, flights, clearLatestUpdate, showDeleted]);

    // --- HELPER FUNCTIONS ---
    const getRouteInfo = (route) => {
        if (!route) return 'Không rõ';
        const from = airports.find(a => a.maSanBay === route.sanBayDi?.maSanBay)?.maIATA || '?';
        const to = airports.find(a => a.maSanBay === route.sanBayDen?.maSanBay)?.maIATA || '?';
        return `${from} → ${to}`;
    };

    // --- LỌC DỮ LIỆU ---
    const filteredFlights = useMemo(() => {
        return flights.filter(flight => {
            const keywordMatch = (flight.soHieuChuyenBay?.toLowerCase() || '').includes(filters.keyword.toLowerCase());
            const dateMatch = filters.date ? flight.ngayDi === filters.date : true;
            return keywordMatch && dateMatch;
        });
    }, [filters, flights]);

    // --- PHÂN TRANG ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredFlights.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredFlights.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // --- MODAL HANDLERS ---
    const _handleOpenModal = async (flight = null) => {
        // Nếu chuyến bay có trạng thái Delay, mở DelayModal
        if (flight && flight.trangThai === 'Delay') {
            setDelayFlightId(flight.maChuyenBay);
            setDelayData({
                lyDoDelay: flight.lyDoDelay || '',
                thoiGianDiThucTe: flight.thoiGianDiThucTe ? new Date(flight.thoiGianDiThucTe).toISOString().slice(0, 16) : '',
                thoiGianDenThucTe: flight.thoiGianDenThucTe ? new Date(flight.thoiGianDenThucTe).toISOString().slice(0, 16) : ''
            });
            setIsDelayModalOpen(true);
            return;
        }

        setCurrentFlight(flight);
        setFormData(flight ? {
            ...flight,
            maTuyenBay: flight.tuyenBay?.maTuyenBay || '',
            maMayBay: flight.mayBay?.maMayBay || ''
        } : {
            maTuyenBay: '', maMayBay: '', soHieuChuyenBay: '', ngayDi: '', gioDi: '', ngayDen: '', gioDen: ''
        });

        // Nếu là sửa chuyến bay, load dịch vụ đã gán
        if (flight) {
            try {
                const servicesRes = await getDichVuByChuyenBay(flight.maChuyenBay);
                const flightServices = servicesRes.data?.data || servicesRes.data || [];
                setSelectedServices(flightServices.map(s => s.maDichVu));
            } catch (error) {
                console.error('Error fetching flight services:', error);
                setSelectedServices([]);
            }
        } else {
            setSelectedServices([]);
        }

        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentFlight(null);
        setSelectedServices([]);
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleServiceChange = (maDichVu) => {
        setSelectedServices(prev =>
            prev.includes(maDichVu)
                ? prev.filter(id => id !== maDichVu)
                : [...prev, maDichVu]
        );
    };

    const showToast = (message, type = 'success') => {
        setToast({ isVisible: true, message, type });
    };

    const hideToast = () => {
        setToast({ ...toast, isVisible: false });
    };

    const handleSubmit = async (e, loaiChuyenBay) => {
        e.preventDefault();
        try {
            const { ...restFormData } = formData;
            const selectedRoute = routes.find(r => r.maTuyenBay === parseInt(formData.maTuyenBay));
            const selectedAircraft = aircraft.find(mb => mb.maMayBay === parseInt(formData.maMayBay));

            if (!selectedAircraft) {
                showToast('Vui lòng chọn máy bay!', 'error');
                return;
            }

            // Tạo chuyến bay đi
            const flightDataDi = {
                soHieuChuyenBay: restFormData.soHieuChuyenBay,
                ngayDi: restFormData.ngayDi,
                gioDi: restFormData.gioDi,
                ngayDen: restFormData.ngayDen,
                gioDen: restFormData.gioDen,
                tuyenBay: selectedRoute,
                mayBay: selectedAircraft
            };

            if (currentFlight) {
                // Cập nhật chuyến bay
                await updateChuyenBay(flightDataDi);

                // Cập nhật dịch vụ cho chuyến bay
                await updateFlightServices(currentFlight.maChuyenBay, selectedServices);

                showToast('Cập nhật chuyến bay thành công!', 'success');
            } else {
                // Tạo chuyến bay đi
                const createdFlightDi = await createChuyenBay(flightDataDi);
                const maChuyenBayDi = createdFlightDi.data?.data?.maChuyenBay || createdFlightDi.data?.maChuyenBay;

                // Gán dịch vụ cho chuyến bay đi
                if (maChuyenBayDi && selectedServices.length > 0) {
                    await assignServicesToFlight(maChuyenBayDi, selectedServices);
                }

                // Nếu là khứ hồi, tạo thêm chuyến bay về
                if (loaiChuyenBay === 'khu-hoi') {
                    // Tìm tuyến bay ngược lại
                    const returnRoute = routes.find(r =>
                        r.sanBayDi?.maSanBay === selectedRoute.sanBayDen?.maSanBay &&
                        r.sanBayDen?.maSanBay === selectedRoute.sanBayDi?.maSanBay
                    );

                    if (!returnRoute) {
                        showToast('Không tìm thấy tuyến bay ngược lại!', 'error');
                        return;
                    }

                    const flightDataVe = {
                        soHieuChuyenBay: restFormData.soHieuChuyenBayVe,
                        ngayDi: restFormData.ngayDiVe,
                        gioDi: restFormData.gioDiVe,
                        ngayDen: restFormData.ngayDenVe,
                        gioDen: restFormData.gioDenVe,
                        tuyenBay: returnRoute,
                        mayBay: selectedAircraft
                    };

                    const createdFlightVe = await createChuyenBay(flightDataVe);
                    const maChuyenBayVe = createdFlightVe.data?.data?.maChuyenBay || createdFlightVe.data?.maChuyenBay;

                    // Gán dịch vụ cho chuyến bay về
                    if (maChuyenBayVe && selectedServices.length > 0) {
                        await assignServicesToFlight(maChuyenBayVe, selectedServices);
                    }

                    showToast('Thêm mới chuyến bay khứ hồi thành công!', 'success');
                } else {
                    showToast('Thêm mới chuyến bay thành công!', 'success');
                }
            }

            // Refresh data
            await fetchFlights();
            handleCloseModal();
        } catch (err) {
            console.error('Error saving flight:', err);
            showToast('Có lỗi xảy ra khi lưu chuyến bay. Vui lòng thử lại.', 'error');
        }
    };

    // Hàm gán dịch vụ cho chuyến bay mới
    const assignServicesToFlight = async (maChuyenBay, serviceIds) => {
        for (const maDichVu of serviceIds) {
            try {
                await addDichVuToChuyenBay(maChuyenBay, maDichVu);
            } catch (error) {
                console.error(`Error assigning service ${maDichVu} to flight ${maChuyenBay}:`, error);
            }
        }
    };

    // Hàm cập nhật dịch vụ cho chuyến bay hiện tại
    const updateFlightServices = async (maChuyenBay, newServiceIds) => {
        try {
            // Lấy danh sách dịch vụ hiện tại
            const servicesRes = await getDichVuByChuyenBay(maChuyenBay);
            const currentServices = servicesRes.data?.data || servicesRes.data || [];
            const currentServiceIds = currentServices.map(s => s.maDichVu);

            // Xóa các dịch vụ không còn được chọn
            for (const maDichVu of currentServiceIds) {
                if (!newServiceIds.includes(maDichVu)) {
                    await removeDichVuFromChuyenBay(maChuyenBay, maDichVu);
                }
            }

            // Thêm các dịch vụ mới
            for (const maDichVu of newServiceIds) {
                if (!currentServiceIds.includes(maDichVu)) {
                    await addDichVuToChuyenBay(maChuyenBay, maDichVu);
                }
            }
        } catch (error) {
            console.error('Error updating flight services:', error);
            throw error;
        }
    };

    const handleStatusChange = async (flightId, newStatus) => {
        if (newStatus === 'Delay') {
            setDelayFlightId(flightId);
            setIsDelayModalOpen(true);
            return;
        }
        if (newStatus === 'Đã hủy') {
            setCancelFlightId(flightId);
            setIsCancelModalOpen(true);
            return;
        }
        try {
            await updateTrangThaiChuyenBay(flightId, newStatus);
            showToast('Cập nhật trạng thái chuyến bay thành công!', 'success');
            // Refresh data
            await fetchFlights();
        } catch (err) {
            console.error('Error updating status:', err);
            showToast('Có lỗi xảy ra khi cập nhật trạng thái. Vui lòng thử lại.', 'error');
        }
    };

    const handleDelayClose = () => {
        setIsDelayModalOpen(false);
        setDelayFlightId(null);
        setDelayData({ lyDoDelay: '', thoiGianDiThucTe: '', thoiGianDenThucTe: '' });
    };

    const handleDelaySubmit = async (e) => {
        e.preventDefault();
        const flight = flights.find(f => f.maChuyenBay === delayFlightId);
        if (!flight) {
            showToast('Không tìm thấy chuyến bay.', 'error');
            return;
        }
        const departureScheduled = new Date(`${flight.ngayDi}T${flight.gioDi}`);
        const arrivalScheduled = new Date(`${flight.ngayDen}T${flight.gioDen}`);
        if (delayData.thoiGianDiThucTe && new Date(delayData.thoiGianDiThucTe) <= departureScheduled) {
            showToast('Thời gian đi thực tế phải sau thời gian đi dự kiến.', 'error');
            return;
        }
        if (new Date(delayData.thoiGianDenThucTe) <= arrivalScheduled) {
            showToast('Thời gian đến thực tế phải sau thời gian đến dự kiến.', 'error');
            return;
        }
        try {
            const delayPayload = {
                maChuyenBay: delayFlightId,
                lyDoDelay: delayData.lyDoDelay,
                thoiGianDiThucTe: delayData.thoiGianDiThucTe ? new Date(delayData.thoiGianDiThucTe).getTime() : null,
                thoiGianDenThucTe: delayData.thoiGianDenThucTe ? new Date(delayData.thoiGianDenThucTe).getTime() : null
            };
            await updateDelay(delayPayload);
            showToast('Cập nhật thông tin delay thành công!', 'success');
            // Refresh data
            await fetchFlights();
            handleDelayClose();
        } catch (err) {
            console.error('Error updating delay:', err);
            showToast('Có lỗi xảy ra khi cập nhật delay. Vui lòng thử lại.', 'error');
        }
    };

    const handleCancelClose = () => {
        setIsCancelModalOpen(false);
        setCancelFlightId(null);
        setCancelData({ lyDoHuy: '' });
    };

    const handleCancelSubmit = async (e) => {
        e.preventDefault();
        if (!cancelData.lyDoHuy.trim()) {
            showToast('Vui lòng nhập lý do hủy chuyến bay.', 'error');
            return;
        }
        try {
            // Gọi API updateCancel để cập nhật lý do hủy và trạng thái
            const cancelPayload = {
                maChuyenBay: cancelFlightId,
                lyDoHuy: cancelData.lyDoHuy
            };
            await updateCancel(cancelPayload);
            await updateTrangThaiChuyenBay(cancelFlightId, 'Đã hủy');
            showToast('Hủy chuyến bay thành công!', 'success');
            // Refresh data
            await fetchFlights();
            handleCancelClose();
        } catch (err) {
            console.error('Error canceling flight:', err);
            showToast('Có lỗi xảy ra khi hủy chuyến bay. Vui lòng thử lại.', 'error');
        }
    };

    const handleRestore = async (maChuyenBay, soHieuChuyenBay) => {
        setConfirmDialog({
            isVisible: true,
            title: 'Xác nhận khôi phục chuyến bay',
            message: (
                <div>
                    <p>Bạn có chắc chắn muốn khôi phục chuyến bay <strong>"{soHieuChuyenBay}"</strong>?</p>
                    <p className="mt-2 text-gray-600">
                        Chuyến bay sẽ được khôi phục lại và có thể đặt vé lại.
                    </p>
                </div>
            ),
            type: 'info',
            confirmText: 'Khôi phục',
            cancelText: 'Hủy',
            onConfirm: async () => {
                try {
                    setActionLoading(true);
                    await restoreChuyenBay(maChuyenBay);
                    showToast(`Khôi phục chuyến bay thành công! Đã khôi phục "${soHieuChuyenBay}"`);
                    await fetchFlights();
                } catch (err) {
                    const errorMsg = err.response?.data?.message || err.message;
                    showToast(`Khôi phục chuyến bay thất bại! ${errorMsg}`, 'error');
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    const handleDelete = async (flight) => {
        setConfirmDialog({
            isVisible: true,
            title: 'Xác nhận xóa chuyến bay',
            message: (
                <div>
                    <p>Bạn có chắc chắn muốn xóa chuyến bay <strong>"{flight.soHieuChuyenBay}"</strong>?</p>
                    <p className="mt-2 text-orange-600">
                        <strong>Lưu ý:</strong> Chuyến bay sẽ được chuyển vào thùng rác. Bạn có thể khôi phục lại sau nếu cần.
                    </p>
                </div>
            ),
            type: 'danger',
            confirmText: 'Xóa',
            cancelText: 'Hủy',
            onConfirm: async () => {
                try {
                    setActionLoading(true);
                    await deleteChuyenBay(flight);
                    showToast(`Xóa chuyến bay thành công! Đã xóa "${flight.soHieuChuyenBay}"`);
                    await fetchFlights();
                } catch (err) {
                    const errorMsg = err.response?.data?.message || err.message;
                    showToast(`Xóa chuyến bay thất bại! ${errorMsg}`, 'error');
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    const handleOpenDetailModal = (flight) => {
        setSelectedFlight(flight);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedFlight(null);
    };

    if (loading) return <div className="flex justify-center items-center h-64"><div className="text-lg">Đang tải...</div></div>;
    if (error) return <div className="flex justify-center items-center h-64"><div className="text-lg text-red-500">{error}</div></div>;

    return (
        <Card title="Quản lý chuyến bay">
            {/* Toast Notification */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
                duration={3000}
            />

            {/* WebSocket Update Notification */}
            {showUpdateNotification && (
                <div className="mb-4 p-4 bg-blue-100 border-l-4 border-blue-500 rounded-lg shadow-md flex items-center justify-between animate-slide-in">
                    <div className="flex items-center gap-3">
                        <FaPlane className="text-blue-600 text-xl animate-bounce" />
                        <span className="text-blue-800 font-semibold">{updateMessage}</span>
                    </div>
                    <button
                        onClick={() => setShowUpdateNotification(false)}
                        className="text-blue-600 hover:text-blue-800 font-bold text-lg"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* WebSocket Connection Status */}
            {!showDeleted && (
                <div className="mb-4 flex items-center gap-2 text-sm">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className={isConnected ? 'text-green-700' : 'text-gray-500'}>
                        {isConnected ? 'Kết nối real-time đang hoạt động' : 'Không có kết nối real-time'}
                    </span>
                </div>
            )}

            {/* Action Loading */}
            {actionLoading && !loading && (
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <div className="inline-block w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <p className="text-blue-600 font-medium inline">Đang xử lý...</p>
                </div>
            )}

            {/* Thanh công cụ */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Tìm số hiệu chuyến bay..."
                            value={filters.keyword}
                            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                        />
                        <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                    </div>
                    <input
                        type="date"
                        value={filters.date}
                        onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                        className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    />
                    <button
                        onClick={() => {
                            setShowDeleted(!showDeleted);
                            setCurrentPage(1);
                        }}
                        className={`flex items-center gap-2 px-5 py-3 rounded-lg font-semibold transition-all shadow-lg w-full sm:w-auto ${showDeleted
                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        title={showDeleted ? 'Hiển thị chuyến bay đang hoạt động' : 'Hiển thị chuyến bay đã xóa'}
                    >
                        {showDeleted ? <FaEye /> : <FaEyeSlash />}
                        <span>{showDeleted ? 'Đang xem đã xóa' : 'Xem đã xóa'}</span>
                    </button>
                </div>
                <ViewToggleButton
                    currentView={viewMode}
                    onViewChange={handleViewChange}
                    className="shrink-0"
                />
                {!showDeleted && (
                    <button
                        onClick={() => navigate('/admin/dashboard/ChuyenBay/them')}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold w-full md:w-auto"
                    >
                        <FaPlus />
                        <span>Thêm chuyến bay</span>
                    </button>
                )}
            </div>

            {/* View Mode: Card or Table */}
            {viewMode === 'grid' ? (
                /* Card View */
                <CardView
                    items={currentItems}
                    renderCard={(flight, index) => (
                        <ChuyenBayCard
                            key={flight.maChuyenBay || index}
                            data={flight}
                            getRouteInfo={getRouteInfo}
                            onView={handleOpenDetailModal}
                            onEdit={(flight) => navigate(`/admin/dashboard/ChuyenBay/${flight.maChuyenBay}/sua`)}
                        />
                    )}
                    emptyMessage={showDeleted ? 'Không tìm thấy chuyến bay đã xóa nào.' : 'Không tìm thấy chuyến bay nào.'}
                />
            ) : (
                /* Table View */
                <ResponsiveTable>
                    <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200">
                        <table className="w-full text-sm">
                            <thead className="bg-blue-600 text-white">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left font-semibold">Số hiệu</th>
                                    <th scope="col" className="px-6 py-4 text-left font-semibold">Tuyến bay</th>
                                    <th scope="col" className="px-6 py-4 text-left font-semibold">Thời gian đi</th>
                                    <th scope="col" className="px-6 py-4 text-left font-semibold">Thời gian đến</th>
                                    {!showDeleted && (
                                        <>
                                            <th scope="col" className="px-6 py-4 text-center font-semibold">Trạng thái</th>
                                            <th scope="col" className="px-6 py-4 text-center font-semibold">Lý do</th>
                                            <th scope="col" className="px-6 py-4 text-center font-semibold">Thời gian đi thực tế</th>
                                            <th scope="col" className="px-6 py-4 text-center font-semibold">Thời gian đến thực tế</th>
                                        </>
                                    )}
                                    {showDeleted && (
                                        <th scope="col" className="px-6 py-4 text-left font-semibold">Ngày xóa</th>
                                    )}
                                    <th scope="col" className="px-6 py-4 text-center font-semibold">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {currentItems.length > 0 ? (
                                    currentItems.map((flight, index) => (
                                        <tr key={flight.maChuyenBay} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                                            <td className="px-6 py-4 font-bold text-blue-600">
                                                {flight.soHieuChuyenBay}
                                                {showDeleted && flight.soHieuChuyenBay?.includes('_deleted_') && (
                                                    <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Đã xóa</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                <div className="flex items-center gap-2">
                                                    <FaPlane className="text-gray-400" />
                                                    {getRouteInfo(flight.tuyenBay)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{flight.gioDi}</span>
                                                    <span className="text-xs text-gray-500">{flight.ngayDi}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{flight.gioDen}</span>
                                                    <span className="text-xs text-gray-500">{flight.ngayDen}</span>
                                                </div>
                                            </td>
                                            {!showDeleted && (
                                                <>
                                                    <td className="px-6 py-4 text-center">
                                                        <select
                                                            value={flight.trangThai}
                                                            onChange={(e) => handleStatusChange(flight.maChuyenBay, e.target.value)}
                                                            disabled={['Đã hủy', 'Đã bay', 'Hủy'].includes(flight.trangThai)}
                                                            className={`px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${['Đã hủy', 'Đã bay', 'Hủy'].includes(flight.trangThai) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                        >
                                                            {/* Đang mở bán: có thể chuyển sang Đang check-in, Đang bay, Delay, Đã hủy */}
                                                            {flight.trangThai === 'Đang mở bán' && (
                                                                <>
                                                                    <option value="Đang mở bán">Đang mở bán</option>
                                                                    <option value="Đang check-in">Đang check-in</option>
                                                                    <option value="Đang bay">Đang bay</option>
                                                                    <option value="Delay">Delay</option>
                                                                    <option value="Đã hủy">Đã hủy</option>
                                                                </>
                                                            )}

                                                            {/* Đang check-in: có thể chuyển sang Đang bay, Delay, Đã hủy */}
                                                            {flight.trangThai === 'Đang check-in' && (
                                                                <>
                                                                    <option value="Đang check-in">Đang check-in</option>
                                                                    <option value="Đang bay">Đang bay</option>
                                                                    <option value="Delay">Delay</option>
                                                                    <option value="Đã hủy">Đã hủy</option>
                                                                </>
                                                            )}

                                                            {/* Đang bay: chỉ có thể chuyển sang Đã bay */}
                                                            {flight.trangThai === 'Đang bay' && (
                                                                <>
                                                                    <option value="Đang bay">Đang bay</option>
                                                                    <option value="Đã bay">Đã bay</option>
                                                                </>
                                                            )}

                                                            {/* Delay: có thể chuyển sang Đang bay, Đã bay, Đã hủy */}
                                                            {flight.trangThai === 'Delay' && (
                                                                <>
                                                                    <option value="Delay">Delay</option>
                                                                    <option value="Đang bay">Đang bay</option>
                                                                    <option value="Đã bay">Đã bay</option>
                                                                    <option value="Đã hủy">Đã hủy</option>
                                                                </>
                                                            )}

                                                            {/* Đã hủy: không thể thay đổi */}
                                                            {(flight.trangThai === 'Đã hủy' || flight.trangThai === 'Hủy') && (
                                                                <option value={flight.trangThai}>{flight.trangThai}</option>
                                                            )}

                                                            {/* Đã bay: không thể thay đổi */}
                                                            {flight.trangThai === 'Đã bay' && (
                                                                <option value="Đã bay">Đã bay</option>
                                                            )}

                                                            {/* Legacy: Đã hạ cánh */}
                                                            {flight.trangThai === 'Đã hạ cánh' && (
                                                                <>
                                                                    <option value="Đã hạ cánh">Đã hạ cánh</option>
                                                                    <option value="Đã bay">Đã bay</option>
                                                                </>
                                                            )}

                                                            {/* Default case: nếu không match với trường hợp nào */}
                                                            {!['Đang mở bán', 'Đang check-in', 'Đang bay', 'Delay', 'Đã hủy', 'Hủy', 'Đã bay', 'Đã hạ cánh'].includes(flight.trangThai) && (
                                                                <>
                                                                    <option value={flight.trangThai}>{flight.trangThai || 'Chưa xác định'}</option>
                                                                    <option value="Đang mở bán">Đang mở bán</option>
                                                                    <option value="Đang check-in">Đang check-in</option>
                                                                    <option value="Đang bay">Đang bay</option>
                                                                    <option value="Đã bay">Đã bay</option>
                                                                    <option value="Delay">Delay</option>
                                                                    <option value="Đã hủy">Đã hủy</option>
                                                                </>
                                                            )}
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">{flight.lyDoDelay || '-'}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        {flight.thoiGianDiThucTe ? new Date(flight.thoiGianDiThucTe).toLocaleString('vi-VN') : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {flight.thoiGianDenThucTe ? new Date(flight.thoiGianDenThucTe).toLocaleString('vi-VN') : '-'}
                                                    </td>
                                                </>
                                            )}
                                            {showDeleted && (
                                                <td className="px-6 py-4 text-gray-600">
                                                    {flight.deletedAt ? new Date(flight.deletedAt).toLocaleString('vi-VN') : '-'}
                                                </td>
                                            )}
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    {showDeleted ? (
                                                        // Deleted view: chỉ hiện nút khôi phục
                                                        <button
                                                            onClick={() => handleRestore(flight.maChuyenBay, flight.soHieuChuyenBay)}
                                                            disabled={actionLoading}
                                                            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Khôi phục chuyến bay"
                                                        >
                                                            <FaRecycle />
                                                            <span>Khôi phục</span>
                                                        </button>
                                                    ) : (
                                                        // Active view: hiện nút xem chi tiết, sửa và xóa
                                                        <>
                                                            <button
                                                                onClick={() => handleOpenDetailModal(flight)}
                                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                                title="Xem chi tiết"
                                                            >
                                                                <FaEye size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/admin/dashboard/ChuyenBay/${flight.maChuyenBay}/sua`)}
                                                                disabled={['Đã hủy', 'Đã bay', 'Đang bay'].includes(flight.trangThai)}
                                                                className={`p-2 rounded-lg transition-colors ${['Đã hủy', 'Đã bay', 'Đang bay'].includes(flight.trangThai) ? 'text-gray-400 cursor-not-allowed' : 'text-orange-600 hover:bg-orange-100'}`}
                                                                title={['Đang bay'].includes(flight.trangThai) ? 'Không thể sửa khi đang bay' : 'Chỉnh sửa'}
                                                            >
                                                                <FaEdit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(flight)}
                                                                disabled={actionLoading}
                                                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                title="Xóa chuyến bay"
                                                            >
                                                                <FaTrash size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={showDeleted ? 6 : 9} className="text-center py-12">
                                            <div className="flex flex-col items-center gap-3">
                                                <FaPlane className="text-gray-300 text-5xl" />
                                                <p className="text-gray-500 font-medium">
                                                    {showDeleted ? 'Không tìm thấy chuyến bay đã xóa nào.' : 'Không tìm thấy chuyến bay nào.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </ResponsiveTable>
            )}

            {/* Thanh phân trang */}
            {filteredFlights.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                    <span className="text-sm text-gray-600 font-medium">
                        Hiển thị <span className="font-bold text-blue-600">{indexOfFirstItem + 1}</span> đến <span className="font-bold text-blue-600">{Math.min(indexOfLastItem, filteredFlights.length)}</span> của <span className="font-bold text-blue-600">{filteredFlights.length}</span> kết quả
                    </span>
                    <nav>
                        <ul className="flex gap-1">
                            <li>
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-sm text-sm"
                                >
                                    Trước
                                </button>
                            </li>

                            {/* Trang đầu */}
                            {currentPage > 3 && (
                                <>
                                    <li>
                                        <button
                                            onClick={() => paginate(1)}
                                            className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 font-medium transition-all text-sm"
                                        >
                                            1
                                        </button>
                                    </li>
                                    {currentPage > 4 && (
                                        <li className="flex items-center px-2">
                                            <span className="text-gray-400">...</span>
                                        </li>
                                    )}
                                </>
                            )}

                            {/* Các trang xung quanh trang hiện tại */}
                            {[...Array(totalPages)].map((_, index) => {
                                const pageNum = index + 1;
                                if (
                                    pageNum === currentPage ||
                                    pageNum === currentPage - 1 ||
                                    pageNum === currentPage + 1 ||
                                    (currentPage <= 2 && pageNum <= 3) ||
                                    (currentPage >= totalPages - 1 && pageNum >= totalPages - 2)
                                ) {
                                    return (
                                        <li key={index}>
                                            <button
                                                onClick={() => paginate(pageNum)}
                                                className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${currentPage === pageNum
                                                    ? 'bg-blue-600 text-white shadow-lg'
                                                    : 'bg-white border border-gray-300 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        </li>
                                    );
                                }
                                return null;
                            })}

                            {/* Trang cuối */}
                            {currentPage < totalPages - 2 && (
                                <>
                                    {currentPage < totalPages - 3 && (
                                        <li className="flex items-center px-2">
                                            <span className="text-gray-400">...</span>
                                        </li>
                                    )}
                                    <li>
                                        <button
                                            onClick={() => paginate(totalPages)}
                                            className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 font-medium transition-all text-sm"
                                        >
                                            {totalPages}
                                        </button>
                                    </li>
                                </>
                            )}

                            <li>
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-sm text-sm"
                                >
                                    Sau
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}

            {/* Modal */}
            <EditFlightModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                formData={formData}
                onFormChange={handleFormChange}
                routes={routes}
                getRouteInfo={getRouteInfo}
                currentFlight={currentFlight}
                services={services}
                selectedServices={selectedServices}
                onServiceChange={handleServiceChange}
                aircraft={aircraft}
            />

            {/* Delay Modal */}
            <DelayFlightModal isOpen={isDelayModalOpen} onClose={handleDelayClose} onSubmit={handleDelaySubmit} delayData={delayData} onDelayDataChange={setDelayData} flights={flights} delayFlightId={delayFlightId} />

            {/* Cancel Modal */}
            <CancelFlightModal isOpen={isCancelModalOpen} onClose={handleCancelClose} onSubmit={handleCancelSubmit} cancelData={cancelData} onCancelDataChange={setCancelData} />

            {/* Flight Detail Modal */}
            <FlightDetailModal
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                flight={selectedFlight}
                getRouteInfo={getRouteInfo}
                showToast={showToast}
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

export default QuanLyChuyenBay;