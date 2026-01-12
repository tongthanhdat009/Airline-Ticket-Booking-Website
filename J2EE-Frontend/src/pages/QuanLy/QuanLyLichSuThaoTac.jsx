import React, { useState } from 'react';
import { FaSearch, FaEye, FaHistory, FaFilter } from 'react-icons/fa';
import Card from '../../components/QuanLy/CardChucNang';

const QuanLyLichSuThaoTac = () => {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedLog, setSelectedLog] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [filterLoaiThaoTac, setFilterLoaiThaoTac] = useState('');
    const [filterBangAnhHuong, setFilterBangAnhHuong] = useState('');
    const itemsPerPage = 5;

    // Dữ liệu mẫu hard code theo schema audit_log
    const [auditLogs] = useState([
        {
            maLog: 1,
            loaiThaoTac: 'CAP_NHAT',
            bangAnhHuong: 'chuyenbay',
            maBanGhi: 123,
            nguoiThucHien: 'admin@airline.com',
            loaiTaiKhoan: 'ADMIN',
            duLieuCu: '{"trangThai": "DANG_LIEN_LAC", "gioBay": "2025-01-10 08:00:00"}',
            duLieuMoi: '{"trangThai": "HOAN_TAT", "gioBay": "2025-01-10 10:30:00"}',
            moTa: 'Cập nhật trạng thái chuyến bay từ Đang liên lạc sang Hoàn tất',
            diaChiIP: '192.168.1.100',
            thoiGian: '2025-01-10T10:35:00'
        },
        {
            maLog: 2,
            loaiThaoTac: 'HUY_VE',
            bangAnhHuong: 'datcho',
            maBanGhi: 456,
            nguoiThucHien: 'customer@gmail.com',
            loaiTaiKhoan: 'CUSTOMER',
            duLieuCu: '{"trangThai": "DA_DAT", "soGhe": "12A"}',
            duLieuMoi: '{"trangThai": "DA_HUY", "soGhe": "12A"}',
            moTa: 'Khách hàng hủy vé đặt chỗ',
            diaChiIP: '103.45.67.89',
            thoiGian: '2025-01-10T09:15:00'
        },
        {
            maLog: 3,
            loaiThaoTac: 'THEM_MOI',
            bangAnhHuong: 'sanbay',
            maBanGhi: 50,
            nguoiThucHien: 'admin@airline.com',
            loaiTaiKhoan: 'ADMIN',
            duLieuCu: null,
            duLieuMoi: '{"maSanBay": 50, "tenSanBay": "Sân bay Quốc tế Đà Nẵng", "maIATA": "DAD", "maICAO": "VVDN", "thanhPho": "Đà Nẵng", "quocGia": "Việt Nam"}',
            moTa: 'Thêm mới sân bay Đà Nẵng vào hệ thống',
            diaChiIP: '192.168.1.100',
            thoiGian: '2025-01-10T08:30:00'
        },
        {
            maLog: 4,
            loaiThaoTac: 'DOI_GIO_BAY',
            bangAnhHuong: 'chuyenbay',
            maBanGhi: 124,
            nguoiThucHien: 'admin@airline.com',
            loaiTaiKhoan: 'ADMIN',
            duLieuCu: '{"gioBay": "2025-01-15 14:00:00", "lyDo": "Thời tiết xấu"}',
            duLieuMoi: '{"gioBay": "2025-01-15 16:30:00", "lyDo": "Thời tiết xấu"}',
            moTa: 'Đổi giờ bay do điều kiện thời tiết xấu',
            diaChiIP: '192.168.1.101',
            thoiGian: '2025-01-09T15:20:00'
        },
        {
            maLog: 5,
            loaiThaoTac: 'CHECK_IN',
            bangAnhHuong: 've',
            maBanGhi: 789,
            nguoiThucHien: 'customer@gmail.com',
            loaiTaiKhoan: 'CUSTOMER',
            duLieuCu: '{"trangThaiCheckIn": "CHUA_CHECK_IN"}',
            duLieuMoi: '{"trangThaiCheckIn": "DA_CHECK_IN", "gioCheckIn": "2025-01-09T07:30:00"}',
            moTa: 'Khách hàng thực hiện check-in online',
            diaChiIP: '103.45.67.90',
            thoiGian: '2025-01-09T07:30:00'
        },
        {
            maLog: 6,
            loaiThaoTac: 'HOAN_TIEN',
            bangAnhHuong: 'hoadon',
            maBanGhi: 301,
            nguoiThucHien: 'admin@airline.com',
            loaiTaiKhoan: 'ADMIN',
            duLieuCu: '{"trangThai": "DA_THANH_TOAN", "soTien": 3500000}',
            duLieuMoi: '{"trangThai": "DA_HOAN_TIEN", "soTienHoan": 3500000, "nguyenNhan": "Hủy chuyến"}',
            moTa: 'Xử lý hoàn tiền cho hóa đơn #HD001 - hủy chuyến bay',
            diaChiIP: '192.168.1.100',
            thoiGian: '2025-01-09T11:00:00'
        },
        {
            maLog: 7,
            loaiThaoTac: 'CAP_NHAT',
            bangAnhHuong: 'taikhoanadmin',
            maBanGhi: 5,
            nguoiThucHien: 'superadmin@airline.com',
            loaiTaiKhoan: 'ADMIN',
            duLieuCu: '{"vaiTro": "STAFF", "trangThai": "ACTIVE"}',
            duLieuMoi: '{"vaiTro": "MANAGER", "trangThai": "ACTIVE"}',
            moTa: 'Nâng cấp vai trò tài khoản admin từ STAFF lên MANAGER',
            diaChiIP: '192.168.1.200',
            thoiGian: '2025-01-09T10:15:00'
        },
        {
            maLog: 8,
            loaiThaoTac: 'DOI_CHUYEN_BAY',
            bangAnhHuong: 'datcho',
            maBanGhi: 457,
            nguoiThucHien: 'customer@gmail.com',
            loaiTaiKhoan: 'CUSTOMER',
            duLieuCu: '{"maChuyenBayDi": 123, "ngayDi": "2025-01-20"}',
            duLieuMoi: '{"maChuyenBayDi": 125, "ngayDi": "2025-01-21", "phiDoi": 500000}',
            moTa: 'Khách hàng đổi chuyến bay, chịu phí đổi vé 500,000đ',
            diaChiIP: '103.45.67.89',
            thoiGian: '2025-01-08T16:45:00'
        },
        {
            maLog: 9,
            loaiThaoTac: 'XOA',
            bangAnhHuong: 'khuyenmai',
            maBanGhi: 15,
            nguoiThucHien: 'admin@airline.com',
            loaiTaiKhoan: 'ADMIN',
            duLieuCu: '{"maKhuyenMai": 15, "tenKhuyenMai": "Giảm giá 30%", "trangThai": "ACTIVE"}',
            duLieuMoi: null,
            moTa: 'Xóa khuyến mãi "Giảm giá 30%" khỏi hệ thống',
            diaChiIP: '192.168.1.100',
            thoiGian: '2025-01-08T14:20:00'
        },
        {
            maLog: 10,
            loaiThaoTac: 'CAP_NHAT',
            bangAnhHuong: 'maybay',
            maBanGhi: 8,
            nguoiThucHien: 'admin@airline.com',
            loaiTaiKhoan: 'ADMIN',
            duLieuCu: '{"trangThai": "ACTIVE", "soGhePhoThong": 180}',
            duLieuMoi: '{"trangThai": "MAINTENANCE", "soGhePhoThong": 180, "lyDo": "Bảo dưỡng định kỳ"}',
            moTa: 'Chuyển máy bay sang trạng thái bảo dưỡng',
            diaChiIP: '192.168.1.101',
            thoiGian: '2025-01-08T09:00:00'
        }
    ]);

    const filteredLogs = auditLogs.filter(log => {
        const matchSearch =
            log.moTa?.toLowerCase().includes(search.toLowerCase()) ||
            log.nguoiThucHien?.toLowerCase().includes(search.toLowerCase()) ||
            log.bangAnhHuong?.toLowerCase().includes(search.toLowerCase()) ||
            log.maLog.toString().includes(search);

        const matchLoaiThaoTac = !filterLoaiThaoTac || log.loaiThaoTac === filterLoaiThaoTac;
        const matchBangAnhHuong = !filterBangAnhHuong || log.bangAnhHuong === filterBangAnhHuong;

        return matchSearch && matchLoaiThaoTac && matchBangAnhHuong;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleViewDetail = (log) => {
        setSelectedLog(log);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedLog(null);
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const getLoaiThaoTacText = (loai) => {
        switch (loai) {
            case 'THEM_MOI': return { text: 'Thêm mới', color: 'bg-green-100 text-green-700' };
            case 'CAP_NHAT': return { text: 'Cập nhật', color: 'bg-blue-100 text-blue-700' };
            case 'XOA': return { text: 'Xóa', color: 'bg-red-100 text-red-700' };
            case 'HUY_VE': return { text: 'Hủy vé', color: 'bg-orange-100 text-orange-700' };
            case 'DOI_GIO_BAY': return { text: 'Đổi giờ bay', color: 'bg-yellow-100 text-yellow-700' };
            case 'DOI_CHUYEN_BAY': return { text: 'Đổi chuyến bay', color: 'bg-purple-100 text-purple-700' };
            case 'CHECK_IN': return { text: 'Check-in', color: 'bg-teal-100 text-teal-700' };
            case 'HOAN_TIEN': return { text: 'Hoàn tiền', color: 'bg-pink-100 text-pink-700' };
            default: return { text: loai, color: 'bg-gray-100 text-gray-700' };
        }
    };

    const getLoaiTaiKhoanText = (loai) => {
        switch (loai) {
            case 'ADMIN': return { text: 'Admin', color: 'bg-indigo-100 text-indigo-700' };
            case 'CUSTOMER': return { text: 'Khách hàng', color: 'bg-cyan-100 text-cyan-700' };
            default: return { text: loai, color: 'bg-gray-100 text-gray-700' };
        }
    };

    // Lấy danh sách các loại thao tác và bảng ảnh hưởng để lọc
    const loaiThaoTacList = [...new Set(auditLogs.map(log => log.loaiThaoTac))];
    const bangAnhHuongList = [...new Set(auditLogs.map(log => log.bangAnhHuong))];

    // Thống kê
    const totalLogs = auditLogs.length;
    const adminActions = auditLogs.filter(log => log.loaiTaiKhoan === 'ADMIN').length;
    const customerActions = auditLogs.filter(log => log.loaiTaiKhoan === 'CUSTOMER').length;

    return (
        <Card title="Lịch sử thao tác">
            {/* Thống kê tổng quan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Tổng thao tác</p>
                            <p className="text-3xl font-bold mt-2">{totalLogs}</p>
                        </div>
                        <FaHistory size={40} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Thao tác Admin</p>
                            <p className="text-3xl font-bold mt-2">{adminActions}</p>
                        </div>
                        <FaHistory size={40} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Thao tác KH</p>
                            <p className="text-3xl font-bold mt-2">{customerActions}</p>
                        </div>
                        <FaHistory size={40} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Hôm nay</p>
                            <p className="text-3xl font-bold mt-2">
                                {auditLogs.filter(log => {
                                    const today = new Date().toDateString();
                                    return new Date(log.thoiGian).toDateString() === today;
                                }).length}
                            </p>
                        </div>
                        <FaHistory size={40} className="opacity-80" />
                    </div>
                </div>
            </div>

            {/* Thanh công cụ */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mô tả, người thực hiện..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                        />
                        <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                    </div>
                    <select
                        value={filterLoaiThaoTac}
                        onChange={e => setFilterLoaiThaoTac(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                    >
                        <option value="">Tất cả thao tác</option>
                        {loaiThaoTacList.map(loai => (
                            <option key={loai} value={loai}>{getLoaiThaoTacText(loai).text}</option>
                        ))}
                    </select>
                    <select
                        value={filterBangAnhHuong}
                        onChange={e => setFilterBangAnhHuong(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                    >
                        <option value="">Tất cả bảng</option>
                        {bangAnhHuongList.map(bang => (
                            <option key={bang} value={bang}>{bang}</option>
                        ))}
                    </select>
                </div>
                <button className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl font-semibold w-full md:w-auto">
                    <FaFilter />
                    <span>Bộ lọc nâng cao</span>
                </button>
            </div>

            {/* Bảng dữ liệu */}
            <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left font-semibold">Mã Log</th>
                                <th className="px-6 py-4 text-left font-semibold">Loại thao tác</th>
                                <th className="px-6 py-4 text-left font-semibold">Bảng ảnh hưởng</th>
                                <th className="px-6 py-4 text-left font-semibold">Người thực hiện</th>
                                <th className="px-6 py-4 text-left font-semibold">Mô tả</th>
                                <th className="px-6 py-4 text-left font-semibold">IP</th>
                                <th className="px-6 py-4 text-left font-semibold">Thời gian</th>
                                <th className="px-6 py-4 text-center font-semibold">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentItems.length > 0 ? (
                                currentItems.map((log, index) => {
                                    const loaiThaoTac = getLoaiThaoTacText(log.loaiThaoTac);
                                    const loaiTaiKhoan = getLoaiTaiKhoanText(log.loaiTaiKhoan);
                                    return (
                                        <tr key={log.maLog} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-green-50 transition-colors`}>
                                            <td className="px-6 py-4 font-bold text-green-600">#{log.maLog}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${loaiThaoTac.color}`}>
                                                    {loaiThaoTac.text}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                                                    {log.bangAnhHuong}
                                                </span>
                                                <span className="text-xs text-gray-500 ml-1">#{log.maBanGhi}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{log.nguoiThucHien}</p>
                                                    <span className={`inline-block px-2 py-0.5 rounded text-xs mt-1 ${loaiTaiKhoan.color}`}>
                                                        {loaiTaiKhoan.text}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 max-w-xs truncate">{log.moTa}</td>
                                            <td className="px-6 py-4 text-xs text-gray-500 font-mono">{log.diaChiIP}</td>
                                            <td className="px-6 py-4 text-gray-700">{formatDateTime(log.thoiGian)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button
                                                        onClick={() => handleViewDetail(log)}
                                                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                        title="Xem chi tiết"
                                                    >
                                                        <FaEye />
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
                                            <FaHistory className="text-gray-300 text-5xl" />
                                            <p className="text-gray-500 font-medium">Không tìm thấy lịch sử thao tác nào.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Thanh phân trang */}
            {filteredLogs.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                    <span className="text-sm text-gray-600 font-medium">
                        Hiển thị <span className="font-bold text-green-600">{indexOfFirstItem + 1}</span> đến <span className="font-bold text-green-600">{Math.min(indexOfLastItem, filteredLogs.length)}</span> của <span className="font-bold text-green-600">{filteredLogs.length}</span> kết quả
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
                                                ? 'bg-green-600 text-white shadow-lg'
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

            {/* Modal chi tiết */}
            {isDetailModalOpen && selectedLog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6 rounded-t-xl sticky top-0">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold">Chi tiết thao tác</h2>
                                    <p className="text-sm opacity-90 mt-1">Mã Log: #{selectedLog.maLog}</p>
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
                            {/* Thông tin cơ bản */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                                    Thông tin thao tác
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Loại thao tác</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${getLoaiThaoTacText(selectedLog.loaiThaoTac).color}`}>
                                            {getLoaiThaoTacText(selectedLog.loaiThaoTac).text}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Loại tài khoản</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${getLoaiTaiKhoanText(selectedLog.loaiTaiKhoan).color}`}>
                                            {getLoaiTaiKhoanText(selectedLog.loaiTaiKhoan).text}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Người thực hiện</p>
                                        <p className="font-medium text-gray-900">{selectedLog.nguoiThucHien}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Địa chỉ IP</p>
                                        <p className="font-mono text-sm text-gray-700">{selectedLog.diaChiIP}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Bảng ảnh hưởng</p>
                                        <p className="font-medium text-gray-900">{selectedLog.bangAnhHuong} <span className="text-sm text-gray-500">#{selectedLog.maBanGhi}</span></p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Thời gian</p>
                                        <p className="font-medium text-gray-900">{formatDateTime(selectedLog.thoiGian)}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-xs text-gray-500 font-semibold">Mô tả</p>
                                        <p className="font-medium text-gray-900">{selectedLog.moTa}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Dữ liệu cũ */}
                            {selectedLog.duLieuCu && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <div className="w-1 h-6 bg-red-600 rounded-full"></div>
                                        Dữ liệu trước khi thay đổi
                                    </h3>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <pre className="text-xs overflow-x-auto text-gray-800">
                                            {JSON.stringify(JSON.parse(selectedLog.duLieuCu), null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {/* Dữ liệu mới */}
                            {selectedLog.duLieuMoi && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                                        Dữ liệu sau khi thay đổi
                                    </h3>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <pre className="text-xs overflow-x-auto text-gray-800">
                                            {JSON.stringify(JSON.parse(selectedLog.duLieuMoi), null, 2)}
                                        </pre>
                                    </div>
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

export default QuanLyLichSuThaoTac;
