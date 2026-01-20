import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FaPlane, FaMagic, FaTrash, FaPlus, FaExpand, FaCompress, FaEdit, FaTimes } from 'react-icons/fa';
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

// Import constants
import { DEFAULT_CABIN_CONFIG } from '../../constants/aircraftConfig';

const ChinhSuaSoDoGhe = () => {
    const { maMayBay } = useParams();

    // Data states
    const [aircraft, setAircraft] = useState(null);
    const [seats, setSeats] = useState([]);
    const [hangVeList, setHangVeList] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI states
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [zoomLevel, setZoomLevel] = useState(100);
    const [showAutoGenerate, setShowAutoGenerate] = useState(false);
    const [showBulkEdit, setShowBulkEdit] = useState(false);
    const [showEditSeat, setShowEditSeat] = useState(false);
    const [showAddSeat, setShowAddSeat] = useState(false);
    const [editingSeat, setEditingSeat] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

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
            <div className="min-h-[calc(100vh-64px)] bg-gray-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
                    <p className="text-gray-600">Đang tải sơ đồ ghế...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-gray-100 flex flex-col">
            {/* Toast */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left - Seat Grid & Legend */}
                <div className="flex-1 flex flex-col bg-gray-50 min-w-0 overflow-hidden">
                    {/* Seat Grid Scrollable Area */}
                    <div className="flex-1 overflow-auto p-6">
                        {seats.length === 0 ? (
                            <div className="flex items-center justify-center min-h-full p-6">
                                <div className="text-center">
                                    <FaPlane className="text-gray-300 text-7xl mx-auto mb-4" />
                                    <p className="text-gray-500 font-semibold text-lg mb-2">Chưa có sơ đồ ghế</p>
                                    <p className="text-gray-400 text-sm mb-6">Sử dụng các chức năng ở bên phải để bắt đầu</p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                {/* Seat Grid with Zoom */}
                                <div
                                    className="transition-transform duration-200"
                                    style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                                >
                                    <SeatGridDisplay
                                        seats={seats}
                                        maxRow={seats.length > 0 ? Math.max(...seats.map(s => s.hang)) : 0}
                                        selectedSeats={selectedSeats}
                                        onSeatClick={handleSeatClick}
                                        onSeatRightClick={handleSeatRightClick}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right - Controls & Statistics */}
                <div className="w-96 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-l border-blue-100 flex flex-col overflow-hidden flex-shrink-0 shadow-2xl">
                    {/* Aircraft Info */}
                    <div className="p-5 border-b border-blue-200 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
                                <FaPlane className="text-white text-xl" />
                            </div>
                            <div>
                                <h2 className="font-bold text-white text-lg">{aircraft?.tenMayBay || `Máy bay #${maMayBay}`}</h2>
                                <p className="text-xs text-blue-100">{aircraft?.hangMayBay} | Số hiệu: {aircraft?.soHieu}</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions & Statistics - Scrollable */}
                    <div className="flex-1 overflow-auto p-4 space-y-4">
                        {/* Legend */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-blue-100">
                            <SeatLegend />
                        </div>
                        {/* Main Actions */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-blue-100">
                            <h3 className="text-xs font-bold text-blue-900 uppercase mb-3 tracking-wider">Chức năng chính</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setShowAutoGenerate(true)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                >
                                    <FaMagic className="text-sm" />
                                    Tự động tạo
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingSeat(null);
                                        setShowAddSeat(true);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                >
                                    <FaPlus className="text-sm" />
                                    Thêm ghế
                                </button>
                                <button
                                    onClick={handleDeleteAllSeats}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-lg hover:from-rose-600 hover:to-red-700 font-medium transition-all shadow-md hover:shadow-lg border border-rose-300"
                                >
                                    <FaTrash className="text-sm" />
                                    Xóa tất cả
                                </button>
                            </div>
                        </div>

                        {/* Selection Actions */}
                        {selectedSeats.length > 0 && (
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-300 shadow-lg animate-pulse-slow">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                                            {selectedSeats.length}
                                        </div>
                                        <span className="text-amber-900 text-sm font-bold">ghế đã chọn</span>
                                    </div>
                                    <button
                                        onClick={clearSelection}
                                        className="p-1.5 text-amber-700 hover:bg-amber-200 rounded-lg transition-colors"
                                        title="Bỏ chọn tất cả"
                                    >
                                        <FaTimes className="text-sm" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setShowBulkEdit(true)}
                                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 text-sm font-medium transition-all shadow-md"
                                    >
                                        <FaEdit size={12} />
                                        Sửa hàng loạt
                                    </button>
                                    <button
                                        onClick={handleDeleteSelectedSeats}
                                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-lg hover:from-rose-600 hover:to-red-700 text-sm font-medium transition-all shadow-md"
                                    >
                                        <FaTrash size={12} />
                                        Xóa đã chọn
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Zoom Controls */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-blue-100">
                            <h3 className="text-xs font-bold text-blue-900 uppercase mb-3 tracking-wider">Thu phóng</h3>
                            <div className="flex items-center justify-center gap-3">
                                <button
                                    onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                                    className="p-2.5 text-blue-700 hover:bg-blue-100 rounded-lg transition-all hover:shadow-md"
                                    title="Thu nhỏ"
                                >
                                    <FaCompress />
                                </button>
                                <span className="text-lg font-bold text-blue-900 min-w-[60px] text-center">{zoomLevel}%</span>
                                <button
                                    onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
                                    className="p-2.5 text-blue-700 hover:bg-blue-100 rounded-lg transition-all hover:shadow-md"
                                    title="Phóng to"
                                >
                                    <FaExpand />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
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
