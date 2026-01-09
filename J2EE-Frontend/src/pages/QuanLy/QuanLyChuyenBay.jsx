import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../components/QuanLy/CardChucNang';
import { FaPlus, FaSearch, FaPlane, FaEdit, FaEye } from 'react-icons/fa';
import { getAllChuyenBay, createChuyenBay, updateChuyenBay, updateTrangThaiChuyenBay, updateDelay, updateCancel, addGheToChuyenBay } from '../../services/QLChuyenBayService';
import { getAllTuyenBay } from '../../services/QLTuyenBayService';
import { getActiveSanBay } from '../../services/QLSanBayService';
import { getAllServices } from '../../services/QLDichVuService';
import { getDichVuByChuyenBay, addDichVuToChuyenBay, removeDichVuFromChuyenBay } from '../../services/QLDichVuChuyenBayService';
import EditFlightModal from '../../components/QuanLy/QuanLyChuyenBay/EditFlightModal';
import DelayFlightModal from '../../components/QuanLy/QuanLyChuyenBay/DelayFlightModal';
import CancelFlightModal from '../../components/QuanLy/QuanLyChuyenBay/CancelFlightModal';
import FlightDetailModal from '../../components/QuanLy/QuanLyChuyenBay/FlightDetailModal';
import Toast from '../../components/common/Toast';
import useWebSocket from '../../hooks/useWebSocket';

