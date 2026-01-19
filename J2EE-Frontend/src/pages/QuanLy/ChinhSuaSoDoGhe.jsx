import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaPlane, FaChevronLeft, FaMagic, FaTrash, FaPlus, FaExpand, FaCompress, FaEdit, FaTimes, FaChevronRight } from 'react-icons/fa';
import * as SoDoGheService from '../../services/SoDoGheService';
import * as QLHangVeService from '../../services/QLHangVeService';
import * as QLMayBayService from '../../services/QLMayBayService';
import Toast from '../../components/common/Toast';

// Import separated components
import SeatGridDisplay from '../../components/QuanLy/QuanLyMayBay/SeatGrid/SeatGridDisplay';
import SeatLegend from '../../components/QuanLy/QuanLyMayBay/SeatGrid/SeatLegend';
import EditSeatModal from '../../components/QuanLy/QuanLyMayBay/SeatGrid/EditSeatModal';
import AddSeatModal from '../../components/QuanLy/QuanLyMayBay/SeatGrid/AddSeatModal';
import BulkEditModal from '../../components/QuanLy/QuanLyMayBay/SeatGrid/BulkEditModal';
import AutoGenerateModal from '../../components/QuanLy/QuanLyMayBay/SeatGrid/AutoGenerateModal';
import ContextMenu from '../../components/QuanLy/QuanLyMayBay/SeatGrid/ContextMenu';
import SeatStatistics from '../../components/QuanLy/QuanLyMayBay/SeatGrid/SeatStatistics';

// Import constants
import { DEFAULT_CABIN_CONFIG } from '../../constants/aircraftConfig';

