import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaEye, FaUndo, FaCheck, FaTimes, FaCalendar } from 'react-icons/fa';
import Card from '../../components/QuanLy/CardChucNang';
import hoanTienApi from '../../services/hoanTienApi';
import Toast from '../../components/common/Toast';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import RefundDetailModal from '../../components/QuanLy/QuanLyHoanTien/RefundDetailModal';
import ViewToggleButton from '../../components/common/ViewToggleButton';
import CardView from '../../components/common/CardView';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import { useViewToggle } from '../../hooks/useViewToggle';
import HoanTienCard from '../../components/QuanLy/QuanLyHoanTien/HoanTienCard';

const QuanLyHoanTien = () => {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRefund, setSelectedRefund] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const itemsPerPage = 5;
    const { viewMode, setViewMode: handleViewChange } = useViewToggle('ql-hoan-tien-view', 'table');

    // States cho dữ liệu từ API
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [thongKe, setThongKe] = useState({
        tongYeuCau: 0,
        choXuLy: 0,
        daHoanTien: 0,
        daTuChoi: 0,
        tongTienDaHoan: 0,
        tongTienChoHoan: 0
    });

    // States cho Toast
    const [toast, setToast] = useState({
        isVisible: false,
        message: '',
        type: 'success'
    });

    // States cho ConfirmDialog
    const [confirmDialog, setConfirmDialog] = useState({
        isVisible: false,
        title: '',
        message: '',
        type: 'warning',
        confirmText: 'Xác nhận',
        onConfirm: null
    });

    // Toast handler
    const showToast = (message, type = 'success') => {
        setToast({ isVisible: true, message, type });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    // ConfirmDialog handlers
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

    // Load dữ liệu từ API
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Load danh sách hoàn tiền
            const response = await hoanTienApi.getHoanTienList({ search });
            if (response.success && response.data) {
                setRefunds(response.data);
            } else {
                setError(response.message || 'Không thể tải dữ liệu');
                showToast(response.message || 'Không thể tải dữ liệu', 'error');
            }

            // Load thống kê
            const thongKeResponse = await hoanTienApi.getThongKeHoanTien();
            if (thongKeResponse.success && thongKeResponse.data) {
                setThongKe(thongKeResponse.data);
            }
        } catch (err) {
            console.error('Error loading hoan tien:', err);
            const errorMsg = err.response?.data?.message || 'Lỗi khi tải dữ liệu';
            setError(errorMsg);
            showToast(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    }, [search]);

    // Load dữ liệu khi component mount hoặc search thay đổi
    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredRefunds = refunds;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRefunds.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRefunds.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleViewDetail = (refund) => {
        setSelectedRefund(refund);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedRefund(null);
    };

    // Xử lý duyệt hoàn tiền
    const handleApproveRefund = async (maHoanTien) => {
        hideConfirm();
        setActionLoading(true);
        try {
            const nguoiXuLy = 'admin';
            const response = await hoanTienApi.duyetHoanTien(maHoanTien, nguoiXuLy);
            
            if (response.success) {
                showToast('Duyệt hoàn tiền thành công!', 'success');
                await loadData();
            } else {
                showToast(response.message || 'Duyệt hoàn tiền thất bại', 'error');
            }
        } catch (err) {
            console.error('Error approving refund:', err);
            const errorMsg = err.response?.data?.message || 'Lỗi khi duyệt hoàn tiền';
            showToast(errorMsg, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // Hiển thị confirm dialog cho duyệt hoàn tiền
    const handleApproveConfirm = (maHoanTien) => {
        showConfirm(
            'Xác nhận duyệt hoàn tiền',
            'Bạn có chắc chắn muốn duyệt yêu cầu hoàn tiền này?',
            'success',
            'Duyệt hoàn tiền',
            () => handleApproveRefund(maHoanTien)
        );
    };

    // Xử lý từ chối hoàn tiền
    const handleRejectRefund = async (maHoanTien, lyDoTuChoi) => {
        if (!lyDoTuChoi || lyDoTuChoi.trim() === '') {
            showToast('Vui lòng nhập lý do từ chối', 'warning');
            return;
        }
        
        hideConfirm();
        setActionLoading(true);
        try {
            const nguoiXuLy = 'admin';
            const response = await hoanTienApi.tuChoiHoanTien(maHoanTien, nguoiXuLy, lyDoTuChoi);
            
            if (response.success) {
                showToast('Từ chối hoàn tiền thành công!', 'success');
                await loadData();
            } else {
                showToast(response.message || 'Từ chối hoàn tiền thất bại', 'error');
            }
        } catch (err) {
            console.error('Error rejecting refund:', err);
            const errorMsg = err.response?.data?.message || 'Lỗi khi từ chối hoàn tiền';
            showToast(errorMsg, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // Hiển thị prompt nhập lý do từ chối
    const handleRejectConfirm = (maHoanTien) => {
        showConfirm(
            'Xác nhận từ chối hoàn tiền',
            'Bạn có chắc chắn muốn từ chối yêu cầu hoàn tiền này? Vui lòng nhập lý do bên dưới.',
            'danger',
            'Từ chối',
            () => {
                hideConfirm();
                // Mở prompt để nhập lý do
                const lyDo = prompt('Vui lòng nhập lý do từ chối:');
                if (lyDo && lyDo.trim() !== '') {
                    handleRejectRefund(maHoanTien, lyDo);
                } else if (lyDo !== null) {
                    showToast('Lý do từ chối không được để trống', 'warning');
                }
            }
        );
    };

    const formatCurrency = (value) => {
        if (!value) return '0đ';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const getTrangThaiText = (trangThai) => {
        switch (trangThai) {
            case 'DA_HOAN_TIEN': return { text: 'Đã hoàn tiền', color: 'bg-green-100 text-green-700', icon: '✓' };
            case 'CHO_XU_LY': return { text: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700', icon: '⏱' };
            case 'TU_CHOI': return { text: 'Từ chối', color: 'bg-red-100 text-red-700', icon: '✕' };
            default: return { text: trangThai, color: 'bg-gray-100 text-gray-700', icon: '?' };
        }
    };

    const getPhuongThucText = (phuongThuc) => {
        switch (phuongThuc) {
            case 'VNPAY': return 'VNPay';
            case 'CHUYEN_KHOAN': return 'Chuyển khoản ngân hàng';
            case 'TIEN_MAT': return 'Tiền mặt';
            default: return phuongThuc || 'Chưa xác định';
        }
    };

    // Tính toán thống kê từ API data
    const totalRefundAmount = thongKe.tongTienDaHoan || 0;
    const pendingRefunds = thongKe.choXuLy || 0;
    const pendingRefundAmount = thongKe.tongTienChoHoan || 0;

    return (
        <Card title="Quản lý hoàn tiền">
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

            {/* Thống kê tổng quan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-linear-to-br from-amber-500 to-yellow-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Tổng yêu cầu</p>
                            <p className="text-3xl font-bold mt-2">{thongKe.tongYeuCau || 0}</p>
                        </div>
                        <FaUndo size={40} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-linear-to-br from-yellow-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Chờ xử lý</p>
                            <p className="text-3xl font-bold mt-2">{pendingRefunds}</p>
                        </div>
                        <FaUndo size={40} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-linear-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Đã hoàn tiền</p>
                            <p className="text-3xl font-bold mt-2">{thongKe.daHoanTien || 0}</p>
                        </div>
                        <FaCheck size={40} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-linear-to-br from-red-500 to-rose-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Đã từ chối</p>
                            <p className="text-3xl font-bold mt-2">{thongKe.daTuChoi || 0}</p>
                        </div>
                        <FaTimes size={40} className="opacity-80" />
                    </div>
                </div>
            </div>

            {/* Thông tin tổng tiền */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-linear-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-5">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-semibold text-amber-800">Tổng tiền đã hoàn</p>
                            <p className="text-2xl font-bold text-amber-600 mt-1">{formatCurrency(totalRefundAmount)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                            <FaUndo className="text-amber-600 text-xl" />
                        </div>
                    </div>
                </div>
                <div className="bg-linear-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-5">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-semibold text-orange-800">Tổng tiền chờ hoàn</p>
                            <p className="text-2xl font-bold text-orange-600 mt-1">{formatCurrency(pendingRefundAmount)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                            <FaCalendar className="text-orange-600 text-xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Thanh công cụ */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Tìm kiếm yêu cầu hoàn tiền..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm"
                    />
                    <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                </div>
                <ViewToggleButton
                    currentView={viewMode}
                    onViewChange={handleViewChange}
                    className="shrink-0"
                />
                <div className="flex gap-3 w-full md:w-auto">
                    <button 
                        onClick={loadData}
                        disabled={loading}
                        className="flex items-center gap-2 bg-linear-to-r from-amber-500 to-yellow-600 text-white px-5 py-3 rounded-lg hover:from-amber-600 hover:to-yellow-700 transition-all shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaCalendar />
                        <span className="hidden sm:inline">{loading ? 'Đang tải...' : 'Làm mới'}</span>
                    </button>
                </div>
            </div>

            {/* Loading và Error states */}
            {loading && (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
                </div>
            )}

            {error && !loading && (
                <div className="text-center py-12">
                    <FaTimes className="text-red-500 text-5xl mx-auto mb-4" />
                    <p className="text-red-500 font-medium">{error}</p>
                    <button 
                        onClick={loadData}
                        className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {/* View Mode: Card or Table */}
            {!loading && !error && (
                <>
                    {viewMode === 'grid' ? (
                        /* Card View */
                        <CardView
                            items={currentItems}
                            renderCard={(refund, index) => (
                                <HoanTienCard
                                    key={refund.maHoanTien || index}
                                    data={refund}
                                    onView={handleViewDetail}
                                    onApprove={(refund) => handleApproveConfirm(refund.maHoanTien)}
                                    onReject={(refund) => handleRejectConfirm(refund.maHoanTien)}
                                />
                            )}
                            emptyMessage="Không tìm thấy yêu cầu hoàn tiền nào."
                        />
                    ) : (
                        /* Table View */
                        <ResponsiveTable>
                            <table className="w-full text-sm">
                                <thead className="bg-linear-to-r from-slate-700 to-slate-800 text-white">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-semibold">Mã hoàn tiền</th>
                                        <th className="px-6 py-4 text-left font-semibold">Mã HĐ</th>
                                        <th className="px-6 py-4 text-left font-semibold">Khách hàng</th>
                                        <th className="px-6 py-4 text-left font-semibold">Email</th>
                                        <th className="px-6 py-4 text-left font-semibold">Ngày yêu cầu</th>
                                        <th className="px-6 py-4 text-right font-semibold">Số tiền hoàn</th>
                                        <th className="px-6 py-4 text-center font-semibold">PT hoàn</th>
                                        <th className="px-6 py-4 text-center font-semibold">Trạng thái</th>
                                        <th className="px-6 py-4 text-center font-semibold">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentItems.length > 0 ? (
                                        currentItems.map((ht, index) => {
                                            const status = getTrangThaiText(ht.trangThai);
                                            return (
                                                <tr key={ht.maHoanTien} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-amber-50 transition-colors`}>
                                                    <td className="px-6 py-4 font-bold text-amber-600">#{ht.maHoanTien}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                                                            {ht.maHoaDon}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{ht.hoTen}</p>
                                                            <p className="text-xs text-gray-500">{ht.soDienThoai}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-700">{ht.email}</td>
                                                    <td className="px-6 py-4 text-gray-700">{formatDateTime(ht.ngayYeuCau)}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-gray-900">{formatCurrency(ht.soTienHoan)}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-xs text-gray-600">{getPhuongThucText(ht.phuongThucHoan)}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                                                            {status.icon} {status.text}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-center items-center gap-2">
                                                            <button
                                                                onClick={() => handleViewDetail(ht)}
                                                                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                                title="Xem chi tiết"
                                                            >
                                                                <FaEye />
                                                            </button>
                                                            {ht.trangThai === 'CHO_XU_LY' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleApproveConfirm(ht.maHoanTien)}
                                                                        disabled={actionLoading}
                                                                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                                                                        title="Duyệt hoàn tiền"
                                                                    >
                                                                        <FaCheck />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleRejectConfirm(ht.maHoanTien)}
                                                                        disabled={actionLoading}
                                                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                                                        title="Từ chối"
                                                                    >
                                                                        <FaTimes />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="9" className="text-center py-12">
                                                <div className="flex flex-col items-center gap-3">
                                                    <FaUndo className="text-gray-300 text-5xl" />
                                                    <p className="text-gray-500 font-medium">Không tìm thấy yêu cầu hoàn tiền nào.</p>
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

            {/* Thanh phân trang */}
            {!loading && !error && filteredRefunds.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                    <span className="text-sm text-gray-600 font-medium">
                        Hiển thị <span className="font-bold text-amber-600">{indexOfFirstItem + 1}</span> đến <span className="font-bold text-amber-600">{Math.min(indexOfLastItem, filteredRefunds.length)}</span> của <span className="font-bold text-amber-600">{filteredRefunds.length}</span> kết quả
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
                                                ? 'bg-amber-600 text-white shadow-lg'
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

            {/* RefundDetailModal Component */}
            <RefundDetailModal
                isVisible={isDetailModalOpen}
                refund={selectedRefund}
                actionLoading={actionLoading}
                onClose={handleCloseDetailModal}
                onApprove={handleApproveConfirm}
                onReject={handleRejectConfirm}
                formatCurrency={formatCurrency}
                formatDateTime={formatDateTime}
                getTrangThaiText={getTrangThaiText}
                getPhuongThucText={getPhuongThucText}
            />
        </Card>
    );
};

export default QuanLyHoanTien;
