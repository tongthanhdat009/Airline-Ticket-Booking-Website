import { useState } from 'react';
import {
  FaSearch,
  FaServer,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaFilter,
  FaCalendar,
  FaInfoCircle,
  FaEye,
  FaCopy,
  FaCode,
  FaExchangeAlt
} from 'react-icons/fa';
import Card from '../../components/QuanLy/CardChucNang';
import Toast from '../../components/common/Toast';
import ViewToggleButton from '../../components/common/ViewToggleButton';
import useViewToggle from '../../hooks/useViewToggle';

// Dữ liệu mẫu log giao dịch VNPay IPN
const mockTransactionLogs = [
  {
    id: 1,
    vnpTxnRef: 'ORD-2026-0215-001',
    vnpTransactionNo: '14268537',
    vnpAmount: 250000000, // VNPay trả về đơn vị x100
    vnpResponseCode: '00',
    vnpTransactionStatus: '00',
    vnpBankCode: 'NCB',
    vnpBankTranNo: 'VNP14268537',
    vnpPayDate: '20260215103045',
    vnpOrderInfo: 'Thanh toan don hang ORD-2026-0215-001',
    vnpSecureHash: 'abc123def456...',
    ipnUrl: '/api/vnpay/ipn',
    ipnReceivedAt: '2026-02-15 10:30:48',
    httpMethod: 'GET',
    sourceIp: '113.52.45.78',
    processingResult: 'SUCCESS',
    processingMessage: 'Đã xử lý thành công. Đơn hàng cập nhật thành ĐÃ THANH TOÁN.',
    rawData: '{"vnp_Amount":"250000000","vnp_BankCode":"NCB","vnp_BankTranNo":"VNP14268537","vnp_CardType":"ATM","vnp_OrderInfo":"Thanh toan don hang ORD-2026-0215-001","vnp_PayDate":"20260215103045","vnp_ResponseCode":"00","vnp_TmnCode":"ABC123","vnp_TransactionNo":"14268537","vnp_TransactionStatus":"00","vnp_TxnRef":"ORD-2026-0215-001"}'
  },
  {
    id: 2,
    vnpTxnRef: 'ORD-2026-0215-002',
    vnpTransactionNo: '14268538',
    vnpAmount: 350000000,
    vnpResponseCode: '00',
    vnpTransactionStatus: '00',
    vnpBankCode: 'VCB',
    vnpBankTranNo: 'VNP14268538',
    vnpPayDate: '20260215142020',
    vnpOrderInfo: 'Thanh toan don hang ORD-2026-0215-002',
    vnpSecureHash: 'xyz789ghi012...',
    ipnUrl: '/api/vnpay/ipn',
    ipnReceivedAt: '2026-02-15 14:20:23',
    httpMethod: 'GET',
    sourceIp: '113.52.45.78',
    processingResult: 'FAILED',
    processingMessage: 'Lỗi: Đơn hàng không tìm thấy trong hệ thống. vnp_TxnRef không khớp.',
    rawData: '{"vnp_Amount":"350000000","vnp_BankCode":"VCB","vnp_BankTranNo":"VNP14268538","vnp_CardType":"ATM","vnp_OrderInfo":"Thanh toan don hang ORD-2026-0215-002","vnp_PayDate":"20260215142020","vnp_ResponseCode":"00","vnp_TmnCode":"ABC123","vnp_TransactionNo":"14268538","vnp_TransactionStatus":"00","vnp_TxnRef":"ORD-2026-0215-002"}'
  },
  {
    id: 3,
    vnpTxnRef: 'ORD-2026-0216-001',
    vnpTransactionNo: '14268539',
    vnpAmount: 100000000,
    vnpResponseCode: '24',
    vnpTransactionStatus: '02',
    vnpBankCode: 'BIDV',
    vnpBankTranNo: '',
    vnpPayDate: '20260216091530',
    vnpOrderInfo: 'Thanh toan don hang ORD-2026-0216-001',
    vnpSecureHash: 'mno345pqr678...',
    ipnUrl: '/api/vnpay/ipn',
    ipnReceivedAt: '2026-02-16 09:15:33',
    httpMethod: 'GET',
    sourceIp: '113.52.45.78',
    processingResult: 'CANCELLED',
    processingMessage: 'Khách hàng hủy giao dịch (vnp_ResponseCode=24). Đơn hàng giữ trạng thái CHỜ THANH TOÁN.',
    rawData: '{"vnp_Amount":"100000000","vnp_BankCode":"BIDV","vnp_OrderInfo":"Thanh toan don hang ORD-2026-0216-001","vnp_PayDate":"20260216091530","vnp_ResponseCode":"24","vnp_TmnCode":"ABC123","vnp_TransactionNo":"14268539","vnp_TransactionStatus":"02","vnp_TxnRef":"ORD-2026-0216-001"}'
  },
  {
    id: 4,
    vnpTxnRef: 'ORD-2026-0217-001',
    vnpTransactionNo: '14268540',
    vnpAmount: 500000000,
    vnpResponseCode: '00',
    vnpTransactionStatus: '00',
    vnpBankCode: 'TCB',
    vnpBankTranNo: 'VNP14268540',
    vnpPayDate: '20260217113005',
    vnpOrderInfo: 'Thanh toan don hang ORD-2026-0217-001',
    vnpSecureHash: 'stu901vwx234...',
    ipnUrl: '/api/vnpay/ipn',
    ipnReceivedAt: '2026-02-17 11:30:08',
    httpMethod: 'GET',
    sourceIp: '113.52.45.78',
    processingResult: 'SUCCESS',
    processingMessage: 'Đã xử lý thành công. Đơn hàng cập nhật thành ĐÃ THANH TOÁN.',
    rawData: '{"vnp_Amount":"500000000","vnp_BankCode":"TCB","vnp_BankTranNo":"VNP14268540","vnp_OrderInfo":"Thanh toan don hang ORD-2026-0217-001","vnp_PayDate":"20260217113005","vnp_ResponseCode":"00","vnp_TmnCode":"ABC123","vnp_TransactionNo":"14268540","vnp_TransactionStatus":"00","vnp_TxnRef":"ORD-2026-0217-001"}'
  },
  {
    id: 5,
    vnpTxnRef: 'ORD-2026-0218-001',
    vnpTransactionNo: '14268541',
    vnpAmount: 150000000,
    vnpResponseCode: '00',
    vnpTransactionStatus: '00',
    vnpBankCode: 'MB',
    vnpBankTranNo: 'VNP14268541',
    vnpPayDate: '20260218164503',
    vnpOrderInfo: 'Thanh toan don hang ORD-2026-0218-001',
    vnpSecureHash: 'yza567bcd890...',
    ipnUrl: '/api/vnpay/ipn',
    ipnReceivedAt: '2026-02-18 16:45:06',
    httpMethod: 'GET',
    sourceIp: '113.52.45.78',
    processingResult: 'SUCCESS',
    processingMessage: 'Đã xử lý thành công. Đơn hàng cập nhật thành ĐÃ THANH TOÁN.',
    rawData: '{"vnp_Amount":"150000000","vnp_BankCode":"MB","vnp_BankTranNo":"VNP14268541","vnp_OrderInfo":"Thanh toan don hang ORD-2026-0218-001","vnp_PayDate":"20260218164503","vnp_ResponseCode":"00","vnp_TmnCode":"ABC123","vnp_TransactionNo":"14268541","vnp_TransactionStatus":"00","vnp_TxnRef":"ORD-2026-0218-001"}'
  },
  {
    id: 6,
    vnpTxnRef: 'ORD-2026-0219-001',
    vnpTransactionNo: '14268542',
    vnpAmount: 200000000,
    vnpResponseCode: '51',
    vnpTransactionStatus: '02',
    vnpBankCode: 'ACB',
    vnpBankTranNo: '',
    vnpPayDate: '20260219080010',
    vnpOrderInfo: 'Thanh toan don hang ORD-2026-0219-001',
    vnpSecureHash: 'efg123hij456...',
    ipnUrl: '/api/vnpay/ipn',
    ipnReceivedAt: '2026-02-19 08:00:13',
    httpMethod: 'GET',
    sourceIp: '113.52.45.78',
    processingResult: 'FAILED',
    processingMessage: 'Tài khoản không đủ số dư (vnp_ResponseCode=51).',
    rawData: '{"vnp_Amount":"200000000","vnp_BankCode":"ACB","vnp_OrderInfo":"Thanh toan don hang ORD-2026-0219-001","vnp_PayDate":"20260219080010","vnp_ResponseCode":"51","vnp_TmnCode":"ABC123","vnp_TransactionNo":"14268542","vnp_TransactionStatus":"02","vnp_TxnRef":"ORD-2026-0219-001"}'
  },
  {
    id: 7,
    vnpTxnRef: 'ORD-2026-0220-001',
    vnpTransactionNo: '14268543',
    vnpAmount: 300000000,
    vnpResponseCode: '00',
    vnpTransactionStatus: '00',
    vnpBankCode: 'VCB',
    vnpBankTranNo: 'VNP14268543',
    vnpPayDate: '20260220101520',
    vnpOrderInfo: 'Thanh toan don hang ORD-2026-0220-001',
    vnpSecureHash: 'klm789nop012...',
    ipnUrl: '/api/vnpay/ipn',
    ipnReceivedAt: '2026-02-20 10:15:23',
    httpMethod: 'GET',
    sourceIp: '113.52.45.78',
    processingResult: 'DUPLICATE',
    processingMessage: 'IPN trùng lặp. Đơn hàng đã được xử lý trước đó. Bỏ qua.',
    rawData: '{"vnp_Amount":"300000000","vnp_BankCode":"VCB","vnp_BankTranNo":"VNP14268543","vnp_OrderInfo":"Thanh toan don hang ORD-2026-0220-001","vnp_PayDate":"20260220101520","vnp_ResponseCode":"00","vnp_TmnCode":"ABC123","vnp_TransactionNo":"14268543","vnp_TransactionStatus":"00","vnp_TxnRef":"ORD-2026-0220-001"}'
  }
];

