import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { FaPlaneDeparture, FaPlaneArrival, FaChevronDown } from 'react-icons/fa';
import { HiUser } from 'react-icons/hi';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { getAllSanBay } from '../../services/datVeServices';

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
    }, [departureValue, arrivalValue]);
    useEffect(() => {
        if (arrivalValue && arrivalValue === departureValue) {
            setDepartureValue("");
        }
    }, [arrivalValue, departureValue]);

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
        // Guest checkout được hỗ trợ - không cần kiểm tra đăng nhập
        // User có thể đặt vé mà không cần đăng nhập
        const formData = getFormData();

        navigate("/chon-chuyen-bay", { state: formData });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 bg-white/65 backdrop-blur-xl rounded-xl border border-white/60 p-3 md:p-4 shadow-xl shadow-slate-300/30">
            {/* Chọn loại vé */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setFlightType('round')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        flightType === 'round'
                            ? "bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                >
                    ⚡ {t('booking.search_form.round_trip')}
                </button>
                <button
                    type="button"
                    onClick={() => setFlightType('one')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        flightType === 'one'
                            ? "bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                >
                    ✈️ {t('booking.search_form.one_way')}
                </button>
            </div>

            {/* Điểm khởi hành và điểm đến */}
            <div className="grid md:grid-cols-2 gap-3">
                <div className="relative">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {t('booking.search_form.from')}
                    </label>
                    <div className="relative">
                        <FaPlaneDeparture className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm' />
                        <select 
                            name="departure"
                            id="departure"
                            value={departureValue}
                            onChange={(e) => setDepartureValue(e.target.value)}
                            className='w-full pl-8 pr-7 py-1.5 text-xs border border-slate-200 rounded-lg bg-white/90 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all appearance-none cursor-pointer text-slate-700'
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
                        <FaChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400' size={10} />
                    </div>
                </div>

                <div className="relative">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {t('booking.search_form.to')}
                    </label>
                    <div className="relative">
                        <FaPlaneArrival className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm' />
                        <select 
                            name="arrival"
                            id="arrival"
                            value={arrivalValue}
                            onChange={(e) => setArrivalValue(e.target.value)}
                            className='w-full pl-8 pr-7 py-1.5 text-xs border border-slate-200 rounded-lg bg-white/90 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all appearance-none cursor-pointer text-slate-700'
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
                        <FaChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400' size={10} />
                    </div>
                </div>
            </div>

            {/* Ngày đi, ngày về và số hành khách */}
            <div className="grid md:grid-cols-3 gap-3">
                <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {t('booking.search_form.departure_date')}
                    </label>
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        placeholderText={t('booking.search_form.departure_date')}
                        dateFormat="dd/MM/yyyy"
                        minDate={new Date()}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white/90 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-slate-700"
                    />
                </div>
                
                {flightType === 'round' && (
                    <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            {t('booking.search_form.return_date')}
                        </label>
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            placeholderText={t('booking.search_form.return_date')}
                            dateFormat="dd/MM/yyyy"
                            minDate={startDate || new Date()}
                            className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white/90 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-slate-700"
                        />
                    </div>
                )}
                
                <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {t('booking.search_form.passengers')}
                    </label>
                    <div className="relative">
                        <HiUser className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm' />
                        <select
                            value={passengers}
                            onChange={(e) => setPassengers(e.target.value)}
                            className="w-full pl-8 pr-7 py-1.5 text-xs border border-slate-200 rounded-lg bg-white/90 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all appearance-none cursor-pointer text-slate-700"
                        >
                            <option value="">{t('booking.search_form.passengers')}</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                <option key={num} value={num}>{num} {t('booking.search_form.passengers').toLowerCase()}</option>
                            ))}
                        </select>
                        <FaChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400' size={10} />
                    </div>
                </div>
            </div>

            {/* Nút tìm chuyến bay */}
            <button
                type="submit"
                className="w-full py-2 mt-1 bg-linear-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white rounded-lg font-bold text-xs shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all"
            >
                🔍 {t('booking.search_form.btn_search')}
            </button>
        </form>
    );
}

export default TimChuyenBayForm;
