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

        const response = await TaiKhoanService.getTaiKhoanByEmail(email);
        setAccountInfo(response.data);
        
        if (response.data.hanhKhach) {
          setFormData({
            hoVaTen: response.data.hanhKhach.hoVaTen || '',
            gioiTinh: response.data.hanhKhach.gioiTinh || '',
            ngaySinh: response.data.hanhKhach.ngaySinh ? response.data.hanhKhach.ngaySinh.split('T')[0] : '',
            email: response.data.email || '',
            soDienThoai: response.data.hanhKhach.soDienThoai || '',
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('L?i khi l?y thông tin tài kho?n:', error);
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
      setPasswordError('Vui lòng di?n d?y d? thông tin');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('M?t kh?u m?i và xác nh?n m?t kh?u không kh?p');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('M?t kh?u m?i ph?i có ít nh?t 6 ký t?');
      return;
    }

    try {
      await TaiKhoanService.changePassword(
        accountInfo.maTaiKhoan,
        passwordData.oldPassword,
        passwordData.newPassword
      );
      
      setPasswordSuccess('Ð?i m?t kh?u thành công!');
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => {
        setPasswordSuccess('');
      }, 3000);
    } catch (error) {
      console.error('L?i khi d?i m?t kh?u:', error);
      setPasswordError(error.response?.data?.message || 'Có l?i x?y ra khi d?i m?t kh?u');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#1E88E5] mx-auto mb-4"></div>
          <p className="text-gray-600">Ðang t?i thông tin...</p>
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
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-[#1E88E5]">
              {/* Profile Header */}
              <div className="relative bg-linear-to-br from-[#1E88E5] via-[#1565C0] to-[#0D47A1] h-32">
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
                        ??
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {accountInfo?.hanhKhach?.hoVaTen || 'Chua c?p nh?t'}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {accountInfo?.oauth2Provider ? (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
                          ?? {accountInfo.oauth2Provider}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                          Hành khách thu?ng xuyên
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
                    <span className="text-xl">??</span>
                    <div className="text-left flex-1">
                      <p className="font-semibold">Chuy?n bay c?a tôi</p>
                      <p className="text-xs opacity-90">Qu?n lý d?t ch?</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => navigate('/lich-su-giao-dich')}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-linear-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition shadow-md"
                  >
                    <span className="text-xl">??</span>
                    <div className="text-left flex-1">
                      <p className="font-semibold">L?ch s? giao d?ch</p>
                      <p className="text-xs opacity-90">Xem hóa don</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => navigate('/')}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-linear-to-r from-[#1E88E5] to-[#1565C0] text-white rounded-lg hover:from-[#1565C0] hover:to-[#0D47A1] transition shadow-md"
                  >
                    <span className="text-xl">??</span>
                    <div className="text-left flex-1">
                      <p className="font-semibold">Ð?t vé m?i</p>
                      <p className="text-xs opacity-90">Tìm chuy?n bay</p>
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
                        ? 'text-[#1E88E5] bg-white'
                        : 'text-gray-600 hover:text-[#1E88E5] hover:bg-white/50'
                    }`}
                  >
                    Thông tin cá nhân
                    {activeTab === 'personal' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E88E5]"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('account')}
                    className={`px-6 py-4 font-semibold text-sm transition-all relative ${
                      activeTab === 'account'
                        ? 'text-[#1E88E5] bg-white'
                        : 'text-gray-600 hover:text-[#1E88E5] hover:bg-white/50'
                    }`}
                  >
                    Tài kho?n
                    {activeTab === 'account' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E88E5]"></div>
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
                          H? và tên
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
                          Gi?i tính
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
                          S? di?n tho?i
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
                        <strong>Luu ý:</strong> Ð? c?p nh?t thông tin cá nhân, vui lòng liên h? b? ph?n cham sóc khách hàng.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Cài d?t tài kho?n</h3>
                    
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Thông tin dang nh?p</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{accountInfo?.email}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Phuong th?c dang nh?p:</span>
                          <span className="font-medium">
                            {accountInfo?.oauth2Provider || 'Tài kho?n thu?ng'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!accountInfo?.oauth2Provider && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Ð?i m?t kh?u</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              M?t kh?u hi?n t?i
                            </label>
                            <input
                              type="password"
                              name="oldPassword"
                              value={passwordData.oldPassword}
                              onChange={handlePasswordChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:border-transparent"
                              placeholder="Nh?p m?t kh?u hi?n t?i"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              M?t kh?u m?i
                            </label>
                            <input
                              type="password"
                              name="newPassword"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:border-transparent"
                              placeholder="Nh?p m?t kh?u m?i"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Xác nh?n m?t kh?u m?i
                            </label>
                            <input
                              type="password"
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:border-transparent"
                              placeholder="Nh?p l?i m?t kh?u m?i"
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
                            className="w-full bg-[#1E88E5] text-white py-3 rounded-lg hover:bg-[#1565C0] transition font-semibold"
                          >
                            Ð?i m?t kh?u
                          </button>
                        </div>
                      </div>
                    )}

                    {accountInfo?.oauth2Provider && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Luu ý:</strong> Tài kho?n c?a b?n dang nh?p qua {accountInfo.oauth2Provider}, không th? d?i m?t kh?u.
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
