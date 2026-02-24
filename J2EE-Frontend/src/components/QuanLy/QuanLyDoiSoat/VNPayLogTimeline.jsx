import { useState, useEffect } from 'react';
import { 
 FaClock, 
 FaCheckCircle, 
 FaTimesCircle, 
 FaExchangeAlt,
 FaChevronDown,
 FaChevronUp,
 FaServer,
 FaCreditCard
} from 'react-icons/fa';
import doiSoatGiaoDichApi from '../../../services/doiSoatGiaoDichApi';

/**
 * Component hiển thị timeline VNPay Transaction Logs
 * @param {string} txnRef - Mã giao dịch VNPay
 */
const VNPayLogTimeline = ({ txnRef }) => {
 const [logs, setLogs] = useState([]);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);
 const [expandedLog, setExpandedLog] = useState(null);

 useEffect(() => {
 if (txnRef) {
 loadLogs();
 }
 }, [txnRef]);

 const loadLogs = async () => {
 setLoading(true);
 setError(null);
 try {
 const response = await doiSoatGiaoDichApi.getVNPayLogs(txnRef);
 if (response.success && response.data) {
 setLogs(response.data);
 } else {
 setLogs([]);
 }
 } catch (err) {
 setError('Không thể tải VNPay logs');
 console.error('Error loading VNPay logs:', err);
 } finally {
 setLoading(false);
 }
 };

 const getStatusIcon = (result) => {
 switch (result) {
 case 'SUCCESS':
 return <FaCheckCircle className="text-green-500" />;
 case 'FAILED':
 case 'CANCELLED':
 return <FaTimesCircle className="text-red-500" />;
 case 'DUPLICATE':
 return <FaExchangeAlt className="text-yellow-500" />;
 default:
 return <FaClock className="text-gray-400" />;
 }
 };

 const getStatusColor = (result) => {
 switch (result) {
 case 'SUCCESS':
 return 'bg-green-100 text-green-700 border-green-200';
 case 'FAILED':
 return 'bg-red-100 text-red-700 border-red-200';
 case 'CANCELLED':
 return 'bg-gray-100 text-gray-700 border-gray-200';
 case 'DUPLICATE':
 return 'bg-yellow-100 text-yellow-700 border-yellow-200';
 default:
 return 'bg-blue-100 text-blue-700 border-blue-200';
 }
 };

 const formatDateTime = (dateString) => {
 if (!dateString) return 'N/A';
 const date = new Date(dateString);
 return date.toLocaleString('vi-VN', {
 year: 'numeric',
 month: '2-digit',
 day: '2-digit',
 hour: '2-digit',
 minute: '2-digit',
 second: '2-digit'
 });
 };

 const formatAmount = (amount) => {
 if (!amount) return 'N/A';
 // VNPay amount is multiplied by 100
 const actualAmount = amount / 100;
 return new Intl.NumberFormat('vi-VN', {
 style: 'currency',
 currency: 'VND'
 }).format(actualAmount);
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center py-4">
 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
 <span className="ml-2 text-sm text-gray-600">Đang tải logs...</span>
 </div>
 );
 }

 if (error) {
 return (
 <div className="text-sm text-red-500 py-2">
 {error}
 </div>
 );
 }

 if (!logs || logs.length === 0) {
 return (
 <div className="text-sm text-gray-500 py-2 italic">
 Không tìm thấy logs VNPay cho giao dịch này
 </div>
 );
 }

 return (
 <div className="space-y-3">
 <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
 <FaServer className="text-blue-500" />
 VNPay Transaction Logs ({logs.length})
 </h4>
 
 <div className="relative">
 {/* Timeline line */}
 <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
 
 <div className="space-y-3">
 {logs.map((log) => (
 <div 
 key={log.id} 
 className="relative pl-10"
 >
 {/* Timeline dot */}
 <div className={`absolute left-2.5 top-2 w-3 h-3 rounded-full border-2 ${
 log.processingResult === 'SUCCESS' ? 'bg-green-500 border-green-500' :
 log.processingResult === 'FAILED' ? 'bg-red-500 border-red-500' :
 'bg-yellow-400 border-yellow-400'
 }`}></div>
 
 {/* Log card */}
 <div className={`border rounded-lg p-3 ${getStatusColor(log.processingResult)}`}>
 <div 
 className="flex items-center justify-between cursor-pointer"
 onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
 >
 <div className="flex items-center gap-2">
 {getStatusIcon(log.processingResult)}
 <span className="font-medium text-sm">
 {log.processingResult}
 </span>
 <span className="text-xs opacity-75">
 ({log.vnpResponseCode})
 </span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-xs">
 {formatDateTime(log.ipnReceivedAt)}
 </span>
 {expandedLog === log.id ? (
 <FaChevronUp className="text-xs" />
 ) : (
 <FaChevronDown className="text-xs" />
 )}
 </div>
 </div>
 
 {/* Expanded details */}
 {expandedLog === log.id && (
 <div className="mt-3 pt-3 border-t border-current border-opacity-20 space-y-2">
 <div className="grid grid-cols-2 gap-2 text-xs">
 <div>
 <span className="opacity-75">Transaction No:</span>
 <div className="font-mono">{log.vnpTransactionNo || 'N/A'}</div>
 </div>
 <div>
 <span className="opacity-75">Txn Ref:</span>
 <div className="font-mono truncate">{log.vnpTxnRef}</div>
 </div>
 <div>
 <span className="opacity-75">Số tiền:</span>
 <div className="font-semibold">{formatAmount(log.vnpAmount)}</div>
 </div>
 <div>
 <span className="opacity-75">Ngân hàng:</span>
 <div>{log.vnpBankCode || 'N/A'}</div>
 </div>
 <div>
 <span className="opacity-75">Bank Tran No:</span>
 <div className="font-mono">{log.vnpBankTranNo || 'N/A'}</div>
 </div>
 <div>
 <span className="opacity-75">Pay Date:</span>
 <div>{log.vnpPayDate || 'N/A'}</div>
 </div>
 </div>
 
 {log.processingMessage && (
 <div className="text-xs mt-2">
 <span className="opacity-75">Message:</span>
 <div className="mt-1 p-2 bg-white bg-opacity-50 rounded">
 {log.processingMessage}
 </div>
 </div>
 )}
 
 {log.rawData && (
 <div className="text-xs mt-2">
 <span className="opacity-75">Raw Data:</span>
 <pre className="mt-1 p-2 bg-black bg-opacity-10 rounded overflow-x-auto text-xs">
 {typeof log.rawData === 'string' 
 ? log.rawData.substring(0, 500) + (log.rawData.length > 500 ? '...' : '')
 : JSON.stringify(log.rawData, null, 2).substring(0, 500)
 }
 </pre>
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
};

export default VNPayLogTimeline;
