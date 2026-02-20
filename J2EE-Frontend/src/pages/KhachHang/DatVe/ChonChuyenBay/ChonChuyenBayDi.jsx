import { useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from 'react';
import { getSanBayByThanhPhoSanBay, searchChuyenBay, getGiaVe, kiemTraConGhe} from "../../../../services/datVeServices"
import { getAllHangVe } from "../../../../services/QLHangVeService"
import { formatCurrencyWithCommas, formatDate } from "../../../../services/utils";
import { FaLongArrowAltRight, FaLongArrowAltLeft} from 'react-icons/fa';

import HeaderTimKiemChuyen from "../../../../components/KhachHang/HeaderTimKiemChuyen"
import ThongTinThanhToan from "../../../../components/KhachHang/ThongTinThanhToan"
import DanhSachNgayBay from "../../../../components/KhachHang/DanhSachNgayBay";
import FlightCard from "../../../../components/KhachHang/FlightCard/FlightCard";
import { useTranslation } from 'react-i18next';
import useTitle from '../../../../hooks/useTitle';

function ChonChuyenBay() {
    const { t } = useTranslation();
    useTitle('Chọn chuyến bay đi - Đặt vé máy bay | Airline Booking');
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState(location.state);
    const [sanBayDi, setSanBayDi] = useState(null);
    const [sanBayDen, setSanBayDen] = useState(null);
    const [chuyenBays, setChuyenBays] = useState([]);
    const [giaVes, setGiaVes] = useState({});
    const [selectedTuyenBayDi, setSelectedTuyenBayDi] = useState(null);
    const [soGheCon, setSoGheCon] = useState({});
    const [hangVeList, setHangVeList] = useState([]);

    const tiepTucOnClick = () => {
        if (!selectedTuyenBayDi) {
            alert(t('booking.errors.select_flight_first'));
            return;
        }
        if (formData.flightType === 'round') {
            navigate("/chon-chuyen-bay-ve", { state: { ...formData, selectedTuyenBayDi: selectedTuyenBayDi, totalPrice: calcTotalPrice()} });
        } else {
            navigate("/thong-tin-hanh-khach", { state: { ...formData, selectedTuyenBayDi: selectedTuyenBayDi, totalPrice: calcTotalPrice()} });
        }
    };
    const calcTotalPrice = () => {
        if(!selectedTuyenBayDi.hangVe) return 0;
        const giaVe = selectedTuyenBayDi.hangVe.giaVe || 0;
        const thuePhi = 583000;
        const dichVu =  0;
        return giaVe * formData.passengers + thuePhi + dichVu;
    }

    const handleSelectNgay = (ngay) => {
        setFormData(prev => ({
            ...prev,
            startDate: ngay
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
        const di = await getSanBayByThanhPhoSanBay(formData.departure);
        const den = await getSanBayByThanhPhoSanBay(formData.arrival);
        setSanBayDi(di.data);
        setSanBayDen(den.data);
    };
    fetchSanBay();
    }, [formData.departure, formData.arrival]);

    useEffect(() => {
    if (!sanBayDi || !sanBayDen) return;
    const formattedDate = formatDate(formData.startDate);
    const fetchChuyenBays = async () => {
        const results = await searchChuyenBay(
        sanBayDi.maIATA,
        sanBayDen.maIATA,
        formattedDate
        );
        setChuyenBays(results.data);
    };
    fetchChuyenBays();
    }, [sanBayDi, sanBayDen, formData.startDate]);

    useEffect(() => {
    if (!chuyenBays.length || !hangVeList.length) return;
    const fetchTatCaGiaVe = async () => {
        const giaMap = {};
        for (const cb of chuyenBays) {
        for (const hv of hangVeList) {
            const hangVeId = hv.maHangVe;
            try {
            const res = await getGiaVe(cb.maChuyenBay, hangVeId);
            
            // Xử lý cả 2 trường hợp: res.data hoặc res.data.data
            const giaData = res.data?.data || res.data;
            
            if (giaData && giaData.giaVe != null) {
                giaMap[`${cb.maChuyenBay}_${hangVeId}`] = giaData;
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
                            <span>{formData.departure}</span>
                        </div>
                        <div className="flex flex-col items-center ">
                            <FaLongArrowAltRight className="text-3xl text-[#1E88E5]" />
                            {formData.flightType === 'round' && (
                            <FaLongArrowAltLeft className="text-3xl text-gray-500" />
                            )}
                        </div>
                        <div className="flex flex-col p-2 items-center max-w-[200px] min-w-[220px]">
                            <span className="font-bold text-2xl">{sanBayDen?.maIATA}</span>
                            <span>{formData.arrival}</span>
                        </div>
                    </div>
                    <DanhSachNgayBay ngayChon={formData.startDate?formatDate(formData.startDate):""} onSelect={handleSelectNgay} />
                    <br/>
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
                                        // Truyền cả object hangVe (có maHangVe) và giaVe
                                        const giaVeData = giaVes[`${chuyenBay.maChuyenBay}_${hangVe.maHangVe}`];
                                        setSelectedTuyenBayDi({ ...chuyenBay, hangVe: { ...hangVe, ...giaVeData } });
                                    }}
                                    selectedTuyenBay={selectedTuyenBayDi}
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
                    {/* <ThongTinThanhToan cb={formData} tuyenBay={selectedTuyenBayDi?.hangVe ? selectedTuyenBayDi : null} /> */}
                    <ThongTinThanhToan
                        cb={{...formData, selectedTuyenBayDi}}
                        onBackToChonChuyenDi={() => navigate("/chon-chuyen-bay", { state: { ...formData} })}
                        onBackToChonChuyenVe={() => navigate("/chon-chuyen-bay-ve", { state: { ...formData } })}
                    />
                </div>
            </div>
            <div className="flex justify-between fixed bottom-0 left-0 w-full bg-white p-4 h-[80px] px-32 shadow-[0_-4px_20px_rgba(0,0,0,0.25)] items-center z-50">
                <span 
                    className="bg-gray-200 rounded-xl flex items-center justify-center px-10 py-2 text-black cursor-pointer hover:bg-gray-300 transition mr-100"
                    onClick={() => navigate(-1)}
                >
                     {t('common.back')}
                </span>
                <div className="flex flex-col text-black">
                    <span className="text-xl">{t('common.total_price')}</span>
                    <span className="text-2xl font-bold">{selectedTuyenBayDi ? formatCurrencyWithCommas(calcTotalPrice())+ " VND" : "0 VND"}</span>
                </div>
                <span className="bg-linear-to-bl from-[#FF7043] to-[#F4511E] rounded-xl flex items-center justify-center px-10 py-2 text-black cursor-pointer" onClick={() => tiepTucOnClick()}>Đi tiếp</span>
            </div>
            </div>
        </div>
    )
}
export default ChonChuyenBay
