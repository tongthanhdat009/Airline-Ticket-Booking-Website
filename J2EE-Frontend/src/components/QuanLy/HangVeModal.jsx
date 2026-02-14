import React, { useState, useEffect, useCallback } from 'react';
import { FaTicketAlt, FaPalette, FaEye, FaCheckCircle } from 'react-icons/fa';
import { AiFillCloseCircle } from 'react-icons/ai';
import { message } from 'antd';
import { twToHex, hexToTw, twGradientToHex, hexToTwGradient, twToCss, twGradientToCss } from '../../utils/tailwindColorUtils';


// Các preset màu sắc (Tailwind arbitrary value syntax)
const COLOR_PRESETS = [
    {
        name: 'Sky Blue',
        preview: '#0ea5e9',
        mauNen: 'bg-[rgb(240,249,255)]', mauVien: 'border-[rgb(186,230,253)]', mauChu: 'text-[rgb(3,105,161)]',
        mauHeader: 'bg-gradient-to-r from-[rgb(14,165,233)] to-[rgb(59,130,246)]',
        mauIcon: 'text-[rgb(14,165,233)]', mauRing: 'ring-[rgb(56,189,248)]', mauBadge: 'bg-[rgb(224,242,254)]', hangBac: 'basic',
    },
    {
        name: 'Emerald',
        preview: '#10b981',
        mauNen: 'bg-[rgb(236,253,245)]', mauVien: 'border-[rgb(167,243,208)]', mauChu: 'text-[rgb(4,120,87)]',
        mauHeader: 'bg-gradient-to-r from-[rgb(16,185,129)] to-[rgb(20,184,166)]',
        mauIcon: 'text-[rgb(16,185,129)]', mauRing: 'ring-[rgb(52,211,153)]', mauBadge: 'bg-[rgb(209,250,229)]', hangBac: 'basic',
    },
    {
        name: 'Orange',
        preview: '#f97316',
        mauNen: 'bg-[rgb(255,247,237)]', mauVien: 'border-[rgb(254,215,170)]', mauChu: 'text-[rgb(194,65,12)]',
        mauHeader: 'bg-gradient-to-r from-[rgb(249,115,22)] to-[rgb(245,158,11)]',
        mauIcon: 'text-[rgb(249,115,22)]', mauRing: 'ring-[rgb(251,146,60)]', mauBadge: 'bg-[rgb(255,237,213)]', hangBac: 'mid',
    },
    {
        name: 'Purple',
        preview: '#9333ea',
        mauNen: 'bg-[rgb(250,245,255)]', mauVien: 'border-[rgb(216,180,254)]', mauChu: 'text-[rgb(126,34,206)]',
        mauHeader: 'bg-gradient-to-r from-[rgb(147,51,234)] to-[rgb(79,70,229)]',
        mauIcon: 'text-[rgb(168,85,247)]', mauRing: 'ring-[rgb(192,132,252)]', mauBadge: 'bg-[rgb(243,232,255)]', hangBac: 'premium',
    },
    {
        name: 'Amber',
        preview: '#f59e0b',
        mauNen: 'bg-[rgb(255,251,235)]', mauVien: 'border-[rgb(252,211,77)]', mauChu: 'text-[rgb(180,83,9)]',
        mauHeader: 'bg-gradient-to-r from-[rgb(245,158,11)] to-[rgb(234,179,8)]',
        mauIcon: 'text-[rgb(245,158,11)]', mauRing: 'ring-[rgb(251,191,36)]', mauBadge: 'bg-[rgb(254,243,199)]', hangBac: 'premium',
    },
    {
        name: 'Rose',
        preview: '#f43f5e',
        mauNen: 'bg-[rgb(255,241,242)]', mauVien: 'border-[rgb(253,164,175)]', mauChu: 'text-[rgb(190,18,60)]',
        mauHeader: 'bg-gradient-to-r from-[rgb(244,63,94)] to-[rgb(236,72,153)]',
        mauIcon: 'text-[rgb(244,63,94)]', mauRing: 'ring-[rgb(251,113,133)]', mauBadge: 'bg-[rgb(255,228,230)]', hangBac: 'premium',
    },
];

const DEFAULT_COLORS = COLOR_PRESETS[0];

/**
 * FlightCard Preview - Hiển thị preview hạng vé trong FlightCard (dùng inline style)
 */
const FlightCardPreview = ({ formData }) => {
    const bgColor = twToCss(formData.mauNen || DEFAULT_COLORS.mauNen);
    const borderColor = twToCss(formData.mauVien || DEFAULT_COLORS.mauVien);
    const textColor = twToCss(formData.mauChu || DEFAULT_COLORS.mauChu);
    const gradient = twGradientToCss(formData.mauHeader || DEFAULT_COLORS.mauHeader);
    const iconColor = twToCss(formData.mauIcon || DEFAULT_COLORS.mauIcon);
    const ringColor = twToCss(formData.mauRing || DEFAULT_COLORS.mauRing);
    const badgeBg = twToCss(formData.mauBadge || DEFAULT_COLORS.mauBadge);
    const isPremium = (formData.hangBac || 'basic') === 'premium';

    const headerBg = (gradient.from && gradient.to)
        ? `linear-gradient(to right, ${gradient.from}, ${gradient.to})`
        : 'linear-gradient(to right, rgb(14,165,233), rgb(59,130,246))';

    const parseBenefits = (moTa) => {
        if (!moTa) return [];
        return moTa.split('\n').filter(line => line.trim() !== '').map(line => ({
            text: line.replace(/^[•-]\s*/, ''),
            included: !line.toLowerCase().includes('không bao gồm')
        }));
    };

    const benefits = parseBenefits(formData.moTa);

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="p-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                <FaEye className="text-gray-400 text-sm" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Xem trước FlightCard</span>
            </div>
            <div className="p-3">
                {/* Selected state */}
                <div className="flex rounded-lg overflow-hidden shadow-xl border"
                    style={{ backgroundColor: bgColor, borderColor: borderColor, outline: `4px solid ${ringColor}`, outlineOffset: '2px' }}>
                    <div className="w-[35%] p-3 flex flex-col justify-center border-r bg-white/80 shadow-inner"
                        style={{ borderColor: borderColor }}>
                        <div className="-mx-3 -mt-3 px-3 py-2 mb-2 shadow-md"
                            style={{ background: headerBg }}>
                            <div className="flex items-center justify-center gap-2">
                                {isPremium && <span className="text-yellow-200 text-xs">★</span>}
                                <div className="text-white font-semibold text-sm truncate">
                                    {formData.tenHangVe || 'Tên hạng vé'}
                                </div>
                            </div>
                        </div>
                        <div className="text-lg font-bold underline decoration-2 underline-offset-4"
                            style={{ color: textColor }}>
                            1,500,000
                            <span className="text-xs font-normal text-gray-500"> VND</span>
                        </div>
                        {isPremium && (
                            <div className="mt-1 inline-block text-xs font-semibold px-2 py-0.5 rounded-full w-fit"
                                style={{ backgroundColor: badgeBg, color: textColor }}>
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
                                            <FaCheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: iconColor }} />
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
                            <p className="text-xs text-gray-400 italic">Nhập mô tả để xem lợi ích</p>
                        )}
                    </div>
                </div>

                {/* Unselected state */}
                <div className="mt-3">
                    <div className="text-xs text-gray-400 mb-1">Trạng thái chưa chọn:</div>
                    <div className={`flex rounded-lg overflow-hidden bg-gray-50 hover:bg-gray-100 border border-transparent ${isPremium ? 'border-l-4' : ''}`}
                        style={isPremium ? { borderLeftColor: borderColor } : undefined}>
                        <div className="w-[35%] p-2 flex flex-col justify-center border-r"
                            style={{ borderColor: borderColor }}>
                            <div className="-mx-2 -mt-2 px-2 py-1.5 mb-1.5"
                                style={{ background: headerBg }}>
                                <div className="flex items-center justify-center gap-1">
                                    {isPremium && <span className="text-yellow-200 text-xs">★</span>}
                                    <div className="text-white font-semibold text-xs truncate">
                                        {formData.tenHangVe || 'Tên hạng vé'}
                                    </div>
                                </div>
                            </div>
                            <div className="text-sm font-bold" style={{ color: textColor }}>
                                1,500,000
                                <span className="text-xs font-normal text-gray-500"> VND</span>
                            </div>
                        </div>
                        <div className="w-[65%] p-2">
                            <div className="text-xs font-semibold text-gray-700 mb-1">Lợi ích:</div>
                            {benefits.length > 0 ? (
                                <div className="grid grid-cols-2 gap-0.5 text-xs">
                                    {benefits.slice(0, 4).map((benefit, idx) => (
                                        <div key={idx} className="flex items-center gap-1">
                                            {benefit.included ? (
                                                <FaCheckCircle className="w-3 h-3 flex-shrink-0" style={{ color: iconColor }} />
                                            ) : (
                                                <AiFillCloseCircle className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                            )}
                                            <span className="text-gray-600 truncate">{benefit.text}</span>
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
        </div>
    );
};

/**
 * Color Picker Field - Chọn màu bằng color picker, lưu dạng Tailwind arbitrary value
 * Ví dụ: prefix="bg" → bg-[rgb(240,249,255)]
 */
const ColorPickerField = ({ label, name, value, onChange, prefix, disabled }) => {
    const hexValue = twToHex(value);
    const cssColor = twToCss(value);
    const handleColorChange = (e) => {
        onChange({ target: { name, value: hexToTw(e.target.value, prefix) } });
    };
    return (
        <div className="flex items-center gap-2">
            <input type="color" value={hexValue} onChange={handleColorChange} disabled={disabled}
                className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200 p-0.5 bg-white shrink-0" />
            <div className="min-w-0">
                <span className="text-xs font-medium text-gray-600 block">{label}</span>
                {cssColor && <span className="text-[10px] text-gray-400 block truncate">{cssColor}</span>}
            </div>
        </div>
    );
};

/**
 * Gradient Picker Field - Chọn 2 màu cho gradient header
 * Lưu dạng: bg-gradient-to-r from-[rgb(r,g,b)] to-[rgb(r,g,b)]
 */
const GradientPickerField = ({ label, name, value, onChange, disabled }) => {
    const { from, to } = twGradientToHex(value);
    const handleChange = (type, hex) => {
        const c = twGradientToHex(value);
        const newFrom = type === 'from' ? hex : c.from;
        const newTo = type === 'to' ? hex : c.to;
        onChange({ target: { name, value: hexToTwGradient(newFrom, newTo) } });
    };
    return (
        <div>
            <span className="text-xs font-medium text-gray-600 mb-1.5 block">{label}</span>
            <div className="flex items-center gap-2">
                <input type="color" value={from} onChange={e => handleChange('from', e.target.value)} disabled={disabled}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200 p-0.5 bg-white shrink-0" />
                <div className="flex-1 h-7 rounded-md border border-gray-200"
                    style={{ background: `linear-gradient(to right, ${from}, ${to})` }}></div>
                <input type="color" value={to} onChange={e => handleChange('to', e.target.value)} disabled={disabled}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200 p-0.5 bg-white shrink-0" />
            </div>
        </div>
    );
};

/**
 * Modal Component để thêm/cập nhật hạng vé
 * Với trình chỉnh sửa màu sắc và xem trước FlightCard
 */
const HangVeModal = ({ isOpen, onClose, onSave, isEditMode, hangVe }) => {
    const [formData, setFormData] = useState({
        tenHangVe: '',
        moTa: '',
        mauNen: DEFAULT_COLORS.mauNen,
        mauVien: DEFAULT_COLORS.mauVien,
        mauChu: DEFAULT_COLORS.mauChu,
        mauHeader: DEFAULT_COLORS.mauHeader,
        mauIcon: DEFAULT_COLORS.mauIcon,
        mauRing: DEFAULT_COLORS.mauRing,
        mauBadge: DEFAULT_COLORS.mauBadge,
        hangBac: DEFAULT_COLORS.hangBac,
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('info');

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && hangVe) {
                setFormData({
                    tenHangVe: hangVe.tenHangVe || '',
                    moTa: hangVe.moTa || '',
                    mauNen: hangVe.mauNen || DEFAULT_COLORS.mauNen,
                    mauVien: hangVe.mauVien || DEFAULT_COLORS.mauVien,
                    mauChu: hangVe.mauChu || DEFAULT_COLORS.mauChu,
                    mauHeader: hangVe.mauHeader || DEFAULT_COLORS.mauHeader,
                    mauIcon: hangVe.mauIcon || DEFAULT_COLORS.mauIcon,
                    mauRing: hangVe.mauRing || DEFAULT_COLORS.mauRing,
                    mauBadge: hangVe.mauBadge || DEFAULT_COLORS.mauBadge,
                    hangBac: hangVe.hangBac || DEFAULT_COLORS.hangBac,
                });
            } else {
                setFormData({
                    tenHangVe: '',
                    moTa: '',
                    mauNen: DEFAULT_COLORS.mauNen,
                    mauVien: DEFAULT_COLORS.mauVien,
                    mauChu: DEFAULT_COLORS.mauChu,
                    mauHeader: DEFAULT_COLORS.mauHeader,
                    mauIcon: DEFAULT_COLORS.mauIcon,
                    mauRing: DEFAULT_COLORS.mauRing,
                    mauBadge: DEFAULT_COLORS.mauBadge,
                    hangBac: DEFAULT_COLORS.hangBac,
                });
            }
            setErrors({});
            setActiveTab('info');
        }
    }, [isOpen, isEditMode, hangVe]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    }, [errors]);

    const applyPreset = useCallback((preset) => {
        setFormData(prev => ({
            ...prev,
            mauNen: preset.mauNen,
            mauVien: preset.mauVien,
            mauChu: preset.mauChu,
            mauHeader: preset.mauHeader,
            mauIcon: preset.mauIcon,
            mauRing: preset.mauRing,
            mauBadge: preset.mauBadge,
            hangBac: preset.hangBac,
        }));
    }, []);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.tenHangVe || formData.tenHangVe.trim() === '') {
            newErrors.tenHangVe = 'Tên hạng vé không được để trống';
        } else if (formData.tenHangVe.length < 2) {
            newErrors.tenHangVe = 'Tên hạng vé phải có ít nhất 2 ký tự';
        } else if (formData.tenHangVe.length > 255) {
            newErrors.tenHangVe = 'Tên hạng vé không được quá 255 ký tự';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            message.warning({
                content: 'Vui lòng kiểm tra lại thông tin!',
                duration: 3,
            });
            return;
        }

        try {
            setSubmitting(true);
            await onSave(formData);
        } catch {
            // Error is handled in parent component
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (!submitting) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50" onClick={handleCancel}></div>

            <div className="relative z-10 h-full w-full md:h-auto md:max-h-[90vh] md:max-w-5xl md:mx-auto md:my-[5vh] md:rounded-xl bg-white md:shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="[background:linear-gradient(to_right,rgb(147,51,234),rgb(126,34,206))] text-white px-4 md:px-6 py-3 md:py-4 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                            <FaTicketAlt className="text-white text-lg md:text-xl" />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold truncate">
                            {isEditMode ? 'Cập nhật hạng vé' : 'Thêm hạng vé mới'}
                        </h3>
                    </div>
                    <button
                        onClick={handleCancel}
                        disabled={submitting}
                        className="text-white hover:text-gray-200 transition-colors p-1 hover:bg-white/10 rounded-lg ml-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto">
                        <div className="flex flex-col lg:flex-row">
                            {/* Left: Form Fields */}
                            <div className="lg:w-1/2 p-4 md:p-6 space-y-4 lg:border-r border-gray-200">
                                {/* Tab switcher */}
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('info')}
                                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-all ${
                                            activeTab === 'info'
                                                ? 'bg-white text-purple-700 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        <FaTicketAlt className="text-xs" />
                                        Thông tin
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('colors')}
                                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-all ${
                                            activeTab === 'colors'
                                                ? 'bg-white text-purple-700 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        <FaPalette className="text-xs" />
                                        Màu sắc
                                    </button>
                                </div>

                                {/* Tab: Thông tin */}
                                {activeTab === 'info' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                Tên hạng vé <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="tenHangVe"
                                                placeholder="VD: Economy, Business, First Class"
                                                value={formData.tenHangVe}
                                                onChange={handleChange}
                                                disabled={submitting}
                                                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all ${
                                                    errors.tenHangVe ? 'border-red-500' : 'border-gray-300'
                                                } ${submitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                required
                                            />
                                            {errors.tenHangVe && (
                                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="break-words">{errors.tenHangVe}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                Mô tả lợi ích
                                            </label>
                                            <textarea
                                                name="moTa"
                                                placeholder="Nhập mô tả lợi ích (mỗi dòng 1 lợi ích)"
                                                value={formData.moTa}
                                                onChange={handleChange}
                                                disabled={submitting}
                                                rows={6}
                                                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all resize-y border-gray-300 ${
                                                    submitting ? 'bg-gray-100 cursor-not-allowed' : ''
                                                }`}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Mỗi lợi ích trên một dòng. Bắt đầu bằng &quot;• &quot; để hiển thị dạng danh sách.
                                            </p>
                                        </div>

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <p className="text-sm text-blue-800 font-semibold">Thông tin:</p>
                                            <ul className="text-sm text-blue-700 mt-1 space-y-1 list-disc list-inside">
                                                <li>Tên hạng vé phải từ 2 đến 255 ký tự</li>
                                                <li>Tên hạng vé không được trùng</li>
                                                <li>Chuyển tab &quot;Màu sắc&quot; để tùy chỉnh giao diện</li>
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {/* Tab: Màu sắc */}
                                {activeTab === 'colors' && (
                                    <div className="space-y-3">
                                        {/* Presets - 3 cột */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Chọn nhanh bộ màu</label>
                                            <div className="grid grid-cols-3 gap-1.5">
                                                {COLOR_PRESETS.map((preset, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => applyPreset(preset)}
                                                        disabled={submitting}
                                                        className="flex items-center gap-1.5 px-2 py-1.5 border border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all text-left disabled:opacity-50"
                                                    >
                                                        <div className="w-5 h-5 rounded-full flex-shrink-0"
                                                            style={{ background: preset.preview }}></div>
                                                        <span className="text-[11px] font-medium text-gray-700 truncate">{preset.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Hạng bậc */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Hạng bậc</label>
                                            <select
                                                name="hangBac"
                                                value={formData.hangBac}
                                                onChange={handleChange}
                                                disabled={submitting}
                                                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                                            >
                                                <option value="basic">Basic (Cơ bản)</option>
                                                <option value="mid">Mid (Trung cấp)</option>
                                                <option value="premium">Premium (Cao cấp - có badge ★)</option>
                                            </select>
                                        </div>

                                        {/* Color pickers */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-2">Tùy chỉnh màu sắc</label>
                                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 space-y-3">
                                                <div className="grid grid-cols-3 gap-3">
                                                    <ColorPickerField label="Nền" name="mauNen" value={formData.mauNen} onChange={handleChange} prefix="bg" disabled={submitting} />
                                                    <ColorPickerField label="Viền" name="mauVien" value={formData.mauVien} onChange={handleChange} prefix="border" disabled={submitting} />
                                                    <ColorPickerField label="Chữ" name="mauChu" value={formData.mauChu} onChange={handleChange} prefix="text" disabled={submitting} />
                                                    <ColorPickerField label="Icon" name="mauIcon" value={formData.mauIcon} onChange={handleChange} prefix="text" disabled={submitting} />
                                                    <ColorPickerField label="Ring" name="mauRing" value={formData.mauRing} onChange={handleChange} prefix="ring" disabled={submitting} />
                                                    <ColorPickerField label="Badge" name="mauBadge" value={formData.mauBadge} onChange={handleChange} prefix="bg" disabled={submitting} />
                                                </div>
                                                <GradientPickerField label="Header gradient" name="mauHeader" value={formData.mauHeader} onChange={handleChange} disabled={submitting} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right: FlightCard Preview */}
                            <div className="lg:w-1/2 p-4 md:p-6 bg-gray-50">
                                <FlightCardPreview formData={formData} />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 md:p-6 border-t border-gray-200 bg-gray-50 shrink-0">
                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={submitting}
                                className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Đang lưu...</span>
                                    </>
                                ) : (
                                    <span>{isEditMode ? 'Cập nhật' : 'Thêm mới'}</span>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HangVeModal;
