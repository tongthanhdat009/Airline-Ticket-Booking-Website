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
                message: message || 'Thanh to�n th�nh c�ng',
                maThanhToan,
                soTien,
                bankCode: searchParams.get('vnp_BankCode'),
                payDate: searchParams.get('vnp_PayDate')
            });
        } else {
            setPaymentStatus('failed');
            setPaymentInfo({
                message: message || 'Thanh to�n th?t b?i',
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
            <div className="absolute inset-0 bg-linear-to-br from-white/70 via-[#E3F2FD]/60 to-white/60"></div>
            
            {/* Content wrapper */}
            <div className="relative z-10">

            <div className="px-32 py-16">
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-2xl p-8">
                    {paymentStatus === 'processing' && (
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-[#1E88E5] mx-auto mb-4"></div>
                            <p className="text-xl">�ang x? l� k?t qu? thanh to�n...</p>
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
                                Thanh to�n th�nh c�ng!
                            </h2>

                            <p className="text-gray-600 mb-6">
                                C?m on b?n d� s? d?ng d?ch v? c?a J2EE Airline
                            </p>

                            <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left">
                                <h3 className="font-bold text-lg mb-4 text-center border-b pb-2">
                                    Th�ng tin thanh to�n
                                </h3>
                                
                                {paymentInfo?.maThanhToan && (
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-gray-600">M� thanh to�n:</span>
                                        <span className="font-semibold">#{paymentInfo.maThanhToan}</span>
                                    </div>
                                )}

                                {paymentInfo?.soTien && (
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-gray-600">S? ti?n:</span>
                                        <span className="font-bold text-[#1E88E5]">
                                            {formatCurrencyWithCommas(paymentInfo.soTien)} VND
                                        </span>
                                    </div>
                                )}

                                {paymentInfo?.bankCode && (
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-gray-600">Ng�n h�ng:</span>
                                        <span className="font-semibold">{paymentInfo.bankCode}</span>
                                    </div>
                                )}

                                {paymentInfo?.payDate && (
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-600">Th?i gian:</span>
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
                                        className="w-6 h-6 text-blue-600 mr-3 shrink-0 mt-1" 
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
                                            ?? V� di?n t? d� du?c g?i qua email
                                        </p>
                                        <p className="text-sm text-blue-800">
                                            Vui l�ng ki?m tra h?p thu email c?a b?n. 
                                            V� m�y bay di?n t? k�m chi ti?t chuy?n bay d� du?c g?i d?n d?a ch? email dang k�.
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
                                        Xem l?ch s? giao d?ch
                                    </button>
                                )}
                                <button
                                    onClick={handleBackHome}
                                    className="px-8 py-3 bg-linear-to-r from-[#FF7043] to-[#F4511E] text-white rounded-lg hover:from-[#F4511E] hover:to-[#E64A19] transition font-semibold"
                                >
                                    V? trang ch?
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
                                Thanh to�n th?t b?i
                            </h2>

                            <p className="text-gray-600 mb-6">
                                {paymentInfo?.message || '�� x?y ra l?i trong qu� tr�nh thanh to�n'}
                            </p>

                            {paymentInfo?.responseCode && (
                                <div className="bg-red-50 p-4 rounded-lg mb-6">
                                    <p className="text-sm text-gray-600">
                                        M� l?i: <span className="font-semibold">{paymentInfo.responseCode}</span>
                                    </p>
                                </div>
                            )}

                            <div className="bg-yellow-50 p-4 rounded-lg mb-6 border-l-4 border-yellow-500">
                                <div className="flex items-start">
                                    <svg 
                                        className="w-6 h-6 text-yellow-600 mr-3 shrink-0 mt-1" 
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
                                            Luu �
                                        </p>
                                        <ul className="text-sm text-yellow-800 list-disc list-inside space-y-1">
                                            <li>Vui l�ng ki?m tra l?i th�ng tin th? v� s? du t�i kho?n</li>
                                            <li>�?m b?o k?t n?i internet ?n d?nh</li>
                                            <li>Li�n h? ng�n h�ng n?u v?n d? v?n ti?p di?n</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={handleBackHome}
                                    className="px-8 py-3 bg-gray-300 text-black rounded-lg hover:bg-gray-400 transition font-semibold"
                                >
                                    V? trang ch?
                                </button>
                                <button
                                    onClick={() => navigate(-1)}
                                    className="px-8 py-3 bg-linear-to-r from-[#1E88E5] to-[#1565C0] text-white rounded-lg hover:from-[#1565C0] hover:to-[#0D47A1] transition font-semibold"
                                >
                                    Th? l?i
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