import { useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

import { formatCurrencyWithCommas } from "../../../services/utils";

import { getAllDichVuCungCapByChuyenBay } from "../../../services/datVeServices";
import ChoNgoiPanel from "../../../components/KhachHang/SlidePanel";
import ThongTinThanhToan from "../../../components/KhachHang/ThongTinThanhToan";
import HeaderTimKiemChuyen from "../../../components/KhachHang/HeaderTimKiemChuyen";
import BookingStepper from "../../../components/KhachHang/Booking/BookingStepper";
import PassengerServiceSelector from "../../../components/KhachHang/Booking/PassengerServiceSelector";
import useTitle from '../../../hooks/useTitle';

function ChonDichVu() {
    const { t } = useTranslation();
    useTitle('Chọn dịch vụ bổ sung - Đặt vé máy bay | Airline Booking');
    const location = useLocation();
    const formData = useMemo(() => location.state, [location.state]);
    const navigate = useNavigate();
    const [dichVuCungCapList, setDichVuCungCapList] = useState([]);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [selectedDichVu, setSelectedDichVu] = useState(null);
    const [isValid, setIsValid] = useState(false);
    const [activePassenger, setActivePassenger] = useState(0);

    // Per-passenger service state: { passengers: [{ di: {...}, ve: {...} }, ...] }
    const soHanhKhach = Number(formData?.passengers ?? formData?.passengerInfo?.length ?? 1);
    const [passengerServices, setPassengerServices] = useState(
        Array.from({ length: soHanhKhach }, () => ({ di: {}, ve: {} }))
    );

    // Current passenger's services (for SlidePanel compatibility)
    const currentPassengerServices = passengerServices[activePassenger] || { di: {}, ve: {} };

    // Ghế đã chọn bởi các hành khách khác (để hiển thị là không khả dụng)
    const otherPassengerSeats = useMemo(() => {
        const seatsMap = { di: [], ve: [] };
        passengerServices.forEach((ps, idx) => {
            if (idx === activePassenger) return;
            ['di', 've'].forEach(dir => {
                if (ps[dir]?.selectedSeats) {
                    seatsMap[dir] = [...seatsMap[dir], ...ps[dir].selectedSeats];
                }
            });
        });
        return seatsMap;
    }, [passengerServices, activePassenger]);

    // Fix: Kiểm tra formData hợp lệ
    useEffect(() => {
        if (location.state !== undefined) {
            const hasRequiredData = formData?.selectedTuyenBayDi;
            if (!hasRequiredData) {
                console.warn('Missing required data, redirecting to home');
                navigate('/');
            } else {
                setIsValid(true);
            }
        }
    }, [formData, navigate, location.state]);

    // Fetch dịch vụ cung cấp
    useEffect(() => {
        const fetchDichVuCungCap = async () => {
            if (!formData?.selectedTuyenBayDi) return;
            try {
                // Lấy dịch vụ cho chuyến bay đi
                const resDi = await getAllDichVuCungCapByChuyenBay(
                    formData.selectedTuyenBayDi.maChuyenBay
                );
                console.log("Dịch vụ chuyến bay đi:", resDi.data);

                let allDichVu = resDi.data?.data || resDi.data || [];

                // Nếu là chuyến bay khứ hồi, lấy thêm dịch vụ cho chuyến bay về
                if (formData.flightType === 'round' && formData.selectedTuyenBayVe) {
                    const resVe = await getAllDichVuCungCapByChuyenBay(
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

    const calculateTotal = () => {
        let total = formData.totalPrice || 0;

        passengerServices.forEach(passenger => {
            ["di", "ve"].forEach(tabKey => {
                const tabData = passenger[tabKey];
                if (!tabData) return;

                // Seat
                if (tabData.selectedSeats?.length) {
                    total += (tabData.seatPrice || 0) * tabData.selectedSeats.length;
                }

                // OPTIONS
                (tabData.options || []).forEach(opt => {
                    total += (opt.price || 0) * (opt.quantity || 1);
                });
            });
        });
        return total;
    };

    // Build legacy dichVu format for ThongTinThanhToan compatibility
    const buildLegacyDichVu = () => {
        const result = { di: { options: [], selectedSeats: [] }, ve: { options: [], selectedSeats: [] } };
        passengerServices.forEach(passenger => {
            ['di', 've'].forEach(dir => {
                if (passenger[dir]?.selectedSeats) {
                    result[dir].selectedSeats = [...(result[dir].selectedSeats || []), ...passenger[dir].selectedSeats];
                    result[dir].seatPrice = passenger[dir].seatPrice || 0;
                }
                if (passenger[dir]?.options) {
                    result[dir].options = [...(result[dir].options || []), ...passenger[dir].options];
                }
            });
        });
        return result;
    };

    const tiepTucOnClick = () => {
        // Kiểm tra từng hành khách đã chọn ghế chưa
        const soHK = soHanhKhach;
        let missingDi = false;
        let missingVe = false;

        passengerServices.forEach((ps) => {
            if (!ps.di?.selectedSeats?.length) missingDi = true;
            if (formData.flightType === 'round' && !ps.ve?.selectedSeats?.length) missingVe = true;
        });

        if (formData.flightType === "round") {
            if (missingDi && missingVe) {
                alert(t('booking.services.error_select_seats_round', { count: soHK }));
                return;
            }
            if (missingDi) {
                alert(t('booking.services.error_select_seats_oneway', { count: soHK }));
                return;
            }
            if (missingVe) {
                alert(t('booking.services.error_select_seats_return', { count: soHK }));
                return;
            }
        } else {
            if (missingDi) {
                alert(t('booking.services.error_select_seats_oneway', { count: soHK }));
                return;
            }
        }
        navigate("/thanh-toan", {
            state: {
                ...formData,
                dichVu: buildLegacyDichVu(),
                passengerServices: passengerServices,
                totalPrice: calculateTotal()
            }
        });
    };

    const handleOpenPanel = (dichVu) => {
        setSelectedDichVu(dichVu);
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
        setSelectedDichVu(null);
    };

    // Early return nếu chưa có data
    if (!isValid || !formData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Đang tải...</p>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed relative"
            style={{ backgroundImage: 'url(/background/home/bgBannerHomePage.72a61446.webp)' }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-linear-to-br from-white/70 via-blue-50/60 to-[#F5F7FA]/60"></div>
            
            {/* Content wrapper */}
            <div className="relative z-10">
            {/* Panel */}
            <ChoNgoiPanel
                formData={formData}
                isOpen={isPanelOpen}
                onClose={handleClosePanel}
                dichVu={selectedDichVu}
                existingServices={currentPassengerServices}
                otherPassengerSeats={otherPassengerSeats}
                activePassengerName={formData.passengerInfo?.[activePassenger]?.fullName || ''}
                onSave={(allServices) => {
                    // Cập nhật dịch vụ cho hành khách đang active (merge theo loại dịch vụ)
                    setPassengerServices(prev => {
                        const updated = [...prev];
                        const existing = { ...(updated[activePassenger] || { di: {}, ve: {} }) };

                        ['di', 've'].forEach(dir => {
                            // Chỉ cập nhật chiều đã được chỉnh sửa trong panel
                            if (!(dir in allServices)) return;

                            const newData = allServices[dir] || {};
                            const oldData = existing[dir] || {};

                            if (selectedDichVu?.maDichVu === 99) {
                                // Dịch vụ ghế: cập nhật ghế, giữ nguyên options khác
                                existing[dir] = {
                                    ...oldData,
                                    selectedSeats: newData.selectedSeats || [],
                                    seatPrice: newData.seatPrice || oldData.seatPrice || 0,
                                };
                            } else {
                                // Dịch vụ khác: merge options theo maDichVu
                                const currentMaDichVu = selectedDichVu?.maDichVu;
                                const retainedOptions = (oldData.options || []).filter(
                                    opt => opt.maDichVu !== currentMaDichVu
                                );
                                existing[dir] = {
                                    ...oldData,
                                    options: [...retainedOptions, ...(newData.options || [])],
                                };
                            }
                        });

                        updated[activePassenger] = existing;
                        return updated;
                    });
                }}
            />

            <HeaderTimKiemChuyen data={{ ...formData }} />
            <BookingStepper currentStep={2} />

            <div className="text-green-500 font-bold text-lg md:text-2xl px-4 md:px-8 lg:px-16 xl:px-32 pt-2">
                {t('booking.services.reminder')}
            </div>

            <div className="flex flex-col lg:flex-row justify-between gap-4 lg:gap-8 px-4 md:px-8 lg:px-16 xl:px-32 py-2">
                <div className="flex-1 mb-64">
                    <PassengerServiceSelector
                        passengerInfo={formData.passengerInfo || []}
                        dichVuList={dichVuCungCapList}
                        selectedServices={{ passengers: passengerServices }}
                        flightType={formData.flightType}
                        onOpenPanel={handleOpenPanel}
                        activePassenger={activePassenger}
                        onChangePassenger={setActivePassenger}
                    />
                </div>
                <div className="mb-64">
                    <ThongTinThanhToan 
                        cb={{...formData, dichVu: buildLegacyDichVu() }} 
                        onBackToThongTinKhachHang={() => navigate("/thong-tin-hanh-khach", { state: { ...formData } })}
                        onBackToChonChuyenDi={() => navigate("/chon-chuyen-bay", { state: { ...formData } })}
                        onBackToChonChuyenVe={() => navigate("/chon-chuyen-bay-ve", { state: { ...formData} })}
                    />
                </div>
            </div>
            {/* Footer */}
            <div className={`flex flex-col md:flex-row justify-between fixed bottom-0 left-0 w-full bg-white p-4 h-auto md:h-[80px] px-4 md:px-8 lg:px-16 xl:px-32 shadow-[0_-4px_20px_rgba(0,0,0,0.25)] items-center z-50 transition-opacity duration-300 gap-3 md:gap-0 ${isPanelOpen ? 'pointer-events-none opacity-50' : ''}`}>
                <span 
                    className="bg-gray-200 rounded-xl flex items-center justify-center px-6 md:px-10 py-2 text-black cursor-pointer hover:bg-gray-300 transition"
                    onClick={() => navigate(-1)}
                >
                    {t('common.back')}
                </span>
                <div className="flex flex-col text-black">
                    <span className="text-xl">{t('common.total_price')}</span>
                    <span className="text-2xl font-bold">{formatCurrencyWithCommas(calculateTotal())+" VND"}</span>
                </div>
                <span
                    className="bg-linear-to-bl from-[#FF7043] to-[#F4511E] rounded-xl flex items-center justify-center px-10 py-2 text-black cursor-pointer"
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
