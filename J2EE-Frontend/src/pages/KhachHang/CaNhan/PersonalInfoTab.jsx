import { FaUser, FaIdCard, FaCalendar, FaEnvelope, FaPhone, FaEdit, FaCheck, FaTimes, FaInfoCircle } from 'react-icons/fa';

function PersonalInfoTab({
  formData,
  isEditing,
  updateError,
  updateSuccess,
  onInputChange,
  onEdit,
  onUpdate,
  onCancel
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h3>
          <p className="text-gray-600 mt-1">Cập nhật thông tin hồ sơ của bạn</p>
        </div>
        {!isEditing && (
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-[#1E88E5] text-white rounded-lg hover:bg-[#1565C0] transition font-medium flex items-center gap-2"
          >
            <FaEdit />
            Chỉnh sửa
          </button>
        )}
      </div>

      {updateError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <span className="text-red-600 text-xl"><FaTimes /></span>
          <p className="text-sm text-red-800">{updateError}</p>
        </div>
      )}

      {updateSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <span className="text-green-600 text-xl"><FaCheck /></span>
          <p className="text-sm text-green-800">{updateSuccess}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <FaUser className="w-4 h-4 text-gray-500" />
            Họ và tên
          </label>
          <input
            type="text"
            name="hoVaTen"
            value={formData.hoVaTen}
            onChange={onInputChange}
            disabled={!isEditing}
            className={`w-full px-4 py-3 border rounded-lg transition focus:ring-2 focus:ring-[#1E88E5] focus:border-transparent ${
              isEditing
                ? 'border-gray-300 bg-white'
                : 'border-gray-200 bg-gray-50 text-gray-600'
            }`}
            placeholder="Nhập họ và tên"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <FaIdCard className="w-4 h-4 text-gray-500" />
            Giới tính
          </label>
          <select
            name="gioiTinh"
            value={formData.gioiTinh}
            onChange={onInputChange}
            disabled={!isEditing}
            className={`w-full px-4 py-3 border rounded-lg transition focus:ring-2 focus:ring-[#1E88E5] focus:border-transparent ${
              isEditing
                ? 'border-gray-300 bg-white'
                : 'border-gray-200 bg-gray-50 text-gray-600'
            }`}
          >
            <option value="">Chọn giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <FaCalendar className="w-4 h-4 text-gray-500" />
            Ngày sinh
          </label>
          <input
            type="date"
            name="ngaySinh"
            value={formData.ngaySinh}
            onChange={onInputChange}
            disabled={!isEditing}
            className={`w-full px-4 py-3 border rounded-lg transition focus:ring-2 focus:ring-[#1E88E5] focus:border-transparent ${
              isEditing
                ? 'border-gray-300 bg-white'
                : 'border-gray-200 bg-gray-50 text-gray-600'
            }`}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <FaEnvelope className="w-4 h-4 text-gray-500" />
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <FaPhone className="w-4 h-4 text-gray-500" />
            Số điện thoại
          </label>
          <input
            type="tel"
            name="soDienThoai"
            value={formData.soDienThoai}
            onChange={onInputChange}
            disabled={!isEditing}
            className={`w-full px-4 py-3 border rounded-lg transition focus:ring-2 focus:ring-[#1E88E5] focus:border-transparent ${
              isEditing
                ? 'border-gray-300 bg-white'
                : 'border-gray-200 bg-gray-50 text-gray-600'
            }`}
            placeholder="Nhập số điện thoại"
          />
        </div>
      </div>

      {isEditing && (
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={onUpdate}
            className="px-6 py-2.5 bg-[#1E88E5] text-white rounded-lg hover:bg-[#1565C0] transition font-medium flex items-center gap-2"
          >
            <FaCheck />
            Lưu thay đổi
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium flex items-center gap-2"
          >
            <FaTimes />
            Hủy bỏ
          </button>
        </div>
      )}

      {!isEditing && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <span className="text-blue-600 text-xl"><FaInfoCircle /></span>
          <div>
            <p className="text-sm text-blue-800 font-medium">Lưu ý</p>
            <p className="text-sm text-blue-700 mt-1">Nhấn nút "Chỉnh sửa" để cập nhật thông tin cá nhân của bạn.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PersonalInfoTab;
