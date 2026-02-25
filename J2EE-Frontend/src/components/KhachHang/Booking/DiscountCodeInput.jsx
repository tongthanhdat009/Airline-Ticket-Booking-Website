import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IoClose } from 'react-icons/io5';
import { HiOutlineTag } from 'react-icons/hi2';
import { formatCurrencyWithCommas } from '../../../services/utils';
import KhuyenMaiClientService from '../../../services/KhuyenMaiClientService';

/**
 * DiscountCodeInput - Component nhập và kiểm tra mã giảm giá
 * @param {number} tongGiaDonHang - Tổng giá đơn hàng hiện tại
 * @param {number} soLuongVe - Số lượng vé
 * @param {object} appliedDiscount - Mã giảm giá đã áp dụng (null nếu chưa)
 * @param {function} onApply - Callback khi áp dụng thành công
 * @param {function} onRemove - Callback khi xóa mã giảm giá
 */
function DiscountCodeInput({ tongGiaDonHang, soLuongVe, appliedDiscount, onApply, onRemove }) {
    const { t } = useTranslation();
    const [discountCode, setDiscountCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleApply = async () => {
        if (!discountCode.trim()) return;

        setLoading(true);
        setError('');

        try {
            const result = await KhuyenMaiClientService.validateCoupon(
                discountCode.trim(),
                tongGiaDonHang,
                soLuongVe
            );

            const data = result.data;
            if (data && data.valid) {
                onApply({
                    maKM: discountCode.trim(),
                    tenKhuyenMai: data.tenKhuyenMai,
                    loaiKhuyenMai: data.loaiKhuyenMai,
                    giaTriGiam: data.giaTriGiam,
                    tongGiaSauKM: data.tongGiaSauKM,
                    moTa: data.moTa,
                });
                setDiscountCode('');
            } else {
                setError(data?.message || t('booking.discount.invalid_code', 'Mã giảm giá không hợp lệ'));
            }
        } catch (err) {
            const message = err.response?.data?.message || t('booking.discount.check_error', 'Không thể kiểm tra mã giảm giá');
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleApply();
        }
    };

    const handleRemove = () => {
        setError('');
        setDiscountCode('');
        onRemove();
    };

    return (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 md:p-6 shadow-lg border border-white/20">
            <div className="flex items-center gap-2 mb-4">
                <HiOutlineTag className="text-xl text-[#1E88E5]" />
                <h3 className="text-lg font-bold text-gray-800">
                    {t('booking.discount.title', 'Mã giảm giá')}
                </h3>
            </div>

            {!appliedDiscount ? (
                <>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={discountCode}
                            onChange={(e) => {
                                setDiscountCode(e.target.value.toUpperCase());
                                if (error) setError('');
                            }}
                            onKeyDown={handleKeyPress}
                            placeholder={t('booking.discount.placeholder', 'Nhập mã giảm giá')}
                            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/30 focus:border-[#1E88E5] transition-all"
                            disabled={loading}
                        />
                        <button
                            onClick={handleApply}
                            disabled={loading || !discountCode.trim()}
                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                loading || !discountCode.trim()
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-[#1E88E5] text-white hover:bg-[#1565C0] shadow-md hover:shadow-lg'
                            }`}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                </div>
                            ) : (
                                t('booking.discount.apply', 'Áp dụng')
                            )}
                        </button>
                    </div>
                    {error && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                            <span>⚠️</span> {error}
                        </p>
                    )}
                </>
            ) : (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <HiOutlineTag className="text-green-600 text-lg" />
                        </div>
                        <div>
                            <p className="font-semibold text-green-700">{appliedDiscount.tenKhuyenMai}</p>
                            <p className="text-sm text-green-600">
                                {t('booking.discount.saved', 'Giảm')} {formatCurrencyWithCommas(appliedDiscount.giaTriGiam)} VND
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleRemove}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100 text-red-400 hover:text-red-600 transition-all"
                        title={t('booking.discount.remove', 'Xóa mã giảm giá')}
                    >
                        <IoClose className="text-xl" />
                    </button>
                </div>
            )}
        </div>
    );
}

export default DiscountCodeInput;
