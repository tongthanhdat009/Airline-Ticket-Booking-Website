import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import TaiKhoanService from '../../services/TaiKhoanService';
import { getClientUserEmail, getClientAccessToken } from '../../utils/cookieUtils';

function CaNhan() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accountInfo, setAccountInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  
  const [formData, setFormData] = useState({
    hoVaTen: '',
    gioiTinh: '',
    ngaySinh: '',
    email: '',
    soDienThoai: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    const fetchAccountInfo = async () => {
      try {
        const email = getClientUserEmail();
        const token = getClientAccessToken();
        
        if (!email || !token) {
          navigate('/dang-nhap-client');
          return;
        }

        const data = await TaiKhoanService.getTaiKhoanByEmail(email);
        setAccountInfo(data.data);
        
        if (data.data?.hanhKhach) {
          setFormData({
            hoVaTen: data.data.hanhKhach.hoVaTen || '',
            gioiTinh: data.data.hanhKhach.gioiTinh || '',
            ngaySinh: data.data.hanhKhach.ngaySinh ? data.data.hanhKhach.ngaySinh.split('T')[0] : '',
            email: data.data.email || '',
            soDienThoai: data.data.hanhKhach.soDienThoai || '',
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi lấy thông tin tài khoản:', error);
        setLoading(false);
      }
    };

    fetchAccountInfo();
  }, [navigate]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      await TaiKhoanService.changePassword(
        accountInfo.maTaiKhoan,
        passwordData.oldPassword,
        passwordData.newPassword
      );
      
      setPasswordSuccess('Đổi mật khẩu thành công!');
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => {
        setPasswordSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      setPasswordError(error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" 
         style={{ backgroundImage: 'url(/background/home/bgBannerHomePage.72a61446.webp)' }}>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-red-600">
              {/* Profile Header */}
              <div className="relative bg-linear-to-br from-red-500 via-red-600 to-orange-600 h-32">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)`
                  }}></div>
                </div>
              </div>
              
              {/* Avatar */}
              <div className="relative px-6 pb-6">
                <div className="flex flex-col items-center -mt-16">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-white p-1 shadow-xl">
                      <div className="w-full h-full rounded-full bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center text-5xl">
                        👤
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {accountInfo?.hanhKhach?.hoVaTen || 'Chưa cập nhật'}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {accountInfo?.oauth2Provider ? (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
                          🔐 {accountInfo.oauth2Provider}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                          Hành khách thường xuyên
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => navigate('/quan-ly-chuyen-bay')}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-md"
                  >
                    <span className="text-xl">✈️</span>
                    <div className="text-left flex-1">
                      <p className="font-semibold">Chuyến bay của tôi</p>
                      <p className="text-xs opacity-90">Quản lý đặt chỗ</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => navigate('/lich-su-giao-dich')}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-linear-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition shadow-md"
                  >
                    <span className="text-xl">💳</span>
                    <div className="text-left flex-1">
                      <p className="font-semibold">Lịch sử giao dịch</p>
                      <p className="text-xs opacity-90">Xem hóa đơn</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => navigate('/')}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-linear-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition shadow-md"
                  >
                    <span className="text-xl">🎫</span>
                    <div className="text-left flex-1">
                      <p className="font-semibold">Đặt vé mới</p>
                      <p className="text-xs opacity-90">Tìm chuyến bay</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Settings */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Tabs Navigation */}
              <div className="border-b border-gray-200 bg-gray-50">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('personal')}
                    className={`px-6 py-4 font-semibold text-sm transition-all relative ${
                      activeTab === 'personal'
                        ? 'text-red-600 bg-white'
                        : 'text-gray-600 hover:text-red-600 hover:bg-white/50'
                    }`}
                  >
                    Thông tin cá nhân
                    {activeTab === 'personal' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('account')}
                    className={`px-6 py-4 font-semibold text-sm transition-all relative ${
                      activeTab === 'account'
                        ? 'text-red-600 bg-white'
                        : 'text-gray-600 hover:text-red-600 hover:bg-white/50'
                    }`}
                  >
                    Tài khoản
                    {activeTab === 'account' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>
                    )}
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {activeTab === 'personal' && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Thông tin cá nhân</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          value={formData.hoVaTen}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Giới tính
                        </label>
                        <input
                          type="text"
                          value={formData.gioiTinh}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ngày sinh
                        </label>
                        <input
                          type="date"
                          value={formData.ngaySinh}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          value={formData.soDienThoai}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Lưu ý:</strong> Để cập nhật thông tin cá nhân, vui lòng liên hệ bộ phận chăm sóc khách hàng.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Cài đặt tài khoản</h3>
                    
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Thông tin đăng nhập</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{accountInfo?.email}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Phương thức đăng nhập:</span>
                          <span className="font-medium">
                            {accountInfo?.oauth2Provider || 'Tài khoản thường'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!accountInfo?.oauth2Provider && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Đổi mật khẩu</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Mật khẩu hiện tại
                            </label>
                            <input
                              type="password"
                              name="oldPassword"
                              value={passwordData.oldPassword}
                              onChange={handlePasswordChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="Nhập mật khẩu hiện tại"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Mật khẩu mới
                            </label>
                            <input
                              type="password"
                              name="newPassword"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="Nhập mật khẩu mới"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Xác nhận mật khẩu mới
                            </label>
                            <input
                              type="password"
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="Nhập lại mật khẩu mới"
                            />
                          </div>

                          {passwordError && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-sm text-red-800">{passwordError}</p>
                            </div>
                          )}

                          {passwordSuccess && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-sm text-green-800">{passwordSuccess}</p>
                            </div>
                          )}

                          <button
                            onClick={handleChangePassword}
                            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-semibold"
                          >
                            Đổi mật khẩu
                          </button>
                        </div>
                      </div>
                    )}

                    {accountInfo?.oauth2Provider && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Lưu ý:</strong> Tài khoản của bạn đăng nhập qua {accountInfo.oauth2Provider}, không thể đổi mật khẩu.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default CaNhan;
