import React, { useState } from 'react';
import { FaSearch, FaEye, FaFileInvoice, FaCalendar, FaDownload } from 'react-icons/fa';
import Card from '../../components/QuanLy/CardChucNang';

const QuanLyHoaDon = () => {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const itemsPerPage = 5;

    // Dữ liệu mẫu hard code
    const [invoices] = useState([
        {
            maHoaDon: 'HD001',
            maDatVe: 'DV001',
            hoTen: 'Nguyễn Văn A',
            email: 'nguyenvana@email.com',
            soDienThoai: '0901234567',
            ngayDat: '2025-01-10T10:30:00',
            tongTien: 3500000,
            trangThaiThanhToan: 'DA_THANH_TOAN',
            phuongThucThanhToan: 'VNPAY',
            maGiaoDich: 'VNP123456789',
            chiTiet: [
                { ten: 'Vé máy bay HAN - SGN', gia: 2500000, soLuong: 1 },
                { ten: 'Hành lý 20kg', gia: 500000, soLuong: 1 },
                { ten: 'Chỗ ngồi hạng thương gia', gia: 500000, soLuong: 1 }
            ]
        },
        {
            maHoaDon: 'HD002',
            maDatVe: 'DV002',
            hoTen: 'Trần Thị B',
            email: 'tranthib@email.com',
            soDienThoai: '0912345678',
            ngayDat: '2025-01-10T14:20:00',
            tongTien: 12000000,
            trangThaiThanhToan: 'DA_THANH_TOAN',
            phuongThucThanhToan: 'CHUYEN_KHOAN',
            maGiaoDich: 'CK987654321',
            chiTiet: [
                { ten: 'Vé máy bay HAN - JFK', gia: 10000000, soLuong: 1 },
                { ten: 'Bữa ăn đặc biệt', gia: 500000, soLuong: 2 },
                { ten: 'Wi-Fi chuyến bay', gia: 300000, soLuong: 1 },
                { ten: 'Bảo hiểm du lịch', gia: 1200000, soLuong: 1 }
            ]
        },
        {
            maHoaDon: 'HD003',
            maDatVe: 'DV003',
            hoTen: 'Lê Văn C',
            email: 'levanc@email.com',
            soDienThoai: '0923456789',
            ngayDat: '2025-01-11T09:15:00',
            tongTien: 8500000,
            trangThaiThanhToan: 'CHO_THANH_TOAN',
            phuongThucThanhToan: 'TIEN_MAT',
            maGiaoDich: '',
            chiTiet: [
                { ten: 'Vé máy bay SGN - DAD', gia: 3500000, soLuong: 2 },
                { ten: 'Chọn chỗ ngồi trước', gia: 750000, soLuong: 2 },
                { ten: 'Hành lý 30kg', gia: 1000000, soLuong: 1 }
            ]
        },
        {
            maHoaDon: 'HD004',
            maDatVe: 'DV004',
            hoTen: 'Phạm Thị D',
            email: 'phamthid@email.com',
            soDienThoai: '0934567890',
            ngayDat: '2025-01-11T16:45:00',
            tongTien: 5400000,
            trangThaiThanhToan: 'DA_THANH_TOAN',
            phuongThucThanhToan: 'VNPAY',
            maGiaoDich: 'VNP987654321',
            chiTiet: [
                { ten: 'Vé máy bay HAN - CXR', gia: 2000000, soLuong: 2 },
                { ten: 'Hành lý 15kg', gia: 700000, soLuong: 2 }
            ]
        },
        {
            maHoaDon: 'HD005',
            maDatVe: 'DV005',
            hoTen: 'Hoàng Văn E',
            email: 'hoangvane@email.com',
            soDienThoai: '0945678901',
            ngayDat: '2025-01-12T08:00:00',
            tongTien: 28000000,
            trangThaiThanhToan: 'HUY',
            phuongThucThanhToan: 'VNPAY',
            maGiaoDich: 'VNP456789123',
            chiTiet: [
                { ten: 'Vé máy bay SGN - LHR', gia: 12000000, soLuong: 2 },
                { ten: 'Hạng thương gia', gia: 2000000, soLuong: 2 },
                { ten: 'Phòng chờ VIP', gia: 500000, soLuong: 2 },
                { ten: 'Xe đưa đón riêng', gia: 1500000, soLuong: 1 },
                { ten: 'Bảo hiểm du lịch quốc tế', gia: 3000000, soLuang: 2 }
            ]
        }
    ]);

    const filteredInvoices = invoices.filter(hd =>
        hd.maHoaDon?.toLowerCase().includes(search.toLowerCase()) ||
        hd.hoTen?.toLowerCase().includes(search.toLowerCase()) ||
        hd.email?.toLowerCase().includes(search.toLowerCase()) ||
        hd.maDatVe?.toLowerCase().includes(search.toLowerCase()) ||
        hd.maGiaoDich?.toLowerCase().includes(search.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleViewDetail = (invoice) => {
        setSelectedInvoice(invoice);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedInvoice(null);
    };

    const formatCurrency = (value) => {
        if (!value) return '0đ';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const getTrangThaiText = (trangThai) => {
        switch (trangThai) {
            case 'DA_THANH_TOAN': return { text: 'Đã thanh toán', color: 'bg-green-100 text-green-700' };
            case 'CHO_THANH_TOAN': return { text: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-700' };
            case 'HUY': return { text: 'Đã hủy', color: 'bg-red-100 text-red-700' };
            case 'HOAN_TIEN': return { text: 'Hoàn tiền', color: 'bg-blue-100 text-blue-700' };
            default: return { text: trangThai, color: 'bg-gray-100 text-gray-700' };
        }
    };

    const getPhuongThucText = (phuongThuc) => {
        switch (phuongThuc) {
            case 'VNPAY': return 'VNPay';
            case 'CHUYEN_KHOAN': return 'Chuyển khoản';
            case 'TIEN_MAT': return 'Tiền mặt';
            case 'THE_TIN_DUNG': return 'Thẻ tín dụng';
            default: return phuongThuc;
        }
    };

    // Tính toán thống kê
    const totalRevenue = invoices
        .filter(inv => inv.trangThaiThanhToan === 'DA_THANH_TOAN')
        .reduce((sum, inv) => sum + inv.tongTien, 0);

    return (
        <Card title="Quản lý hóa đơn">
            {/* Thống kê tổng quan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Tổng hóa đơn</p>
                            <p className="text-3xl font-bold mt-2">{invoices.length}</p>
                        </div>
                        <FaFileInvoice size={40} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Đã thanh toán</p>
                            <p className="text-3xl font-bold mt-2">{invoices.filter(inv => inv.trangThaiThanhToan === 'DA_THANH_TOAN').length}</p>
                        </div>
                        <FaFileInvoice size={40} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Chờ thanh toán</p>
                            <p className="text-3xl font-bold mt-2">{invoices.filter(inv => inv.trangThaiThanhToan === 'CHO_THANH_TOAN').length}</p>
                        </div>
                        <FaFileInvoice size={40} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium opacity-90">Tổng doanh thu</p>
                            <p className="text-xl font-bold mt-2">{(totalRevenue / 1000000).toFixed(1)}M</p>
                        </div>
                        <FaFileInvoice size={40} className="opacity-80" />
                    </div>
                </div>
            </div>

            {/* Thanh công cụ */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Tìm kiếm hóa đơn theo mã, tên khách hàng, email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm"
                    />
                    <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-5 py-3 rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold">
                        <FaCalendar />
                        <span className="hidden sm:inline">Lọc theo ngày</span>
                    </button>
                    <button className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl font-semibold">
                        <FaDownload />
                        <span className="hidden sm:inline">Xuất Excel</span>
                    </button>
                </div>
            </div>

            {/* Bảng dữ liệu */}
            <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-violet-600 to-purple-700 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left font-semibold">Mã HD</th>
                                <th className="px-6 py-4 text-left font-semibold">Mã đặt vé</th>
                                <th className="px-6 py-4 text-left font-semibold">Khách hàng</th>
                                <th className="px-6 py-4 text-left font-semibold">Email</th>
                                <th className="px-6 py-4 text-left font-semibold">Ngày đặt</th>
                                <th className="px-6 py-4 text-right font-semibold">Tổng tiền</th>
                                <th className="px-6 py-4 text-center font-semibold">PTTT</th>
                                <th className="px-6 py-4 text-center font-semibold">Trạng thái</th>
                                <th className="px-6 py-4 text-center font-semibold">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentItems.length > 0 ? (
                                currentItems.map((hd, index) => {
                                    const status = getTrangThaiText(hd.trangThaiThanhToan);
                                    return (
                                        <tr key={hd.maHoaDon} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-violet-50 transition-colors`}>
                                            <td className="px-6 py-4 font-bold text-violet-600">#{hd.maHoaDon}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                                                    {hd.maDatVe}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{hd.hoTen}</p>
                                                    <p className="text-xs text-gray-500">{hd.soDienThoai}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">{hd.email}</td>
                                            <td className="px-6 py-4 text-gray-700">{formatDateTime(hd.ngayDat)}</td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-900">{formatCurrency(hd.tongTien)}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-xs text-gray-600">{getPhuongThucText(hd.phuongThucThanhToan)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                                                    {status.text}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button
                                                        onClick={() => handleViewDetail(hd)}
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
                                    <td colSpan="9" className="text-center py-12">
                                        <div className="flex flex-col items-center gap-3">
                                            <FaFileInvoice className="text-gray-300 text-5xl" />
                                            <p className="text-gray-500 font-medium">Không tìm thấy hóa đơn nào.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Thanh phân trang */}
            {filteredInvoices.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                    <span className="text-sm text-gray-600 font-medium">
                        Hiển thị <span className="font-bold text-violet-600">{indexOfFirstItem + 1}</span> đến <span className="font-bold text-violet-600">{Math.min(indexOfLastItem, filteredInvoices.length)}</span> của <span className="font-bold text-violet-600">{filteredInvoices.length}</span> kết quả
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
                                                ? 'bg-violet-600 text-white shadow-lg'
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

            {/* Modal chi tiết hóa đơn */}
            {isDetailModalOpen && selectedInvoice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white p-6 rounded-t-xl sticky top-0">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold">Chi tiết hóa đơn</h2>
                                    <p className="text-sm opacity-90 mt-1">Mã HD: {selectedInvoice.maHoaDon}</p>
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
                                    <div className="w-1 h-6 bg-violet-600 rounded-full"></div>
                                    Thông tin khách hàng
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Họ tên</p>
                                        <p className="font-medium text-gray-900">{selectedInvoice.hoTen}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Email</p>
                                        <p className="font-medium text-gray-900">{selectedInvoice.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Số điện thoại</p>
                                        <p className="font-medium text-gray-900">{selectedInvoice.soDienThoai}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Ngày đặt</p>
                                        <p className="font-medium text-gray-900">{formatDateTime(selectedInvoice.ngayDat)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Chi tiết đơn hàng */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-violet-600 rounded-full"></div>
                                    Chi tiết dịch vụ
                                </h3>
                                <div className="bg-gray-50 rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-violet-100 text-violet-800">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-semibold">Dịch vụ</th>
                                                <th className="px-4 py-3 text-center font-semibold">Số lượng</th>
                                                <th className="px-4 py-3 text-right font-semibold">Đơn giá</th>
                                                <th className="px-4 py-3 text-right font-semibold">Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {selectedInvoice.chiTiet.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-3">{item.ten}</td>
                                                    <td className="px-4 py-3 text-center">{item.soLuong}</td>
                                                    <td className="px-4 py-3 text-right">{formatCurrency(item.gia)}</td>
                                                    <td className="px-4 py-3 text-right font-semibold">
                                                        {formatCurrency(item.gia * item.soLuong)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Thông tin thanh toán */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-violet-600 rounded-full"></div>
                                    Thông tin thanh toán
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Phương thức thanh toán</p>
                                        <p className="font-medium text-gray-900">{getPhuongThucText(selectedInvoice.phuongThucThanhToan)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold">Mã giao dịch</p>
                                        <p className="font-medium text-gray-900">{selectedInvoice.maGiaoDich || 'N/A'}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-xs text-gray-500 font-semibold">Trạng thái thanh toán</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${getTrangThaiText(selectedInvoice.trangThaiThanhToan).color}`}>
                                            {getTrangThaiText(selectedInvoice.trangThaiThanhToan).text}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Tổng tiền */}
                            <div className="bg-gradient-to-r from-violet-100 to-purple-100 p-6 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-gray-800">Tổng thanh toán:</span>
                                    <span className="text-3xl font-bold text-violet-600">{formatCurrency(selectedInvoice.tongTien)}</span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={handleCloseDetailModal}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                                >
                                    Đóng
                                </button>
                                <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 font-semibold transition-all shadow-lg flex items-center gap-2">
                                    <FaDownload />
                                    In hóa đơn
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default QuanLyHoaDon;
