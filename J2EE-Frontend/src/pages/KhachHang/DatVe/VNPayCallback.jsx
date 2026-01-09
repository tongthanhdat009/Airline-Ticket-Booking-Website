import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatCurrencyWithCommas } from '../../../services/utils';
import { isClientAuthenticated } from '../../../utils/cookieUtils';

function VNPayCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [paymentStatus, setPaymentStatus] = useState('processing');
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check if user is logged in
        setIsLoggedIn(isClientAuthenticated());
        
        const success = searchParams.get('success');
        const message = searchParams.get('message');
        const maThanhToan = searchParams.get('maThanhToan');
        const soTien = searchParams.get('soTien');
        const vnpResponseCode = searchParams.get('vnp_ResponseCode');

        if (success === 'true' && vnpResponseCode === '00') {
            setPaymentStatus('success');
            setPaymentInfo({
                message: message || 'Thanh toán thành công',
                maThanhToan,
                soTien,
                bankCode: searchParams.get('vnp_BankCode'),
                payDate: searchParams.get('vnp_PayDate')
            });
        } else {
            setPaymentStatus('failed');
            setPaymentInfo({
                message: message || 'Thanh toán thất bại',
                responseCode: vnpResponseCode
            });
        }
    }, [searchParams]);

    const handleBackHome = () => {
        navigate('/');
    };

    const handleViewHistory = () => {
        navigate('/lich-su-giao-dich');
    };

    return (
        <div 
            className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed relative"
            style={{ backgroundImage: 'url(/background/home/bgBannerHomePage.72a61446.webp)' }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-pink-50/60 to-yellow-50/60"></div>
            
            {/* Content wrapper */}
            <div className="relative z-10">

            <div className="px-32 py-16">
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-2xl p-8">
                    {paymentStatus === 'processing' && (
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-red-600 mx-auto mb-4"></div>
                            <p className="text-xl">Đang xử lý kết quả thanh toán...</p>
                        </div>
                    )}

                    {paymentStatus === 'success' && (
                        <div className="text-center">
                            <div className="mb-6">
                                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg 
                                        className="w-12 h-12 text-green-600" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth="2" 
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                            </div>

                            <h2 className="text-3xl font-bold text-green-600 mb-4">
                                Thanh toán thành công!
                            </h2>

                            <p className="text-gray-600 mb-6">
                                Cảm ơn bạn đã sử dụng dịch vụ của J2EE Airline
                            </p>

                            <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left">
                                <h3 className="font-bold text-lg mb-4 text-center border-b pb-2">
                                    Thông tin thanh toán
                                </h3>
                                
                                {paymentInfo?.maThanhToan && (
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-gray-600">Mã thanh toán:</span>
                                        <span className="font-semibold">#{paymentInfo.maThanhToan}</span>
                                    </div>
                                )}

                                {paymentInfo?.soTien && (
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-gray-600">Số tiền:</span>
                                        <span className="font-bold text-red-600">
                                            {formatCurrencyWithCommas(paymentInfo.soTien)} VND
                                        </span>
                                    </div>
                                )}

                                {paymentInfo?.bankCode && (
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-gray-600">Ngân hàng:</span>
                                        <span className="font-semibold">{paymentInfo.bankCode}</span>
                                    </div>
                                )}

                                {paymentInfo?.payDate && (
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-600">Thời gian:</span>
                                        <span className="font-semibold">
                                            {new Date(
                                                paymentInfo.payDate.substring(0, 4) + '-' +
                                                paymentInfo.payDate.substring(4, 6) + '-' +
                                                paymentInfo.payDate.substring(6, 8) + ' ' +
                                                paymentInfo.payDate.substring(8, 10) + ':' +
                                                paymentInfo.payDate.substring(10, 12) + ':' +
                                                paymentInfo.payDate.substring(12, 14)
                                            ).toLocaleString('vi-VN')}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
                                <div className="flex items-start">
                                    <svg 
                                        className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-1" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth="2" 
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <div className="text-left">
                                        <p className="font-semibold text-blue-900 mb-2">
                                            📧 Vé điện tử đã được gửi qua email
                                        </p>
                                        <p className="text-sm text-blue-800">
                                            Vui lòng kiểm tra hộp thư email của bạn. 
                                            Vé máy bay điện tử kèm chi tiết chuyến bay đã được gửi đến địa chỉ email đăng ký.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 justify-center">
                                {isLoggedIn && (
                                    <button
                                        onClick={handleViewHistory}
                                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                                    >
                                        Xem lịch sử giao dịch
                                    </button>
                                )}
                                <button
                                    onClick={handleBackHome}
                                    className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition font-semibold"
                                >
                                    Về trang chủ
                                </button>
                            </div>
                        </div>
                    )}

                    {paymentStatus === 'failed' && (
                        <div className="text-center">
                            <div className="mb-6">
                                <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg 
                                        className="w-12 h-12 text-red-600" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth="2" 
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </div>
                            </div>

                            <h2 className="text-3xl font-bold text-red-600 mb-4">
                                Thanh toán thất bại
                            </h2>

                            <p className="text-gray-600 mb-6">
                                {paymentInfo?.message || 'Đã xảy ra lỗi trong quá trình thanh toán'}
                            </p>

                            {paymentInfo?.responseCode && (
                                <div className="bg-red-50 p-4 rounded-lg mb-6">
                                    <p className="text-sm text-gray-600">
                                        Mã lỗi: <span className="font-semibold">{paymentInfo.responseCode}</span>
                                    </p>
                                </div>
                            )}

                            <div className="bg-yellow-50 p-4 rounded-lg mb-6 border-l-4 border-yellow-500">
                                <div className="flex items-start">
                                    <svg 
                                        className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth="2" 
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                        />
                                    </svg>
                                    <div className="text-left">
                                        <p className="font-semibold text-yellow-900 mb-2">
                                            Lưu ý
                                        </p>
                                        <ul className="text-sm text-yellow-800 list-disc list-inside space-y-1">
                                            <li>Vui lòng kiểm tra lại thông tin thẻ và số dư tài khoản</li>
                                            <li>Đảm bảo kết nối internet ổn định</li>
                                            <li>Liên hệ ngân hàng nếu vấn đề vẫn tiếp diễn</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={handleBackHome}
                                    className="px-8 py-3 bg-gray-300 text-black rounded-lg hover:bg-gray-400 transition font-semibold"
                                >
                                    Về trang chủ
                                </button>
                                <button
                                    onClick={() => navigate(-1)}
                                    className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition font-semibold"
                                >
                                    Thử lại
                                </button>
                            </div>
                        </div>
                    )}  
                </div>
            </div>
            </div>
        </div>
    );
}

export default VNPayCallback;