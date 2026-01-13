import React, { useEffect, useState } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaUser, FaTimes, FaUserShield } from 'react-icons/fa';
import Card from '../../components/QuanLy/CardChucNang';
import { getAllTKadmin, updateTKadmin, addTKadmin, deleteTKadmin } from '../../services/QLTaiKhoanAdminServices';

// Hard code danh sách vai trò
const ROLES_DATA = [
  { maVaiTro: 1, tenVaiTro: 'Super Admin' },
  { maVaiTro: 2, tenVaiTro: 'Nhân viên bán vé' },
  { maVaiTro: 3, tenVaiTro: 'Kế toán' },
  { maVaiTro: 4, tenVaiTro: 'Quản lý vận hành' },
  { maVaiTro: 5, tenVaiTro: 'Chăm sóc khách hàng' },
  { maVaiTro: 6, tenVaiTro: 'Báo cáo viên' }
];

// Hard code dữ liệu account với vai trò
const ACCOUNTS_WITH_ROLES = [
  {
    maTaiKhoan: 1,
    tenDangNhap: 'admin',
    hoVaTen: 'Nguyễn Văn Admin',
    email: 'admin@airline.com',
    vaiTro: [1, 2],
    tenVaiTro: ['Super Admin', 'Nhân viên bán vé']
  },
  {
    maTaiKhoan: 2,
    tenDangNhap: 'staff01',
    hoVaTen: 'Trần Thị Staff',
    email: 'staff01@airline.com',
    vaiTro: [2],
    tenVaiTro: ['Nhân viên bán vé']
  },
  {
    maTaiKhoan: 3,
    tenDangNhap: 'accountant',
    hoVaTen: 'Lê Văn KeToan',
    email: 'accountant@airline.com',
    vaiTro: [3],
    tenVaiTro: ['Kế toán']
  },
  {
    maTaiKhoan: 4,
    tenDangNhap: 'ops_manager',
    hoVaTen: 'Phạm Thị Ops',
    email: 'ops@airline.com',
    vaiTro: [4],
    tenVaiTro: ['Quản lý vận hành']
  },
  {
    maTaiKhoan: 5,
    tenDangNhap: 'cs_agent',
    hoVaTen: 'Hoàng Văn CS',
    email: 'cs@airline.com',
    vaiTro: [5],
    tenVaiTro: ['Chăm sóc khách hàng']
  }
];

const QuanLyTKAdmin = () => {
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editAccount, setEditAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      // Sử dụng hard code data thay vì API
      setAccounts(ACCOUNTS_WITH_ROLES);
      // Nếu muốn dùng API, uncomment dòng dưới:
      // const res = await getAllTKadmin();
      // setAccounts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching accounts:', err);
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

  const handleSave = async (accountData) => {
    try {
      console.log('Dữ liệu gửi:', accountData);
      if (editAccount) {
        await updateTKadmin(editAccount.maTaiKhoan, accountData);
        alert('Cập nhật tài khoản thành công!');
      } else {
        await addTKadmin(accountData);
        alert('Thêm tài khoản thành công!');
      }
      fetchAccounts();
      handleFormClose();
    } catch (error) {
      console.error('Lỗi khi lưu tài khoản:', error);
      throw error;
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      try {
        await deleteTKadmin(id);
        alert('Xóa tài khoản thành công!');
        fetchAccounts();
      } catch (error) {
        console.error('Lỗi khi xóa tài khoản:', error);
        alert('Lỗi khi xóa tài khoản!');
      }
    }
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
                            onClick={() => handleDelete(acc.maTaiKhoan)}
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
          onClose={handleFormClose}
          onSave={handleSave}
        />
      )}
    </Card>
  );
};

// Account Form Component
const AccountForm = ({ account, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    tenDangNhap: '',
    hoVaTen: '',
    email: '',
    matKhauBam: '',
    vaiTro: [], // Mảng chứa các maVaiTro
  });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (account) {
      setFormData({
        hoVaTen: account.hoVaTen || '',
        tenDangNhap: account.tenDangNhap || '',
        email: account.email || '',
        matKhauBam: account.matKhauBam ? account.matKhauBam.substring(0, 6) : '',
        vaiTro: account.vaiTro || [],
      });
    } else {
      setFormData({ tenDangNhap: '', hoVaTen: '', email: '', matKhauBam: '', vaiTro: [] });
    }
    setErrorMessage('');
  }, [account]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrorMessage('');
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
    if (!formData.tenDangNhap || !formData.hoVaTen || !formData.email || !formData.matKhauBam) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin!');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{account ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
              <FaTimes size={24} />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tên đăng nhập <span className="text-red-500">*</span>
              </label>
              <input
                name="tenDangNhap"
                value={formData.tenDangNhap}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                placeholder="Nhập tên đăng nhập"
                required
              />
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

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                placeholder="Nhập email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Vai trò <span className="text-red-500">*</span>
              </label>
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-1 gap-2">
                  {ROLES_DATA.map(role => (
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

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                name="matKhauBam"
                type="password"
                value={formData.matKhauBam}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                placeholder="Nhập mật khẩu"
                required
              />
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

export default QuanLyTKAdmin;