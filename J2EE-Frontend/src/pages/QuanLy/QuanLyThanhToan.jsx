import React, { useState, useMemo, useEffect } from 'react';
import { FaSearch, FaMoneyBillWave, FaCheckCircle, FaClock, FaEye, FaFilter } from 'react-icons/fa';
import Card from '../../components/QuanLy/CardChucNang';
import Toast from '../../components/common/Toast';
import ViewPaymentDetailModal from '../../components/QuanLy/QuanLyThanhToan/ViewPaymentDetailModal';
import { getAllThanhToan } from '../../services/QLThanhToanService';

const QuanLyThanhToan = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState('all'); // all, paid, pending
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
    const itemsPerPage = 10;
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const response = await getAllThanhToan();
            setPayments(response.data || []);
        } catch (err) {
            setError('Không thể tải dữ liệu thanh toán. Vui lòng thử lại.');
            console.error('Error fetching payments:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredPayments = useMemo(() => {
        let result = payments;

        // Lọc theo trạng thái
        if (filterStatus === 'paid') {
            result = result.filter(p => p.daThanhToan === 'Y');
        } else if (filterStatus === 'pending') {
            result = result.filter(p => p.daThanhToan === 'N');
        }

        // Tìm kiếm
        if (searchTerm) {
            result = result.filter(payment =>
                payment.maThanhToan?.toString().includes(searchTerm) ||
                payment.datCho?.hanhKhach?.hoVaTen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.datCho?.hanhKhach?.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return result;
    }, [searchTerm, payments, filterStatus]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const hideToast = () => {
        setToast({ ...toast, isVisible: false });
    };

    const handleViewPayment = (payment) => {
        setSelectedPayment(payment);
        setIsViewModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsViewModalOpen(false);
        setSelectedPayment(null);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const getStatusBadge = (status) => {
        if (status === 'Y') {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    <FaCheckCircle /> Đã thanh toán
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                <FaClock /> Đang xử lý
            </span>
        );
    };

    if (loading) return <div className="flex justify-center items-center h-64"><div className="text-lg">Đang tải...</div></div>;
    if (error) return <div className="flex justify-center items-center h-64"><div className="text-lg text-red-500">{error}</div></div>;

    return (
        <Card title="Quản lý thanh toán">
            <Toast 
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
                duration={3000}
            />

            {/* Thanh công cụ */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã, tên khách hàng, email..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                    <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                </div>
                <div className="flex gap-2">
                    <select
                        value={filterStatus}
                        onChange={(e) => {
                            setFilterStatus(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    >
                        <option value="all">Tất cả</option>
                        <option value="paid">Đã thanh toán</option>
                        <option value="pending">Đang xử lý</option>
                    </select>
                </div>
            </div>

            {/* Thống kê nhanh */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">Tổng thanh toán</p>
                            <p className="text-3xl font-bold mt-2">{payments.length}</p>
                        </div>
                        <FaMoneyBillWave size={48} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">Đã thanh toán</p>
                            <p className="text-3xl font-bold mt-2">{payments.filter(p => p.daThanhToan === 'Y').length}</p>
                        </div>
                        <FaCheckCircle size={48} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">Đang xử lý</p>
                            <p className="text-3xl font-bold mt-2">{payments.filter(p => p.daThanhToan === 'N').length}</p>
                        </div>
                        <FaClock size={48} className="opacity-80" />
                    </div>
                </div>
            </div>

            {/* Bảng dữ liệu */}
            <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left font-semibold">Mã TT</th>
                                <th scope="col" className="px-6 py-4 text-left font-semibold">Khách hàng</th>
                                <th scope="col" className="px-6 py-4 text-left font-semibold">Số tiền</th>
                                <th scope="col" className="px-6 py-4 text-left font-semibold">Ngày hết hạn</th>
                                <th scope="col" className="px-6 py-4 text-left font-semibold">Trạng thái</th>
                                <th scope="col" className="px-6 py-4 text-center font-semibold">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentItems.length > 0 ? (
                                currentItems.map((payment, index) => (
                                    <tr key={payment.maThanhToan} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                                        <td className="px-6 py-4 font-semibold text-blue-600">#{payment.maThanhToan}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium text-gray-900">{payment.datCho?.hanhKhach?.hoVaTen || '-'}</span>
                                                <span className="text-xs text-gray-500">{payment.datCho?.hanhKhach?.email || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-green-600">{formatCurrency(payment.soTien)}</td>
                                        <td className="px-6 py-4 text-gray-600">{formatDate(payment.ngayHetHan)}</td>
                                        <td className="px-6 py-4">{getStatusBadge(payment.daThanhToan)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <button 
                                                    onClick={() => handleViewPayment(payment)}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" 
                                                    title="Xem chi tiết"
                                                >
                                                    <FaEye size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-12">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="text-gray-400 text-5xl">💳</div>
                                            <p className="text-gray-500 font-medium">Không tìm thấy thanh toán nào.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Thanh phân trang */}
            {filteredPayments.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                    <span className="text-sm text-gray-600 font-medium">
                        Hiển thị <span className="font-bold text-blue-600">{indexOfFirstItem + 1}</span> đến <span className="font-bold text-blue-600">{Math.min(indexOfLastItem, filteredPayments.length)}</span> của <span className="font-bold text-blue-600">{filteredPayments.length}</span> kết quả
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
                                                ? 'bg-blue-600 text-white shadow-lg'
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

            {/* Modal xem chi tiết với component mới */}
            <ViewPaymentDetailModal
                payment={selectedPayment}
                isOpen={isViewModalOpen}
                onClose={handleCloseModal}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                getStatusBadge={getStatusBadge}
            />
        </Card>
    );
};

export default QuanLyThanhToan;
