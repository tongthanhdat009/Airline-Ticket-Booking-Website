import React, { useState, useEffect } from 'react';
import { FaChair, FaTimes, FaPlus, FaTrash, FaSave, FaMagic } from 'react-icons/fa';
import * as SoDoGheService from '../../../services/SoDoGheService';
import * as QLHangVeService from '../../../services/QLHangVeService';

const SeatLayoutEditor = ({ maMayBay, onClose, onSave }) => {
    const [seats, setSeats] = useState([]);
    const [hangVeList, setHangVeList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'form'
    const [showAutoGenerate, setShowAutoGenerate] = useState(false);

    // Auto-generate form state
    const [autoGenConfig, setAutoGenConfig] = useState({
        maHangVe: '',
        startRow: 1,
        endRow: 10,
        columns: ['A', 'B', 'C', 'D', 'E', 'F'],
        viTriGhe: 'GIỮA'
    });

    useEffect(() => {
        loadData();
    }, [maMayBay]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [seatsRes, hangVeRes] = await Promise.all([
                SoDoGheService.getSeatsByAircraft(maMayBay),
                QLHangVeService.getAll()
            ]);
            setSeats(seatsRes.data || []);
            setHangVeList(hangVeRes.data || []);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSeat = async (seatData) => {
        try {
            await SoDoGheService.addSeatToAircraft(maMayBay, seatData);
            await loadData();
            return true;
        } catch (error) {
            console.error('Lỗi khi thêm ghế:', error);
            alert(error.response?.data?.message || 'Không thể thêm ghế');
            return false;
        }
    };

    const handleUpdateSeat = async (maGhe, seatData) => {
        try {
            await SoDoGheService.updateSeat(maGhe, seatData);
            await loadData();
            return true;
        } catch (error) {
            console.error('Lỗi khi cập nhật ghế:', error);
            alert(error.response?.data?.message || 'Không thể cập nhật ghế');
            return false;
        }
    };

    const handleDeleteSeat = async (maGhe) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa ghế này?')) return;

        try {
            await SoDoGheService.deleteSeat(maGhe);
            await loadData();
        } catch (error) {
            console.error('Lỗi khi xóa ghế:', error);
            alert(error.response?.data?.message || 'Không thể xóa ghế');
        }
    };

    const handleDeleteAllSeats = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa TẤT CẢ ghế của máy bay này? Hành động này không thể hoàn tác!')) return;

        try {
            await SoDoGheService.deleteAllSeatsByAircraft(maMayBay);
            await loadData();
            alert('Đã xóa tất cả ghế thành công');
        } catch (error) {
            console.error('Lỗi khi xóa tất cả ghế:', error);
            alert(error.response?.data?.message || 'Không thể xóa tất cả ghế');
        }
    };

    const handleAutoGenerate = async () => {
        try {
            await SoDoGheService.autoGenerateSeats(maMayBay, [autoGenConfig]);
            await loadData();
            setShowAutoGenerate(false);
            alert('Tự động tạo sơ đồ ghế thành công!');
        } catch (error) {
            console.error('Lỗi khi tự động tạo sơ đồ ghế:', error);
            alert(error.response?.data?.message || 'Không thể tạo sơ đồ ghế');
        }
    };

    const getHangVeName = (maHangVe) => {
        const hv = hangVeList.find(h => h.maHangVe === maHangVe);
        return hv?.tenHangVe || 'Chưa phân loại';
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Chỉnh sửa sơ đồ ghế</h2>
                        <p className="text-purple-100 text-sm mt-1">Mã máy bay: #{maMayBay} | Số ghế hiện tại: {seats.length}</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                        <FaTimes size={24} />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                viewMode === 'grid'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            Lưới ghế
                        </button>
                        <button
                            onClick={() => {
                                setSelectedSeat({ maHangVe: hangVeList[0]?.maHangVe || '', viTriGhe: 'GIỮA' });
                                setViewMode('form');
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                        >
                            <FaPlus />
                            Thêm ghế
                        </button>
                        <button
                            onClick={() => setShowAutoGenerate(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                        >
                            <FaMagic />
                            Tự động tạo
                        </button>
                        <button
                            onClick={handleDeleteAllSeats}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                        >
                            <FaTrash />
                            Xóa tất cả
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
                    >
                        <FaSave />
                        Đóng
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {viewMode === 'grid' ? (
                        <SeatGridView
                            seats={seats}
                            hangVeList={hangVeList}
                            onSeatClick={(seat) => {
                                setSelectedSeat(seat);
                                setViewMode('form');
                            }}
                            onDeleteSeat={handleDeleteSeat}
                            getHangVeName={getHangVeName}
                        />
                    ) : (
                        <SeatForm
                            seat={selectedSeat}
                            hangVeList={hangVeList}
                            onSave={async (data) => {
                                const success = selectedSeat?.maGhe
                                    ? await handleUpdateSeat(selectedSeat.maGhe, data)
                                    : await handleAddSeat(data);
                                if (success) {
                                    setViewMode('grid');
                                    setSelectedSeat(null);
                                }
                            }}
                            onCancel={() => {
                                setViewMode('grid');
                                setSelectedSeat(null);
                            }}
                        />
                    )}
                </div>

                {/* Auto Generate Modal */}
                {showAutoGenerate && (
                    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
                                <h3 className="text-xl font-bold">Tự động tạo sơ đồ ghế</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Hạng vé</label>
                                    <select
                                        value={autoGenConfig.maHangVe}
                                        onChange={(e) => setAutoGenConfig({...autoGenConfig, maHangVe: parseInt(e.target.value)})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="">Chọn hạng vé</option>
                                        {hangVeList.map(hv => (
                                            <option key={hv.maHangVe} value={hv.maHangVe}>{hv.tenHangVe}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Hàng bắt đầu</label>
                                        <input
                                            type="number"
                                            value={autoGenConfig.startRow}
                                            onChange={(e) => setAutoGenConfig({...autoGenConfig, startRow: parseInt(e.target.value)})}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            min="1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Hàng kết thúc</label>
                                        <input
                                            type="number"
                                            value={autoGenConfig.endRow}
                                            onChange={(e) => setAutoGenConfig({...autoGenConfig, endRow: parseInt(e.target.value)})}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            min="1"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Cột (ngăn cách bằng dấu phẩy)</label>
                                    <input
                                        type="text"
                                        value={autoGenConfig.columns.join(',')}
                                        onChange={(e) => setAutoGenConfig({...autoGenConfig, columns: e.target.value.split(',').map(s => s.trim().toUpperCase())})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        placeholder="A,B,C,D,E,F"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Vị trí ghế</label>
                                    <select
                                        value={autoGenConfig.viTriGhe}
                                        onChange={(e) => setAutoGenConfig({...autoGenConfig, viTriGhe: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="CỬA SỜ">Cửa sổ</option>
                                        <option value="LỐI ĐI">Lối đi</option>
                                        <option value="GIỮA">Giữa</option>
                                    </select>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>Tổng số ghế sẽ tạo:</strong> {(autoGenConfig.endRow - autoGenConfig.startRow + 1) * autoGenConfig.columns.length}
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setShowAutoGenerate(false)}
                                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleAutoGenerate}
                                        disabled={!autoGenConfig.maHangVe}
                                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
                                    >
                                        Tạo ngay
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Grid View Component
const SeatGridView = ({ seats, hangVeList, onSeatClick, onDeleteSeat, getHangVeName }) => {
    const seatMap = {};
    const columns = new Set();

    seats.forEach(seat => {
        const row = seat.hang || 0;
        if (!seatMap[row]) seatMap[row] = {};
        seatMap[row][seat.cot] = seat;
        columns.add(seat.cot);
    });

    const sortedRows = Object.keys(seatMap).sort((a, b) => a - b);
    const sortedColumns = Array.from(columns).sort();

    return (
        <div className="bg-white rounded-lg shadow p-6">
            {seats.length === 0 ? (
                <div className="text-center py-16">
                    <FaChair className="text-gray-300 text-6xl mx-auto mb-4" />
                    <p className="text-gray-500 font-medium text-lg">Chưa có ghế nào</p>
                    <p className="text-gray-400 text-sm mt-2">Nhấn "Tự động tạo" để tạo sơ đồ ghế nhanh chóng</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <div className="min-w-max">
                        {sortedRows.map(row => (
                            <div key={row} className="flex items-center gap-2 mb-2">
                                <div className="w-20 flex-shrink-0 text-sm font-semibold text-gray-600">Hàng {row}</div>
                                {sortedColumns.map(col => {
                                    const seat = seatMap[row]?.[col];
                                    return (
                                        <div key={`${row}-${col}`} className="w-16 flex-shrink-0">
                                            {seat ? (
                                                <div
                                                    className={`relative group cursor-pointer border-2 rounded-lg p-2 transition-all ${
                                                        seat.viTriGhe === 'CỬA SỜ' ? 'bg-blue-100 border-blue-300' :
                                                        seat.viTriGhe === 'LỐI ĐI' ? 'bg-green-100 border-green-300' :
                                                        'bg-gray-100 border-gray-300'
                                                    } hover:shadow-md`}
                                                    onClick={() => onSeatClick(seat)}
                                                >
                                                    <div className="flex flex-col items-center">
                                                        <FaChair className="text-lg" />
                                                        <span className="text-xs font-bold mt-1">{seat.soGhe}</span>
                                                        <span className="text-xs text-gray-600">{getHangVeName(seat.maHangVe)}</span>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDeleteSeat(seat.maGhe);
                                                        }}
                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                                                    >
                                                        <FaTimes size={12} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 border-2 border-dashed border-gray-200 rounded-lg"></div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Form Component
const SeatForm = ({ seat, hangVeList, onSave, onCancel }) => {
    const [formData, setFormData] = useState(seat || {
        maHangVe: '',
        soGhe: '',
        viTriGhe: 'GIỮA',
        hang: 1,
        cot: 'A'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
                {seat?.maGhe ? 'Cập nhật ghế' : 'Thêm ghế mới'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Số ghế</label>
                    <input
                        type="text"
                        value={formData.soGhe}
                        onChange={(e) => setFormData({...formData, soGhe: e.target.value.toUpperCase()})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="VD: 1A"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Hạng vé</label>
                    <select
                        value={formData.maHangVe}
                        onChange={(e) => setFormData({...formData, maHangVe: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        required
                    >
                        <option value="">Chọn hạng vé</option>
                        {hangVeList.map(hv => (
                            <option key={hv.maHangVe} value={hv.maHangVe}>{hv.tenHangVe}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Hàng</label>
                        <input
                            type="number"
                            value={formData.hang}
                            onChange={(e) => setFormData({...formData, hang: parseInt(e.target.value)})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            min="1"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Cột</label>
                        <input
                            type="text"
                            value={formData.cot}
                            onChange={(e) => setFormData({...formData, cot: e.target.value.toUpperCase()})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            placeholder="A"
                            maxLength="2"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Vị trí ghế</label>
                    <select
                        value={formData.viTriGhe}
                        onChange={(e) => setFormData({...formData, viTriGhe: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="CỬA SỜ">Cửa sổ</option>
                        <option value="LỐI ĐI">Lối đi</option>
                        <option value="GIỮA">Giữa</option>
                    </select>
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                    >
                        {seat?.maGhe ? 'Cập nhật' : 'Thêm'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SeatLayoutEditor;
