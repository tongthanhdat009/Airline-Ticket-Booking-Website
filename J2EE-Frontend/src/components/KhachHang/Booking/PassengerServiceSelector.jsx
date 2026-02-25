import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdOutlineKeyboardArrowRight } from 'react-icons/md';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { formatCurrencyWithCommas } from '../../../services/utils';
import { getServiceImageUrl } from '../../../config/api.config';

/**
 * PassengerServiceSelector - Chọn dịch vụ riêng cho từng hành khách
 * @param {Array} passengerInfo - Danh sách hành khách
 * @param {Array} dichVuList - Danh sách dịch vụ cung cấp
 * @param {object} selectedServices - Dịch vụ đã chọn { passengers: [...] }
 * @param {string} flightType - 'round' hoặc 'one_way'
 * @param {function} onOpenPanel - Callback khi mở panel chi tiết dịch vụ
 * @param {number} activePassenger - Index hành khách đang active
 * @param {function} onChangePassenger - Callback khi đổi hành khách
 */
function PassengerServiceSelector({
    passengerInfo = [],
    dichVuList = [],
    selectedServices = {},
    flightType = 'one_way',
    onOpenPanel,
    activePassenger = 0,
    onChangePassenger,
}) {
    const { t } = useTranslation();

    // Tính tổng dịch vụ cho một hành khách
    const getPassengerServiceTotal = (passengerIndex) => {
        const passenger = selectedServices.passengers?.[passengerIndex];
        if (!passenger) return 0;

        let total = 0;
        ['di', 've'].forEach(dir => {
            if (passenger[dir]) {
                total += (passenger[dir].seat?.price || 0);
                (passenger[dir].options || []).forEach(opt => {
                    total += (opt.price || 0) * (opt.quantity || 1);
                });
            }
        });
        return total;
    };

    // Kiểm tra hành khách đã chọn dịch vụ chưa
    const hasServices = (passengerIndex) => {
        const passenger = selectedServices.passengers?.[passengerIndex];
        if (!passenger) return false;
        return ['di', 've'].some(dir =>
            passenger[dir]?.seat || (passenger[dir]?.options?.length > 0)
        );
    };

    // Đếm số dịch vụ đã chọn cho hành khách
    const getServiceCount = (passengerIndex) => {
        const passenger = selectedServices.passengers?.[passengerIndex];
        if (!passenger) return 0;
        let count = 0;
        ['di', 've'].forEach(dir => {
            if (passenger[dir]?.seat) count++;
            count += (passenger[dir]?.options?.length || 0);
        });
        return count;
    };

    return (
        <div className="space-y-6">
            {/* Tab chọn hành khách */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/20">
                <h3 className="text-lg font-bold mb-3 text-gray-800">
                    {t('booking.services.select_passenger', 'Chọn hành khách')}
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {passengerInfo.map((p, idx) => {
                        const serviceTotal = getPassengerServiceTotal(idx);
                        const serviceCount = getServiceCount(idx);
                        return (
                            <button
                                key={idx}
                                onClick={() => onChangePassenger(idx)}
                                className={`relative flex flex-col items-center min-w-[120px] px-4 py-3 rounded-xl whitespace-nowrap transition-all duration-300 ${
                                    activePassenger === idx
                                        ? 'bg-[#1E88E5] text-white shadow-lg shadow-blue-200'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <span className="text-sm font-semibold truncate max-w-[100px]">
                                    {p.fullName || `${t('booking.passenger_info.passenger', 'HK')} ${idx + 1}`}
                                </span>
                                {serviceCount > 0 && (
                                    <span className={`text-xs mt-1 ${
                                        activePassenger === idx ? 'text-blue-100' : 'text-gray-500'
                                    }`}>
                                        {serviceCount} {t('booking.services.items', 'dịch vụ')}
                                    </span>
                                )}
                                {hasServices(idx) && (
                                    <div className="absolute -top-1 -right-1">
                                        <IoCheckmarkCircle className="text-green-500 bg-white rounded-full text-lg" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Hiển thị dịch vụ cho hành khách đang chọn */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 md:p-6 shadow-lg border border-white/20">
                <h4 className="font-semibold text-gray-800 mb-4">
                    {t('booking.services.services_for', 'Dịch vụ cho')}{' '}
                    <span className="text-[#1E88E5]">
                        {passengerInfo[activePassenger]?.fullName || `${t('booking.passenger_info.passenger', 'Hành khách')} ${activePassenger + 1}`}
                    </span>
                </h4>

                {/* Danh sách dịch vụ */}
                <div className="flex flex-col gap-4">
                    {/* Chọn chỗ ngồi */}
                    <div
                        className="flex items-center bg-white rounded-2xl shadow-md p-4 cursor-pointer hover:shadow-lg transition-all duration-300 border border-transparent hover:border-[#1E88E5]/20"
                        onClick={() => onOpenPanel({
                            maDichVu: 99,
                            tenDichVu: t('booking.services.seat_selection', 'Chọn chỗ ngồi'),
                            moTa: t('booking.services.select_seat_desc', 'Chọn chỗ ngồi yêu thích'),
                            anh: '/service/select-service_favorite-seat.cc6498ae.svg',
                        })}
                    >
                        <img
                            src="/service/select-service_favorite-seat.cc6498ae.svg"
                            alt={t('booking.services.seat_selection')}
                            className="w-16 h-16 md:w-20 md:h-20 rounded-xl mr-4 md:mr-6"
                        />
                        <div className="flex flex-col flex-1 overflow-hidden">
                            <span className="text-base md:text-xl font-semibold text-gray-800">
                                {t('booking.services.seat_selection', 'Chọn chỗ ngồi')}
                            </span>
                            <span className="text-gray-500 text-sm">
                                {t('booking.services.select_seat_desc', 'Chọn chỗ ngồi yêu thích')}
                            </span>
                        </div>
                        <MdOutlineKeyboardArrowRight className="ml-auto text-3xl text-gray-400" />
                    </div>

                    {/* Dịch vụ bổ sung */}
                    {dichVuList.map((dichVu) => (
                        <div
                            key={dichVu.maDichVu}
                            className="flex items-center bg-white rounded-2xl shadow-md p-4 cursor-pointer hover:shadow-lg transition-all duration-300 border border-transparent hover:border-[#1E88E5]/20"
                            onClick={() => onOpenPanel(dichVu)}
                        >
                            <img
                                src={getServiceImageUrl(dichVu.anh)}
                                alt={dichVu.tenDichVu}
                                className="w-16 h-16 md:w-20 md:h-20 rounded-xl mr-4 md:mr-6"
                            />
                            <div className="flex flex-col flex-1 overflow-hidden">
                                <span className="text-base md:text-xl font-semibold text-gray-800">
                                    {dichVu.tenDichVu}
                                </span>
                                <span className="text-gray-500 text-sm">{dichVu.moTa}</span>
                            </div>
                            <MdOutlineKeyboardArrowRight className="ml-auto text-3xl text-gray-400" />
                        </div>
                    ))}
                </div>

                {/* Tổng dịch vụ cho hành khách hiện tại */}
                {getPassengerServiceTotal(activePassenger) > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                                {t('booking.services.passenger_total', 'Tổng dịch vụ hành khách này')}
                            </span>
                            <span className="font-bold text-[#1E88E5]">
                                {formatCurrencyWithCommas(getPassengerServiceTotal(activePassenger))} VND
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PassengerServiceSelector;
