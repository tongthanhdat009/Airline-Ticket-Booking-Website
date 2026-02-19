import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCheck, FaTimes, FaInfoCircle, FaShieldAlt } from 'react-icons/fa';

function SecurityTab({
  accountInfo,
  passwordData,
  showPassword,
  passwordError,
  passwordSuccess,
  onPasswordChange,
  onToggleShowPassword,
  onChangePassword
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Bảo mật tài khoản</h3>
        <p className="text-gray-600 mt-1">Quản lý mật khẩu và cài đặt bảo mật</p>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaEnvelope className="w-5 h-5 text-gray-600" />
          Thông tin đăng nhập
        </h4>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium text-gray-900">{accountInfo?.email}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-gray-600">Phương thức đăng nhập:</span>
            <span className={`font-medium ${
              accountInfo?.oauth2Provider
                ? 'text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm'
                : 'text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm'
            }`}>
              {accountInfo?.oauth2Provider || 'Tài khoản thường'}
            </span>
          </div>
        </div>
      </div>

      {!accountInfo?.oauth2Provider && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FaLock className="w-5 h-5 text-gray-600" />
            Đổi mật khẩu
          </h4>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <input
                  type={showPassword.old ? 'text' : 'password'}
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={onPasswordChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:border-transparent"
                  placeholder="Nhập mật khẩu hiện tại"
                />
                <button
                  type="button"
                  onClick={() => onToggleShowPassword('old')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword.old ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showPassword.new ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={onPasswordChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:border-transparent"
                  placeholder="Nhập mật khẩu mới"
                />
                <button
                  type="button"
                  onClick={() => onToggleShowPassword('new')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword.new ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
              {passwordData.newPassword && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500">Mật khẩu phải có:</p>
                  <ul className="text-xs space-y-1">
                    <li className={`flex items-center gap-1 ${passwordData.newPassword.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                      <span>{passwordData.newPassword.length >= 6 ? <FaCheck /> : <FaTimes />}</span>
                      Ít nhất 6 ký tự
                    </li>
                    <li className={`flex items-center gap-1 ${/[A-Z]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                      <span>{/[A-Z]/.test(passwordData.newPassword) ? <FaCheck /> : <FaTimes />}</span>
                      1 chữ hoa
                    </li>
                    <li className={`flex items-center gap-1 ${/[a-z]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                      <span>{/[a-z]/.test(passwordData.newPassword) ? <FaCheck /> : <FaTimes />}</span>
                      1 chữ thường
                    </li>
                    <li className={`flex items-center gap-1 ${/[0-9]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                      <span>{/[0-9]/.test(passwordData.newPassword) ? <FaCheck /> : <FaTimes />}</span>
                      1 số
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showPassword.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={onPasswordChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E88E5] focus:border-transparent"
                  placeholder="Nhập lại mật khẩu mới"
                />
                <button
                  type="button"
                  onClick={() => onToggleShowPassword('confirm')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword.confirm ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
              {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">Mật khẩu không khớp</p>
              )}
            </div>

            {passwordError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <span className="text-red-600 text-xl"><FaTimes /></span>
                <p className="text-sm text-red-800">{passwordError}</p>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <span className="text-green-600 text-xl"><FaCheck /></span>
                <p className="text-sm text-green-800">{passwordSuccess}</p>
              </div>
            )}

            <button
              onClick={onChangePassword}
              disabled={!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword || passwordData.newPassword !== passwordData.confirmPassword}
              className="w-full bg-[#1E88E5] text-white py-3 rounded-lg hover:bg-[#1565C0] transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FaLock />
              Đổi mật khẩu
            </button>
          </div>
        </div>
      )}

      {accountInfo?.oauth2Provider && (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-4">
          <span className="text-yellow-600 text-2xl"><FaInfoCircle /></span>
          <div>
            <p className="text-sm text-yellow-800 font-medium">Tài khoản mạng xã hội</p>
            <p className="text-sm text-yellow-700 mt-1">
              Tài khoản của bạn đang đăng nhập qua <strong>{accountInfo.oauth2Provider}</strong>.
              Không thể đổi mật khẩu cho tài khoản này.
            </p>
          </div>
        </div>
      )}

      {/* Security Tips */}
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <FaShieldAlt />
          Mẹo bảo mật
        </h4>
        <ul className="text-sm text-blue-800 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5"><FaCheck /></span>
            Sử dụng mật khẩu mạnh, duy nhất cho tài khoản này
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5"><FaCheck /></span>
            Không chia sẻ mật khẩu với người khác
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5"><FaCheck /></span>
            Đăng xuất sau khi sử dụng xong trên thiết bị chung
          </li>
        </ul>
      </div>
    </div>
  );
}

export default SecurityTab;
