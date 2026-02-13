import React, { useEffect, useState } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaUser, FaKey, FaUserShield } from 'react-icons/fa';
import Card from '../../components/QuanLy/CardChucNang';
import Toast from '../../components/common/Toast';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ViewToggleButton from '../../components/common/ViewToggleButton';
import CardView from '../../components/common/CardView';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import { useViewToggle } from '../../hooks/useViewToggle';
import { getAllTKadmin, updateTKadmin, addTKadmin, deleteTKadmin, getAllVaiTro, assignRolesToAccount } from '../../services/QLTaiKhoanAdminServices';
import TaiKhoanAdminCard from '../../components/QuanLy/QuanLyTKAdmin/TaiKhoanAdminCard';
import AccountForm from '../../components/QuanLy/QuanLyTKAdmin/AccountForm';
import RoleAssignmentModal from '../../components/QuanLy/QuanLyTKAdmin/RoleAssignmentModal';

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
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const { viewMode, setViewMode: handleViewChange } = useViewToggle('ql-tk-admin-view', 'table');

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

  const handleItemsPerPageChange = (e) => {
      const newValue = parseInt(e.target.value);
      setItemsPerPage(newValue);
      setCurrentPage(1); // Reset to first page when changing items per page
  };

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
      if (editAccount) {
        await updateTKadmin(editAccount.maTaiKhoan, accountData);
        showToast('Cập nhật tài khoản thành công!', 'success');
      } else {
        await addTKadmin(accountData);
        showToast('Thêm tài khoản thành công!', 'success');
      }
      fetchAccounts();
      handleFormClose();
    } catch (error) {
      showToast('Lỗi khi lưu tài khoản: ' + (error.response?.data?.message || error.message || 'Lỗi không xác định'), 'error');
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
        <ViewToggleButton
          currentView={viewMode}
          onViewChange={handleViewChange}
          className="shrink-0"
        />
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold w-full md:w-auto"
        >
          <FaPlus />
          <span>Thêm tài khoản</span>
        </button>
      </div>

      {/* Thanh phân trang */}
      {!loading && filteredAccounts.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 font-medium">
              Hiển thị <span className="font-bold text-blue-600">{indexOfFirstItem + 1}</span> đến <span className="font-bold text-blue-600">{Math.min(indexOfLastItem, filteredAccounts.length)}</span> của <span className="font-bold text-blue-600">{filteredAccounts.length}</span> kết quả
            </span>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white"
            >
              <option value={5}>5 / trang</option>
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
            </select>
          </div>
          {totalPages > 1 && (
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
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* View Mode: Card or Table */}
      {!loading && (
        <>
          {viewMode === 'grid' ? (
            /* Card View */
            <CardView
              items={currentItems}
              renderCard={(account, index) => (
                <TaiKhoanAdminCard
                  key={account.maTaiKhoan || index}
                  data={account}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAssignRoles={handleAssignRoles}
                />
              )}
              emptyMessage="Không tìm thấy tài khoản nào."
            />
          ) : (
            /* Table View */
            <ResponsiveTable>
              <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200">
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
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                <FaUser className="text-blue-600" />
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
                                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1"
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
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
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
            </ResponsiveTable>
          )}
        </>
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

export default QuanLyTKAdmin;
