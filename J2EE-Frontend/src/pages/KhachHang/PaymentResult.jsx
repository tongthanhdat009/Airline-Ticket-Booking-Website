import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Footer from '../../components/common/Footer';

function PaymentResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [vnpayParams, setVnpayParams] = useState({});

  useEffect(() => {
    const handlePaymentResult = () => {
      try {
        // Lấy tất cả query params từ URL (đã được backend xử lý và redirect về)
        const searchParams = new URLSearchParams(location.search);
        const params = {};
        
        for (let [key, value] of searchParams.entries()) {
          params[key] = value;
        }

        setVnpayParams(params);

        // Parse kết quả từ backend
        const success = params.success === 'true';
        const message = params.message || '';
        
        if (success) {
          setResult({
            success: true,
            message: message,
            data: {
              maThanhToan: params.maThanhToan,
              soTien: params.soTien
            }
          });
        } else {
          setError(message);
        }
      } catch (err) {
        console.error('Error handling payment result:', err);
        setError('Có lỗi xảy ra khi xử lý kết quả thanh toán');
      } finally {
        setLoading(false);
      }
    };

    if (location.search) {
      handlePaymentResult();
    } else {
      setError('Không tìm thấy thông tin giao dịch');
      setLoading(false);
    }
  }, [location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  const isSuccess = result?.success;

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" 
         style={{ backgroundImage: 'url(/background/home/bgBannerHomePage.72a61446.webp)' }}>
      
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className={`p-8 text-center ${isSuccess ? 'bg-linear-to-r from-green-500 to-green-600' : 'bg-linear-to-r from-red-500 to-red-600'}`}>
            <div className="text-6xl mb-4">
              {isSuccess ? '✓' : '✕'}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
            </h1>
            <p className="text-white/90">
              {result?.message || error || 'Đã có lỗi xảy ra'}
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {isSuccess && result?.data && (
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-gray-600">Mã thanh toán:</span>
                  <span className="font-semibold text-lg">#{result.data.maThanhToan}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-gray-600">Mã giao dịch VNPay:</span>
                  <span className="font-mono text-sm">{vnpayParams.vnp_TxnRef}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-semibold text-lg text-green-600">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(result.data.soTien)}
                  </span>
                </div>
                {vnpayParams.vnp_BankCode && (
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="text-gray-600">Ngân hàng:</span>
                    <span className="font-semibold">{vnpayParams.vnp_BankCode}</span>
                  </div>
                )}
                {vnpayParams.vnp_PayDate && (
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="text-gray-600">Thời gian thanh toán:</span>
                    <span className="font-semibold">
                      {new Date(
                        vnpayParams.vnp_PayDate.substring(0, 4),
                        vnpayParams.vnp_PayDate.substring(4, 6) - 1,
                        vnpayParams.vnp_PayDate.substring(6, 8),
                        vnpayParams.vnp_PayDate.substring(8, 10),
                        vnpayParams.vnp_PayDate.substring(10, 12),
                        vnpayParams.vnp_PayDate.substring(12, 14)
                      ).toLocaleString('vi-VN')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    ✓ Đã thanh toán
                  </span>
                </div>
              </div>
            )}

            {!isSuccess && vnpayParams.vnp_ResponseCode && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <span className="font-semibold">Mã lỗi:</span> {vnpayParams.vnp_ResponseCode}
                </p>
                {vnpayParams.vnp_TxnRef && (
                  <p className="text-sm text-red-800 mt-2">
                    <span className="font-semibold">Mã giao dịch:</span> {vnpayParams.vnp_TxnRef}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {isSuccess && (
                <button
                  onClick={() => navigate('/lich-su-giao-dich')}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Xem lịch sử giao dịch
                </button>
              )}
              <button
                onClick={() => navigate('/')}
                className={`flex-1 py-3 rounded-lg transition font-semibold ${
                  isSuccess 
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default PaymentResult;
