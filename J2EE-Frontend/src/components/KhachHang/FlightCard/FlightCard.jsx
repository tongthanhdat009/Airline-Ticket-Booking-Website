import { useState } from 'react';
import { IoAirplaneSharp } from 'react-icons/io5';
import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io';
import { FaCheckCircle, FaCheck } from 'react-icons/fa';
import { AiFillCloseCircle } from 'react-icons/ai';
import { formatTime, formatDateType, formatCurrency, calcFlightDuration } from '../../../services/utils';
import { twToCss, twGradientToCss } from '../../../utils/tailwindColorUtils';

/**
 * FlightCard - Component hiển thị thẻ chuyến bay có thể thu gọn
 * Hiển thị thông tin chuyến bay và danh sách hạng vé có sẵn
 */
const FlightCard = ({
    chuyenBay,
    sanBayDi,
    sanBayDen,
    hangVes, // Array of ticket classes with price and availability
    onHangVeClick,
    selectedHangVe
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleToggle = () => {
        setIsExpanded(!isExpanded);
    };

    const handleHangVeSelect = (hangVe) => {
        onHangVeClick(chuyenBay, hangVe);
        // Không đóng collapse sau khi chọn - giữ mở để user thấy các lựa chọn khác
    };

    const getHangVeConfig = (hangVe) => {
        // Chuyển Tailwind arbitrary value → CSS color cho inline style
        const gradient = twGradientToCss(hangVe.mauHeader);
        return {
            bgColor: twToCss(hangVe.mauNen) || 'rgb(240,249,255)',
            borderColor: twToCss(hangVe.mauVien) || 'rgb(186,230,253)',
            textColor: twToCss(hangVe.mauChu) || 'rgb(3,105,161)',
            headerFrom: gradient.from || 'rgb(14,165,233)',
            headerTo: gradient.to || 'rgb(59,130,246)',
            iconColor: twToCss(hangVe.mauIcon) || 'rgb(14,165,233)',
            ringColor: twToCss(hangVe.mauRing) || 'rgb(56,189,248)',
            badgeBg: twToCss(hangVe.mauBadge) || 'rgb(224,242,254)',
            tier: hangVe.hangBac || 'basic',
        };
    };

    // Parse mô tả từ API thành danh sách lợi ích
    const parseBenefits = (moTa) => {
        if (!moTa) return [];
        return moTa.split('\n').filter(line => line.trim() !== '').map(line => ({
            text: line.replace(/^[•-]\s*/, ''),
            included: !line.toLowerCase().includes('không bao gồm')
        }));
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4 border border-gray-100 hover:shadow-lg transition-shadow">
            {/* Flight Info Header - Always Visible */}
            <div
                className="p-4 cursor-pointer hover:bg-blue-50/50 transition-colors"
                onClick={handleToggle}
            >
                <div className="flex items-center justify-between">
                    {/* Left: Flight Route and Times */}
                    <div className="flex items-center gap-6 flex-1">
                        {/* Departure */}
                        <div className="text-center min-w-[100px]">
                            <div className="text-3xl font-bold text-gray-800">{formatTime(chuyenBay.gioDi)}</div>
                            <div className="text-sm text-gray-500">{sanBayDi?.maIATA || '---'}</div>
                            <div className="text-sm text-gray-600">{sanBayDi?.thanhPhoSanBay || chuyenBay.tuyenBay?.sanBayDi?.thanhPhoSanBay}</div>
                        </div>

                        {/* Flight Duration and Arrow */}
                        <div className="flex flex-col items-center px-4">
                            <div className="text-sm text-blue-600 font-medium mb-1">
                                {calcFlightDuration(chuyenBay.gioDi, chuyenBay.ngayDi, chuyenBay.gioDen, chuyenBay.ngayDen)}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                <div className="w-24 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400 relative">
                                    <IoAirplaneSharp className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 rotate-90" />
                                </div>
                                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Bay thẳng</div>
                        </div>

                        {/* Arrival */}
                        <div className="text-center min-w-[100px]">
                            <div className="text-3xl font-bold text-gray-800">{formatTime(chuyenBay.gioDen)}</div>
                            <div className="text-sm text-gray-500">{sanBayDen?.maIATA || '---'}</div>
                            <div className="text-sm text-gray-600">{sanBayDen?.thanhPhoSanBay || chuyenBay.tuyenBay?.sanBayDen?.thanhPhoSanBay}</div>
                        </div>
                    </div>

                    {/* Center: Flight Details */}
                    <div className="flex flex-col items-center px-6 border-l border-r border-gray-200 mx-4">
                        <div className="text-sm text-gray-500">Số hiệu chuyến bay</div>
                        <div className="text-xl font-bold text-blue-600">{chuyenBay.soHieuChuyenBay}</div>
                        <div className="text-sm text-gray-500 mt-1">{formatDateType(chuyenBay.ngayDi)}</div>
                    </div>

                    {/* Right: Expand Icon */}
                    <div className="flex items-center">
                        {isExpanded ? (
                            <IoMdArrowDropup className="text-2xl text-blue-600" />
                        ) : (
                            <IoMdArrowDropdown className="text-2xl text-blue-600" />
                        )}
                    </div>
                </div>
            </div>

            {/* Collapsible Ticket Classes Section */}
            {isExpanded && (
                <div className="border-t border-gray-200 animate-slideDown">
                    <div className="p-2">
                        {hangVes && hangVes.length > 0 ? (
                            <div className="space-y-2">
                                {hangVes.map((hangVe) => {
                                    const config = getHangVeConfig(hangVe);
                                    const benefits = parseBenefits(hangVe.moTa);
                                    const isSelected = selectedHangVe?.maHangVe === hangVe.maHangVe;
                                    const isPremium = config.tier === 'premium';

                                    return (
                                        <div
                                            key={hangVe.maHangVe}
                                            className={`flex rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                                                isSelected
                                                    ? 'shadow-xl scale-[1.02] border'
                                                    : 'bg-gray-50 hover:bg-gray-100 hover:shadow-md border border-transparent'
                                            } ${isPremium && !isSelected ? 'border-l-4' : ''}`}
                                            style={isSelected ? {
                                                backgroundColor: config.bgColor,
                                                borderColor: config.borderColor,
                                                outline: `4px solid ${config.ringColor}`,
                                                outlineOffset: '2px',
                                            } : isPremium ? {
                                                borderLeftColor: config.borderColor,
                                            } : undefined}
                                            onClick={() => handleHangVeSelect(hangVe)}
                                        >
                                            {/* 30% - Name and Price */}
                                            <div className={`w-[30%] p-3 flex flex-col justify-center border-r ${
                                                isSelected ? 'bg-white/80 shadow-inner' : ''
                                            }`}
                                                style={{ borderColor: config.borderColor }}>
                                                <div className={`-mx-3 -mt-3 px-3 py-2 mb-2 relative ${
                                                    isSelected ? 'shadow-md' : ''
                                                }`}
                                                    style={{ background: `linear-gradient(to right, ${config.headerFrom}, ${config.headerTo})` }}>
                                                    <div className="flex items-center justify-center gap-2">
                                                        {isPremium && (
                                                            <span className="text-yellow-200 text-xs">★</span>
                                                        )}
                                                        <div className="text-white font-semibold text-sm">{hangVe.tenHangVe}</div>
                                                        {isSelected && (
                                                            <div className="flex items-center gap-1">
                                                                <FaCheck className="text-white text-lg animate-pulse" />
                                                                <span className="text-xs text-white/90 font-medium">ĐÃ CHỌN</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {hangVe.giaVe != null && hangVe.giaVe !== '' ? (
                                                    <div className={`text-2xl font-bold ${isSelected ? 'underline decoration-2 underline-offset-4' : ''}`}
                                                        style={{ color: config.textColor }}>
                                                        {formatCurrency(hangVe.giaVe)}
                                                        <span className="text-sm font-normal text-gray-500"> VND</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-red-500">Hết chỗ</div>
                                                )}
                                                {isPremium && (
                                                    <div className="mt-1 inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
                                                        style={{ backgroundColor: config.badgeBg, color: config.textColor }}>
                                                        Cao cấp
                                                    </div>
                                                )}
                                            </div>

                                            {/* 70% - Benefits */}
                                            <div className={`w-[70%] p-3 ${isSelected ? 'bg-white/60' : ''}`}>
                                                <div className="text-sm font-semibold text-gray-700 mb-2">Lợi ích:</div>
                                                {benefits.length > 0 ? (
                                                    <div className="grid grid-cols-2 gap-1 text-sm">
                                                        {benefits.map((benefit, idx) => (
                                                            <div key={idx} className="flex items-center gap-1">
                                                                {benefit.included ? (
                                                                    <FaCheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: config.iconColor }} />
                                                                ) : (
                                                                    <AiFillCloseCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                                )}
                                                                <span className={`text-gray-600 ${benefit.included ? '' : 'line-through text-gray-400'}`}>
                                                                    {benefit.text}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-400 italic">Chưa có thông tin lợi ích</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-gray-500">
                                Không có hạng vé nào khả dụng
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlightCard;