// Mapping VNPay response codes
const vnpResponseCodes = {
  '00': { label: 'Thành công', color: 'text-green-600' },
  '07': { label: 'Trừ tiền thành công (nghi ngờ)', color: 'text-yellow-600' },
  '09': { label: 'Chưa đăng ký IB', color: 'text-red-600' },
  '10': { label: 'Xác thực sai >3 lần', color: 'text-red-600' },
  '11': { label: 'Hết hạn chờ', color: 'text-orange-600' },
  '12': { label: 'Thẻ bị khóa', color: 'text-red-600' },
  '13': { label: 'Sai OTP', color: 'text-red-600' },
  '24': { label: 'Khách hủy', color: 'text-gray-600' },
  '51': { label: 'Không đủ số dư', color: 'text-red-600' },
  '65': { label: 'Vượt hạn mức', color: 'text-red-600' },
  '75': { label: 'Ngân hàng bảo trì', color: 'text-orange-600' },
  '79': { label: 'Sai mật khẩu >số lần', color: 'text-red-600' },
  '99': { label: 'Lỗi khác', color: 'text-red-600' }
};

// Trạng thái xử lý config
const processingStatusConfig = {
  SUCCESS: { label: 'Thành công', color: 'bg-green-100 text-green-700', icon: FaCheckCircle },
  FAILED: { label: 'Thất bại', color: 'bg-red-100 text-red-700', icon: FaTimesCircle },
  CANCELLED: { label: 'Đã hủy', color: 'bg-gray-100 text-gray-700', icon: FaTimesCircle },
  DUPLICATE: { label: 'IPN trùng lặp', color: 'bg-yellow-100 text-yellow-700', icon: FaExclamationTriangle }
};

