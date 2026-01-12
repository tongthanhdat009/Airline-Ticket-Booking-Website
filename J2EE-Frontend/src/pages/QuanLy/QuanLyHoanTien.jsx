import React, { useState } from 'react';
import { FaSearch, FaEye, FaUndo, FaCheck, FaTimes, FaCalendar } from 'react-icons/fa';
import Card from '../../components/QuanLy/CardChucNang';

const QuanLyHoanTien = () => {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRefund, setSelectedRefund] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const itemsPerPage = 5;

    // Dữ liệu mẫu hard code
    const [refunds, setRefunds] = useState([
        {
            maHoanTien: 'HT001',
            maHoaDon: 'HD001',
            maDatVe: 'DV001',
            hoTen: 'Nguyễn Văn A',
            email: 'nguyenvana@email.com',
            soDienThoai: '0901234567',
            ngayYeuCau: '2025-01-10T15:30:00',
            lyDo: 'Hủy chuyến bay do lý do cá nhân',
            soTienHoan: 3500000,
            trangThai: 'CHO_XU_LY',
            phuongThucHoan: 'CHUYEN_KHOAN',
            taiKhoanHoan: '1234567890 - Vietcombank',
            nguoiXuLy: null,
            ngayXuLy: null
        },
        {
            maHoanTien: 'HT002',
            maHoaDon: 'HD002',
            maDatVe: 'DV003',
            hoTen: 'Trần Thị B',
            email: 'tranthib@email.com',
            soDienThoai: '0912345678',
            ngayYeuCau: '2025-01-09T10:20:00',
            lyDo: 'Chuyến bay bị hủy bởi hãng hàng không',
            soTienHoan: 8500000,
            trangThai: 'DA_HOAN_TIEN',
            phuongThucHoan: 'VNPAY',
            taiKhoanHoan: 'VNPAY - 0987654321',
            nguoiXuLy: 'admin',
            ngayXuLy: '2025-01-09T14:00:00'
        },
        {
            maHoanTien: 'HT003',
            maHoaDon: 'HD004',
            maDatVe: 'DV004',
            hoTen: 'Lê Văn C',
            email: 'levanc@email.com',
            soDienThoai: '0923456789',
            ngayYeuCau: '2025-01-08T09:15:00',
            lyDo: 'Thay đổi lịch trình đột xuất',
            soTienHoan: 5400000,
            trangThai: 'TU_CHOI',
            phuongThucHoan: 'CHUYEN_KHOAN',
            taiKhoanHoan: '9876543210 - BIDV',
            nguoiXuLy: 'admin',
            ngayXuLy: '2025-01-08T11:30:00',
            lyDoTuChoi: 'Đã quá thời hạn hoàn tiền theo quy định'
        },
        {
            maHoanTien: 'HT004',
            maHoaDon: 'HD005',
            maDatVe: 'DV002',
            hoTen: 'Phạm Thị D',
            email: 'phamthid@email.com',
            soDienThoai: '0934567890',
            ngayYeuCau: '2025-01-11T16:45:00',
            lyDo: 'Khách hàng đổi ý không muốn bay',
            soTienHoan: 12000000,
            trangThai: 'CHO_XU_LY',
            phuongThucHoan: 'VNPAY',
            taiKhoanHoan: 'VNPAY - 0912345678',
            nguoiXuLy: null,
            ngayXuLy: null
        },
        {
            maHoanTien: 'HT005',
            maHoaDon: 'HD006',
            maDatVe: 'DV005',
            hoTen: 'Hoàng Văn E',
            email: 'hoangvane@email.com',
            soDienThoai: '0945678901',
            ngayYeuCau: '2025-01-07T08:00:00',
            lyDo: 'Sức khỏe không cho phép bay',
            soTienHoan: 28000000,
            trangThai: 'DA_HOAN_TIEN',
            phuongThucHoan: 'CHUYEN_KHOAN',
            taiKhoanHoan: '1122334455 - Techcombank',
            nguoiXuLy: 'admin',
            ngayXuLy: '2025-01-07T15:00:00'
        }
    ]);

    const filteredRefunds = refunds.filter(ht =>
        ht.maHoanTien?.toLowerCase().includes(search.toLowerCase()) ||
        ht.hoTen?.toLowerCase().includes(search.toLowerCase()) ||
        ht.email?.toLowerCase().includes(search.toLowerCase()) ||
        ht.maHoaDon?.toLowerCase().includes(search.toLowerCase()) ||
        ht.maDatVe?.toLowerCase().includes(search.toLowerCase())
    );

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

    const handleApproveRefund = (maHoanTien) => {
        if (window.confirm('Bạn có chắc chắn muốn duyệt yêu cầu hoàn tiền này?')) {
            setRefunds(refunds.map(ht =>
                ht.maHoanTien === maHoanTien
                    ? {
                        ...ht,
                        trangThai: 'DA_HOAN_TIEN',
                        nguoiXuLy: 'admin',
                        ngayXuLy: new Date().toISOString()
                    }
                    : ht
            ));
        }
    };

    const handleRejectRefund = (maHoanTien) => {
        const reason = prompt('Vui lòng nhập lý do từ chối:');
        if (reason) {
            setRefunds(refunds.map(ht =>
                ht.maHoanTien === maHoanTien
                    ? {
                        ...ht,
                        trangThai: 'TU_CHOI',
                        nguoiXuLy: 'admin',
                        ngayXuLy: new Date().toISOString(),
                        lyDoTuChoi: reason
                    }
                    : ht
            ));
        }
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
            default: return phuongThuc;
        }
    };

    // Tính toán thống kê
    const totalRefundAmount = refunds
        .filter(ref => ref.trangThai === 'DA_HOAN_TIEN')
        .reduce((sum, ref) => sum + ref.soTienHoan, 0);

    const pendingRefunds = refunds.filter(ref => ref.trangThai === 'CHO_XU_LY').length;
    const pendingRefundAmount = refunds
        .filter(ref => ref.trangThai === 'CHO_XU_LY')
        .reduce((sum, ref) => sum + ref.soTienHoan, 0);

    return (
        <Card title="Quản lý hoàn tiền">
            {/* Thống kê tổng quan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Tổng yêu cầu</p>
                            <p className="text-3xl font-bold mt-2">{refunds.length}</p>
                        </div>
                        <FaUndo size={40} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Chờ xử lý</p>
                            <p className="text-3xl font-bold mt-2">{pendingRefunds}</p>
                        </div>
                        <FaUndo size={40} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Đã hoàn tiền</p>
                            <p className="text-3xl font-bold mt-2">{refunds.filter(ref => ref.trangThai === 'DA_HOAN_TIEN').length}</p>
                        </div>
                        <FaCheck size={40} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Đã từ chối</p>
                            <p className="text-3xl font-bold mt-2">{refunds.filter(ref => ref.trangThai === 'TU_CHOI').length}</p>
                        </div>
                        <FaTimes size={40} className="opacity-80" />
                    </div>
                </div>
            </div>

            {/* Thông tin tổng tiền */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-5">
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
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-5">
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
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-5 py-3 rounded-lg hover:from-amber-600 hover:to-yellow-700 transition-all shadow-lg hover:shadow-xl font-semibold">
                        <FaCalendar />
                        <span className="hidden sm:inline">Lọc theo ngày</span>
                    </button>
                </div>
            </div>

            {/* Bảng dữ liệu */}
            <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white">
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
                                                                onClick={() => handleApproveRefund(ht.maHoanTien)}
                                                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                                                title="Duyệt hoàn tiền"
                                                            >
                                                                <FaCheck />
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectRefund(ht.maHoanTien)}
                                                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
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
                </div>
            </div>

            {/* Thanh phân trang */}
            {filteredRefunds.length > itemsPerPage && (
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

            {/* Modal chi tiết hoàn tiền */}
            {isDetailModalOpen && selectedRefund && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white p-6 rounded-t-xl sticky top-0">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold">Chi tiết yêu cầu hoàn tiền</h2>
                                    <p className="text-sm opacity-90 mt-1">Mã hoàn tiền: {selectedRefund.maHoanTien}</p>
                                </div>
                                <button
                                    onClick={handleCloseDetailModal}
                                    className="text-white hover:text-gray-200 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Thông tin khách hàng */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-amber-600 rounded-full"></div>
                                    Thông tin khách hàng
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Họ tên</p>
                                        <p className="font-medium text-gray-900">{selectedRefund.hoTen}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Email</p>
                                        <p className="font-medium text-gray-900">{selectedRefund.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Số điện thoại</p>
                                        <p className="font-medium text-gray-900">{selectedRefund.soDienThoai}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Ngày yêu cầu</p>
                                        <p className="font-medium text-gray-900">{formatDateTime(selectedRefund.ngayYeuCau)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Thông tin hoàn tiền */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-amber-600 rounded-full"></div>
                                    Thông tin hoàn tiền
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div className="md:col-span-2">
                                        <p className="text-xs text-gray-500 font-semibold">Lý do hoàn tiền</p>
                                        <p className="font-medium text-gray-900">{selectedRefund.lyDo}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Số tiền hoàn</p>
                                        <p className="font-bold text-lg text-amber-600">{formatCurrency(selectedRefund.soTienHoan)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Phương thức hoàn</p>
                                        <p className="font-medium text-gray-900">{getPhuongThucText(selectedRefund.phuongThucHoan)}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-xs text-gray-500 font-semibold">Tài khoản nhận hoàn tiền</p>
                                        <p className="font-medium text-gray-900">{selectedRefund.taiKhoanHoan}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Thông tin xử lý */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-amber-600 rounded-full"></div>
                                    Thông tin xử lý
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Trạng thái</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${getTrangThaiText(selectedRefund.trangThai).color}`}>
                                            {getTrangThaiText(selectedRefund.trangThai).icon} {getTrangThaiText(selectedRefund.trangThai).text}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Người xử lý</p>
                                        <p className="font-medium text-gray-900">{selectedRefund.nguoiXuLy || 'Chưa xử lý'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Ngày xử lý</p>
                                        <p className="font-medium text-gray-900">{formatDateTime(selectedRefund.ngayXuLy)}</p>
                                    </div>
                                    {selectedRefund.lyDoTuChoi && (
                                        <div className="md:col-span-2">
                                            <p className="text-xs text-gray-500 font-semibold">Lý do từ chối</p>
                                            <p className="font-medium text-red-600">{selectedRefund.lyDoTuChoi}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Nút hành động */}
                            {selectedRefund.trangThai === 'CHO_XU_LY' && (
                                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={() => {
                                            handleRejectRefund(selectedRefund.maHoanTien);
                                            handleCloseDetailModal();
                                        }}
                                        className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold transition-colors flex items-center gap-2"
                                    >
                                        <FaTimes />
                                        Từ chối
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleApproveRefund(selectedRefund.maHoanTien);
                                            handleCloseDetailModal();
                                        }}
                                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 font-semibold transition-all shadow-lg flex items-center gap-2"
                                    >
                                        <FaCheck />
                                        Duyệt hoàn tiền
                                    </button>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={handleCloseDetailModal}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default QuanLyHoanTien;
