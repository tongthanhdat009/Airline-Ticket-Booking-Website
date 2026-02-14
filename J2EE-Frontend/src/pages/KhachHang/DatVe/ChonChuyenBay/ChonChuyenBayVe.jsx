import { useNavigate, useLocation} from "react-router-dom"
import { useState, useEffect } from 'react';
import { getSanBayByThanhPhoSanBay, searchChuyenBay, getGiaVe , kiemTraConGhe} from "../../../../services/datVeServices"
import { getAllHangVe } from "../../../../services/QLHangVeService"
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
import FlightCard from "../../../../components/KhachHang/FlightCard/FlightCard";
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
    const [hangVeList, setHangVeList] = useState([]);

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
    const fetchHangVe = async () => {
        try {
            const res = await getAllHangVe();
            setHangVeList(Array.isArray(res.data) ? res.data : []);
        } catch {
            setHangVeList([]);
        }
    };
    fetchHangVe();
    }, []);

    useEffect(() => {
    if (!chuyenBays.length || !hangVeList.length) return;

    const fetchSoGhe = async () => {
    const gheMap = {};
    const requests = chuyenBays.flatMap(cb => 
        hangVeList.map(async hv => {
        try {
            const available = await kiemTraConGhe(cb.maChuyenBay, hv.maHangVe, formData.passengers);
            gheMap[`${cb.maChuyenBay}_${hv.maHangVe}`] = available.data;
        } catch {
            gheMap[`${cb.maChuyenBay}_${hv.maHangVe}`] = false;
        }
        })
    );
    await Promise.all(requests);
    setSoGheCon(gheMap);
    };

    fetchSoGhe();
    }, [chuyenBays, formData.passengers, hangVeList]);

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
    };
    fetchChuyenBays();
    }, [sanBayDi, sanBayDen, formData.endDate]);

    useEffect(() => {
    if (!chuyenBays.length || !hangVeList.length) return;

    const fetchTatCaGiaVe = async () => {
        const giaMap = {};
        for (const cb of chuyenBays) {
            for (const hv of hangVeList) {
                const hangVeId = hv.maHangVe;
                try {
                    const res = await getGiaVe(cb.maChuyenBay, hangVeId);
                    if (res.success && res.data) {
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
    }, [chuyenBays, hangVeList]);

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
                        <div className="space-y-3">
                        {chuyenBays.map(cb => {
                            // Prepare hangVe data for this flight using dynamic hangVeList
                            const hangVesForFlight = hangVeList.map(hv => {
                                const key = `${cb.maChuyenBay}_${hv.maHangVe}`;
                                return {
                                    maHangVe: hv.maHangVe,
                                    tenHangVe: hv.tenHangVe,
                                    moTa: hv.moTa,
                                    mauNen: hv.mauNen,
                                    mauVien: hv.mauVien,
                                    mauChu: hv.mauChu,
                                    mauHeader: hv.mauHeader,
                                    mauIcon: hv.mauIcon,
                                    mauRing: hv.mauRing,
                                    mauBadge: hv.mauBadge,
                                    hangBac: hv.hangBac,
                                    giaVe: giaVes[key]?.giaVe,
                                    available: soGheCon[key] !== false
                                };
                            }).filter(hv => hv.available && hv.giaVe != null);

                            return (
                            <div className="w-full" key={cb.maChuyenBay}>
                                <FlightCard
                                    chuyenBay={cb}
                                    sanBayDi={sanBayDi}
                                    sanBayDen={sanBayDen}
                                    hangVes={hangVesForFlight}
                                    onHangVeClick={(chuyenBay, hangVe) => {
                                        setSelectedTuyenBayVe({ ...chuyenBay, hangVe: giaVes[`${chuyenBay.maChuyenBay}_${hangVe.maHangVe}`] });
                                    }}
                                    selectedHangVe={selectedTuyenBayVe?.hangVe}
                                />
                            </div>
                            )
                        })}
                        </div>
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
