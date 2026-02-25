import { useTranslation } from 'react-i18next';
import { formatCurrencyWithCommas } from '../../../services/utils';

/**
 * PriceBreakdown - Chi tiết giá vé, dịch vụ, giảm giá
 * @param {object} formData - Dữ liệu đặt vé
 * @param {object} appliedDiscount - Mã giảm giá đã áp dụng (null nếu chưa)
 * @param {number} totalPrice - Tổng giá trước giảm
 */
function PriceBreakdown({ formData, appliedDiscount, totalPrice }) {
    const { t } = useTranslation();

    const giaVeDi = formData?.selectedTuyenBayDi?.hangVe?.giaVe || 0;
    const giaVeVe = formData?.selectedTuyenBayVe?.hangVe?.giaVe || 0;
    const passengers = formData?.passengers || 1;
    const thuePhi = 583000;

    // Tính tiền dịch vụ
    const calcServiceTotal = (services) => {
        if (!services) return 0;
        let total = 0;
        // Per-passenger format
        if (services.passengers) {
            services.passengers.forEach(p => {
                ['di', 've'].forEach(dir => {
                    if (p[dir]) {
                        total += (p[dir].seat?.price || 0);
                        (p[dir].options || []).forEach(opt => {
                            total += (opt.price || 0) * (opt.quantity || 1);
                        });
                    }
                });
            });
        }
        // Legacy per-direction format
        else {
            ['di', 've'].forEach(dir => {
                if (services[dir]) {
                    const s = services[dir];
                    total += (s.selectedSeats?.length || 0) * (s.seatPrice || 0);
                    (s.options || []).forEach(opt => {
                        total += (opt.price || 0) * (opt.quantity || 1);
                    });
                }
            });
        }
        return total;
    };

    const serviceTotal = calcServiceTotal(formData?.dichVu);
    const giaTriGiam = appliedDiscount?.giaTriGiam || 0;
    const finalTotal = (totalPrice || 0) - giaTriGiam;

    return (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 md:p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
                {t('booking.price_breakdown.title', 'Chi tiết giá')}
            </h3>

            <div className="space-y-3">
                {/* Giá vé chiều đi */}
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                        {t('booking.summary.outbound', 'Chuyến đi')} ({passengers} {t('booking.header.passenger_label', 'người')})
                    </span>
                    <span className="font-medium">{formatCurrencyWithCommas(giaVeDi * passengers)} VND</span>
                </div>

                {/* Giá vé chiều về */}
                {formData?.flightType === 'round' && giaVeVe > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                            {t('booking.summary.return', 'Chuyến về')} ({passengers} {t('booking.header.passenger_label', 'người')})
                        </span>
                        <span className="font-medium">{formatCurrencyWithCommas(giaVeVe * passengers)} VND</span>
                    </div>
                )}

                {/* Thuế phí */}
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('booking.summary.taxes_fees', 'Thuế, phí')}</span>
                    <span className="font-medium">
                        {formatCurrencyWithCommas(thuePhi * (formData?.flightType === 'round' ? 2 : 1))} VND
                    </span>
                </div>

                {/* Dịch vụ bổ sung */}
                {serviceTotal > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t('booking.summary.services', 'Dịch vụ')}</span>
                        <span className="font-medium">{formatCurrencyWithCommas(serviceTotal)} VND</span>
                    </div>
                )}

                {/* Đường kẻ */}
                <div className="border-t border-gray-200 pt-3 mt-3">
                    {/* Tổng trước giảm */}
                    {appliedDiscount && (
                        <>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-500">{t('booking.price_breakdown.subtotal', 'Tạm tính')}</span>
                                <span className="text-gray-500">{formatCurrencyWithCommas(totalPrice)} VND</span>
                            </div>
                            <div className="flex justify-between text-sm mb-2 text-green-600">
                                <span className="flex items-center gap-1">
                                    🏷️ {appliedDiscount.tenKhuyenMai}
                                </span>
                                <span className="font-medium">-{formatCurrencyWithCommas(giaTriGiam)} VND</span>
                            </div>
                        </>
                    )}

                    {/* Tổng cuối */}
                    <div className="flex justify-between text-lg font-bold text-[#1E88E5]">
                        <span>{t('booking.payment.total', 'Tổng cộng')}</span>
                        <span>{formatCurrencyWithCommas(Math.max(finalTotal, 0))} VND</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PriceBreakdown;
