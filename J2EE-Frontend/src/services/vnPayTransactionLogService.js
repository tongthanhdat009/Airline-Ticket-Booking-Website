import apiClient from './apiClient';

const BASE_URL = '/vnpay/transaction-logs';

/**
 * Service cho VNPay Transaction Log (Lịch sử giao dịch VNPay)
 */
const vnPayTransactionLogService = {
    /**
     * Lấy danh sách log giao dịch VNPay với phân trang và bộ lọc
     * @param {Object} params - Tham số tìm kiếm và phân trang
     * @param {number} params.page - Số trang (mặc định 0)
     * @param {number} params.size - Kích thước trang (mặc định 10)
     * @param {string} params.search - Từ khóa tìm kiếm (vnp_TxnRef, vnp_TransactionNo, vnp_BankCode)
     * @param {string} params.processingResult - Kết quả xử lý (SUCCESS, FAILED, CANCELLED, DUPLICATE)
     * @param {string} params.tuNgay - Ngày bắt đầu (yyyy-MM-dd)
     * @param {string} params.denNgay - Ngày kết thúc (yyyy-MM-dd)
     * @returns {Promise} - Promise chứa response từ server
     */
    getTransactionLogs: async (params = {}) => {
        const defaultParams = {
            page: 0,
            size: 10,
            ...params
        };
        const response = await apiClient.get(BASE_URL, { params: defaultParams });
        return response.data;
    },

    /**
     * Lấy chi tiết log giao dịch theo ID
     * @param {number} id - ID của transaction log
     * @returns {Promise} - Promise chứa response từ server
     */
    getTransactionLogById: async (id) => {
        const response = await apiClient.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    /**
     * Lấy danh sách log giao dịch theo vnp_TxnRef
     * @param {string} vnpTxnRef - Mã giao dịch VNPay
     * @returns {Promise} - Promise chứa response từ server
     */
    getTransactionLogsByTxnRef: async (vnpTxnRef) => {
        const response = await apiClient.get(`${BASE_URL}/txn/${vnpTxnRef}`);
        return response.data;
    },

    /**
     * Lấy thống kê giao dịch VNPay
     * @param {Object} params - Tham số lọc theo ngày
     * @param {string} params.tuNgay - Ngày bắt đầu (yyyy-MM-dd)
     * @param {string} params.denNgay - Ngày kết thúc (yyyy-MM-dd)
     * @returns {Promise} - Promise chứa thống kê (total, success, failed, cancelled, duplicate)
     */
    getStatistics: async (params = {}) => {
        const response = await apiClient.get(`${BASE_URL}/stats`, { params });
        return response.data;
    }
};

export default vnPayTransactionLogService;
