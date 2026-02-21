import { FaUser, FaEnvelope, FaIdCard, FaPlane, FaReceipt, FaHome, FaGoogle, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

function ProfileCard({ accountInfo, onNavigate, activePage = 'profile' }) {
  return (
    <div className="xl:w-96 shrink-0">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 sticky top-6 border-t-4 border-[#1E88E5]">
        {/* Profile Header */}
        <div className="relative bg-gradient-to-br from-[#1E88E5] via-[#1565C0] to-[#0D47A1] h-36">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)`
            }}></div>
          </div>
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm">
              Thành viên
            </span>
          </div>
        </div>

        {/* Avatar */}
        <div className="relative px-6 pb-6">
          <div className="flex flex-col items-center -mt-16">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-white p-1.5 shadow-2xl ring-4 ring-white">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white">
                  <FaUser className="text-4xl" />
                </div>
              </div>
              <div className="absolute bottom-1 right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {accountInfo?.hanhKhach?.hoVaTen || 'Chưa cập nhật'}
              </h2>
              <p className="text-sm text-gray-600 mt-1 flex items-center justify-center gap-1">
                <FaEnvelope className="w-4 h-4" />
                {accountInfo?.email || 'N/A'}
              </p>
              <p className="mt-3 flex items-center justify-center gap-2 flex-wrap">
                {accountInfo?.oauth2Provider ? (
                  <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-4 py-1.5 rounded-full text-sm font-medium">
                    <FaGoogle className="w-4 h-4" />
                    {accountInfo.oauth2Provider}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium">
                    <FaIdCard className="w-4 h-4" />
                    Hành khách thông thường
                  </span>
                )}
                {/* Email Verification Status */}
                {accountInfo?.emailVerified !== undefined && (
                  <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium ${
                    accountInfo.emailVerified
                      ? 'bg-green-50 text-green-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {accountInfo.emailVerified ? (
                      <>
                        <FaCheckCircle className="w-4 h-4" />
                        Đã xác thực
                      </>
                    ) : (
                      <>
                        <FaExclamationCircle className="w-4 h-4" />
                        Chưa xác thực
                      </>
                    )}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-[#1E88E5]">0</p>
              <p className="text-xs text-gray-600 mt-1">Chuyến bay</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-green-600">0</p>
              <p className="text-xs text-gray-600 mt-1">Đơn hàng</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-amber-500">0</p>
              <p className="text-xs text-gray-600 mt-1">Điểm</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 space-y-3">
            <button
              onClick={() => onNavigate('/quan-ly-chuyen-bay')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:shadow-lg transition-all shadow-md group ${
                activePage === 'flights'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-red-300 hover:shadow-md'
              }`}
            >
              <FaPlane className={`text-lg group-hover:scale-110 transition-transform ${activePage === 'flights' ? 'text-white' : 'text-red-500'}`} />
              <div className="text-left flex-1">
                <p className="font-semibold">Chuyến bay của tôi</p>
                <p className={`text-xs ${activePage === 'flights' ? 'opacity-90' : 'text-gray-500'}`}>Quản lý đặt chỗ</p>
              </div>
              <span className={`text-lg ${activePage === 'flights' ? 'text-white' : 'text-gray-400'}`}>›</span>
            </button>

            <button
              onClick={() => onNavigate('/lich-su-giao-dich')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:shadow-lg transition-all shadow-md group ${
                activePage === 'transactions'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-green-300 hover:shadow-md'
              }`}
            >
              <FaReceipt className={`text-lg group-hover:scale-110 transition-transform ${activePage === 'transactions' ? 'text-white' : 'text-green-500'}`} />
              <div className="text-left flex-1">
                <p className="font-semibold">Lịch sử giao dịch</p>
                <p className={`text-xs ${activePage === 'transactions' ? 'opacity-90' : 'text-gray-500'}`}>Xem hóa đơn</p>
              </div>
              <span className={`text-lg ${activePage === 'transactions' ? 'text-white' : 'text-gray-400'}`}>›</span>
            </button>

            <button
              onClick={() => onNavigate('/ca-nhan')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:shadow-lg transition-all shadow-md group ${
                activePage === 'profile'
                  ? 'bg-gradient-to-r from-[#1E88E5] to-[#1565C0] text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <FaUser className={`text-lg group-hover:scale-110 transition-transform ${activePage === 'profile' ? 'text-white' : 'text-blue-500'}`} />
              <div className="text-left flex-1">
                <p className="font-semibold">Thông tin cá nhân</p>
                <p className={`text-xs ${activePage === 'profile' ? 'opacity-90' : 'text-gray-500'}`}>Quản lý tài khoản</p>
              </div>
              <span className={`text-lg ${activePage === 'profile' ? 'text-white' : 'text-gray-400'}`}>›</span>
            </button>

            <button
              onClick={() => onNavigate('/')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#1E88E5] to-[#1565C0] text-white rounded-xl hover:from-[#1565C0] hover:to-[#0D47A1] transition-all shadow-md hover:shadow-lg group"
            >
              <FaHome className="text-lg group-hover:scale-110 transition-transform" />
              <div className="text-left flex-1">
                <p className="font-semibold">Đặt vé mới</p>
                <p className="text-xs opacity-90">Tìm chuyến bay</p>
              </div>
              <span className="text-lg">›</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;
