import React, { useEffect, useState } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaUser, FaTimes, FaUserShield, FaKey } from 'react-icons/fa';
import Card from '../../components/QuanLy/CardChucNang';
import Toast from '../../components/common/Toast';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { getAllTKadmin, updateTKadmin, addTKadmin, deleteTKadmin, getAllVaiTro, assignRolesToAccount } from '../../services/QLTaiKhoanAdminServices';

const QuanLyTKAdmin = () => {
  const [accounts, setAccounts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [editAccount, setEditAccount] = useState(null);
  const [selectedAccountForRole, setSelectedAccountForRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const itemsPerPage = 5;

  useEffect(() => {
    fetchData();
  }, []);

  // Toast functions
  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, isVisible: false });
  };

  const fetchData = async () => {
    await Promise.all([fetchAccounts(), fetchRoles()]);
  };

  const fetchRoles = async () => {
    try {
      const res = await getAllVaiTro();
      const rolesData = Array.isArray(res.data) ? res.data : [];
      setRoles(rolesData);
    } catch (err) {
      console.error('Error fetching roles:', err);
      showToast('Lỗi khi tải danh sách vai trò: ' + (err.response?.data?.message || err.message), 'error');
      setRoles([]);
    }
  };

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await getAllTKadmin();

      // Dữ liệu từ API đã có sẵn tenVaiTro
      const accountsData = Array.isArray(res.data) ? res.data : [];
      setAccounts(accountsData);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      showToast('Lỗi khi tải danh sách tài khoản: ' + (err.response?.data?.message || err.message), 'error');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredAccounts = Array.isArray(accounts) ? accounts.filter(
    acc =>
      acc.tenDangNhap?.toLowerCase().includes(search.toLowerCase()) ||
      acc.email?.toLowerCase().includes(search.toLowerCase()) ||
      acc.hoVaTen?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAccounts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleAdd = () => {
    setEditAccount(null);
    setShowForm(true);
  };

  const handleEdit = (account) => {
    setEditAccount(account);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditAccount(null);
  };

  const handleAssignRoles = (account) => {
    setSelectedAccountForRole(account);
    setShowRoleModal(true);
  };

  const handleRoleModalClose = () => {
    setShowRoleModal(false);
    setSelectedAccountForRole(null);
  };

  const handleSaveRoles = async (selectedRoleIds) => {
    try {
      await assignRolesToAccount(selectedAccountForRole.maTaiKhoan, selectedRoleIds);
      showToast('Gán vai trò thành công!', 'success');
      fetchAccounts();
      handleRoleModalClose();
    } catch (error) {
      console.error('Lỗi khi gán vai trò:', error);
      const message = error.response?.data?.message || error.message || 'Lỗi không xác định';
      showToast('Lỗi khi gán vai trò: ' + message, 'error');
    }
  };

  const handleSave = async (accountData) => {
    try {
      console.log('=== HANDLE SAVE CALLED ===');
      console.log('editAccount:', editAccount);
      console.log('accountData:', accountData);

      if (editAccount) {
        console.log('>>> UPDATING EXISTING ACCOUNT');
        console.log('Account ID:', editAccount.maTaiKhoan);
        await updateTKadmin(editAccount.maTaiKhoan, accountData);
        showToast('Cập nhật tài khoản thành công!', 'success');
      } else {
        console.log('>>> CREATING NEW ACCOUNT');
        await addTKadmin(accountData);
        showToast('Thêm tài khoản thành công!', 'success');
      }
      fetchAccounts();
      handleFormClose();
    } catch (error) {
      console.error('Lỗi khi lưu tài khoản:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  };

  const handleDelete = (account) => {
    setAccountToDelete(account);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteTKadmin(accountToDelete.maTaiKhoan);
      showToast('Xóa tài khoản thành công!', 'success');
      fetchAccounts();
      setShowDeleteConfirm(false);
      setAccountToDelete(null);
    } catch (error) {
      console.error('Lỗi khi xóa tài khoản:', error);
      showToast('Lỗi khi xóa tài khoản!', 'error');
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setAccountToDelete(null);
  };

  return (
    <Card title="Quản lý tài khoản Admin">
      {/* Thanh công cụ */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, tên đăng nhập..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
          <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold w-full md:w-auto"
        >
          <FaPlus />
          <span>Thêm tài khoản</span>
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Bảng dữ liệu */}
      {!loading && (
        <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">ID</th>
                  <th className="px-6 py-4 text-left font-semibold">Họ và tên</th>
                  <th className="px-6 py-4 text-left font-semibold">Tên đăng nhập</th>
                  <th className="px-6 py-4 text-left font-semibold">Email</th>
                  <th className="px-6 py-4 text-left font-semibold">Vai trò</th>
                  <th className="px-6 py-4 text-center font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((acc, index) => (
                    <tr key={acc.maTaiKhoan} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                      <td className="px-6 py-4 font-bold text-blue-600">#{acc.maTaiKhoan}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <FaUser className="text-purple-600" />
                          </div>
                          <span className="font-medium text-gray-900">{acc.hoVaTen}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          {acc.tenDangNhap}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{acc.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {acc.tenVaiTro && acc.tenVaiTro.length > 0 ? (
                            acc.tenVaiTro.map((role, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-semibold flex items-center gap-1"
                              >
                                <FaUserShield size={10} />
                                {role}
                              </span>
                            ))
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                              Chưa gán
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(acc)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleAssignRoles(acc)}
                            className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                            title="Gán vai trò"
                          >
                            <FaKey size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(acc)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <FaUser className="text-gray-300 text-5xl" />
                        <p className="text-gray-500 font-medium">Không tìm thấy tài khoản nào.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Thanh phân trang */}
      {!loading && filteredAccounts.length > itemsPerPage && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <span className="text-sm text-gray-600 font-medium">
            Hiển thị <span className="font-bold text-blue-600">{indexOfFirstItem + 1}</span> đến <span className="font-bold text-blue-600">{Math.min(indexOfLastItem, filteredAccounts.length)}</span> của <span className="font-bold text-blue-600">{filteredAccounts.length}</span> kết quả
          </span>
          <nav>
            <ul className="flex gap-2">
              <li>
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-sm"
                >
                  ← Trước
                </button>
              </li>
              {[...Array(totalPages)].map((_, index) => (
                <li key={index}>
                  <button
                    onClick={() => paginate(index + 1)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === index + 1
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-sm"
                >
                  Sau →
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <AccountForm
          account={editAccount}
          roles={roles}
          onClose={handleFormClose}
          onSave={handleSave}
        />
      )}

      {/* Modal Gán Vai Trò */}
      {showRoleModal && (
        <RoleAssignmentModal
          account={selectedAccountForRole}
          roles={roles}
          onClose={handleRoleModalClose}
          onSave={handleSaveRoles}
        />
      )}

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isVisible={showDeleteConfirm}
        title="Xác nhận xóa"
        type="danger"
        message={`Bạn có chắc chắn muốn xóa tài khoản admin "${accountToDelete?.hoVaTen}" (${accountToDelete?.tenDangNhap})?`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        showIcon={true}
      />
    </Card>
  );
};

// Account Form Component
const AccountForm = ({ account, roles = [], onClose, onSave }) => {
  const [formData, setFormData] = useState({
    tenDangNhap: '',
    hoVaTen: '',
    email: '',
    matKhauBam: '',
    vaiTro: [], // Mảng chứa các maVaiTro
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    matKhauBam: ''
  });

  useEffect(() => {
    if (account) {
      setFormData({
        hoVaTen: account.hoVaTen || '',
        tenDangNhap: account.tenDangNhap || '',
        email: account.email || '',
        matKhauBam: '', // Không điền mật khẩu khi sửa
        vaiTro: account.vaiTro || [],
      });
    } else {
      setFormData({ tenDangNhap: '', hoVaTen: '', email: '', matKhauBam: '', vaiTro: [] });
    }
    setErrorMessage('');
    setFieldErrors({ email: '', matKhauBam: '' });
  }, [account]);

  const validateEmail = (email) => {
    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // Mật khẩu phải bắt đầu bằng chữ in hoa, có ít nhất 6 ký tự và chứa ký tự đặc biệt
    const passwordRegex = /^[A-Z](?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{5,}$/;
    return passwordRegex.test(password);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrorMessage('');

    // Real-time validation
    if (name === 'email') {
      if (value && !validateEmail(value)) {
        setFieldErrors(prev => ({ ...prev, email: 'Email không đúng định dạng (ví dụ: user@example.com)' }));
      } else {
        setFieldErrors(prev => ({ ...prev, email: '' }));
      }
    } else if (name === 'matKhauBam') {
      if (value && !validatePassword(value)) {
        setFieldErrors(prev => ({
          ...prev,
          matKhauBam: 'Mật khẩu phải bắt đầu bằng chữ in hoa, có ít nhất 6 ký tự và chứa ký tự đặc biệt'
        }));
      } else {
        setFieldErrors(prev => ({ ...prev, matKhauBam: '' }));
      }
    }
  };

  // Xử lý chọn/bỏ chọn vai trò
  const handleRoleToggle = (maVaiTro) => {
    setFormData(prev => {
      const newRoles = prev.vaiTro.includes(maVaiTro)
        ? prev.vaiTro.filter(id => id !== maVaiTro)
        : [...prev.vaiTro, maVaiTro];
      return { ...prev, vaiTro: newRoles };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate các trường bắt buộc
    if (!formData.tenDangNhap || !formData.hoVaTen || !formData.email) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    // Khi thêm mới, mật khẩu là bắt buộc
    if (!account && !formData.matKhauBam) {
      setErrorMessage('Vui lòng nhập mật khẩu!');
      return;
    }

    // Validate email
    if (!validateEmail(formData.email)) {
      setErrorMessage('Email không đúng định dạng (ví dụ: user@example.com)');
      return;
    }

    // Validate mật khẩu khi có nhập
    if (formData.matKhauBam && !validatePassword(formData.matKhauBam)) {
      setErrorMessage('Mật khẩu phải bắt đầu bằng chữ in hoa, có ít nhất 6 ký tự và chứa ký tự đặc biệt');
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Lỗi không xác định';
      setErrorMessage(message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{account ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
              <FaTimes size={24} />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Tên đăng nhập <span className="text-red-500">*</span>
                </label>
                <input
                  name="tenDangNhap"
                  value={formData.tenDangNhap}
                  onChange={handleChange}
                  disabled={!!account} // Disabled khi sửa tài khoản
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 shadow-sm ${
                    account
                      ? 'bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                  }`}
                  placeholder="Nhập tên đăng nhập"
                  required
                />
                {account && (
                  <p className="text-xs text-gray-500 mt-1">⚠️ Tên đăng nhập không thể thay đổi</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  name="hoVaTen"
                  value={formData.hoVaTen}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 shadow-sm ${
                    fieldErrors.email
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                  }`}
                  placeholder="Nhập email (ví dụ: user@example.com)"
                  required
                />
                {fieldErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Mật khẩu {!account && <span className="text-red-500">*</span>}
                </label>
                <input
                  name="matKhauBam"
                  type="password"
                  value={formData.matKhauBam}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 shadow-sm ${
                    fieldErrors.matKhauBam
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                  }`}
                  placeholder={account ? "Để trống nếu không muốn đổi mật khẩu" : "Nhập mật khẩu"}
                  required={!account}
                />
                {fieldErrors.matKhauBam && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.matKhauBam}</p>
                )}
                {!fieldErrors.matKhauBam && (
                  <p className="text-gray-500 text-xs mt-1">
                    ℹ️ Bắt đầu bằng chữ in hoa, ít nhất 6 ký tự, có ký tự đặc biệt
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Vai trò <span className="text-red-500">*</span>
              </label>
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-48 overflow-y-auto">
                {roles.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">Đang tải danh sách vai trò...</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {roles.map(role => (
                      <label
                        key={role.maVaiTro}
                        className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.vaiTro.includes(role.maVaiTro)}
                          onChange={() => handleRoleToggle(role.maVaiTro)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex items-center gap-2">
                          <FaUserShield className="text-violet-600" />
                          <span className="font-medium text-gray-700">{role.tenVaiTro}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {formData.vaiTro.length === 0 && (
                <p className="text-red-500 text-sm mt-1">Vui lòng chọn ít nhất một vai trò!</p>
              )}
              {formData.vaiTro.length > 0 && (
                <p className="text-green-600 text-sm mt-1">
                  Đã chọn {formData.vaiTro.length} vai trò
                </p>
              )}
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold transition-all shadow-lg"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Role Assignment Modal Component
const RoleAssignmentModal = ({ account, roles = [], onClose, onSave }) => {
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (account && account.vaiTro) {
      setSelectedRoles(account.vaiTro || []);
    } else {
      setSelectedRoles([]);
    }
    setErrorMessage('');
  }, [account]);

  const handleRoleToggle = (maVaiTro) => {
    setSelectedRoles(prev => {
      const newRoles = prev.includes(maVaiTro)
        ? prev.filter(id => id !== maVaiTro)
        : [...prev, maVaiTro];
      return newRoles;
    });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedRoles.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất một vai trò!');
      return;
    }
    try {
      await onSave(selectedRoles);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Lỗi không xác định';
      setErrorMessage(message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-xl sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Gán vai trò</h2>
              <p className="text-purple-100 mt-1">
                Tài khoản: <span className="font-semibold">{account?.hoVaTen}</span> ({account?.tenDangNhap})
              </p>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
              <FaTimes size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Danh sách vai trò <span className="text-red-500">*</span>
              </label>
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-80 overflow-y-auto">
                {roles.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">Đang tải danh sách vai trò...</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {roles.map(role => (
                      <label
                        key={role.maVaiTro}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                          selectedRoles.includes(role.maVaiTro)
                            ? 'bg-purple-100 border-2 border-purple-500'
                            : 'hover:bg-white border-2 border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(role.maVaiTro)}
                          onChange={() => handleRoleToggle(role.maVaiTro)}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                        />
                        <div className="flex items-center gap-2">
                          <FaUserShield className={`${selectedRoles.includes(role.maVaiTro) ? 'text-purple-600' : 'text-gray-500'}`} />
                          <span className={`font-medium ${selectedRoles.includes(role.maVaiTro) ? 'text-purple-900' : 'text-gray-700'}`}>
                            {role.tenVaiTro}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {selectedRoles.length === 0 && (
                <p className="text-red-500 text-sm mt-2">Vui lòng chọn ít nhất một vai trò!</p>
              )}
              {selectedRoles.length > 0 && (
                <p className="text-green-600 text-sm mt-2 font-medium">
                  Đã chọn {selectedRoles.length} vai trò
                </p>
              )}
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 font-semibold transition-all shadow-lg"
            >
              Lưu vai trò
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuanLyTKAdmin;