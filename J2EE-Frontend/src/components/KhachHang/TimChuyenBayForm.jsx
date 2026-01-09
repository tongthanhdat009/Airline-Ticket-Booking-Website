import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { FaPlaneDeparture, FaPlaneArrival, FaChevronDown } from 'react-icons/fa';
import { HiUser } from 'react-icons/hi';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { getAllSanBay } from '../../services/datVeServices';
import { checkProfileComplete } from '../../utils/profileUtils';

function TimChuyenBayForm() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [departureValue, setDepartureValue] = useState('');
    const [arrivalValue, setArrivalValue] = useState('');
    const [passengers, setPassengers] = useState('');
    const [flightType, setFlightType] = useState('round');
    const [sanBayList, setSanBayList] = useState([]);

    const groupByCountry = (airport) => {
        return airport.reduce((acc, curr) => {
            const country = curr.quocGiaSanBay;
            if (!acc[country]) {
                acc[country] = [];
            }
            acc[country].push(curr.thanhPhoSanBay);
            return acc;
        }, {});
    };
    
    useEffect(() => {
        if (departureValue && departureValue === arrivalValue) {
            setArrivalValue("");
        }
    }, [departureValue]);
    useEffect(() => {
        if (arrivalValue && arrivalValue === departureValue) {
            setDepartureValue("");
        }
    }, [arrivalValue]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getAllSanBay();
                setSanBayList(result.data || []);
            } catch (error) {
                console.error("Lỗi fetch data:", error);
                setSanBayList([]);
            }
        };
        fetchData();
    }, []);
    
    // Nhóm sân bay theo quốc gia
    const grouped = sanBayList.length > 0 ? groupByCountry(sanBayList) : {};

    // Lấy tất cả dữ liệu form
    const getFormData = () => {
        const formData = {
            flightType: flightType,
            departure: departureValue,
            arrival: arrivalValue,
            startDate: startDate,
            endDate: endDate,
            passengers: passengers
        };
        return formData;
    };

    // Hàm validate form
    const validateForm = () => {
        const errors = [];
        
        if (!flightType) errors.push(t('validation.required'));
        if (!departureValue) errors.push(t('validation.required'));
        if (!arrivalValue) errors.push(t('validation.required'));
        if (!startDate) errors.push(t('validation.required'));
        if (flightType === 'round' && !endDate) errors.push(t('validation.required'));
        if (!passengers || passengers < 1) errors.push(t('validation.required'));
        
        return errors;
    };

    // Hàm xử lý submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const errors = validateForm();
        if (errors.length > 0) {
            alert(t('common.error') + ":\n" + errors.join("\n"));
            return;
        }
        // Kiểm tra profile của user trước khi cho đặt vé
        const profile = await checkProfileComplete();
        if (!profile.isLoggedIn) {
            // Not logged in - ask user to login first
            if (window.confirm('Bạn cần đăng nhập để tiếp tục đặt vé. Chuyển đến trang đăng nhập không?')) {
                navigate('/dang-nhap-client');
            }
            return;
        }

        if (!profile.isComplete) {
            // Show message and offer to go to completion page
            const reasons = [];
            if (profile.needsPhone) reasons.push('số điện thoại');
            if (profile.needsDob) reasons.push('ngày sinh');
            const msg = `Bạn chưa hoàn thiện thông tin (${reasons.join(', ')}). Vui lòng cập nhật để tiếp tục đặt vé. Chuyển tới trang hoàn thiện thông tin?`;
            if (window.confirm(msg)) {
                navigate('/hoan-thien-thong-tin');
            }
            return;
        }

        const formData = getFormData();
        navigate("/chon-chuyen-bay", { state: formData });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Chọn loại vé */}
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={() => setFlightType('round')}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                        flightType === 'round'
                            ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                    ⚡ {t('booking.search_form.round_trip')}
                </button>
                <button
                    type="button"
                    onClick={() => setFlightType('one')}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                        flightType === 'one'
                            ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                    ✈️ {t('booking.search_form.one_way')}
                </button>
            </div>

            {/* Điểm khởi hành và điểm đến */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('booking.search_form.from')}
                    </label>
                    <div className="relative">
                        <FaPlaneDeparture className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500' />
                        <select 
                            name="departure"
                            id="departure"
                            value={departureValue}
                            onChange={(e) => setDepartureValue(e.target.value)}
                            className='w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none transition-all appearance-none cursor-pointer'
                        >
                            <option value="">{t('booking.search_form.from')}</option>
                            {Object.entries(grouped).map(([country, cities]) => (
                                <optgroup key={country} label={country}>
                                    {cities.map((city, index) => (
                                        <option key={index} value={city} >
                                            {city}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                        <FaChevronDown className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400' size={12} />
                    </div>
                </div>

                <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('booking.search_form.to')}
                    </label>
                    <div className="relative">
                        <FaPlaneArrival className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500' />
                        <select 
                            name="arrival"
                            id="arrival"
                            value={arrivalValue}
                            onChange={(e) => setArrivalValue(e.target.value)}
                            className='w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none transition-all appearance-none cursor-pointer'
                        >
                            <option value="">{t('booking.search_form.to')}</option>
                            {Object.entries(grouped).map(([country, cities]) => (
                                <optgroup key={country} label={country}>
                                    {cities.map((city, index) => (
                                        <option key={index} value={city} >
                                            {city}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                        <FaChevronDown className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400' size={12} />
                    </div>
                </div>
            </div>

            {/* Ngày đi, ngày về và số hành khách */}
            <div className="grid md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('booking.search_form.departure_date')}
                    </label>
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        placeholderText={t('booking.search_form.departure_date')}
                        dateFormat="dd/MM/yyyy"
                        minDate={new Date()}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none transition-all"
                    />
                </div>
                
                {flightType === 'round' && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('booking.search_form.return_date')}
                        </label>
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            placeholderText={t('booking.search_form.return_date')}
                            dateFormat="dd/MM/yyyy"
                            minDate={startDate || new Date()}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none transition-all"
                        />
                    </div>
                )}
                
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('booking.search_form.passengers')}
                    </label>
                    <div className="relative">
                        <HiUser className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500' />
                        <select
                            value={passengers}
                            onChange={(e) => setPassengers(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none transition-all"
                        >
                            <option value="">{t('booking.search_form.passengers')}</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                <option key={num} value={num}>{num} {t('booking.search_form.passengers').toLowerCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Nút tìm chuyến bay */}
            <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
            >
                🔍 {t('booking.search_form.btn_search')}
            </button>
        </form>
    );
}

export default TimChuyenBayForm;
