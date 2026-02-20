import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa';
import Footer from '../../components/common/Footer';
import TaiKhoanService from '../../services/TaiKhoanService';
import { getClientUserEmail, getClientAccessToken } from '../../utils/cookieUtils';
import ProfileCard from './CaNhan/ProfileCard';
import PersonalInfoTab from './CaNhan/PersonalInfoTab';
import SecurityTab from './CaNhan/SecurityTab';
import useTitle from '../../hooks/useTitle';

function CaNhan() {
  const navigate = useNavigate();
  useTitle('Trang cá nhân - Airline Booking');
  const [loading, setLoading] = useState(true);
  const [accountInfo, setAccountInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);

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
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [showPassword, setShowPassword] = useState({ old: false, new: false, confirm: false });

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
        console.error('Lỗi khi lấy thông tin tài khoản:', error);
        setLoading(false);
      }
    };

    fetchAccountInfo();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async () => {
    setUpdateError('');
    setUpdateSuccess('');

    // Validate
    if (!formData.hoVaTen || !formData.soDienThoai) {
      setUpdateError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    // Validate phone number
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(formData.soDienThoai)) {
      setUpdateError('Số điện thoại không hợp lệ');
      return;
    }

    try {
      await TaiKhoanService.updateHanhKhach(accountInfo.hanhKhach.maHanhKhach, {
        hoVaTen: formData.hoVaTen,
        gioiTinh: formData.gioiTinh,
        ngaySinh: formData.ngaySinh,
        soDienThoai: formData.soDienThoai,
      });

      setUpdateSuccess('Cập nhật thông tin thành công!');
      setIsEditing(false);

      // Refresh data
      const response = await TaiKhoanService.getTaiKhoanByEmail(formData.email);
      setAccountInfo(response.data);

      setTimeout(() => {
        setUpdateSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin:', error);
      setUpdateError(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    }
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

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(passwordData.newPassword);
    const hasLowerCase = /[a-z]/.test(passwordData.newPassword);
    const hasNumber = /[0-9]/.test(passwordData.newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      setPasswordError('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số');
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

  const toggleShowPassword = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setUpdateError('');
    setUpdateSuccess('');
    // Reset form
    if (accountInfo?.hanhKhach) {
      setFormData({
        hoVaTen: accountInfo.hanhKhach.hoVaTen || '',
        gioiTinh: accountInfo.hanhKhach.gioiTinh || '',
        ngaySinh: accountInfo.hanhKhach.ngaySinh ? accountInfo.hanhKhach.ngaySinh.split('T')[0] : '',
        email: accountInfo.email || '',
        soDienThoai: accountInfo.hanhKhach.soDienThoai || '',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-[#1E88E5] mx-auto mb-6"></div>
          <p className="text-xl font-semibold text-gray-700">Đang tải thông tin...</p>
          <p className="text-gray-500 mt-2">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Left Sidebar - Profile Card */}
          <ProfileCard accountInfo={accountInfo} onNavigate={navigate} />

          {/* Right Content - Settings */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              {/* Tabs Navigation */}
              <div className="border-b border-gray-200 bg-gray-50/80">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('personal')}
                    className={`px-6 py-4 font-semibold text-sm transition-all relative flex items-center gap-2 ${
                      activeTab === 'personal'
                        ? 'text-[#1E88E5] bg-white'
                        : 'text-gray-600 hover:text-[#1E88E5] hover:bg-white/50'
                    }`}
                  >
                    <FaUser className="w-5 h-5" />
                    Thông tin cá nhân
                    {activeTab === 'personal' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E88E5]"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`px-6 py-4 font-semibold text-sm transition-all relative flex items-center gap-2 ${
                      activeTab === 'security'
                        ? 'text-[#1E88E5] bg-white'
                        : 'text-gray-600 hover:text-[#1E88E5] hover:bg-white/50'
                    }`}
                  >
                    <FaLock className="w-5 h-5" />
                    Bảo mật
                    {activeTab === 'security' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E88E5]"></div>
                    )}
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6 sm:p-8">
                {activeTab === 'personal' && (
                  <PersonalInfoTab
                    formData={formData}
                    isEditing={isEditing}
                    updateError={updateError}
                    updateSuccess={updateSuccess}
                    onInputChange={handleInputChange}
                    onEdit={() => setIsEditing(true)}
                    onUpdate={handleUpdateProfile}
                    onCancel={handleCancelEdit}
                  />
                )}

                {activeTab === 'security' && (
                  <SecurityTab
                    accountInfo={accountInfo}
                    passwordData={passwordData}
                    showPassword={showPassword}
                    passwordError={passwordError}
                    passwordSuccess={passwordSuccess}
                    onPasswordChange={handlePasswordChange}
                    onToggleShowPassword={toggleShowPassword}
                    onChangePassword={handleChangePassword}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CaNhan;
