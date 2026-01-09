import apiClient from './apiClient';

const CheckInService = {
    // Tìm kiếm thông tin đặt chỗ
    searchBooking: async (maDatCho, hoVaTen) => {
        try {
            const response = await apiClient.post('/api/checkin/search', {
                maDatCho: parseInt(maDatCho),
                hoVaTen: hoVaTen
            });
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            throw error;
        }
    },

    // Xác nhận check-in
    confirmCheckIn: async (maDatCho) => {
        try {
            const response = await apiClient.post(`/api/checkin/confirm/${maDatCho}`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            throw error;
        }
    }
};

export default CheckInService;