const QuanLyChuyenBay = () => {
    // --- STATE MANAGEMENT ---
    const [airports, setAirports] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [flights, setFlights] = useState([]);
    const [services, setServices] = useState([]);
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
    const itemsPerPage = 5;

    // --- WEBSOCKET ---
    const { flightUpdates, latestUpdate, isConnected, clearLatestUpdate } = useWebSocket();

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [flightsRes, routesRes, airportsRes, servicesRes] = await Promise.all([
                    getAllChuyenBay(),
                    getAllTuyenBay(),
                    getActiveSanBay(),
                    getAllServices()
                ]);
                setFlights(flightsRes.data.data || []);
                setRoutes(routesRes.data.data || []);
                setAirports(airportsRes.data.data || []);
                setServices(servicesRes.data?.data || servicesRes.data || []);
            } catch (err) {
                setError('Không thể tải dữ liệu. Vui lòng thử lại.');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- WEBSOCKET UPDATE HANDLER ---
    useEffect(() => {
        if (!latestUpdate) return;

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
    }, [latestUpdate, flights, clearLatestUpdate]);

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
    const handleOpenModal = async (flight = null) => {
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
            maTuyenBay: flight.tuyenBay?.maTuyenBay || '' 
        } : {
            maTuyenBay: '', soHieuChuyenBay: '', ngayDi: '', gioDi: '', ngayDen: '', gioDen: ''
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
            
            // Tạo chuyến bay đi
            const flightDataDi = {
                soHieuChuyenBay: restFormData.soHieuChuyenBay,
                ngayDi: restFormData.ngayDi,
                gioDi: restFormData.gioDi,
                ngayDen: restFormData.ngayDen,
                gioDen: restFormData.gioDen,
                tuyenBay: selectedRoute
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
                
                // Thêm ghế cho chuyến bay đi
                if (maChuyenBayDi) {
                    const soGheData = {
                        soGheEconomy: parseInt(formData.soGheEconomy) || 0,
                        soGheDeluxe: parseInt(formData.soGheDeluxe) || 0,
                        soGheBusiness: parseInt(formData.soGheBusiness) || 0,
                        soGheFirstClass: parseInt(formData.soGheFirstClass) || 0
                    };
                    await addGheToChuyenBay(maChuyenBayDi, soGheData);
                }
                
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
                        tuyenBay: returnRoute
                    };
                    
                    const createdFlightVe = await createChuyenBay(flightDataVe);
                    const maChuyenBayVe = createdFlightVe.data?.data?.maChuyenBay || createdFlightVe.data?.maChuyenBay;
                    
                    // Thêm ghế cho chuyến bay về
                    if (maChuyenBayVe) {
                        const soGheData = {
                            soGheEconomy: parseInt(formData.soGheEconomy) || 0,
                            soGheDeluxe: parseInt(formData.soGheDeluxe) || 0,
                            soGheBusiness: parseInt(formData.soGheBusiness) || 0,
                            soGheFirstClass: parseInt(formData.soGheFirstClass) || 0
                        };
                        await addGheToChuyenBay(maChuyenBayVe, soGheData);
                    }
                    
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
            const flightsRes = await getAllChuyenBay();
            setFlights(flightsRes.data.data || []);
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
            const flightsRes = await getAllChuyenBay();
            setFlights(flightsRes.data.data || []);
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
            const flightsRes = await getAllChuyenBay();
            setFlights(flightsRes.data.data || []);
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
            const flightsRes = await getAllChuyenBay();
            setFlights(flightsRes.data.data || []);
            handleCancelClose();
        } catch (err) {
            console.error('Error canceling flight:', err);
            showToast('Có lỗi xảy ra khi hủy chuyến bay. Vui lòng thử lại.', 'error');
        }
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
            <div className="mb-4 flex items-center gap-2 text-sm">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className={isConnected ? 'text-green-700' : 'text-gray-500'}>
                    {isConnected ? 'Kết nối real-time đang hoạt động' : 'Không có kết nối real-time'}
                </span>
            </div>

            {/* Thanh công cụ */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
                <div className="flex w-full md:w-auto gap-2">
                    <div className="relative flex-grow md:w-80">
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
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold w-full md:w-auto"
                >
                    <FaPlus />
                    <span>Thêm chuyến bay</span>
                </button>
            </div>

            {/* Bảng dữ liệu */}
            <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left font-semibold">Số hiệu</th>
                                <th scope="col" className="px-6 py-4 text-left font-semibold">Tuyến bay</th>
                                <th scope="col" className="px-6 py-4 text-left font-semibold">Thời gian đi</th>
                                <th scope="col" className="px-6 py-4 text-left font-semibold">Thời gian đến</th>
                                <th scope="col" className="px-6 py-4 text-center font-semibold">Trạng thái</th>
                                <th scope="col" className="px-6 py-4 text-center font-semibold">Lý do</th>
                                <th scope="col" className="px-6 py-4 text-center font-semibold">Thời gian đi thực tế</th>
                                <th scope="col" className="px-6 py-4 text-center font-semibold">Thời gian đến thực tế</th>
                                <th scope="col" className="px-6 py-4 text-center font-semibold">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentItems.map((flight, index) => (
                                <tr key={flight.maChuyenBay} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                                    <td className="px-6 py-4 font-bold text-blue-600">{flight.soHieuChuyenBay}</td>
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
                                    <td className="px-6 py-4 text-center">
                                        <select
                                            value={flight.trangThai}
                                            onChange={(e) => handleStatusChange(flight.maChuyenBay, e.target.value)}
                                            disabled={['Đã hủy', 'Đã bay'].includes(flight.trangThai)}
                                            className={`px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${['Đã hủy', 'Đã bay'].includes(flight.trangThai) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                        >
                                            {flight.trangThai === 'Delay' ? (
                                                <>
                                                    <option value="Delay">Delay</option>
                                                    <option value="Đã bay">Đã bay</option>
                                                    <option value="Đã hủy">Đã hủy</option>
                                                </>
                                            ) : flight.trangThai === 'Đã hủy' ? (
                                                <>
                                                    <option value="Đã hủy">Đã hủy</option>
                                                    <option value="Đã bay">Đã bay</option>
                                                </>
                                            ) : (
                                                <>
                                                    <option value="Đang mở bán">Đang mở bán</option>
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
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button 
                                                onClick={() => handleOpenDetailModal(flight)}
                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" 
                                                title="Xem chi tiết"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleOpenModal(flight)} 
                                                disabled={['Đã hủy', 'Đã bay'].includes(flight.trangThai)}
                                                className={`p-2 rounded-lg transition-colors ${['Đã hủy', 'Đã bay'].includes(flight.trangThai) ? 'text-gray-400 cursor-not-allowed' : 'text-orange-600 hover:bg-orange-100'}`} 
                                                title={flight.trangThai === 'Delay' ? 'Cập nhật thông tin delay' : 'Chỉnh sửa'}
                                            >
                                                <FaEdit size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredFlights.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="text-center py-12">
                                        <div className="flex flex-col items-center gap-3">
                                            <FaPlane className="text-gray-300 text-5xl" />
                                            <p className="text-gray-500 font-medium">Không tìm thấy chuyến bay nào.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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
                                                className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                                                    currentPage === pageNum
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
        </Card>
    );
};

export default QuanLyChuyenBay;