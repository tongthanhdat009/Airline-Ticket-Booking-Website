import React, { useState, useEffect } from 'react';
import { FaChair } from 'react-icons/fa';

const SeatMapCompactPreview = ({ maMayBay }) => {
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSeats = async () => {
            try {
                setLoading(true);
                const { getAircraftSeats } = await import('../../../services/AircraftService');
                const response = await getAircraftSeats(maMayBay);
                // Service đã return response.data
                const seatsData = Array.isArray(response) ? response : (response?.data || []);
                setSeats(seatsData);
            } catch (error) {
                console.error('Lỗi khi tải sơ đồ ghế:', error);
            } finally {
                setLoading(false);
            }
        };
        loadSeats();
    }, [maMayBay]);

    // Get seat color based on position
    const getSeatColor = (viTriGhe) => {
        switch (viTriGhe) {
            case 'CỬA SỔ': return 'bg-blue-500 text-white';
            case 'LỐI ĐI': return 'bg-green-500 text-white';
            case 'GIỮA': return 'bg-gray-400 text-white';
            default: return 'bg-gray-300 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-sm text-gray-600">Đang tải sơ đồ ghế...</span>
                </div>
            </div>
        );
    }

    if (seats.length === 0) {
        return (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-center text-gray-500 text-sm">Chưa có sơ đồ ghế</p>
            </div>
        );
    }

    // Group seats by class
    const seatsByClass = seats.reduce((acc, seat) => {
        const className = seat.hangVe?.tenHangVe || 'Chưa phân loại';
        if (!acc[className]) acc[className] = [];
        acc[className].push(seat);
        return acc;
    }, {});

    return (
        <div className="bg-linear-to-b from-sky-50 to-white rounded-lg border border-sky-200 p-4 space-y-3">
            <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-gray-600">Cửa sổ</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-gray-600">Lối đi</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-400 rounded"></div>
                    <span className="text-gray-600">Giữa</span>
                </div>
            </div>

            {Object.entries(seatsByClass).map(([className, classSeats]) => (
                <div key={className} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                    <p className="text-sm font-semibold text-gray-800 mb-2">{className} ({classSeats.length} ghế)</p>
                    <div className="flex flex-wrap gap-1">
                        {classSeats.slice(0, 32).map(seat => ( // Show max 32 seats for preview
                            <div
                                key={seat.maGhe}
                                className={`w-5 h-5 ${getSeatColor(seat.viTriGhe)} rounded flex items-center justify-center`}
                                title={`${seat.soGhe} - ${seat.viTriGhe}`}
                            >
                                <FaChair className="text-xs" />
                            </div>
                        ))}
                        {classSeats.length > 32 && (
                            <span className="text-xs text-gray-500 self-center">+{classSeats.length - 32}</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SeatMapCompactPreview;
