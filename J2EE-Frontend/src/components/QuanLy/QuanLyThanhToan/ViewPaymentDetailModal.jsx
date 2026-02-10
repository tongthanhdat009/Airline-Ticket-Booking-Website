import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaMoneyBillWave, FaUser, FaEnvelope, FaCalendarAlt, FaPlane, FaConciergeBell, FaBox, FaFilePdf } from 'react-icons/fa';
import { getDichVuByMaDatCho, fetchServiceImageByName, fetchOptionImageByName } from '../../../services/QLDichVuService';
import { getThanhToanChiTiet, downloadInvoicePdf } from '../../../services/QLThanhToanService';

const ViewPaymentDetailModal = ({ 
    payment, 
    isOpen, 
    onClose, 
    formatCurrency, 
    formatDate,
    getStatusBadge 
}) => {
    const [currentPayment, setCurrentPayment] = useState(payment);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [bookedServices, setBookedServices] = useState([]);
    const [loadingServices, setLoadingServices] = useState(false);
    const [serviceImages, setServiceImages] = useState({});
    const [downloadingInvoice, setDownloadingInvoice] = useState(false);

    useEffect(() => {
        setCurrentPayment(payment);
        
        // Fetch chi tiết thanh toán và dịch vụ khi modal mở
        if (payment && payment.maThanhToan) {
            fetchPaymentDetails(payment.maThanhToan);
            
            if (payment.datCho?.maDatCho) {
                fetchBookedServices(payment.datCho.maDatCho);
            }
        }
    }, [payment]);

    const fetchPaymentDetails = async (maThanhToan) => {
        try {
            const response = await getThanhToanChiTiet(maThanhToan);
            setPaymentDetails(response.data);
        } catch (error) {
            console.error('Error fetching payment details:', error);
        }
    };

    const fetchBookedServices = async (maDatCho) => {
        try {
            setLoadingServices(true);
            const response = await getDichVuByMaDatCho(maDatCho);
            const services = response.data || [];
            setBookedServices(services);
            
            // Tải ảnh cho từng dịch vụ
            services.forEach(service => {
                loadServiceImage(service);
            });
        } catch (error) {
            console.error('Error fetching booked services:', error);
            setBookedServices([]);
        } finally {
            setLoadingServices(false);
        }
    };

    const loadServiceImage = async (service) => {
        try {
            const dichVu = service.luaChonDichVu?.dichVu;
            const luaChon = service.luaChonDichVu;
            
            // Ưu tiên ảnh của lựa chọn, nếu không có thì dùng ảnh của dịch vụ
            const imageName = luaChon?.anh || dichVu?.anh;
            const maLuaChon = luaChon?.maLuaChon;
            
            if (imageName && maLuaChon) {
                let imageBlob;
                
                // Nếu có ảnh lựa chọn, dùng API fetchOptionImageByName
                if (luaChon?.anh) {
                    const response = await fetchOptionImageByName(imageName);
                    imageBlob = response.data;
                } 
                // Nếu không, dùng ảnh dịch vụ
                else if (dichVu?.anh) {
                    const response = await fetchServiceImageByName(imageName);
                    imageBlob = response.data;
                }
                
                if (imageBlob) {
                    const imageUrl = URL.createObjectURL(imageBlob);
                    setServiceImages(prev => ({
                        ...prev,
                        [maLuaChon]: imageUrl
                    }));
                }
            }
        } catch (error) {
            console.error('Error loading service image:', error);
        }
    };

    // Cleanup image URLs khi component unmount
    useEffect(() => {
        return () => {
            Object.values(serviceImages).forEach(url => {
                if (url) URL.revokeObjectURL(url);
            });
        };
    }, [serviceImages]);

    const handleDownloadInvoice = async () => {
        try {
            setDownloadingInvoice(true);
            await downloadInvoicePdf(currentPayment.maThanhToan);
            // Toast notification sẽ được hiển thị từ parent component nếu cần
        } catch (error) {
            console.error('Error downloading invoice:', error);
            alert('Failed to download invoice. Please try again.');
        } finally {
            setDownloadingInvoice(false);
        }
    };

    if (!isOpen || !currentPayment) return null;

    // Lấy thông tin chuyến bay từ paymentDetails hoặc currentPayment
    const chuyenBayInfo = paymentDetails?.datCho?.chiTietGhe?.chuyenBay || 
                          currentPayment?.datCho?.chuyenBay;
    const hanhKhachInfo = paymentDetails?.datCho?.hanhKhach || 
                          currentPayment?.datCho?.hanhKhach;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

            {/* Modal - Full screen on mobile, centered modal on desktop */}
            <div className="relative z-10 h-full w-full md:h-[85vh] md:max-w-7xl md:mx-auto md:my-8 md:rounded-xl bg-white md:shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="[background:linear-gradient(to_right,rgb(37,99,235),rgb(29,78,216))] text-white px-4 md:px-6 py-3 md:py-4 flex justify-between items-center shrink-0">
                    <div className="min-w-0 flex-1">
                        <h3 className="text-lg md:text-xl font-bold truncate">Chi tiết thanh toán #{currentPayment.maThanhToan}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 transition-colors p-1 hover:bg-white/10 rounded-lg ml-2 shrink-0"
                    >
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Main Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 border mt-3 mb-3 border-blue-200">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-600 mb-2">Trạng thái thanh toán</h4>
                                <div className="text-2xl md:text-3xl">{getStatusBadge(currentPayment.daThanhToan)}</div>
                            </div>
                            <div className="text-left sm:text-right w-full sm:w-auto">
                                <div className="text-sm text-gray-600 mb-1">Mã thanh toán</div>
                                <div className="text-xl md:text-2xl font-bold text-blue-600">#{currentPayment.maThanhToan}</div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {/* Cột trái - Thông tin thanh toán */}
                        <div className="space-y-6">
                            <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-xl p-4 md:p-6 border border-purple-200 h-full">
                                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FaUser className="text-purple-600" />
                                    Thông tin khách hàng
                                </h4>
                                
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                            <FaUser size={12} />
                                            <span>Họ và tên</span>
                                        </div>
                                        <div className="font-bold text-gray-900">{hanhKhachInfo?.hoVaTen || '-'}</div>
                                    </div>
                                    
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                            <FaEnvelope size={12} />
                                            <span>Email</span>
                                        </div>
                                        <div className="font-medium text-gray-900 break-all">{hanhKhachInfo?.email || '-'}</div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="text-gray-500 text-xs mb-1">Số điện thoại</div>
                                        <div className="font-medium text-gray-900">{hanhKhachInfo?.soDienThoai || '-'}</div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <div className="text-gray-500 text-xs mb-1">Mã đặt chỗ</div>
                                        <div className="font-semibold text-blue-600">#{currentPayment.datCho?.maDatCho || paymentDetails?.datCho?.maDatCho || '-'}</div>
                                    </div>
                                </div>
                            </div>
                            
                            {currentPayment.ghiChu && (
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <div className="text-sm font-semibold text-gray-600 mb-2">Ghi chú</div>
                                    <div className="text-gray-700">{currentPayment.ghiChu}</div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            
                            <div className="bg-linear-to-br from-indigo-50 to-purple-50 rounded-xl p-4 md:p-6 border border-indigo-200 h-full">
                                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FaConciergeBell className="text-indigo-600" />
                                    Dịch vụ đã đặt
                                </h4>
                                <div className="bg-linear-to-r from-indigo-100 to-purple-100 rounded-lg p-3 md:p-4 border-2 border-indigo-300 mb-4 md:mb-5 mt-4">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                        <span className="font-bold text-gray-800">Tổng tiền dịch vụ:</span>
                                        <span className="text-xl md:text-2xl font-bold text-indigo-600">
                                            {formatCurrency(
                                                bookedServices.reduce((total, service) =>
                                                    total + ((service.luaChonDichVu?.gia || 0) * (service.soLuong || 1)),
                                                0)
                                            )}
                                        </span>
                                    </div>
                                </div>
                                {loadingServices ? (
                                    <div className="flex justify-center items-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                                    </div>
                                ) : bookedServices.length > 0 ? (
                                    <div className="space-y-3 max-h-[400px] md:max-h-[600px] overflow-y-auto pr-1 md:pr-2">
                                        {bookedServices.map((service, index) => {
                                            const maLuaChon = service.luaChonDichVu?.maLuaChon;
                                            const imageUrl = serviceImages[maLuaChon];
                                            
                                            return (
                                                <div key={index} className="bg-white rounded-lg p-4 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 overflow-hidden">
                                                            {imageUrl ? (
                                                                <img 
                                                                    src={imageUrl} 
                                                                    alt={service.luaChonDichVu?.tenLuaChon}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <FaBox className="text-indigo-600 text-2xl" />
                                                            )}
                                                        </div>
                                                        
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <h5 className="font-bold text-gray-900">
                                                                        {service.luaChonDichVu?.dichVu?.tenDichVu || 'Dịch vụ'}
                                                                    </h5>
                                                                    <p className="text-sm text-gray-600 mt-1">
                                                                        {service.luaChonDichVu?.tenLuaChon || '-'}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="font-bold text-green-600">
                                                                        {formatCurrency(service.luaChonDichVu?.gia || 0)}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 mt-1">
                                                                        SL: {service.soLuong || 1}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            {service.luaChonDichVu?.moTa && (
                                                                <p className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                                                                    {service.luaChonDichVu.moTa}
                                                                </p>
                                                            )}

                                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                                    <div>
                                                                        <span className="text-gray-500">Mã dịch vụ:</span>
                                                                        <span className="ml-1 font-semibold text-gray-700">
                                                                            #{service.luaChonDichVu?.dichVu?.maDichVu || '-'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className="text-gray-500">Tổng:</span>
                                                                        <span className="ml-1 font-semibold text-indigo-600">
                                                                            {formatCurrency((service.luaChonDichVu?.gia || 0) * (service.soLuong || 1))}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}                                        
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 px-4">
                                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                            <FaConciergeBell className="text-gray-400 text-3xl" />
                                        </div>
                                        <p className="text-gray-500 font-medium text-center mb-2">Chưa có dịch vụ nào được đặt</p>
                                        <p className="text-gray-400 text-sm text-center">Khách hàng chưa đăng ký dịch vụ bổ sung nào</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        {chuyenBayInfo && (
                                <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl p-4 md:p-6 border border-green-200">
                                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <FaPlane className="text-green-600" />
                                        Thông tin chuyến bay
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                            <div className="text-gray-500 text-xs mb-1">Mã chuyến bay</div>
                                            <div className="font-bold text-green-600">{chuyenBayInfo.maChuyenBay}</div>
                                        </div>

                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                            <div className="text-gray-500 text-xs mb-1">Số hiệu</div>
                                            <div className="font-bold text-gray-900">{chuyenBayInfo.soHieuChuyenBay || '-'}</div>
                                        </div>

                                        <div className="bg-white rounded-lg p-4 shadow-sm md:col-span-2">
                                            <div className="text-gray-500 text-xs mb-1">Tuyến bay</div>
                                            <div className="font-medium text-gray-900">
                                                {chuyenBayInfo.tuyenBay?.sanBayDi?.tenSanBay || '-'} 
                                                <span className="mx-2 text-blue-600">→</span>
                                                {chuyenBayInfo.tuyenBay?.sanBayDen?.tenSanBay || '-'}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {chuyenBayInfo.tuyenBay?.sanBayDi?.maIATA} - {chuyenBayInfo.tuyenBay?.sanBayDen?.maIATA}
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                            <div className="text-gray-500 text-xs mb-1">Ngày khởi hành</div>
                                            <div className="font-medium text-gray-900">{formatDate(chuyenBayInfo.ngayDi)}</div>
                                        </div>

                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                            <div className="text-gray-500 text-xs mb-1">Giờ khởi hành</div>
                                            <div className="font-medium text-gray-900">{chuyenBayInfo.gioDi || '-'}</div>
                                        </div>

                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                            <div className="text-gray-500 text-xs mb-1">Ngày đến</div>
                                            <div className="font-medium text-gray-900">{formatDate(chuyenBayInfo.ngayDen)}</div>
                                        </div>

                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                            <div className="text-gray-500 text-xs mb-1">Giờ đến</div>
                                            <div className="font-medium text-gray-900">{chuyenBayInfo.gioDen || '-'}</div>
                                        </div>

                                        <div className="bg-white rounded-lg p-4 shadow-sm md:col-span-2">
                                            <div className="text-gray-500 text-xs mb-1">Trạng thái chuyến bay</div>
                                            <div className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                                                {chuyenBayInfo.trangThai || 'Chưa xác định'}
                                            </div>
                                        </div>
                                    </div>
                                </div>)}
                    </div>
                        <div className="bg-linear-to-br from-yellow-50 to-orange-50 rounded-xl p-4 md:p-6 mt-4 md:mt-6 border border-yellow-200">
                            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FaMoneyBillWave className="text-yellow-600" />
                                Thông tin thanh toán
                            </h4>
                            
                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm">
                                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                        <FaMoneyBillWave size={12} />
                                        <span>Số tiền thanh toán</span>
                                    </div>
                                    <div className="text-2xl md:text-3xl font-bold text-green-600">{formatCurrency(currentPayment.soTien)}</div>
                                </div>

                                <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm">
                                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                        <FaCalendarAlt size={12} />
                                        <span>Ngày hết hạn</span>
                                    </div>
                                    <div className="text-lg md:text-xl font-semibold text-red-600">{formatDate(currentPayment.ngayHetHan)}</div>
                                </div>

                                <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm">
                                    <div className="text-gray-500 text-xs mb-1">Phương thức thanh toán</div>
                                    <div className="font-medium text-gray-900">{currentPayment.phuongThucThanhToan || 'Chưa xác định'}</div>
                                </div>
                            </div>
                        </div>
                </div>


                {/* Footer - Responsive layout */}
                <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-0 shrink-0">
                    <div className="flex items-center gap-2 text-xs md:text-sm order-2 md:order-1">
                        {currentPayment.daThanhToan === 'Y' && (
                            <span className="text-gray-500 italic">
                                ✓ Invoice is available for download
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2 md:gap-3 order-1 md:order-2 w-full md:w-auto">
                        {currentPayment.daThanhToan === 'Y' && (
                            <button
                                onClick={handleDownloadInvoice}
                                disabled={downloadingInvoice}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                            >
                                {downloadingInvoice ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span className="hidden sm:inline">Processing...</span>
                                        <span className="sm:hidden">...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaFilePdf />
                                        <span className="hidden sm:inline">Xuất hoá đơn</span>
                                        <span className="sm:hidden">Hóa đơn</span>
                                    </>
                                )}
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="flex-1 md:flex-none px-4 md:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm md:text-base"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewPaymentDetailModal;