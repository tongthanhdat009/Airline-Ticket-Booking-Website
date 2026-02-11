import { useNavigate, useLocation} from "react-router-dom"
import { useState, useEffect } from 'react';
import { getSanBayByThanhPhoSanBay, searchChuyenBay, getGiaVe , kiemTraConGhe} from "../../../../services/datVeServices"
import { formatCurrency, formatCurrencyWithCommas, formatDate, formatDateType, formatTime, calcFlightDuration } from "../../../../services/utils";
import { FaLongArrowAltRight, FaLongArrowAltLeft} from 'react-icons/fa';
import { MdAirplanemodeInactive } from 'react-icons/md';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { MdKeyboardArrowUp } from 'react-icons/md';
import { IoAirplaneSharp } from 'react-icons/io5';
import { FaCheckCircle } from 'react-icons/fa';
import { AiFillCloseCircle } from 'react-icons/ai';
import { GoDotFill } from 'react-icons/go';
import { GoGoal } from 'react-icons/go';

import HeaderTimKiemChuyen from "../../../../components/KhachHang/HeaderTimKiemChuyen"
import ThongTinThanhToan from "../../../../components/KhachHang/ThongTinThanhToan"
import DanhSachNgayBay from "../../../../components/KhachHang/DanhSachNgayBay";
import { useTranslation } from 'react-i18next';

function ChonChuyenBayVe() {
    const { t } = useTranslation();
    const location = useLocation();
    const [formData, setFormData] = useState(location.state);
    const navigate = useNavigate();
    const [sanBayDi, setSanBayDi] = useState(null);
    const [sanBayDen, setSanBayDen] = useState(null);
    const [chuyenBays, setChuyenBays] = useState([]);
    const [expanded, setExpanded] = useState({ id: null, type: null });
    const [giaVes, setGiaVes] = useState({});
    const [selectedTuyenBayVe, setSelectedTuyenBayVe] = useState(null);
    const [soGheCon, setSoGheCon] = useState({});

    const tiepTucOnClick = () => {
        if (!selectedTuyenBayVe) {
            alert(t('booking.errors.select_flight_first'));
            return;
        }
        navigate("/thong-tin-hanh-khach", { state: { ...formData, selectedTuyenBayVe, totalPrice: calcTotalPrice() } });
    }
    
    const SoldOutIcon = ({ size = 18 }) => (
        <div className="flex flex-col items-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border-[2px] border-gray-400 text-gray-400">
                <MdAirplanemodeInactive size={size} />
            </span>
        </div>
    );

    const calcTotalPrice = () => {
        if(!selectedTuyenBayVe.hangVe) return 0;
        const giaVeDi = formData.totalPrice || 0;
        const giaVeVe = selectedTuyenBayVe.hangVe.giaVe || 0;
        const thuePhi = 583000;
        const dichVu =  0;
        return (giaVeVe * formData.passengers) + thuePhi + dichVu + giaVeDi;
    }

    const handleExpand = (cb , id, type) => {
        if (expanded.id === id && expanded.type === type ) {
            setExpanded({ id: null, type: null });
        } else {
            setExpanded({ id, type });
            if (type >= 1 && type <= 4) {
                const key = `${id}_${type}`;
                const hangVe = giaVes[key] || null;
                setSelectedTuyenBayVe({ ...cb, hangVe: hangVe });
            }
        }
    };

    const handleSelectNgay = (ngay) => {
        setFormData(prev => ({
            ...prev,
            endDate: ngay
        }));
    };

    useEffect(() => {
    if (!chuyenBays.length) return;

    const fetchSoGhe = async () => {
    const gheMap = {};
    const requests = chuyenBays.flatMap(cb => 
        [1,2,3,4].map(async hangVeId => {
        try {
            const available = await kiemTraConGhe(cb.maChuyenBay, hangVeId, formData.passengers);
            gheMap[`${cb.maChuyenBay}_${hangVeId}`] = available.data;
            console.log('So ghe con cho chuyen bay', cb.maChuyenBay, 'hang ve', hangVeId, ':', available.data);
        } catch {
            gheMap[`${cb.maChuyenBay}_${hangVeId}`] = false;
        }
        })
    );
    await Promise.all(requests);
    setSoGheCon(gheMap);
    };

    fetchSoGhe();
    }, [chuyenBays, formData.passengers]);

    useEffect(() => {
    const fetchSanBay = async () => {
        const den = await getSanBayByThanhPhoSanBay(formData.departure);
        const di = await getSanBayByThanhPhoSanBay(formData.arrival);
        setSanBayDi(di.data);
        setSanBayDen(den.data);
    };
    fetchSanBay();
    }, [formData.departure, formData.arrival]);

    useEffect(() => {
    if (!sanBayDi || !sanBayDen) return;
    const formattedDate = formatDate(formData.endDate);
    const fetchChuyenBays = async () => {
        const results = await searchChuyenBay(
        sanBayDi.maIATA,
        sanBayDen.maIATA,
        formattedDate
        );
        setChuyenBays(results.data);
    };``
    fetchChuyenBays();
    }, [sanBayDi, sanBayDen, formData.endDate]);

    useEffect(() => {
    if (!chuyenBays.length) return;

    const fetchTatCaGiaVe = async () => {
        const giaMap = {};
        for (const cb of chuyenBays) {
            for (let hangVeId = 1; hangVeId <= 4; hangVeId++) {
                try {
                    const res = await getGiaVe(cb.maChuyenBay, hangVeId);
                    console.log('Gia ve response:', res.data);
                    if (res.success && res.data) {
                        console.log(`Gia ve cho chuyen ${cb.maChuyenBay}, hang ${hangVeId}:`, res.data);
                        giaMap[`${cb.maChuyenBay}_${hangVeId}`] = res.data;
                    }
                } catch (err) {
                console.error(`Lỗi lấy giá vé cho chuyến ${cb.maChuyenBay}, hạng ${hangVeId}`, err);
                }
            }
        }

        setGiaVes(giaMap);
    };

    fetchTatCaGiaVe();
    }, [chuyenBays]);

    const hienThiGiaVe = (maChuyenBay, hangVeId, cb, isLast=false) => {
        const key = `${maChuyenBay}_${hangVeId}`;
        const gia = giaVes[key];
        const hetCho = !gia || !gia.giaVe || soGheCon[key] === false;
        if (hetCho) {
            return (
            <div className={`bg-gray-100 flex flex-col items-center justify-center ${ isLast===true ? '' : 'border-r-[1px]'} `}>
                <div className="flex flex-col items-center justify-center text-gray-400">
                    <SoldOutIcon />
                    HẾT CHỖ
                </div>
            </div>
            );
        }
        return (
            <div className={`flex flex-col items-center justify-center ${ isLast===true ? '' : 'border-r-[1px]'} cursor-pointer transition-colors ${
                expanded.id === cb.maChuyenBay && expanded.type === hangVeId ? getBackgroundColor(hangVeId) : 'bg-gray-100'
                }`} onClick={() => handleExpand(cb, cb.maChuyenBay, hangVeId)}>
                <div className="flex flex-col items-center justify-center text-black font-bold">
                    <span className="text-3xl mt-4">{formatCurrency(gia.giaVe)}</span>
                    <span className="text-gray-500 text-xl">000 VND</span>
                    {expanded.id === cb.maChuyenBay && expanded.type === hangVeId ? (
                        <MdKeyboardArrowUp className="text-gray-700 cursor-pointer mt-1"/>
                    ) : (
                        <MdKeyboardArrowDown className="text-gray-700 cursor-pointer mt-1"/>
                    )}
                </div>
            </div>
        );
    };

    const getBackgroundColor = (hangVeId) => {
        switch (hangVeId) {
        case 1: return "bg-green-100";   // Economy
        case 2: return "bg-yellow-100";     // Premium
        case 3: return "bg-red-100";    // Business
        case 4: return "bg-orange-100";   // First
        }
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
            <HeaderTimKiemChuyen data={{...formData, sanBayDi, sanBayDen}}/>
            <div className="px-32 flex gap-8">
                <div className="w-2/3 flex flex-col mb-50">
                    <div className="flex items-center justify-between bg-white px-50">
                        <div className="flex flex-col p-2 items-center max-w-[200px] min-w-[220px]">
                            <span className="font-bold text-2xl">{sanBayDi?.maIATA}</span>
                            <span>{formData.arrival}</span>
                        </div>
                        <div className="flex flex-col items-center ">
                            <FaLongArrowAltRight className="text-3xl text-[#1E88E5]" />
                            {formData.flightType === 'round' && (
                            <FaLongArrowAltLeft className="text-3xl text-gray-500" />
                            )}
                        </div>
                        <div className="flex flex-col p-2 items-center max-w-[200px] min-w-[220px]">
                            <span className="font-bold text-2xl">{sanBayDen?.maIATA}</span>
                            <span>{formData.departure}</span>
                        </div>
                    </div>
                    <DanhSachNgayBay ngayChon={formData.endDate?formatDate(formData.endDate):""} onSelect={handleSelectNgay} />
                    {Array.isArray(chuyenBays) && chuyenBays.length ? (
                        chuyenBays.map(cb => (
                            <div className="w-full" key={cb.maChuyenBay}>
                                <div className="grid grid-cols-5 grid-rows-2 w-full space mt-3" style={{ gridTemplateColumns: '200px 1fr 1fr 1fr 1fr', gridTemplateRows: '45px 1fr' }}>
                                    <div>
                                        
                                    </div>
                                    <div className="bg-[#1565C0] flex items-center justify-center text-white font-bold rounded-t-lg mx-[4px]">
                                        Business
                                    </div>
                                    <div className="bg-[#1E88E5] flex items-center justify-center text-white font-bold rounded-t-lg mx-[4px]">
                                        FirstClass
                                    </div>
                                    <div className="bg-[#64B5F6] flex items-center justify-center text-white font-bold rounded-t-lg mx-[4px]">
                                        Deluxe
                                    </div>
                                    <div className="bg-green-500 flex items-center justify-center text-white font-bold rounded-t-lg mx-[4px]">
                                        Economy
                                    </div>
                                    <div className="bg-linear-to-r from-[#1E88E5] to-[#64B5F6] flex flex-col items-center justify-center p-2 rounded-tl-lg text-center cursor-pointer" onClick={() => handleExpand(cb, cb.maChuyenBay, 6)}>
                                        <div className="text-[15px] mt-2">{cb.soHieuChuyenBay}</div>
                                        <div><span className="text-xl font-bold">{formatTime(cb.gioDi)}</span> <span className="font-[12px]">đến</span > <span className="text-xl font-bold">{formatTime(cb.gioDen)}</span></div>
                                        <div className="text-[12px] text-[#1E88E5] font-bold">{t('booking.flight.direct')}</div>
                                        {expanded.id === cb.maChuyenBay && expanded.type === 6 ? (
                                            <MdKeyboardArrowUp className="text-gray-700 cursor-pointer mt-1" onClick={() => handleExpand(cb, cb.maChuyenBay, 6)} />
                                        ) : (
                                            <MdKeyboardArrowDown className="text-gray-700 cursor-pointer mt-1" onClick={() => handleExpand(cb, cb.maChuyenBay, 6)} />
                                        )}
                                    </div>
                                        {hienThiGiaVe(cb.maChuyenBay, 3, cb)}  {/* Business */}

                                        {hienThiGiaVe(cb.maChuyenBay, 4, cb)} {/* FirstClass */}

                                        {hienThiGiaVe(cb.maChuyenBay, 2, cb)} {/* Deluxe */}

                                        {hienThiGiaVe(cb.maChuyenBay, 1, cb, true)} {/* Economy */}

                                </div>
                                {expanded.id === cb.maChuyenBay && expanded.type === 6 && (
                                    <div className="bg-white p-4 rounded-b-lg mb-3">
                                        <div className="flex items-center pl-2"> 
                                            <IoAirplaneSharp className="pb-[2px] text-[#1E88E5] w-[20px] h-[20px] "/> 
                                            <div className="pl-7">{t('booking.flight_info.flight_number')}</div>
                                            <span className="text-[#1E88E5] font-bold pl-1">{cb.soHieuChuyenBay}</span>
                                        </div>
                                        <div className="grid grid-cols-[40px_1fr] gap-4 mt-3">
                                            <div className="flex flex-col items-center h-24 mt-[6px]">
                                                <GoDotFill className="border border-[#1E88E5] rounded-full w-[16px] h-[16px] text-red-500" />
                                                <div className="w-[2px] bg-gray-300 flex-1 my-1" />
                                                <span className="inline-flex w-[17px] h-[17px] bg-linear-to-r from-green-500 to-green-400 items-center justify-center rounded-full mb-3">
                                                    <GoGoal className="w-[12px] h-[12px] text-white" />
                                                </span>
                                            </div>
                                            <div>
                                                <div className="mb-4 flex">
                                                    <div >{t('booking.flight.departure_label')}</div>
                                                    <div className="ml-2">
                                                        <div className="text-black font-bold">{formatTime(cb.gioDi)}, {formatDateType(cb.ngayDi)} (Giờ địa phương)</div>
                                                        <div className="text-black font-bold">{cb.tuyenBay.sanBayDi.thanhPhoSanBay}</div>
                                                    </div>
                                                </div>
                                                <div className="flex">
                                                    <div >{t('booking.flight.arrival_label')}</div>
                                                    <div className="ml-14">
                                                        <div className="text-black font-bold">{formatTime(cb.gioDen)}, {formatDateType(cb.ngayDen)} (Giờ địa phương)</div>
                                                        <div className="text-black font-bold">{cb.tuyenBay.sanBayDen.thanhPhoSanBay}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pl-14 pt-2 flex">
                                            <div className="">{t('booking.flight.duration_label')}</div>
                                            <span className="text-[#1E88E5] pl-3">{calcFlightDuration(cb.gioDi, cb.ngayDi, cb.gioDen, cb.ngayDen)}</span>
                                        </div>
                                    </div>
                                )}
                                {expanded.id === cb.maChuyenBay && expanded.type === 3 && (
                                    //Business
                                    <div className="bg-orange-100 p-4 rounded-b-lg mb-3">
                                        <div className="flex items-center justify-between px-16">
                                            <div className="flex flex-col items-center">
                                                <div className="font-bold">{sanBayDi.maIATA}</div>
                                                <div className="text-xs">{formData.departure}</div>
                                                <div className="text-xs">
                                                    <span>{formatTime(cb.gioDi)}, </span>
                                                    <span>{formatDateType(cb.ngayDi)}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <div className="text-xs">{calcFlightDuration(cb.gioDi, cb.ngayDi, cb.gioDen, cb.ngayDen)}</div>
                                                <div className="flex items-center w-full">
                                                    <div className="w-36 h-[2px] bg-gray-300 rounded" />
                                                    <IoAirplaneSharp className="text-[#64B5F6] w-[20px] h-[20px]" />
                                                    <div className="w-36 h-[2px] bg-gray-300 rounded" />
                                                </div>
                                                <span className="text-xs">bay thẳng</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <div className="font-bold">{sanBayDen.maIATA}</div>
                                                <div className="text-xs">{formData.arrival}</div>
                                                <div className="text-xs">
                                                    <span>{formatTime(cb.gioDen)}, </span>
                                                    <span>{formatDateType(cb.ngayDen)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full border-t-2 border-dashed border-gray-300 my-4 space-10 bg-orange-100" />
                                        <div className="flex flex-col pl-5 max-h-48 overflow-auto" >
                                            <span className="font-bold">Bao gồm:</span>
                                            <span className="text-sm"><FaCheckCircle className="inline-block mr-1 mb-1 text-green-500" />Hành lý xách tay: 18kg.</span>
                                            <span className="text-sm"><FaCheckCircle className="inline-block mr-1 mb-1 text-green-500" />Hành lý ký gửi: 60kg cho đường bay Úc, Kazakhstan; 40kg cho các đường bay còn lại và 01 bộ dụng cụ chơi golf (nếu có).</span>
                                            <span className="text-sm"><FaCheckCircle className="inline-block mr-1 mb-1 text-green-500" />Phòng chờ sang trọng (không áp dụng trên các chuyến bay nội địa Thái Lan và các sân bay có phòng chờ không đạt tiêu chuẩn hoặc đóng cửa trong giờ hoạt động của chuyến bay). Thời gian sử dụng dịch vụ là 03 tiếng trước giờ khởi hành chuyến bay. </span>
                                            <span className="text-sm"><FaCheckCircle className="inline-block mr-1 mb-1 text-green-500" />Ưu tiên làm thủ tục trước chuyến bay.</span>
                                            <span className="text-sm"><FaCheckCircle className="inline-block mr-1 mb-1 text-green-500" />Ưu tiên phục vụ hành lý.</span>
                                            <span className="text-sm"><FaCheckCircle className="inline-block mr-1 mb-1 text-green-500" />Ưu tiên qua cửa an ninh (tùy theo điều kiện từng sân bay).</span>
                                            <span className="text-sm"><FaCheckCircle className="inline-block mr-1 mb-1 text-green-500" />Phục vụ đưa đón riêng ra tàu bay (áp dụng trường hợp tàu bay đậu bãi; không áp dụng đối với sân bay không cung cấp dịch vụ xe đưa đón riêng)</span>
                                            <span className="text-sm"><FaCheckCircle className="inline-block mr-1 mb-1 text-green-500" />Ưu tiên chọn chỗ ngồi trên tàu bay.</span>
                                            <span className="text-sm"><FaCheckCircle className="inline-block mr-1 mb-1 text-green-500" />Thưởng thức ẩm thực tươi ngon suốt chuyến bay.</span>
                                            <span className="text-sm"><FaCheckCircle className="inline-block mr-1 mb-1 text-green-500" />Bộ tiện ích (chuyến bay từ 04 tiếng trở lên).</span>
                                            <span className="text-sm"><FaCheckCircle className="inline-block mr-1 mb-1 text-green-500" />Hoàn bảo lưu định danh Tiền Vé: 02 năm kể từ ngày khởi hành dự kiến.</span>
                                        </div>
                                    </div>
                                )}
                                {expanded.id === cb.maChuyenBay && expanded.type === 4 && (
                                    // FirstClass
                                    <div className="bg-red-100 p-4 rounded-b-lg mb-3">
                                        <div className="flex items-center justify-between px-16">
                                            <div className="flex flex-col items-center">
                                                <div className="font-bold">{sanBayDi.maIATA}</div>
                                                <div className="text-xs">{formData.departure}</div>
                                                <div className="text-xs">
                                                    <span>{formatTime(cb.gioDi)}, </span>
                                                    <span>{formatDateType(cb.ngayDi)}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <div className="text-xs">{calcFlightDuration(cb.gioDi, cb.ngayDi, cb.gioDen, cb.ngayDen)}</div>
                                                <div className="flex items-center w-full">
                                                    <div className="w-36 h-[2px] bg-gray-300 rounded" />
                                                    <IoAirplaneSharp className="text-[#64B5F6] w-[20px] h-[20px]" />
                                                    <div className="w-36 h-[2px] bg-gray-300 rounded" />
                                                </div>
                                                <span className="text-xs">bay thẳng</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <div className="font-bold">{sanBayDen.maIATA}</div>
                                                <div className="text-xs">{formData.arrival}</div>
                                                <div className="text-xs">
                                                    <span>{formatTime(cb.gioDen)}, </span>
                                                    <span>{formatDateType(cb.ngayDen)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full border-t-2 border-dashed border-gray-300 my-4 space-10" />
                                        <div className="flex flex-col pl-5 max-h-48 overflow-auto">
                                            <span className="font-bold">Bao gồm:</span>
                                            <span className="text-sm"><FaCheckCircle className="inline-block mr-1 mb-1 text-green-500" />Hành lý xách tay: 10kg.</span>
                                            <span className="text-sm"><FaCheckCircle className="inline-block mr-1 mb-1 text-green-500" />Hành lý ký gửi: 50kg cho đường bay Úc, Kazakhstan; 30kg cho các đường bay còn lại và 01 bộ dụng cụ chơi golf (nếu có).</span>
                                            <span className="text-sm"><FaCheckCircle className="inline-block mr-1 mb-1 text-green-500" />Phòng chờ sang trọng (không áp dụng trên các chuyến bay nội địa Thái Lan và các sân bay có phòng chờ không đạt tiêu chuẩn hoặc đóng cửa trong giờ hoạt động của chuyến bay). Thời gian sử dụng dịch vụ là 03 tiếng trước giờ khởi hành chuyến bay. </span>
                                            <span className="text-sm"><FaCheckCircle className="inline-block mr-1 mb-1 text-green-500" />Ưu tiên làm thủ tục trước chuyến bay.</span>
                                            <span className="text-sm"><FaCheckCircle className="inline-block mr-1 mb-1 text-green-500" />Ưu tiên phục vụ hành lý.</span>
                                            <span className="text-sm"><FaCheckCircle className="inline-block mr-1 mb-1 text-green-500" />Ưu tiên qua cửa an ninh (tùy theo điều kiện từng sân bay).</span>
                                            <span className="text-sm"><FaCheckCircle className="inline-block mr-1 mb-1 text-green-500" />Phục vụ đưa đón riêng ra tàu bay (áp dụng trường hợp tàu bay đậu bãi; không áp dụng đối với sân bay không cung cấp dịch vụ xe đưa đón riêng)</span>
                                            <span className="text-sm"><FaCheckCircle className="inline-block mr-1 mb-1 text-green-500" />Ưu tiên chọn chỗ ngồi trên tàu bay (không áp dụng các hàng ghế dành cho khách Business).</span>
                                            <span className="text-sm"><FaCheckCircle className="inline-block mr-1 mb-1 text-green-500" />Thưởng thức ẩm thực tươi ngon suốt chuyến bay.</span>
                                            <span className="text-sm"><FaCheckCircle className="inline-block mr-1 mb-1 text-green-500" />Bộ tiện ích (chuyến bay từ 04 tiếng trở lên).</span>
                                            <span className="text-sm"><FaCheckCircle className="inline-block mr-1 mb-1 text-green-500" />Hoàn bảo lưu định danh Tiền Vé: 02 năm kể từ ngày khởi hành dự kiến.</span>
                                        </div>
                                    </div>
                                )}
                                {expanded.id === cb.maChuyenBay && expanded.type === 2 && (
                                    // deluxe
                                    <div className="bg-yellow-100 p-4 rounded-b-lg mb-3">
                                        <div className="flex items-center justify-between px-16">
                                            <div className="flex flex-col items-center">
                                                <div className="font-bold">{sanBayDi.maIATA}</div>
                                                <div className="text-xs">{formData.departure}</div>
                                                <div className="text-xs">
                                                    <span>{formatTime(cb.gioDi)}, </span>
                                                    <span>{formatDateType(cb.ngayDi)}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <div className="text-xs">{calcFlightDuration(cb.gioDi, cb.ngayDi, cb.gioDen, cb.ngayDen)}</div>
                                                <div className="flex items-center w-full">
                                                    <div className="w-36 h-[2px] bg-gray-300 rounded" />
                                                    <IoAirplaneSharp className="text-[#64B5F6] w-[20px] h-[20px]" />
                                                    <div className="w-36 h-[2px] bg-gray-300 rounded" />
                                                </div>
                                                <span className="text-xs">bay thẳng</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <div className="font-bold">{sanBayDen.maIATA}</div>
                                                <div className="text-xs">{formData.arrival}</div>
                                                <div className="text-xs">
                                                    <span>{formatTime(cb.gioDen)}, </span>
                                                    <span>{formatDateType(cb.ngayDen)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full border-t-2 border-dashed border-gray-300 my-4 space-10" />
                                        <div className="flex flex-col pl-5 max-h-48 overflow-auto"> 
                                            <span className="font-bold">Bao gồm:</span>
                                            <span className="text-sm"><FaCheckCircle className="inline-block mr-1 mb-1 text-green-500" />Hành lý xách tay: 10kg cho đường bay Úc, Kazakhstan;  07kg cho các đường bay còn lại.</span>
                                            <span className="text-sm"><FaCheckCircle className="inline-block mr-1 mb-1 text-green-500" />Hành lý ký gửi: 40kg cho đường bay Úc, Kazakhstan; 20kg cho các đường bay còn lại.</span>
                                            <span className="text-sm"><FaCheckCircle className="inline-block mr-1 mb-1 text-green-500" />Suất ăn & nước uống cho đường bay Úc, Kazakhstan. </span>
                                            <span className="text-sm"><FaCheckCircle className="inline-block mr-1 mb-1 text-green-500" />Chọn trước chỗ ngồi yêu thích (khi còn chỗ, không áp dụng các hàng ghế dành cho SkyBoss và Business).</span>
                                            <span className="text-sm"><FaCheckCircle className="inline-block mr-1 mb-1 text-green-500" />Miễn phí thay đổi chuyến bay, ngày bay, hành trình (Thu chênh lệch giá Vé - nếu có).</span>
                                            <span className="font-bold">Chưa bao gồm:</span>
                                            <span className="text-sm"><AiFillCloseCircle className="inline-block mr-1 mb-1 text-red-500 w-[16px] h-[16px]" />Bộ tiện ích 3 trong 1.</span>
                                        </div>
                                    </div>
                                )}
                                {expanded.id === cb.maChuyenBay && expanded.type === 1 && (
                                    // economy
                                    <div className="bg-green-100 p-4 rounded-b-lg mb-3 ">
                                        <div className="flex items-center justify-between px-16">
                                            <div className="flex flex-col items-center">
                                                <div className="font-bold">{sanBayDi.maIATA}</div>
                                                <div className="text-xs">{formData.departure}</div>
                                                <div className="text-xs">
                                                    <span>{formatTime(cb.gioDi)}, </span>
                                                    <span>{formatDateType(cb.ngayDi)}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <div className="text-xs">{calcFlightDuration(cb.gioDi, cb.ngayDi, cb.gioDen, cb.ngayDen)}</div>
                                                <div className="flex items-center w-full">
                                                    <div className="w-36 h-[2px] bg-gray-300 rounded" />
                                                    <IoAirplaneSharp className="text-[#64B5F6] w-[20px] h-[20px]" />
                                                    <div className="w-36 h-[2px] bg-gray-300 rounded" />
                                                </div>
                                                <span className="text-xs">bay thẳng</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <div className="font-bold">{sanBayDen.maIATA}</div>
                                                <div className="text-xs">{formData.arrival}</div>
                                                <div className="text-xs">
                                                    <span>{formatTime(cb.gioDen)}, </span>
                                                    <span>{formatDateType(cb.ngayDen)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full border-t-2 border-dashed border-gray-300 my-4 space-10" />
                                        <div className="flex flex-col pl-5 max-h-48 overflow-auto">
                                            <span className="font-bold">Bao gồm:</span>
                                            <span className="text-sm"><FaCheckCircle className="inline-block mr-1 mb-1 text-green-500" />Hành lý xách tay: 07Kg.</span>
                                            <span className="font-bold">Chưa bao gồm:</span>
                                            <span className="text-sm"><AiFillCloseCircle className="inline-block mr-1 mb-1 text-red-500 w-[16px] h-[16px]" />Hành lý ký gửi (tùy chọn).</span>
                                            <span className="text-sm"><AiFillCloseCircle className="inline-block mr-1 mb-1 text-red-500 w-[16px] h-[16px]" />Suất ăn.</span>
                                            <span className="text-sm"><AiFillCloseCircle className="inline-block mr-1 mb-1 text-red-500 w-[16px] h-[16px]" />Bộ tiện ích 3 trong 1.</span>
                                            <span className="text-sm"><AiFillCloseCircle className="inline-block mr-1 mb-1 text-red-500 w-[16px] h-[16px]" />Chọn trước chỗ ngồi.</span>
                                            <span className="text-sm"><AiFillCloseCircle className="inline-block mr-1 mb-1 text-red-500 w-[16px] h-[16px]" />Thay đổi chuyến bay, ngày bay, hành trình.</span>
                                            <span className="text-sm"><AiFillCloseCircle className="inline-block mr-1 mb-1 text-red-500 w-[16px] h-[16px]" />Chênh lệch tiền vé khi thay đổi (nếu có).</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ):(
                        <div className="w-full flex justify-center items-center h-64">
                        Không có chuyến bay
                        </div>
                    )}
                </div>
                <div  className="my-10 mb-50">
                    {/* <ThongTinThanhToan cb={formData} tuyenBay={formData.chuyenBayDi} tuyenBayVe={selectedTuyenBayVe?.hangVe ? selectedTuyenBayVe : null} /> */}
                    <ThongTinThanhToan
                    cb={{...formData, selectedTuyenBayVe: selectedTuyenBayVe}}
                    onBackToChonChuyenDi={() => navigate("/chon-chuyen-bay", { state: { ...formData } })}
                    onBackToChonChuyenVe={() => navigate("/chon-chuyen-bay-ve", { state: { ...formData} })}
                    />
                </div>
            </div>
            <div className="flex justify-between fixed bottom-0 left-0 w-full bg-white p-4 h-[80px] px-32 shadow-[0_-4px_20px_rgba(0,0,0,0.25)] items-center">
                <span 
                    className="bg-gray-200 rounded-xl flex items-center justify-center px-10 py-2 text-black cursor-pointer hover:bg-gray-300 transition mr-100"
                    onClick={() => navigate(-1)}
                >
                     {t('common.back')}
                </span>
                <div className="flex flex-col text-black">
                    <span className="text-xl">{t('common.total_price')}</span>
                    <span className="text-2xl font-bold">{selectedTuyenBayVe ? formatCurrencyWithCommas(calcTotalPrice())+" VND" : formatCurrencyWithCommas(formData.totalPrice)+" VND"}</span>
                </div>
                <span className="bg-linear-to-bl from-[#FF7043] to-[#F4511E] rounded-xl flex items-center justify-center px-10 py-2 text-black cursor-pointer" onClick={() => tiepTucOnClick()}>Đi tiếp</span>
            </div>
            </div>
        </div>
    )
}
export default ChonChuyenBayVe;
