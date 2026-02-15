import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HeaderTimKiemChuyen from '../../../components/KhachHang/HeaderTimKiemChuyen';
import { useTranslation } from 'react-i18next'

import { formatCurrencyWithCommas, formatTime, formatDate } from '../../../services/utils';
import VNPayService from '../../../services/VNPayService';
import apiClient from '../../../services/apiClient';
import { getClientAccessToken } from '../../../utils/cookieUtils';

function ThanhToan() {
    const { t } = useTranslation()
    const location = useLocation();
    const navigate = useNavigate();
    const formData = useMemo(() => location.state || {}, [location.state]);
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!formData.passengerInfo || !formData.selectedTuyenBayDi) {
            navigate('/');
        }
    }, [formData, navigate]);

    const createBookingAndPayment = async () => {
        setIsProcessing(true);
        setError('');

        try {
            const token = getClientAccessToken();
            
            // Extract ALL seat IDs from selected seats (for multiple passengers)
            const outboundSeatIds = formData.dichVu?.di?.selectedSeats?.map(seat => parseInt(seat.id)) || [];
            const returnSeatIds = formData.dichVu?.ve?.selectedSeats?.map(seat => parseInt(seat.id)) || [];
            
            // Prepare booking data with proper format
            const bookingData = {
                passengerInfo: formData.passengerInfo.map((passenger, index) => ({
                    fullName: passenger.fullName,
                    email: passenger.email,
                    phone: passenger.phone,
                    gender: passenger.sex,
                    birthDate: passenger.birthday,
                    idNumber: passenger.idCard,
                    isFromAccount: index === 0 && formData.useAccountInfo // Only first passenger can be from account
                })),
                flightInfo: {
                    outbound: {
                        maChuyenBay: formData.selectedTuyenBayDi.maChuyenBay,
                        danhSachMaGhe: outboundSeatIds, // Send list of seat IDs
                        maGhe: outboundSeatIds.length > 0 ? outboundSeatIds[0] : null, // Backward compatibility
                        hangVe: formData.selectedTuyenBayDi.hangVe?.tenHangVe || null
                    },
                    returnFlight: formData.selectedTuyenBayVe ? {
                        maChuyenBay: formData.selectedTuyenBayVe.maChuyenBay,
                        danhSachMaGhe: returnSeatIds, // Send list of seat IDs
                        maGhe: returnSeatIds.length > 0 ? returnSeatIds[0] : null, // Backward compatibility
                        hangVe: formData.selectedTuyenBayVe.hangVe?.tenHangVe || null
                    } : null
                },
                services: formData.dichVu || {},
                totalAmount: formData.totalPrice
            };

            // Prepare headers (token is optional for guest customers)
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // Only add Authorization header if token exists (logged in user)
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // Create booking and payment record
            const response = await apiClient.post('/client/datcho/create', bookingData, {
                headers: headers
            });

            if (response.data.success) {
                const maThanhToan = response.data.data.maThanhToan;
                
                // Create VNPay payment URL
                const vnpayResponse = await VNPayService.createPayment(maThanhToan);
                
                if (vnpayResponse.success && vnpayResponse.data.paymentUrl) {
                    // Redirect to VNPay
                    window.location.href = vnpayResponse.data.paymentUrl;
                } else {
                    setError(t('booking_payment_errors.error_create_payment'));
                    setIsProcessing(false);
                }
            } else {
                setError(response.data.message || t('booking_payment_errors.error_create_booking'));
                setIsProcessing(false);
            }
        } catch (err) {
            console.error('Error creating booking:', err);
            const errorMessage = err.response?.data?.message || t('booking_payment_errors.error_processing_booking');
            setError(errorMessage);
            setIsProcessing(false);
        }
    };

    const handlePayment = () => {
        if (!formData.passengerInfo || formData.passengerInfo.length === 0) {
            setError(t('booking_payment_errors.error_missing_passenger_info'));
            return;
        }
        
        createBookingAndPayment();
    };

    return (
        <div 
            className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed relative"
            style={{ backgroundImage: 'url(/background/home/bgBannerHomePage.72a61446.webp)' }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-linear-to-br from-white/70 via-blue-50/60 to-[#F5F7FA]/60"></div>
            
            {/* Content wrapper */}
            <div className="relative z-10">
            <HeaderTimKiemChuyen data={{ ...formData }} />

            <div className="px-32 py-8">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-3xl font-bold mb-6 text-center text-[#1E88E5]">
                        {t('booking.payment.title')}
                    </h2>

                    {/* Flight Information Summary */}
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-4 border-b pb-2">
                            {t('booking.flight_selection.outbound')}
                        </h3>
                        
                        {/* Outbound Flight */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">{t('booking.flight_selection.outbound')}</p>
                                    <p className="font-bold text-lg">
                                        {formData.selectedTuyenBayDi?.soHieuChuyenBay}
                                    </p>
                                    <p className="text-sm">
                                        {formData.departure} → {formData.arrival}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">
                                        {formatDate(formData.startDate)}
                                    </p>
                                    <p className="font-bold">
                                        {formatTime(formData.selectedTuyenBayDi?.gioDi)} - 
                                        {formatTime(formData.selectedTuyenBayDi?.gioDen)}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {formData.selectedTuyenBayDi?.hangVe?.tenHangVe}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Return Flight */}
                        {formData.selectedTuyenBayVe && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-600">{t('booking.flight_selection.inbound')}</p>
                                        <p className="font-bold text-lg">
                                            {formData.selectedTuyenBayVe?.soHieuChuyenBay}
                                        </p>
                                        <p className="text-sm">
                                            {formData.arrival} → {formData.departure}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">
                                            {formatDate(formData.endDate)}
                                        </p>
                                        <p className="font-bold">
                                            {formatTime(formData.selectedTuyenBayVe?.gioDi)} - 
                                            {formatTime(formData.selectedTuyenBayVe?.gioDen)}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {formData.selectedTuyenBayVe?.hangVe?.tenHangVe}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Passenger Information */}
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-4 border-b pb-2">
                            {t('booking.passenger_info.title')}
                        </h3>
                        {formData.passengerInfo?.map((passenger, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg mb-3">
                                <p className="font-semibold">
                                    {t('booking.passenger_info.passenger')} {index + 1}: {passenger.fullName}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {t('booking.passenger_info.contact_info')}: {passenger.email} | {passenger.phone}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Payment Summary */}
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-4 border-b pb-2">
                            {t('booking.payment.payment_details') || t('booking.payment.title')}
                        </h3>
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <div className="flex justify-between mb-2">
                                <span>{t('booking.payment.ticket_price')}</span>
                                <span className="font-semibold">
                                    {formatCurrencyWithCommas(formData.basePrice || formData.totalPrice)} VND
                                </span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span>{t('booking.payment.tax_fee') || 'Thuế và phí'}</span>
                                <span className="font-semibold">
                                    {formatCurrencyWithCommas(formData.taxFee || 0)} VND
                                </span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between text-xl font-bold text-[#1E88E5]">
                                    <span>{t('booking.payment.total') || 'Tổng cộng:'}</span>
                                    <span>{formatCurrencyWithCommas(formData.totalPrice)} VND</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {/* Payment Method */}
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-4 border-b pb-2">
                            {t('booking.payment.payment_method')}
                        </h3>
                        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
                            <div className="flex items-center">
                                <img 
                                    src="https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png" 
                                    alt="VNPay" 
                                    className="h-12 mr-4"
                                />
                                <div>
                                    <p className="font-bold">{t('booking.payment.vnpay_title') || 'Thanh toán qua VNPay'}</p>
                                    <p className="text-sm text-gray-600">
                                        {t('booking.payment.vnpay_desc') || 'Hỗ trợ thanh toán bằng thẻ ATM, thẻ tín dụng, QR Code'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-8 py-3 bg-gray-300 text-black rounded-lg hover:bg-gray-400 transition"
                            disabled={isProcessing}
                        >
                            {t('common.back')}
                        </button>
                        
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className={`px-8 py-3 rounded-lg font-bold transition ${
                                isProcessing
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-linear-to-r from-[#FF7043] to-[#F4511E] hover:from-[#FF8A65] hover:to-[#FF7043]'
                            }`}
                        >
                                {isProcessing ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                    </svg>
                                    {t('common.processing')}
                                </span>
                                ) : (
                                    t('booking.payment.pay_now')
                                )}
                        </button>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}

export default ThanhToan;