const ChinhSuaSoDoGhe = () => {
    const { maMayBay } = useParams();
    const navigate = useNavigate();

    // Data states
    const [aircraft, setAircraft] = useState(null);
    const [seats, setSeats] = useState([]);
    const [hangVeList, setHangVeList] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI states
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(100);
    const [showAutoGenerate, setShowAutoGenerate] = useState(false);
    const [showBulkEdit, setShowBulkEdit] = useState(false);
    const [showEditSeat, setShowEditSeat] = useState(false);
    const [showAddSeat, setShowAddSeat] = useState(false);
    const [editingSeat, setEditingSeat] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Auto-generate multi-cabin config
    const [cabinConfigs, setCabinConfigs] = useState([DEFAULT_CABIN_CONFIG]);

    // Bulk edit state
    const [bulkEditData, setBulkEditData] = useState({
        maHangVe: '',
        viTriGhe: ''
    });

    // Load data
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [seatsRes, hangVeRes, aircraftRes] = await Promise.all([
                SoDoGheService.getSeatsByAircraft(maMayBay),
                QLHangVeService.getAllHangVeAdmin(),
                QLMayBayService.getMayBayById(maMayBay)
            ]);
            setSeats(seatsRes.data || []);
            setHangVeList(hangVeRes.data || []);
            setAircraft(aircraftRes.data || null);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            showToast('Không thể tải dữ liệu', 'error');
        } finally {
            setLoading(false);
        }
    }, [maMayBay]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Toast functions
    const showToast = (message, type = 'success') => {
        setToast({ isVisible: true, message, type });
    };

    const hideToast = () => {
        setToast({ ...toast, isVisible: false });
    };

    // Seat selection handlers
    const handleSeatClick = (seat, event) => {
        event.stopPropagation();
        setContextMenu(null);
        
        if (event.ctrlKey || event.metaKey) {
            // Multi-select with Ctrl/Cmd
            setSelectedSeats(prev =>
                prev.find(s => s.maGhe === seat.maGhe)
                    ? prev.filter(s => s.maGhe !== seat.maGhe)
                    : [...prev, seat]
            );
        } else if (event.shiftKey && selectedSeats.length > 0) {
            // Range select with Shift
            const lastSelected = selectedSeats[selectedSeats.length - 1];
            const seatMap = getSeatMap();
            const minRow = Math.min(lastSelected.hang, seat.hang);
            const maxRow = Math.max(lastSelected.hang, seat.hang);
            const columns = getAllColumns();
            const minColIdx = Math.min(columns.indexOf(lastSelected.cot), columns.indexOf(seat.cot));
            const maxColIdx = Math.max(columns.indexOf(lastSelected.cot), columns.indexOf(seat.cot));

            const newSelection = [];
            for (let row = minRow; row <= maxRow; row++) {
                for (let colIdx = minColIdx; colIdx <= maxColIdx; colIdx++) {
                    const col = columns[colIdx];
                    if (seatMap[row]?.[col]) {
                        newSelection.push(seatMap[row][col]);
                    }
                }
            }
            setSelectedSeats(newSelection);
        } else {
            // Check for double-click to edit
            if (selectedSeats.length === 1 && selectedSeats[0].maGhe === seat.maGhe) {
                // Double-click effect - open edit modal
                setEditingSeat(seat);
                setShowEditSeat(true);
            } else {
                // Single select
                setSelectedSeats([seat]);
            }
        }
    };

    const handleSeatRightClick = (seat, event) => {
        event.preventDefault();
        event.stopPropagation();
        setSelectedSeats([seat]);
        setContextMenu({
            x: event.clientX,
            y: event.clientY,
            seat: seat
        });
    };

    const handleContextMenuAction = (action, seat) => {
        setContextMenu(null);
        switch (action) {
            case 'edit':
                setEditingSeat(seat);
                setShowEditSeat(true);
                break;
            case 'delete':
                handleDeleteSeat(seat.maGhe);
                break;
            case 'duplicate': {
                // Open add modal with pre-filled data
                const newSeatData = {
                    ...seat,
                    soGhe: '',
                    hang: seat.hang + 1,
                    cot: seat.cot
                };
                setEditingSeat(newSeatData);
                setShowAddSeat(true);
                break;
            }
            default:
                break;
        }
    };

    const clearSelection = () => {
        setSelectedSeats([]);
    };

    // Close context menu when clicking outside
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    // Seat operations
    const handleAddSeat = async (seatData) => {
        try {
            await SoDoGheService.addSeatToAircraft(maMayBay, seatData);
            await loadData();
            setShowAddSeat(false);
            showToast('Đã thêm ghế thành công');
        } catch (error) {
            console.error('Lỗi khi thêm ghế:', error);
            showToast(error.response?.data?.message || 'Không thể thêm ghế', 'error');
        }
    };

    const handleUpdateSeat = async (maGhe, seatData) => {
        try {
            await SoDoGheService.updateSeat(maGhe, seatData);
            await loadData();
            setShowEditSeat(false);
            setEditingSeat(null);
            setSelectedSeats([]);
            showToast('Đã cập nhật ghế thành công');
        } catch (error) {
            console.error('Lỗi khi cập nhật ghế:', error);
            showToast(error.response?.data?.message || 'Không thể cập nhật ghế', 'error');
        }
    };
    const handleDeleteSeat = async (maGhe) => {
        try {
            await SoDoGheService.deleteSeat(maGhe);
            await loadData();
            setSelectedSeats(prev => prev.filter(s => s.maGhe !== maGhe));
            showToast('Đã xóa ghế thành công');
        } catch (error) {
            console.error('Lỗi khi xóa ghế:', error);
            showToast(error.response?.data?.message || 'Không thể xóa ghế', 'error');
        }
    };

    const handleDeleteSelectedSeats = async () => {
        if (selectedSeats.length === 0) return;
        if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedSeats.length} ghế đã chọn?`)) return;

        try {
            for (const seat of selectedSeats) {
                await SoDoGheService.deleteSeat(seat.maGhe);
            }
            await loadData();
            setSelectedSeats([]);
            showToast(`Đã xóa ${selectedSeats.length} ghế thành công`);
        } catch (error) {
            console.error('Lỗi khi xóa ghế:', error);
            showToast('Có lỗi xảy ra khi xóa ghế', 'error');
        }
    };

    const handleDeleteAllSeats = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa TẤT CẢ ghế? Hành động này không thể hoàn tác!')) return;

        try {
            await SoDoGheService.deleteAllSeatsByAircraft(maMayBay);
            await loadData();
            setSelectedSeats([]);
            showToast('Đã xóa tất cả ghế thành công');
        } catch (error) {
            console.error('Lỗi khi xóa tất cả ghế:', error);
            showToast(error.response?.data?.message || 'Không thể xóa tất cả ghế', 'error');
        }
    };

    const handleBulkUpdate = async () => {
        if (selectedSeats.length === 0) return;

        try {
            for (const seat of selectedSeats) {
                const updateData = { ...seat };
                if (bulkEditData.maHangVe) updateData.maHangVe = bulkEditData.maHangVe;
                if (bulkEditData.viTriGhe) updateData.viTriGhe = bulkEditData.viTriGhe;
                await SoDoGheService.updateSeat(seat.maGhe, updateData);
            }
            await loadData();
            setSelectedSeats([]);
            setShowBulkEdit(false);
            showToast(`Đã cập nhật ${selectedSeats.length} ghế thành công`);
        } catch (error) {
            console.error('Lỗi khi cập nhật ghế:', error);
            showToast('Có lỗi xảy ra khi cập nhật ghế', 'error');
        }
    };

    // Auto-generate handlers
    const handleAutoGenerate = async () => {
        try {
            const validConfigs = cabinConfigs.filter(c => c.maHangVe);
            if (validConfigs.length === 0) {
                showToast('Vui lòng chọn hạng vé cho ít nhất một cabin', 'error');
                return;
            }

            // Transform configs to API format with proper seat position detection
            const apiConfigs = validConfigs.flatMap(config => {
                const seats = [];
                
                // Helper function to determine seat position
                const getSeatPosition = (colIndex, totalCols, section) => {
                    if (section === 'left') {
                        if (colIndex === 0) return 'WINDOW'; // First column on left = window
                        if (colIndex === config.columnsLeft.length - 1) return 'AISLE'; // Last column on left = aisle
                        return 'MIDDLE';
                    } else if (section === 'middle') {
                        // All middle section seats are aisle or middle (no window)
                        if (colIndex === 0 || colIndex === config.columnsMiddle.length - 1) return 'AISLE';
                        return 'MIDDLE';
                    } else if (section === 'right') {
                        if (colIndex === 0) return 'AISLE'; // First column on right = aisle
                        if (colIndex === config.columnsRight.length - 1) return 'WINDOW'; // Last column on right = window
                        return 'MIDDLE';
                    }
                    return 'MIDDLE';
                };
                
                // Process left columns - send each column as separate config
                config.columnsLeft.forEach((col, idx) => {
                    seats.push({
                        maHangVe: config.maHangVe,
                        startRow: config.startRow,
                        endRow: config.endRow,
                        columns: [col], // Backend expects array
                        viTriGhe: getSeatPosition(idx, config.columnsLeft.length, 'left')
                    });
                });
                
                // Process middle columns (if any)
                if (config.columnsMiddle && config.columnsMiddle.length > 0) {
                    config.columnsMiddle.forEach((col, idx) => {
                        seats.push({
                            maHangVe: config.maHangVe,
                            startRow: config.startRow,
                            endRow: config.endRow,
                            columns: [col], // Backend expects array
                            viTriGhe: getSeatPosition(idx, config.columnsMiddle.length, 'middle')
                        });
                    });
                }
                
                // Process right columns
                config.columnsRight.forEach((col, idx) => {
                    seats.push({
                        maHangVe: config.maHangVe,
                        startRow: config.startRow,
                        endRow: config.endRow,
                        columns: [col], // Backend expects array
                        viTriGhe: getSeatPosition(idx, config.columnsRight.length, 'right')
                    });
                });
                
                return seats;
            });

            const response = await SoDoGheService.autoGenerateSeats(maMayBay, apiConfigs);
            await loadData();
            setShowAutoGenerate(false);
            showToast(`Đã tạo ${response.data?.length || 0} ghế thành công!`);
        } catch (error) {
            console.error('Lỗi khi tự động tạo ghế:', error);
            showToast(error.response?.data?.message || 'Không thể tạo sơ đồ ghế', 'error');
        }
    };

    // Helper functions
    const getSeatMap = useCallback(() => {
        const seatMap = {};
        seats.forEach(seat => {
            if (!seatMap[seat.hang]) seatMap[seat.hang] = {};
            seatMap[seat.hang][seat.cot] = seat;
        });
        return seatMap;
    }, [seats]);

    const getAllColumns = useCallback(() => {
        const columns = new Set();
        seats.forEach(seat => columns.add(seat.cot));
        return Array.from(columns).sort();
    }, [seats]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
                    <p className="text-gray-600">Đang tải sơ đồ ghế...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-gray-100 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
            {/* Toast */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />

            {/* Header with Breadcrumb */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm">
                            <Link to="/admin/dashboard/MayBay" className="text-gray-500 hover:text-sky-600 transition-colors">
                                Quản lý Máy Bay
                            </Link>
                            <FaChevronRight className="text-gray-400 text-xs" />
                            <span className="text-gray-700 font-medium">
                                {aircraft?.tenMayBay || `Máy bay #${maMayBay}`}
                            </span>
                            <FaChevronRight className="text-gray-400 text-xs" />
                            <span className="text-sky-600 font-semibold">Sơ đồ ghế</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setEditingSeat(null);
                                    setShowAddSeat(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors shadow-md"
                            >
                                <FaPlus />
                                Thêm ghế
                            </button>
                            
                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1">
                                <button
                                    onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg"
                                    title="Thu nhỏ"
                                >
                                    <FaCompress />
                                </button>
                                <span className="text-sm text-gray-600 min-w-[50px] text-center">{zoomLevel}%</span>
                                <button
                                    onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
                                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg"
                                    title="Phóng to"
                                >
                                    <FaExpand />
                                </button>
                            </div>

                            <button
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                            >
                                {isFullscreen ? <FaCompress /> : <FaExpand />}
                            </button>
                            
                            <button
                                onClick={() => navigate('/admin/dashboard/MayBay')}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                <FaChevronLeft />
                                Quay lại
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex h-[calc(100vh-64px)]">
                {/* Seat Grid Area */}
                <div className="flex-1 overflow-auto bg-gray-50">
                    {/* Toolbar Container - Modern Layout */}
                    <div className="sticky top-0 z-10 bg-gray-50 pt-4 px-6 pb-2 space-y-3">
                        {/* Primary Actions Bar */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center justify-center gap-3">
                                <button
                                    onClick={() => setShowAutoGenerate(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium transition-all shadow-md hover:shadow-lg"
                                >
                                    <FaMagic />
                                    Tự động tạo
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingSeat(null);
                                        setShowAddSeat(true);
                                    }}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors shadow-md hover:shadow-lg"
                                >
                                    <FaPlus />
                                    Thêm ghế
                                </button>
                                <button
                                    onClick={handleDeleteAllSeats}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors border border-red-200 shadow-sm hover:shadow-md"
                                >
                                    <FaTrash />
                                    Xóa tất cả
                                </button>
                            </div>
                        </div>

                        {/* Selection Actions Bar - Only shown when seats are selected */}
                        {selectedSeats.length > 0 && (
                            <div className="bg-sky-50 rounded-xl border border-sky-200 p-3 animate-slideDown">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                                {selectedSeats.length}
                                            </div>
                                            <span className="text-sky-700 font-semibold">ghế đã chọn</span>
                                        </div>
                                        <div className="h-6 w-px bg-sky-200"></div>
                                        <button
                                            onClick={() => setShowBulkEdit(true)}
                                            className="flex items-center gap-1.5 px-4 py-1.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 text-sm font-medium transition-colors"
                                        >
                                            <FaEdit size={12} />
                                            Sửa hàng loạt
                                        </button>
                                        <button
                                            onClick={handleDeleteSelectedSeats}
                                            className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
                                        >
                                            <FaTrash size={12} />
                                            Xóa đã chọn
                                        </button>
                                    </div>
                                    <button
                                        onClick={clearSelection}
                                        className="p-2 text-sky-600 hover:bg-sky-100 rounded-lg transition-colors"
                                        title="Bỏ chọn tất cả"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Help/Tips Bar */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg px-4 py-2 border border-amber-200">
                            <div className="flex items-center justify-center gap-4 text-xs text-amber-900">
                                <span className="flex items-center gap-1">
                                    <span className="font-semibold">💡 Click</span> để chọn
                                </span>
                                <span className="text-amber-300">•</span>
                                <span className="flex items-center gap-1">
                                    <span className="font-semibold">Double-click</span> để sửa
                                </span>
                                <span className="text-amber-300">•</span>
                                <span className="flex items-center gap-1">
                                    <span className="font-semibold">Right-click</span> menu tùy chọn
                                </span>
                                <span className="text-amber-300">•</span>
                                <span className="flex items-center gap-1">
                                    <span className="font-semibold">Ctrl+Click</span> chọn nhiều
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="px-6 pb-6 pt-4">
                        {/* Legend */}
                        <SeatLegend />

                        {/* Aircraft Seat Map */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-4">
                        {/* Cockpit Header */}
                        <div className="bg-gradient-to-r from-sky-600 to-blue-700 text-white p-4 text-center">
                            <div className="flex items-center justify-center gap-3">
                                <FaPlane className="text-2xl" />
                                <span className="text-lg font-bold">ĐẦU MÁY BAY / COCKPIT</span>
                            </div>
                            {aircraft && (
                                <p className="text-sky-100 text-sm mt-1">
                                    {aircraft.tenMayBay} - {aircraft.hangMayBay} | Số hiệu: {aircraft.soHieu}
                                </p>
                            )}
                        </div>

                            {/* Seat Grid */}
                            <div
                                className="p-6 overflow-auto"
                                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                            >
                                {seats.length === 0 ? (
                                    <div className="text-center py-16">
                                        <FaPlane className="text-gray-300 text-6xl mx-auto mb-4" />
                                        <p className="text-gray-500 font-medium text-lg">Chưa có sơ đồ ghế</p>
                                        <p className="text-gray-400 text-sm mt-2 mb-6">Nhấn "Tự động tạo" để bắt đầu</p>
                                        <button
                                            onClick={() => setShowAutoGenerate(true)}
                                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                                        >
                                            <FaMagic className="inline mr-2" />
                                            Tự động tạo sơ đồ ghế
                                        </button>
                                    </div>
                                ) : (
                                    <SeatGridDisplay
                                        seats={seats}
                                        maxRow={seats.length > 0 ? Math.max(...seats.map(s => s.hang)) : 0}
                                        selectedSeats={selectedSeats}
                                        onSeatClick={handleSeatClick}
                                        onSeatRightClick={handleSeatRightClick}
                                    />
                                )}
                            </div>

                            {/* Tail */}
                            {seats.length > 0 && (
                                <div className="bg-gradient-to-r from-gray-400 to-gray-500 text-white p-3 text-center">
                                    <span className="text-sm font-medium">🚻 PHÍA SAU MÁY BAY / TAIL</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Statistics */}
                <SeatStatistics
                    seats={seats}
                    hangVeList={hangVeList}
                    sidebarCollapsed={sidebarCollapsed}
                    setSidebarCollapsed={setSidebarCollapsed}
                />
            </div>

            {/* Auto Generate Modal */}
            {showAutoGenerate && (
                <AutoGenerateModal
                    cabinConfigs={cabinConfigs}
                    setCabinConfigs={setCabinConfigs}
                    hangVeList={hangVeList}
                    onGenerate={handleAutoGenerate}
                    onClose={() => setShowAutoGenerate(false)}
                />
            )}
            {/* Edit Seat Modal */}
            {showEditSeat && editingSeat && (
                <EditSeatModal
                    seat={editingSeat}
                    seats={seats}
                    onSave={handleUpdateSeat}
                    onClose={() => {
                        setShowEditSeat(false);
                        setEditingSeat(null);
                    }}
                />
            )}

            {/* Add Seat Modal */}
            {showAddSeat && (
                <AddSeatModal
                    initialData={editingSeat}
                    seats={seats}
                    onSave={handleAddSeat}
                    onClose={() => {
                        setShowAddSeat(false);
                        setEditingSeat(null);
                    }}
                />
            )}

            {/* Context Menu */}
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    seat={contextMenu.seat}
                    onAction={handleContextMenuAction}
                />
            )}

            {/* Bulk Edit Modal */}
            {showBulkEdit && (
                <BulkEditModal
                    selectedCount={selectedSeats.length}
                    bulkEditData={bulkEditData}
                    setBulkEditData={setBulkEditData}
                    hangVeList={hangVeList}
                    onSave={handleBulkUpdate}
                    onClose={() => setShowBulkEdit(false)}
                />
            )}
        </div>
    );
};

export default ChinhSuaSoDoGhe;
