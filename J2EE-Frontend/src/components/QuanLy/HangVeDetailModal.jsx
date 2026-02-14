import React from 'react';
import { FaTicketAlt, FaTimes, FaEye, FaCheckCircle } from 'react-icons/fa';
import { AiFillCloseCircle } from 'react-icons/ai';

/**
 * FlightCard Preview cho Detail Modal
 */
const DetailFlightCardPreview = ({ hangVe }) => {
    const config = {
        bgColor: hangVe.mauNen || 'bg-sky-50',
        borderColor: hangVe.mauVien || 'border-sky-200',
        textColor: hangVe.mauChu || 'text-sky-700',
        headerBg: hangVe.mauHeader || 'bg-gradient-to-r from-sky-500 to-blue-500',
        iconColor: hangVe.mauIcon || 'text-sky-500',
        ringColor: hangVe.mauRing || 'ring-sky-400',
        badgeBg: hangVe.mauBadge || 'bg-sky-100',
        tier: hangVe.hangBac || 'basic',
    };
    const isPremium = config.tier === 'premium';

    const parseBenefits = (moTa) => {
        if (!moTa) return [];
        return moTa.split('\n').filter(line => line.trim() !== '').map(line => ({
            text: line.replace(/^[•-]\s*/, ''),
            included: !line.toLowerCase().includes('không bao gồm')
        }));
    };

    const benefits = parseBenefits(hangVe.moTa);

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="p-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                <FaEye className="text-gray-400 text-sm" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Xem trước FlightCard</span>
            </div>
            <div className="p-3">
                {/* Selected state */}
                <div className={`flex rounded-lg overflow-hidden ring-4 ring-offset-2 ${config.ringColor} shadow-xl ${config.bgColor} border ${config.borderColor}`}>
                    <div className={`w-[35%] p-3 flex flex-col justify-center border-r ${config.borderColor} bg-white/80 shadow-inner`}>
                        <div className={`${config.headerBg} -mx-3 -mt-3 px-3 py-2 mb-2 shadow-md`}>
                            <div className="flex items-center justify-center gap-2">
                                {isPremium && <span className="text-yellow-200 text-xs">★</span>}
                                <div className="text-white font-semibold text-sm truncate">{hangVe.tenHangVe}</div>
                            </div>
                        </div>
                        <div className={`text-lg font-bold ${config.textColor} underline decoration-2 underline-offset-4`}>
                            1,500,000
                            <span className="text-xs font-normal text-gray-500"> VND</span>
                        </div>
                        {isPremium && (
                            <div className={`mt-1 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${config.badgeBg} ${config.textColor} w-fit`}>
                                Cao cấp
                            </div>
                        )}
                    </div>
                    <div className="w-[65%] p-3 bg-white/60">
                        <div className="text-sm font-semibold text-gray-700 mb-2">Lợi ích:</div>
                        {benefits.length > 0 ? (
                            <div className="grid grid-cols-2 gap-1 text-sm">
                                {benefits.slice(0, 6).map((benefit, idx) => (
                                    <div key={idx} className="flex items-center gap-1">
                                        {benefit.included ? (
                                            <FaCheckCircle className={`w-3.5 h-3.5 ${config.iconColor} flex-shrink-0`} />
                                        ) : (
                                            <AiFillCloseCircle className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                        )}
                                        <span className={`text-xs text-gray-600 truncate ${benefit.included ? '' : 'line-through text-gray-400'}`}>
                                            {benefit.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 italic">Chưa có lợi ích</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Modal Component để xem chi tiết hạng vé
 * @param {boolean} isOpen - Trạng thái mở/đóng modal
 * @param {function} onClose - Callback khi đóng modal
 * @param {object} hangVe - Dữ liệu hạng vé
 */
const HangVeDetailModal = ({ isOpen, onClose, hangVe }) => {
    if (!isOpen || !hangVe) return null;

    // Parse mô tả thành danh sách các lợi ích
    const parseMoTa = (moTa) => {
        if (!moTa) return [];
        return moTa.split('\n').filter(line => line.trim() !== '');
    };

    const benefits = parseMoTa(hangVe.moTa);

    // Map tên hạng bậc
    const hangBacLabel = {
        basic: 'Cơ bản (Basic)',
        mid: 'Trung cấp (Mid)',
        premium: 'Cao cấp (Premium)',
    };

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative z-10 h-full w-full md:h-auto md:max-w-3xl md:mx-auto md:my-6 md:rounded-xl bg-white md:shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 md:px-6 py-3 md:py-4 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                            <FaTicketAlt className="text-white text-lg md:text-xl" />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold truncate">
                            Chi tiết hạng vé
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 transition-colors p-1 hover:bg-white/10 rounded-lg ml-2 shrink-0"
                    >
                        <FaTimes className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-white p-4 md:p-6 space-y-5">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Left: Info */}
                        <div className="lg:w-1/2 space-y-5">
                            {/* Tên hạng vé */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    Tên hạng vé
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                        <FaTicketAlt className="text-white text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-gray-900">{hangVe.tenHangVe}</p>
                                        <p className="text-sm text-gray-500">Mã: #{hangVe.maHangVe}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Hạng bậc */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    Hạng bậc
                                </label>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                    hangVe.hangBac === 'premium' ? 'bg-amber-100 text-amber-700' :
                                    hangVe.hangBac === 'mid' ? 'bg-orange-100 text-orange-700' :
                                    'bg-sky-100 text-sky-700'
                                }`}>
                                    {hangBacLabel[hangVe.hangBac] || hangVe.hangBac || 'Cơ bản'}
                                </span>
                            </div>

                            {/* Mô tả lợi ích */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Mô tả lợi ích
                                </label>
                                {benefits.length > 0 ? (
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                                        <ul className="space-y-2">
                                            {benefits.map((benefit, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="text-blue-500 mt-0.5 flex-shrink-0">✓</span>
                                                    <span className="text-gray-700 text-sm">{benefit.replace(/^[•-]\s*/, '')}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
                                        <p className="text-gray-400 text-sm italic">Chưa có mô tả lợi ích</p>
                                    </div>
                                )}
                            </div>

                            {/* Thông tin màu sắc */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Cấu hình màu sắc
                                </label>
                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 space-y-2 text-sm">
                                    {[
                                        { label: 'Màu nền', value: hangVe.mauNen },
                                        { label: 'Màu viền', value: hangVe.mauVien },
                                        { label: 'Màu chữ', value: hangVe.mauChu },
                                        { label: 'Header', value: hangVe.mauHeader },
                                        { label: 'Màu icon', value: hangVe.mauIcon },
                                        { label: 'Màu ring', value: hangVe.mauRing },
                                        { label: 'Màu badge', value: hangVe.mauBadge },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <span className="text-gray-500">{item.label}:</span>
                                            <div className="flex items-center gap-2">
                                                <code className="text-xs bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700">{item.value || '—'}</code>
                                                <div className={`w-5 h-5 rounded border border-gray-300 ${item.value || ''}`}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: FlightCard Preview */}
                        <div className="lg:w-1/2">
                            <DetailFlightCardPreview hangVe={hangVe} />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 md:p-6 border-t border-gray-200 bg-gray-50 shrink-0">
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HangVeDetailModal;
