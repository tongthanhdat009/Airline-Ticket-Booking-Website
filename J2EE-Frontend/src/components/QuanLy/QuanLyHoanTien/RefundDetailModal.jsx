import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

/**
 * Modal hiển thị chi tiết yêu cầu hoàn tiền
 */
const RefundDetailModal = ({
    isVisible,
    refund,
    actionLoading,
    onClose,
    onApprove,
    onReject,
    formatCurrency,
    formatDateTime,
    getTrangThaiText,
    getPhuongThucText
}) => {
    if (!isVisible || !refund) return null;

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
                {/* Header */}
                <div className="bg-linear-to-r from-amber-600 to-yellow-600 text-white p-6 rounded-t-xl sticky top-0">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold">Chi tiết yêu cầu hoàn tiền</h2>
                            <p className="text-sm opacity-90 mt-1">Mã hoàn tiền: #{refund.maHoanTien}</p>
                        </div>
                        <button
                            onClick={onClose}
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
                                <p className="font-medium text-gray-900">{refund.hoTen || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold">Email</p>
                                <p className="font-medium text-gray-900">{refund.email || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold">Số điện thoại</p>
                                <p className="font-medium text-gray-900">{refund.soDienThoai || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold">Ngày yêu cầu</p>
                                <p className="font-medium text-gray-900">{formatDateTime(refund.ngayYeuCau)}</p>
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
                                <p className="font-medium text-gray-900">{refund.lyDo || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold">Số tiền hoàn</p>
                                <p className="font-bold text-lg text-amber-600">{formatCurrency(refund.soTienHoan)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold">Phương thức hoàn</p>
                                <p className="font-medium text-gray-900">{getPhuongThucText(refund.phuongThucHoan)}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-xs text-gray-500 font-semibold">Tài khoản nhận hoàn tiền</p>
                                <p className="font-medium text-gray-900">{refund.taiKhoanHoan || 'N/A'}</p>
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
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${getTrangThaiText(refund.trangThai).color}`}>
                                    {getTrangThaiText(refund.trangThai).icon} {getTrangThaiText(refund.trangThai).text}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold">Ngưởi xử lý</p>
                                <p className="font-medium text-gray-900">{refund.nguoiXuLy || 'Chưa xử lý'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold">Ngày xử lý</p>
                                <p className="font-medium text-gray-900">{formatDateTime(refund.ngayXuLy)}</p>
                            </div>
                            {refund.lyDoTuChoi && (
                                <div className="md:col-span-2">
                                    <p className="text-xs text-gray-500 font-semibold">Lý do từ chối</p>
                                    <p className="font-medium text-red-600">{refund.lyDoTuChoi}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Nút hành động */}
                    {refund.trangThai === 'CHO_XU_LY' && (
                        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    onClose();
                                    onReject(refund.maHoanTien);
                                }}
                                disabled={actionLoading}
                                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                <FaTimes />
                                Từ chối
                            </button>
                            <button
                                onClick={() => {
                                    onClose();
                                    onApprove(refund.maHoanTien);
                                }}
                                disabled={actionLoading}
                                className="px-6 py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 font-semibold transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                            >
                                <FaCheck />
                                Duyệt hoàn tiền
                            </button>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RefundDetailModal;
