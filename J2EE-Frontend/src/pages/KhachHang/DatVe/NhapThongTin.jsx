import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ThongTinThanhToan from "../../../components/KhachHang/ThongTinThanhToan";
import { formatCurrencyWithCommas } from "../../../services/utils";
import HeaderTimKiemChuyen from "../../../components/KhachHang/HeaderTimKiemChuyen";

import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import { getAllCountries } from "../../../services/CountryService";
import TaiKhoanService from "../../../services/TaiKhoanService";
import { getClientUserEmail } from "../../../utils/cookieUtils";

import { useTranslation } from 'react-i18next'

function NhapThongTin() {
    const { t } = useTranslation()
    const location = useLocation();
    const navigate = useNavigate();

    const [formData, setFormData] = useState(location.state);
    const [expanded, setExpanded] = useState(
        Array(Number(location.state.passengers)).fill(true)
    );

    // ĐÁNH DẤU LỖI
    const [errors, setErrors] = useState(
        Array(Number(location.state.passengers)).fill({})
    );

    const scrollRefs = useRef([]);

    const [passengerInfo, setPassengerInfo] = useState(
        Array(Number(formData.passengers)).fill({
            sex: "",
            fullName: "",
            birthday: "",
            country: "",
            phone: "",
            email: "",
            idCard: "",
            address: ""
        })
    );

    // State cho countries và account info
    const [countries, setCountries] = useState([]);
    const [accountInfo, setAccountInfo] = useState(null);
    const [useAccountInfo, setUseAccountInfo] = useState(false);

    // Load countries và account info khi component mount
    useEffect(() => {
        const loadData = async () => {
            try {
                // Load countries
                const countriesData = await getAllCountries();
                setCountries(countriesData);

                // Load account info nếu đã đăng nhập
                const email = getClientUserEmail();
                if (email) {
                    const accountData = await TaiKhoanService.getTaiKhoanByEmail(email);
                    setAccountInfo(accountData.data);
                    console.log('Loaded account info:', accountData.data);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };
        loadData();
    }, []);

    // Xử lý khi chọn sử dụng thông tin tài khoản
    useEffect(() => {
        if (useAccountInfo && accountInfo && accountInfo.hanhKhach) {
            const hanhKhach = accountInfo.hanhKhach;
            setPassengerInfo((prev) => {
                const updated = [...prev];
                updated[0] = {
                    sex: hanhKhach.gioiTinh === 'Nam' ? 'male' : hanhKhach.gioiTinh === 'Nữ' ? 'female' : 'other',
                    fullName: hanhKhach.hoVaTen || '',
                    birthday: hanhKhach.ngaySinh ? hanhKhach.ngaySinh.split('T')[0] : '',
                    country: hanhKhach.quocGia || '',
                    phone: hanhKhach.soDienThoai || '',
                    email: hanhKhach.email || accountInfo.email || '',
                    idCard: hanhKhach.cccd || '',
                    address: hanhKhach.diaChi || ''
                };
                return updated;
            });
        } else if (!useAccountInfo) {
            // Reset thông tin hành khách đầu tiên nếu bỏ chọn
            setPassengerInfo((prev) => {
                const updated = [...prev];
                updated[0] = {
                    sex: "",
                    fullName: "",
                    birthday: "",
                    country: "",
                    phone: "",
                    email: "",
                    idCard: "",
                    address: ""
                };
                return updated;
            });
        }
    }, [useAccountInfo, accountInfo]);

    const handleChange = (index, field, value) => {
        setPassengerInfo((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });

        // Xóa lỗi ngay khi người dùng sửa input
        setErrors((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: false };
            return updated;
        });
    };

    // VALIDATION
    const validatePassengerInfo = () => {
        const newErrors = passengerInfo.map(() => ({}));
        let hasError = false;
        let firstErrorIndex = -1;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{9,12}$/;
        const nameRegex = /^[a-zA-ZÀ-ỹ\s'-]{2,}$/;
        const idCardRegex = /^[A-Za-z0-9]{9,}$/;

        passengerInfo.forEach((p, i) => {
            const err = {};

            // Giới tính
            if (!p.sex) err.sex = t('validation.required_gender') || "Vui lòng chọn giới tính";

            // Họ và tên
            if (!p.fullName.trim()) err.fullName = t('validation.required') || "Vui lòng nhập họ và tên";
            else if (!nameRegex.test(p.fullName))
                err.fullName = t('validation.invalid_name') || "Họ và tên chỉ được chứa chữ cái và tối thiểu 2 ký tự";

            // Ngày sinh
            if (!p.birthday) err.birthday = t('validation.required') || "Vui lòng nhập ngày sinh";

            // Quốc gia
            if (!p.country.trim()) err.country = t('validation.required') || "Vui lòng chọn quốc gia";

            // Số điện thoại
            if (!p.phone.trim()) err.phone = t('validation.required') || "Vui lòng nhập số điện thoại";
            else if (!phoneRegex.test(p.phone))
                err.phone = t('validation.invalid_phone') || "Số điện thoại không hợp lệ (9-12 chữ số)";

            // Email
            if (!p.email.trim()) err.email = t('validation.required') || "Vui lòng nhập email";
            else if (!emailRegex.test(p.email))
                err.email = t('validation.invalid_email') || "Email không hợp lệ";

            // CCCD/Hộ chiếu
            if (!p.idCard.trim()) err.idCard = t('validation.required') || "Vui lòng nhập CCCD/Hộ chiếu";
            else if (!idCardRegex.test(p.idCard))
                err.idCard = t('validation.invalid_idcard') || "CCCD/Hộ chiếu không hợp lệ (ít nhất 9 ký tự, chỉ chữ và số)";

            // Địa chỉ
            if (!p.address.trim()) err.address = t('validation.required') || "Vui lòng nhập địa chỉ";

            if (Object.keys(err).length > 0) {
                hasError = true;
                newErrors[i] = err;
                if (firstErrorIndex === -1) firstErrorIndex = i;
            }
        });

        setErrors(newErrors);

        // Scroll đến hành khách lỗi đầu tiên
        if (hasError && firstErrorIndex !== -1) {
            setExpanded((prev) => {
                const updated = [...prev];
                updated[firstErrorIndex] = true;
                return updated;
            });

            setTimeout(() => {
                scrollRefs.current[firstErrorIndex]?.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }, 200);
        }

        return !hasError;
    };

    const tiepTucOnClick = () => {
        if (!validatePassengerInfo()) return;

        navigate("/chon-dich-vu", { state: { ...formData, passengerInfo, state: 2, useAccountInfo } });
    };

    return (
        <div className="bg-blue-100 min-h-screen bg-no-repeat bg-cover bg-fixed"
        style={{ backgroundImage: 'url(/background/home/bgBannerHomePage.72a61446.webp)' }}>
            <HeaderTimKiemChuyen data={{ ...formData, state: 1 }} />

            <div className="px-32 mt-4 text-xl font-semibold text-white drop-shadow-lg">{t('booking.passenger_info.title')}</div>

            <div className="flex justify-between gap-8 mt-4 px-32 mb-20">
                <div className="w-full">
                    {[...Array(Number(formData.passengers))].map((_, index) => (
                        <div
                            key={index}
                            ref={(el) => (scrollRefs.current[index] = el)}
                            className="mb-5"
                        >
                            {/* Header */}
                            <div
                                className="flex bg-gray-100 px-4 py-2 rounded-t-lg items-center cursor-pointer"
                                onClick={() =>
                                    setExpanded((prev) => {
                                        const updated = [...prev];
                                        updated[index] = !updated[index];
                                        return updated;
                                    })
                                }
                            >
                                <FaUser className="mr-2" />
                                <div className="text-lg font-semibold">{t('booking.passenger_info.passenger')} {index + 1}</div>
                                {index === 0 && accountInfo && (
                                    <label className="ml-4 flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={useAccountInfo}
                                            onChange={(e) => setUseAccountInfo(e.target.checked)}
                                            className="mr-2"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <span className="text-sm">{t('booking.passenger_info.use_account_info')}</span>
                                    </label>
                                )}
                                {expanded[index] ? (
                                    <IoMdArrowDropup className="ml-auto" />
                                ) : (
                                    <IoMdArrowDropdown className="ml-auto" />
                                )}
                            </div>

                            {expanded[index] && (
                                <div className="flex flex-col bg-white gap-6 rounded-b-lg shadow-md transition-all duration-300 p-6">

                                    {/* GIỚI TÍNH */}
                                    <div>
                                        <div className="font-semibold mb-2">Giới tính</div>
                                        <div
                                            className={`${
                                                errors[index]?.sex ? "text-red-500" : ""
                                            }`}
                                        >
                                            <label className={`mr-6 ${index === 0 && useAccountInfo ? "cursor-not-allowed opacity-50" : ""}`}>
                                                <input
                                                    type="radio"
                                                    name={`sex_${index}`}
                                                    value="male"
                                                    checked={passengerInfo[index].sex === "male"}
                                                    onChange={(e) =>
                                                        handleChange(index, "sex", e.target.value)
                                                    }
                                                    disabled={index === 0 && useAccountInfo}
                                                    className="mr-2"
                                                />
                                                {t('booking.passenger_info.male')}
                                            </label>
                                            <label className={`mr-6 ${index === 0 && useAccountInfo ? "cursor-not-allowed opacity-50" : ""}`}>
                                                <input
                                                    type="radio"
                                                    name={`sex_${index}`}
                                                    value="female"
                                                    checked={passengerInfo[index].sex === "female"}
                                                    onChange={(e) =>
                                                        handleChange(index, "sex", e.target.value)
                                                    }
                                                    disabled={index === 0 && useAccountInfo}
                                                    className="mr-2"
                                                />
                                                {t('booking.passenger_info.female')}
                                            </label>
                                            <label className={index === 0 && useAccountInfo ? "cursor-not-allowed opacity-50" : ""}>
                                                <input
                                                    type="radio"
                                                    name={`sex_${index}`}
                                                    value="other"
                                                    checked={passengerInfo[index].sex === "other"}
                                                    onChange={(e) =>
                                                        handleChange(index, "sex", e.target.value)
                                                    }
                                                    disabled={index === 0 && useAccountInfo}
                                                    className="mr-2"
                                                />
                                                {t('booking.passenger_info.other')}
                                            </label>
                                        </div>
                                        {errors[index]?.sex && (
                                            <div className="text-red-500 text-sm mt-1">
                                                {errors[index].sex}
                                            </div>
                                        )}
                                    </div>

                                    {/* Họ và tên */}
                                    <div>
                                        <div className="font-semibold mb-2">{t('booking.passenger_info.passenger')}</div>
                                        <input
                                            type="text"
                                            placeholder={t('booking.passenger_info.full_name')}
                                            value={passengerInfo[index].fullName}
                                            onChange={(e) =>
                                                handleChange(
                                                    index,
                                                    "fullName",
                                                    e.target.value
                                                )
                                            }
                                            disabled={index === 0 && useAccountInfo}
                                            className={`text-lg border-b w-full focus:outline-none ${
                                                errors[index]?.fullName
                                                    ? "border-red-500"
                                                    : "border-gray-300 hover:border-gray-500"
                                            } ${index === 0 && useAccountInfo ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                        />
                                        {errors[index]?.fullName && (
                                            <div className="text-red-500 text-sm mt-1">
                                                {errors[index].fullName}
                                            </div>
                                        )}
                                    </div>

                                    {/* Ngày sinh + Quốc gia */}
                                    <div>
                                        <div className="font-semibold mb-2">{t('booking.passenger_info.gender')} & {t('booking.passenger_info.nationality')}</div>
                                        <div className="flex gap-6">
                                            <div className="w-full">
                                                <input
                                                    type="date"
                                                    value={passengerInfo[index].birthday}
                                                    onChange={(e) =>
                                                        handleChange(
                                                            index,
                                                            "birthday",
                                                            e.target.value
                                                        )
                                                    }
                                                    disabled={index === 0 && useAccountInfo}
                                                    className={`text-lg border-b w-full focus:outline-none ${
                                                        errors[index]?.birthday
                                                            ? "border-red-500"
                                                            : "border-gray-300 hover:border-gray-500"
                                                    } ${index === 0 && useAccountInfo ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                                />
                                                {errors[index]?.birthday && (
                                                    <div className="text-red-500 text-sm mt-1">
                                                        {errors[index].birthday}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="w-full">
                                                <select
                                                    value={passengerInfo[index].country}
                                                    onChange={(e) =>
                                                        handleChange(
                                                            index,
                                                            "country",
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`text-lg border-b w-full focus:outline-none bg-white ${
                                                        errors[index]?.country
                                                            ? "border-red-500"
                                                            : "border-gray-300 hover:border-gray-500"
                                                    }`}
                                                >
                                                    <option value="">{t('booking.passenger_info.nationality')}</option>
                                                    {countries.map((country, idx) => (
                                                        <option key={idx} value={country.name || country}>
                                                            {country.name || country}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors[index]?.country && (
                                                    <div className="text-red-500 text-sm mt-1">
                                                        {errors[index].country}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* LIÊN HỆ */}
                                    <div>
                                        <div className="font-semibold mb-2">{t('booking.passenger_info.contact_info')}</div>
                                        <div className="flex gap-6">
                                            <div className="w-full">
                                                <input
                                                    type="number"
                                                    placeholder={t('auth.phone')}
                                                    value={passengerInfo[index].phone}
                                                    onChange={(e) =>
                                                        handleChange(index, "phone", e.target.value)
                                                    }
                                                    disabled={index === 0 && useAccountInfo}
                                                    className={`text-lg border-b w-full focus:outline-none ${
                                                        errors[index]?.phone
                                                            ? "border-red-500"
                                                            : "border-gray-300 hover:border-gray-500"
                                                    } ${index === 0 && useAccountInfo ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                                />
                                                {errors[index]?.phone && (
                                                    <div className="text-red-500 text-sm mt-1">
                                                        {errors[index].phone}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="w-full">
                                                <input
                                                    type="email"
                                                    placeholder={t('auth.email_phone')}
                                                    value={passengerInfo[index].email}
                                                    onChange={(e) =>
                                                        handleChange(index, "email", e.target.value)
                                                    }
                                                    disabled={index === 0 && useAccountInfo}
                                                    className={`text-lg border-b w-full focus:outline-none ${
                                                        errors[index]?.email
                                                            ? "border-red-500"
                                                            : "border-gray-300 hover:border-gray-500"
                                                    } ${index === 0 && useAccountInfo ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                                />
                                                {errors[index]?.email && (
                                                    <div className="text-red-500 text-sm mt-1">
                                                        {errors[index].email}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* GIẤY TỜ */}
                                    <div>
                                        <div className="font-semibold mb-2">{t('booking.passenger_info.id_card')}</div>
                                        <input
                                            type="text"
                                            placeholder={t('booking.passenger_info.id_card')}
                                            value={passengerInfo[index].idCard}
                                            onChange={(e) =>
                                                handleChange(index, "idCard", e.target.value)
                                            }
                                            className={`text-lg border-b w-full focus:outline-none ${
                                                errors[index]?.idCard
                                                    ? "border-red-500"
                                                    : "border-gray-300 hover:border-gray-500"
                                            }`}
                                        />
                                        {errors[index]?.idCard && (
                                            <div className="text-red-500 text-sm mt-1">
                                                {errors[index].idCard}
                                            </div>
                                        )}
                                    </div>

                                    {/* ĐỊA CHỈ */}
                                    <div>
                                        <div className="font-semibold mb-3">{t('booking.passenger_info.address')}</div>
                                        <input
                                            type="text"
                                            placeholder={t('booking.passenger_info.address')}
                                            value={passengerInfo[index].address}
                                            onChange={(e) =>
                                                handleChange(index, "address", e.target.value)
                                            }
                                            className={`mb-3 text-lg border-b w-full focus:outline-none ${
                                                errors[index]?.address
                                                    ? "border-red-500"
                                                    : "border-gray-300 hover:border-gray-500"
                                            }`}
                                        />
                                        {errors[index]?.address && (
                                            <div className="text-red-500 text-sm mt-1">
                                                {errors[index].address}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="bg-white px-8 py-4 rounded-lg mt-8 text-gray-600 mb-50">
                        {t('booking.passenger_info.privacy_ack')}
                        <span className="text-blue-700 cursor-pointer"> {t('footer.policy')}</span>
                        {` ${t('booking.passenger_info.of')} J2EEairline.`}
                    </div>
                </div>

                <div className="mb-50">
                    <ThongTinThanhToan
                        cb={formData}
                        onBackToChonChuyenDi={() =>
                            navigate("/chon-chuyen-bay", { state: { ...formData } })
                        }
                        onBackToChonChuyenVe={() =>
                            navigate("/chon-chuyen-bay-ve", { state: { ...formData } })
                        }
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
                    <span className="text-2xl font-bold">
                        {formData
                            ? formatCurrencyWithCommas(formData.totalPrice) + " VND"
                            : "0 VND"}
                    </span>
                </div>
                <span
                    className="bg-gradient-to-bl from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center px-10 py-2 text-black cursor-pointer"
                    onClick={tiepTucOnClick}
                >
                    {t('common.continue')}
                </span>
            </div>
        </div>
    );
}

export default NhapThongTin;
