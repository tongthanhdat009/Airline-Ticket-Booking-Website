import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaPlane, FaChevronLeft, FaMagic, FaTrash, FaPlus, FaExpand, FaCompress } from 'react-icons/fa';
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
import { CABIN_COLORS, DEFAULT_CABIN_CONFIG } from '../../constants/aircraftConfig';

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
            console.error('Lá»—i khi táº£i dá»¯ liá»‡u:', error);
            showToast('KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u', 'error');
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
            case 'duplicate':
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
            showToast('ÄÃ£ thÃªm gháº¿ thÃ nh cÃ´ng');
        } catch (error) {
            console.error('Lá»—i khi thÃªm gháº¿:', error);
            showToast(error.response?.data?.message || 'KhÃ´ng thá»ƒ thÃªm gháº¿', 'error');
        }
    };

    const handleUpdateSeat = async (maGhe, seatData) => {
        try {
            await SoDoGheService.updateSeat(maGhe, seatData);
            await loadData();
            setShowEditSeat(false);
            setEditingSeat(null);
            setSelectedSeats([]);
            showToast('ÄÃ£ cáº­p nháº­t gháº¿ thÃ nh cÃ´ng');
        } catch (error) {
            console.error('Lá»—i khi cáº­p nháº­t gháº¿:', error);
            showToast(error.response?.data?.message || 'KhÃ´ng thá»ƒ cáº­p nháº­t gháº¿', 'error');
        }
    };
    const handleDeleteSeat = async (maGhe) => {
        try {
            await SoDoGheService.deleteSeat(maGhe);
            await loadData();
            setSelectedSeats(prev => prev.filter(s => s.maGhe !== maGhe));
            showToast('ÄÃ£ xÃ³a gháº¿ thÃ nh cÃ´ng');
        } catch (error) {
            console.error('Lá»—i khi xÃ³a gháº¿:', error);
            showToast(error.response?.data?.message || 'KhÃ´ng thá»ƒ xÃ³a gháº¿', 'error');
        }
    };

    const handleDeleteSelectedSeats = async () => {
        if (selectedSeats.length === 0) return;
        if (!window.confirm(`Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a ${selectedSeats.length} gháº¿ Ä‘Ã£ chá»n?`)) return;

        try {
            for (const seat of selectedSeats) {
                await SoDoGheService.deleteSeat(seat.maGhe);
            }
            await loadData();
            setSelectedSeats([]);
            showToast(`ÄÃ£ xÃ³a ${selectedSeats.length} gháº¿ thÃ nh cÃ´ng`);
        } catch (error) {
            console.error('Lá»—i khi xÃ³a gháº¿:', error);
            showToast('CÃ³ lá»—i xáº£y ra khi xÃ³a gháº¿', 'error');
        }
    };

    const handleDeleteAllSeats = async () => {
        if (!window.confirm('Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a Táº¤T Cáº¢ gháº¿? HÃ nh Ä‘á»™ng nÃ y khÃ´ng thá»ƒ hoÃ n tÃ¡c!')) return;

        try {
            await SoDoGheService.deleteAllSeatsByAircraft(maMayBay);
            await loadData();
            setSelectedSeats([]);
            showToast('ÄÃ£ xÃ³a táº¥t cáº£ gháº¿ thÃ nh cÃ´ng');
        } catch (error) {
            console.error('Lá»—i khi xÃ³a táº¥t cáº£ gháº¿:', error);
            showToast(error.response?.data?.message || 'KhÃ´ng thá»ƒ xÃ³a táº¥t cáº£ gháº¿', 'error');
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
            showToast(`ÄÃ£ cáº­p nháº­t ${selectedSeats.length} gháº¿ thÃ nh cÃ´ng`);
        } catch (error) {
            console.error('Lá»—i khi cáº­p nháº­t gháº¿:', error);
            showToast('CÃ³ lá»—i xáº£y ra khi cáº­p nháº­t gháº¿', 'error');
        }
    };

    // Auto-generate handlers
    const handleAutoGenerate = async () => {
        try {
            const validConfigs = cabinConfigs.filter(c => c.maHangVe);
            if (validConfigs.length === 0) {
                showToast('Vui lÃ²ng chá»n háº¡ng vÃ© cho Ã­t nháº¥t má»™t cabin', 'error');
                return;
            }

            // Transform configs to API format
            const apiConfigs = validConfigs.flatMap(config => {
                const allColumns = [...config.columnsLeft, ...config.columnsRight];
                return [{
                    maHangVe: config.maHangVe,
                    startRow: config.startRow,
                    endRow: config.endRow,
                    columns: allColumns,
                    viTriGhe: 'GIá»®A' // Auto-detect based on column position
                }];
            });

            const response = await SoDoGheService.autoGenerateSeats(maMayBay, apiConfigs);
            await loadData();
            setShowAutoGenerate(false);
            showToast(`ÄÃ£ táº¡o ${response.data?.length || 0} gháº¿ thÃ nh cÃ´ng!`);
        } catch (error) {
            console.error('Lá»—i khi tá»± Ä‘á»™ng táº¡o gháº¿:', error);
            showToast(error.response?.data?.message || 'KhÃ´ng thá»ƒ táº¡o sÆ¡ Ä‘á»“ gháº¿', 'error');
        }
    };

    const applyTemplate = (templateKey) => {
        const template = AIRCRAFT_TEMPLATES[templateKey];
        if (!template) return;

        const newConfigs = template.cabins.map((cabin, idx) => ({
            id: idx + 1,
            cabinName: cabin.name,
            maHangVe: hangVeList.find(hv =>
                hv.tenHangVe?.toLowerCase().includes(cabin.name.toLowerCase().split(' ')[0])
            )?.maHangVe || '',
            startRow: cabin.startRow,
            endRow: cabin.endRow,
            columnsLeft: cabin.columnsLeft,
            columnsRight: cabin.columnsRight,
            columnsMiddle: cabin.columnsMiddle || [],
            exitRows: template.exitRows?.filter(r => r >= cabin.startRow && r <= cabin.endRow) || [],
            backgroundColor: cabin.backgroundColor
        }));

        setCabinConfigs(newConfigs);
    };

    const addCabinConfig = () => {
        const lastConfig = cabinConfigs[cabinConfigs.length - 1];
        setCabinConfigs([...cabinConfigs, {
            id: Date.now(),
            cabinName: 'New Cabin',
            maHangVe: '',
            startRow: lastConfig ? lastConfig.endRow + 1 : 1,
            endRow: lastConfig ? lastConfig.endRow + 5 : 5,
            columnsLeft: ['A', 'B', 'C'],
            columnsRight: ['D', 'E', 'F'],
            exitRows: [],
            backgroundColor: '#FAFAFA'
        }]);
    };

    const removeCabinConfig = (id) => {
        setCabinConfigs(cabinConfigs.filter(c => c.id !== id));
    };

    const updateCabinConfig = (id, field, value) => {
        setCabinConfigs(cabinConfigs.map(c =>
            c.id === id ? { ...c, [field]: value } : c
        ));
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

    const getAllRows = useCallback(() => {
        const rows = new Set();
        seats.forEach(seat => rows.add(seat.hang));
        return Array.from(rows).sort((a, b) => a - b);
    }, [seats]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
                    <p className="text-gray-600">Äang táº£i sÆ¡ Ä‘á»“ gháº¿...</p>
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
                                Quáº£n lÃ½ MÃ¡y Bay
                            </Link>
                            <FaChevronRight className="text-gray-400 text-xs" />
                            <span className="text-gray-700 font-medium">
                                {aircraft?.tenMayBay || `MÃ¡y bay #${maMayBay}`}
                            </span>
                            <FaChevronRight className="text-gray-400 text-xs" />
                            <span className="text-sky-600 font-semibold">SÆ¡ Ä‘á»“ gháº¿</span>
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
                                ThÃªm gháº¿
                            </button>
                            
                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1">
                                <button
                                    onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg"
                                    title="Thu nhá»"
                                >
                                    <FaCompress />
                                </button>
                                <span className="text-sm text-gray-600 min-w-[50px] text-center">{zoomLevel}%</span>
                                <button
                                    onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
                                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg"
                                    title="PhÃ³ng to"
                                >
                                    <FaExpand />
                                </button>
                            </div>

                            <button
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                title={isFullscreen ? 'ThoÃ¡t toÃ n mÃ n hÃ¬nh' : 'ToÃ n mÃ n hÃ¬nh'}
                            >
                                {isFullscreen ? <FaCompress /> : <FaExpand />}
                            </button>
                            
                            <button
                                onClick={() => navigate('/admin/dashboard/MayBay')}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                <FaChevronLeft />
                                Quay láº¡i
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex h-[calc(100vh-64px)]">
                {/* Seat Grid Area */}
                <div className="flex-1 overflow-auto bg-gray-50 p-6">
                    {/* Toolbar */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowAutoGenerate(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium transition-all shadow-md"
                                >
                                    <FaMagic />
                                    Tá»± Ä‘á»™ng táº¡o
                                </button>
                                <button
                                    onClick={handleDeleteAllSeats}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-medium transition-colors"
                                >
                                    <FaTrash />
                                    XÃ³a táº¥t cáº£
                                </button>
                            </div>

                            {/* Selection actions */}
                            {selectedSeats.length > 0 && (
                                <div className="flex items-center gap-3 bg-sky-50 px-4 py-2 rounded-lg border border-sky-200">
                                    <span className="text-sky-700 font-medium">
                                        ÄÃ£ chá»n: {selectedSeats.length} gháº¿
                                    </span>
                                    <button
                                        onClick={() => setShowBulkEdit(true)}
                                        className="flex items-center gap-1 px-3 py-1 bg-sky-600 text-white rounded-lg hover:bg-sky-700 text-sm font-medium"
                                    >
                                        <FaEdit size={12} />
                                        Sá»­a hÃ ng loáº¡t
                                    </button>
                                    <button
                                        onClick={handleDeleteSelectedSeats}
                                        className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                                    >
                                        <FaTrash size={12} />
                                        XÃ³a
                                    </button>
                                    <button
                                        onClick={clearSelection}
                                        className="p-1 text-gray-500 hover:text-gray-700"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>ðŸ’¡ Click Ä‘á»ƒ chá»n</span>
                                <span>|</span>
                                <span>Click 2 láº§n Ä‘á»ƒ sá»­a</span>
                                <span>|</span>
                                <span>Chuá»™t pháº£i Ä‘á»ƒ menu</span>
                                <span>|</span>
                                <span>Ctrl+Click: chá»n nhiá»u</span>
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <SeatLegend />

                    {/* Aircraft Seat Map */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Cockpit Header */}
                        <div className="bg-gradient-to-r from-sky-600 to-blue-700 text-white p-4 text-center">
                            <div className="flex items-center justify-center gap-3">
                                <FaPlane className="text-2xl" />
                                <span className="text-lg font-bold">Äáº¦U MÃY BAY / COCKPIT</span>
                            </div>
                            {aircraft && (
                                <p className="text-sky-100 text-sm mt-1">
                                    {aircraft.tenMayBay} - {aircraft.hangMayBay} | Sá»‘ hiá»‡u: {aircraft.soHieu}
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
                                    <p className="text-gray-500 font-medium text-lg">ChÆ°a cÃ³ sÆ¡ Ä‘á»“ gháº¿</p>
                                    <p className="text-gray-400 text-sm mt-2 mb-6">Nháº¥n "Tá»± Ä‘á»™ng táº¡o" Ä‘á»ƒ báº¯t Ä‘áº§u</p>
                                    <button
                                        onClick={() => setShowAutoGenerate(true)}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                                    >
                                        <FaMagic className="inline mr-2" />
                                        Tá»± Ä‘á»™ng táº¡o sÆ¡ Ä‘á»“ gháº¿
                                    </button>
                                </div>
                            ) : (
                                <SeatGridDisplay
                                    seats={seats}
                                    maxRow={seats.length > 0 ? Math.max(...seats.map(s => s.hang)) : 0}
                                    allColumns={getAllColumns()}
                                    selectedSeats={selectedSeats}
                                    onSeatClick={handleSeatClick}
                                    onSeatRightClick={handleSeatRightClick}
                                    zoomLevel={zoomLevel}
                                />
                            )}
                        </div>

                        {/* Tail */}
                        {seats.length > 0 && (
                            <div className="bg-gradient-to-r from-gray-400 to-gray-500 text-white p-3 text-center">
                                <span className="text-sm font-medium">ðŸš» PHÃA SAU MÃY BAY / TAIL</span>
                            </div>
                        )}
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
                    hangVeList={hangVeList}
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
                    hangVeList={hangVeList}
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
