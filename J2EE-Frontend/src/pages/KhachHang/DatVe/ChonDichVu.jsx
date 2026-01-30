import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { MdOutlineKeyboardArrowRight } from "react-icons/md";

import { formatCurrencyWithCommas } from "../../../services/utils";

import { getDichVuByChuyenBay } from "../../../services/QLDichVuChuyenBayService";
import SlidePanel from "../../../components/KhachHang/SlidePanel";
import ThongTinThanhToan from "../../../components/KhachHang/ThongTinThanhToan";
import HeaderTimKiemChuyen from "../../../components/KhachHang/HeaderTimKiemChuyen";

function ChonDichVu() {
    const { t } = useTranslation();
    const location = useLocation();
    const formData = location.state || {};
    const navigate = useNavigate();
    const [dichVuCungCapList, setDichVuCungCapList] = useState([]);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [selectedDichVu, setSelectedDichVu] = useState(null);
    const [selectedServices, setSelectedServices] = useState({});

    const calculateTotal = () => {
        let total = formData.totalPrice || 0;

        ["di", "ve"].forEach(tabKey => {
            const tabData = selectedServices[tabKey];
            if (!tabData) return;

            // OPTIONS
            (tabData.options || []).forEach(opt => {
            if (opt.quantity) {
                total += opt.price * opt.quantity;
            } else {
                total += opt.price;
            }
            });
        });
        return total;
    };

    const dichVuChonChoNgoi = {
        maDichVu: 99,
        tenDichVu: t('booking.services.seat_selection'),
        moTa: t('booking.services.select_seat_desc'),
        anh: "public/service/select-service_favorite-seat.cc6498ae.svg",
    };

    const tiepTucOnClick = () => {
        const choNgoiDi = selectedServices.di?.selectedSeats?.length || 0;
        const choNgoiVe = selectedServices.ve?.selectedSeats?.length || 0;
        const soHanhKhach = Number(formData?.passengers ?? formData?.passengerInfo?.length ?? 1);

        if (formData.flightType === "round") {
            if (choNgoiDi !== soHanhKhach || choNgoiVe !== soHanhKhach) {
                alert(t('booking.services.error_select_seats_round', { count: soHanhKhach }));
                return;
            }
        } else {
            if (choNgoiDi !== soHanhKhach) {
                alert(t('booking.services.error_select_seats_oneway', { count: soHanhKhach }));
                return;
            }
        }
        navigate("/thanh-toan", { state: { ...formData, dichVu: selectedServices, totalPrice: calculateTotal() } });
    };

    useEffect(() => {
        const fetchDichVuCungCap = async () => {
            try {
                // Lấy dịch vụ cho chuyến bay đi
                const resDi = await getDichVuByChuyenBay(
                    formData.selectedTuyenBayDi.maChuyenBay
                );
                console.log("Dịch vụ chuyến bay đi:", resDi.data);

                let allDichVu = resDi.data?.data || resDi.data || [];

                // Nếu là chuyến bay khứ hồi, lấy thêm dịch vụ cho chuyến bay về
                if (formData.flightType === 'round' && formData.selectedTuyenBayVe) {
                    const resVe = await getDichVuByChuyenBay(
                        formData.selectedTuyenBayVe.maChuyenBay
                    );
                    console.log("Dịch vụ chuyến bay về:", resVe.data);
                    
                    const dichVuVe = resVe.data?.data || resVe.data || [];
                    
                    // Gộp 2 danh sách và loại bỏ trùng lặp dựa trên maDichVu
                    const dichVuMap = new Map();
                    [...allDichVu, ...dichVuVe].forEach(dv => {
                        if (dv && dv.maDichVu) {
                            dichVuMap.set(dv.maDichVu, dv);
                        }
                    });
                    allDichVu = Array.from(dichVuMap.values());
                }

                setDichVuCungCapList(Array.isArray(allDichVu) ? allDichVu : []);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách dịch vụ đã gán cho chuyến bay", error);
                setDichVuCungCapList([]);
            }
        };

        fetchDichVuCungCap();
    }, [formData]);

    const handleOpenPanel = (dichVu) => {
        setSelectedDichVu(dichVu);
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
        setSelectedDichVu(null);
    };

    return (
        <div 
            className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed relative"
            style={{ backgroundImage: 'url(/background/home/bgBannerHomePage.72a61446.webp)' }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-linear-to-br from-white/70 via-pink-50/60 to-yellow-50/60"></div>
            
            {/* Content wrapper */}
            <div className="relative z-10">
            {/* Panel */}
            <SlidePanel
                formData={formData}
                isOpen={isPanelOpen}
                onClose={handleClosePanel}
                dichVu={selectedDichVu}
                onSave={(allServices) => {
                    setSelectedServices(allServices);
                }}
            />

            <HeaderTimKiemChuyen data={{ ...formData }} />

            <div className="text-green-500 font-bold text-2xl px-32 pt-2">
                {t('booking.services.reminder')}
            </div>

            <div className="flex justify-between gap-8 px-32 py-2 ">
                <div className="flex-1 mb-64">
                    <div className="flex flex-col gap-6">
                        <div
                            key={dichVuChonChoNgoi.maDichVu}
                            className="flex items-center bg-white rounded-2xl shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow duration-300"
                            onClick={() => handleOpenPanel(dichVuChonChoNgoi)}
                        >
                            <img
                                    src={dichVuChonChoNgoi.anh}
                                    alt={dichVuChonChoNgoi.tenDichVu}
                                    className="w-20 h-20 rounded-xl mr-6"
                                />                            <div className="flex flex-col max-h-20 w-4/5 overflow-auto text-ml hide-scrollbar">
                                <div className="text-xl font-semibold text-gray-800">
                                    {dichVuChonChoNgoi.tenDichVu}
                                </div>
                                <div className="text-gray-500">
                                    {dichVuChonChoNgoi.moTa}
                                </div>
                            </div>

                            <MdOutlineKeyboardArrowRight className="ml-auto text-3xl text-gray-400" />
                        </div>
                        {dichVuCungCapList.map((dichVu) => (
                            <div
                                key={dichVu.maDichVu}
                                className="flex items-center bg-white rounded-2xl shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow duration-300"
                                onClick={() => handleOpenPanel(dichVu)}
                            >
                                <img
                                    src={`http://localhost:8080/AnhDichVuCungCap/${dichVu.anh}`}
                                    alt={dichVu.tenDichVu}
                                    className="w-20 h-20 rounded-xl mr-6"
                                />
                                <div className="flex flex-col max-h-20 w-4/5 overflow-auto text-ml hide-scrollbar">
                                    <div className="text-xl font-semibold text-gray-800">
                                        {dichVu.tenDichVu}
                                    </div>
                                    <div className="text-gray-500">{dichVu.moTa}</div>
                                </div>
                                <MdOutlineKeyboardArrowRight className="ml-auto text-3xl text-gray-400" />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mb-64">
                    <ThongTinThanhToan 
                        cb={{...formData, dichVu:selectedServices, }} 
                        onBackToThongTinKhachHang={() => navigate("/thong-tin-hanh-khach", { state: { ...formData } })}
                        onBackToChonChuyenDi={() => navigate("/chon-chuyen-bay", { state: { ...formData } })}
                        onBackToChonChuyenVe={() => navigate("/chon-chuyen-bay-ve", { state: { ...formData} })}
                    />
                </div>
            </div>
            {/* Footer */}
            <div className="flex justify-between fixed bottom-0 left-0 w-full bg-white p-4 h-[80px] px-32 shadow-[0_-4px_20px_rgba(0,0,0,0.25)] items-center">
                <span 
                    className="bg-gray-200 rounded-xl flex items-center justify-center px-10 py-2 text-black cursor-pointer hover:bg-gray-300 transition mr-100"
                    onClick={() => navigate(-1)}
                >
                    {t('common.back')}
                </span>
                <div className="flex flex-col text-black">
                    <span className="text-xl">{t('common.total_price')}</span>
                    <span className="text-2xl font-bold">{formatCurrencyWithCommas(calculateTotal())+" VND"}</span>
                </div>
                <span
                    className="bg-linear-to-bl from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center px-10 py-2 text-black cursor-pointer"
                    onClick={() => tiepTucOnClick()}
                >
                    {t('common.continue')}
                </span>
            </div>
            </div>
        </div>
    );
}
export default ChonDichVu;