// Format VNPay amount (x100)
const formatAmount = (vnpAmount) => {
  const amount = vnpAmount / 100;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Format VNPay pay date  
const formatVnpDate = (vnpDate) => {
  if (!vnpDate || vnpDate.length !== 14) return vnpDate;
  return `${vnpDate.slice(0, 4)}-${vnpDate.slice(4, 6)}-${vnpDate.slice(6, 8)} ${vnpDate.slice(8, 10)}:${vnpDate.slice(10, 12)}:${vnpDate.slice(12, 14)}`;
};

const LichSuGiaoDichVNPay = () => {
  const [search, setSearch] = useState('');
  const [filterResult, setFilterResult] = useState('all');
  const [tuNgay, setTuNgay] = useState('2026-02-15');
  const [denNgay, setDenNgay] = useState('2026-02-21');
  const [logs] = useState(mockTransactionLogs);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showRawData, setShowRawData] = useState(false);
  const { viewMode, setViewMode } = useViewToggle('lich-su-gd-vnpay-view', 'table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Toast
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  // Lọc
  const filteredLogs = logs.filter(log => {
    const matchSearch =
      log.vnpTxnRef.toLowerCase().includes(search.toLowerCase()) ||
      log.vnpTransactionNo.toLowerCase().includes(search.toLowerCase()) ||
      log.vnpBankCode.toLowerCase().includes(search.toLowerCase());
    const matchResult = filterResult === 'all' || log.processingResult === filterResult;
    return matchSearch && matchResult;
  });

  // Thống kê
  const stats = {
    total: logs.length,
    success: logs.filter(l => l.processingResult === 'SUCCESS').length,
    failed: logs.filter(l => l.processingResult === 'FAILED').length,
    others: logs.filter(l => !['SUCCESS', 'FAILED'].includes(l.processingResult)).length
  };

  // Copy raw data
  const copyRawData = (data) => {
    navigator.clipboard.writeText(data);
    showToast('Đã copy raw data vào clipboard');
  };

  return (
    <Card title="Lịch sử giao dịch VNPay (Transaction Logs)">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />

      {/* Thông tin cảnh báo */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
        <FaInfoCircle className="text-amber-500 mt-0.5 shrink-0" />
        <div className="text-sm text-amber-700">
          <p className="font-semibold mb-1">Dành cho Developer / Vận hành</p>
          <p>Đây là dữ liệu "thô" (raw data) mà VNPay trả về qua IPN (Instant Payment Notification). Sử dụng màn hình này để debug khi có khách khiếu nại "Bị trừ tiền nhưng web báo lỗi".</p>
        </div>
      </div>

      {/* Thống kê */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <FaServer className="text-blue-600" />
            <div>
              <p className="text-xs text-blue-600">Tổng IPN</p>
              <p className="text-xl font-bold text-blue-700">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <FaCheckCircle className="text-green-600" />
            <div>
              <p className="text-xs text-green-600">Thành công</p>
              <p className="text-xl font-bold text-green-700">{stats.success}</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <FaTimesCircle className="text-red-600" />
            <div>
              <p className="text-xs text-red-600">Thất bại</p>
              <p className="text-xl font-bold text-red-700">{stats.failed}</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-yellow-600" />
            <div>
              <p className="text-xs text-yellow-600">Hủy/Trùng lặp</p>
              <p className="text-xl font-bold text-yellow-700">{stats.others}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo vnp_TxnRef, TransactionNo, BankCode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
          />
        </div>
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-400" />
          <select
            value={filterResult}
            onChange={(e) => setFilterResult(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Tất cả kết quả</option>
            <option value="SUCCESS">Thành công</option>
            <option value="FAILED">Thất bại</option>
            <option value="CANCELLED">Đã hủy</option>
            <option value="DUPLICATE">Trùng lặp</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <FaCalendar className="text-gray-400" />
          <input type="date" value={tuNgay} onChange={(e) => setTuNgay(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <span className="text-gray-400">-</span>
          <input type="date" value={denNgay} onChange={(e) => setDenNgay(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <ViewToggleButton currentView={viewMode} onViewChange={(v) => { setViewMode(v); setCurrentPage(1); }} />
      </div>

      {/* Pagination header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">Hiển thị {Math.min(filteredLogs.length, itemsPerPage)} / {filteredLogs.length} bản ghi</p>
        <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
          <option value={5}>5 / trang</option>
          <option value={10}>10 / trang</option>
          <option value={20}>20 / trang</option>
        </select>
      </div>

      {/* Bảng logs / Card view */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FaServer className="text-4xl mx-auto mb-3 text-gray-300" />
          <p>Không tìm thấy log giao dịch nào</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((log) => {
            const statusConfig = processingStatusConfig[log.processingResult] || processingStatusConfig.FAILED;
            const StatusIcon = statusConfig.icon;
            const responseInfo = vnpResponseCodes[log.vnpResponseCode] || { label: `Code ${log.vnpResponseCode}`, color: 'text-gray-600' };
            return (
              <div key={log.id} className={`bg-white rounded-xl border hover:shadow-lg transition-shadow p-4 ${
                log.processingResult === 'SUCCESS' ? 'border-l-4 border-l-green-500' :
                log.processingResult === 'FAILED' ? 'border-l-4 border-l-red-500' :
                'border-l-4 border-l-yellow-500'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-mono font-semibold text-sm text-gray-800">{log.vnpTxnRef}</p>
                    <p className="font-mono text-xs text-gray-400">TXN: {log.vnpTransactionNo}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                    <StatusIcon className="text-xs" />
                    {statusConfig.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div className="bg-blue-50 rounded-lg p-2">
                    <p className="text-xs text-gray-500">Số tiền</p>
                    <p className="font-medium text-blue-700">{formatAmount(log.vnpAmount)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-500">Ngân hàng</p>
                    <p className="font-mono font-medium text-gray-700">{log.vnpBankCode}</p>
                  </div>
                </div>
                <div className="text-xs space-y-1 mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">VNPay Code:</span>
                    <span className={`font-medium ${responseInfo.color}`}>{log.vnpResponseCode} - {responseInfo.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">IPN nhận lúc:</span>
                    <span className="font-mono text-gray-600">{log.ipnReceivedAt}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3 bg-gray-50 rounded p-2">{log.processingMessage}</p>
                <div className="flex justify-end">
                  <button onClick={() => { setSelectedLog(log); setShowRawData(false); }} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    <FaEye /> Xem chi tiết
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="px-3 py-3 text-left text-xs font-semibold">#</th>
                <th className="px-3 py-3 text-left text-xs font-semibold">vnp_TxnRef</th>
                <th className="px-3 py-3 text-left text-xs font-semibold">TransactionNo</th>
                <th className="px-3 py-3 text-right text-xs font-semibold">Số tiền</th>
                <th className="px-3 py-3 text-left text-xs font-semibold">Ngân hàng</th>
                <th className="px-3 py-3 text-left text-xs font-semibold">VNPay Code</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">Kết quả XL</th>
                <th className="px-3 py-3 text-left text-xs font-semibold">IPN nhận lúc</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((log, index) => {
                const statusConfig = processingStatusConfig[log.processingResult] || processingStatusConfig.FAILED;
                const StatusIcon = statusConfig.icon;
                const responseInfo = vnpResponseCodes[log.vnpResponseCode] || { label: `Code ${log.vnpResponseCode}`, color: 'text-gray-600' };

                return (
                  <tr key={log.id} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                    <td className="px-3 py-3 text-sm text-gray-500">{log.id}</td>
                    <td className="px-3 py-3 text-sm font-mono text-gray-700 font-medium">{log.vnpTxnRef}</td>
                    <td className="px-3 py-3 text-sm font-mono text-gray-600">{log.vnpTransactionNo}</td>
                    <td className="px-3 py-3 text-sm text-right font-medium text-gray-800">{formatAmount(log.vnpAmount)}</td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-xs font-mono font-medium text-gray-700">
                        {log.vnpBankCode}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs">
                      <span className={`font-medium ${responseInfo.color}`}>
                        {log.vnpResponseCode} - {responseInfo.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        <StatusIcon className="text-xs" />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500 font-mono">{log.ipnReceivedAt}</td>
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => { setSelectedLog(log); setShowRawData(false); }}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {(() => {
        const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
        if (totalPages <= 1) return null;
        return (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-100">← Trước</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 rounded-lg text-sm font-medium ${page === currentPage ? 'bg-blue-600 text-white' : 'border hover:bg-gray-100'}`}>{page}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-100">Sau →</button>
          </div>
        );
      })()}

      {/* Modal chi tiết log */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedLog(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaCode className="text-blue-600" />
                Chi tiết IPN Log #{selectedLog.id}
              </h3>
              <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6">
              {/* Thông tin giao dịch */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">vnp_TxnRef</p>
                  <p className="font-mono font-medium text-sm">{selectedLog.vnpTxnRef}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">vnp_TransactionNo</p>
                  <p className="font-mono font-medium text-sm">{selectedLog.vnpTransactionNo}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Số tiền</p>
                  <p className="font-medium text-sm text-blue-600">{formatAmount(selectedLog.vnpAmount)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Ngân hàng</p>
                  <p className="font-mono font-medium text-sm">{selectedLog.vnpBankCode}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">vnp_ResponseCode</p>
                  <p className="font-mono font-medium text-sm">
                    {selectedLog.vnpResponseCode} - {(vnpResponseCodes[selectedLog.vnpResponseCode] || {}).label}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">vnp_PayDate</p>
                  <p className="font-mono font-medium text-sm">{formatVnpDate(selectedLog.vnpPayDate)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">IPN nhận lúc</p>
                  <p className="font-mono font-medium text-sm">{selectedLog.ipnReceivedAt}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Source IP</p>
                  <p className="font-mono font-medium text-sm">{selectedLog.sourceIp}</p>
                </div>
              </div>

              {/* Kết quả xử lý */}
              <div className={`rounded-lg p-4 mb-4 ${
                selectedLog.processingResult === 'SUCCESS' ? 'bg-green-50 border border-green-200' :
                selectedLog.processingResult === 'FAILED' ? 'bg-red-50 border border-red-200' :
                'bg-yellow-50 border border-yellow-200'
              }`}>
                <p className="text-xs font-semibold mb-1">Kết quả xử lý</p>
                <p className="text-sm">{selectedLog.processingMessage}</p>
              </div>

              {/* Raw data */}
              <div>
                <button
                  onClick={() => setShowRawData(!showRawData)}
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-2"
                >
                  <FaCode />
                  {showRawData ? 'Ẩn Raw Data' : 'Xem Raw Data'}
                </button>
                {showRawData && (
                  <div className="relative">
                    <button
                      onClick={() => copyRawData(selectedLog.rawData)}
                      className="absolute top-2 right-2 p-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-600"
                      title="Copy"
                    >
                      <FaCopy />
                    </button>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto font-mono">
                      {JSON.stringify(JSON.parse(selectedLog.rawData), null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end p-6 border-t">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default LichSuGiaoDichVNPay;
