import { useState, useEffect } from 'react';
import { FaUserShield, FaPlus, FaEdit, FaTrash, FaSearch, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import Toast from '../../components/common/Toast';
import ViewToggleButton from '../../components/common/ViewToggleButton';
import CardView from '../../components/common/CardView';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import { useViewToggle } from '../../hooks/useViewToggle';
import VaiTroCard from '../../components/QuanLy/QuanLyVaiTro/VaiTroCard';
import {
    getAllVaiTro,
    createVaiTro,
    updateVaiTro,
    deleteVaiTro
} from '../../services/VaiTroService';

const QuanLyVaiTro = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
    const [formData, setFormData] = useState({
        tenVaiTro: '',
        moTa: '',
        trangThai: true
    });
    const { viewMode, setViewMode: handleViewChange } = useViewToggle('ql-vai-tro-view', 'table');

    // Fetch roles from API
    const fetchRoles = async () => {
        try {
            setLoading(true);
            const response = await getAllVaiTro();
            if (response.success && response.data) {
                // Fetch số admin cho mỗi vai trò
                const rolesWithAdminCount = await Promise.all(
                    response.data.map(async (role) => {
                        try {
                            // Lấy số admin từ API count-admin
                            const countResponse = await fetch(`http://localhost:8080/admin/dashboard/vai-tro/${role.maVaiTro}/count-admin`, {
                                headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('admin_access_token') || document.cookie.match(/admin_access_token=([^;]+)/)?.[1]}`,
                                    'Content-Type': 'application/json'
                                }
                            });
                            const countData = await countResponse.json();
                            return {
                                ...role,
                                soAdmin: countData.data || 0,
                                createdAt: role.createdAt || new Date().toISOString().split('T')[0]
                            };
                        } catch (error) {
                            console.error('Error fetching admin count:', error);
                            return {
                                ...role,
                                soAdmin: 0,
                                createdAt: role.createdAt || new Date().toISOString().split('T')[0]
                            };
                        }
                    })
                );
                setRoles(rolesWithAdminCount);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
            showToast('Lỗi khi tải danh sách vai trò', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    // Statistics
    const stats = {
        total: roles.length,
        active: roles.filter(r => r.trangThai).length,
        inactive: roles.filter(r => !r.trangThai).length,
        totalAdmin: roles.reduce((sum, r) => sum + (r.soAdmin || 0), 0)
    };

    // Filter roles
    const filteredRoles = roles.filter(role =>
        role.tenVaiTro.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (role.moTa && role.moTa.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Toast functions
    const showToast = (message, type = 'success') => {
        setToast({ isVisible: true, message, type });
    };

    const hideToast = () => {
        setToast({ ...toast, isVisible: false });
    };

    // Handle Add/Edit
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation: Tên vai trò không được để trống
        if (!formData.tenVaiTro || formData.tenVaiTro.trim() === '') {
            showToast('Tên vai trò không được để trống', 'error');
            return;
        }

        try {
            setSubmitting(true);

            if (editingRole) {
                // Update existing role
                const response = await updateVaiTro(editingRole.maVaiTro, formData);
                if (response.success) {
                    showToast('Cập nhật vai trò thành công', 'success');
                    await fetchRoles();
                    closeModal();
                } else {
                    showToast(response.message || 'Cập nhật vai trò thất bại', 'error');
                }
            } else {
                // Add new role
                const response = await createVaiTro(formData);
                if (response.success) {
                    showToast('Thêm vai trò thành công', 'success');
                    await fetchRoles();
                    closeModal();
                } else {
                    showToast(response.message || 'Thêm vai trò thất bại', 'error');
                }
            }
        } catch (error) {
            console.error('Error saving role:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi lưu vai trò';
            showToast(errorMessage, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Delete
    const handleDelete = async (role) => {
        // Validation: Không được xóa khi có tài khoản đang sử dụng
        if (role.soAdmin > 0) {
            showToast(`Không thể xóa vai trò này vì đang có ${role.soAdmin} admin được gán!`, 'error');
            return;
        }

        if (window.confirm(`Bạn có chắc chắn muốn xóa vai trò "${role.tenVaiTro}"?`)) {
            try {
                const response = await deleteVaiTro(role.maVaiTro);
                if (response.success) {
                    showToast('Xóa vai trò thành công', 'success');
                    await fetchRoles();
                } else {
                    showToast(response.message || 'Xóa vai trò thất bại', 'error');
                }
            } catch (error) {
                console.error('Error deleting role:', error);
                const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi xóa vai trò';
                showToast(errorMessage, 'error');
            }
        }
    };

    // Open modal for edit
    const openEditModal = (role) => {
        setEditingRole(role);
        setFormData({
            tenVaiTro: role.tenVaiTro,
            moTa: role.moTa || '',
            trangThai: role.trangThai
        });
        setShowModal(true);
    };

    // Open modal for add
    const openAddModal = () => {
        setEditingRole(null);
        setFormData({
            tenVaiTro: '',
            moTa: '',
            trangThai: true  // Trạng thái mặc định là Active
        });
        setShowModal(true);
    };

    // Close modal
    const closeModal = () => {
        setShowModal(false);
        setEditingRole(null);
        setFormData({
            tenVaiTro: '',
            moTa: '',
            trangThai: true
        });
    };

    return (
        <div className="p-6 bg-linear-to-br from-slate-50 to-slate-100 min-h-screen">
            {/* Toast Component */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
                duration={3000}
            />

            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-blue-600 flex items-center gap-3">
                            <FaUserShield className="text-blue-600" />
                            Quản lý Vai trò
                        </h1>
                        <p className="text-slate-600 mt-2">Danh sách vai trò trong hệ thống RBAC</p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="px-6 py-3 bg-linear-to-r from-blue-600 to-blue-600 text-white rounded-xl hover:from-blue-700 hover:to-blue-700 transition-all shadow-lg shadow-blue-600/50 flex items-center gap-2 font-semibold"
                    >
                        <FaPlus /> Thêm vai trò
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-2xl p-5 shadow-lg border border-blue-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Tổng vai trò</p>
                                <p className="text-3xl font-bold text-slate-800 mt-1">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-500 rounded-xl flex items-center justify-center">
                                <FaUserShield className="text-white text-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 shadow-lg border border-emerald-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Đang hoạt động</p>
                                <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.active}</p>
                            </div>
                            <div className="w-12 h-12 bg-linear-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                                <FaCheck className="text-white text-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 shadow-lg border border-red-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Ngưng hoạt động</p>
                                <p className="text-3xl font-bold text-red-600 mt-1">{stats.inactive}</p>
                            </div>
                            <div className="w-12 h-12 bg-linear-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center">
                                <FaTimes className="text-white text-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 shadow-lg border border-blue-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Tổng Admin</p>
                                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalAdmin}</p>
                            </div>
                            <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                <FaUserShield className="text-white text-xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-2xl p-4 shadow-lg mb-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm vai trò..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                            />
                        </div>
                        <ViewToggleButton
                            currentView={viewMode}
                            onViewChange={handleViewChange}
                            className="shrink-0"
                        />
                    </div>
                </div>

                {/* Roles Display */}
                {loading ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 flex items-center justify-center">
                        <FaSpinner className="animate-spin text-blue-600 text-4xl" />
                        <span className="ml-3 text-slate-600">Đang tải...</span>
                    </div>
                ) : viewMode === 'grid' ? (
                    /* Card View */
                    <CardView
                        items={filteredRoles}
                        renderCard={(role, index) => (
                            <VaiTroCard
                                key={role.maVaiTro || index}
                                data={role}
                                onView={openEditModal}
                                onEdit={openEditModal}
                                onDelete={handleDelete}
                            />
                        )}
                        emptyMessage="Không tìm thấy vai trò nào."
                    />
                ) : (
                    /* Table View */
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-linear-to-r from-slate-700 to-slate-800 text-white">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-white font-bold">Mã vai trò</th>
                                        <th className="px-6 py-4 text-left text-white font-bold">Tên vai trò</th>
                                        <th className="px-6 py-4 text-left text-white font-bold">Mô tả</th>
                                        <th className="px-6 py-4 text-center text-white font-bold">Trạng thái</th>
                                        <th className="px-6 py-4 text-center text-white font-bold">Số Admin</th>
                                        <th className="px-6 py-4 text-center text-white font-bold">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRoles.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                                Không tìm thấy vai trò nào
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRoles.map((role, index) => (
                                            <tr key={role.maVaiTro} className={`border-b border-slate-200 hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                                                <td className="px-6 py-4 font-semibold text-blue-600">#{role.maVaiTro}</td>
                                                <td className="px-6 py-4 font-semibold text-slate-800">{role.tenVaiTro}</td>
                                                <td className="px-6 py-4 text-slate-600">{role.moTa || '-'}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                                        role.trangThai
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {role.trangThai ? 'Hoạt động' : 'Ngừng'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                                        {role.soAdmin || 0} admin
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => openEditModal(role)}
                                                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                                            title="Sửa"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(role)}
                                                            className={`p-2 rounded-lg transition-colors ${
                                                                (role.soAdmin || 0) > 0
                                                                    ? 'text-slate-400 cursor-not-allowed'
                                                                    : 'text-red-600 hover:bg-red-100'
                                                            }`}
                                                            title={(role.soAdmin || 0) > 0 ? 'Không thể xóa' : 'Xóa'}
                                                            disabled={(role.soAdmin || 0) > 0}
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Add/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                            <div className="bg-linear-to-r from-blue-600 to-blue-600 px-6 py-4 rounded-t-2xl">
                                <h2 className="text-2xl font-bold text-white">
                                    {editingRole ? 'Cập nhật vai trò' : 'Thêm vai trò mới'}
                                </h2>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-slate-700 font-semibold mb-2">
                                            Tên vai trò <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.tenVaiTro}
                                            onChange={(e) => setFormData({...formData, tenVaiTro: e.target.value})}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                            placeholder="VD: Super Admin"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-700 font-semibold mb-2">
                                            Mô tả
                                        </label>
                                        <textarea
                                            value={formData.moTa}
                                            onChange={(e) => setFormData({...formData, moTa: e.target.value})}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
                                            rows="3"
                                            placeholder="Mô tả về vai trò này..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-700 font-semibold mb-2">
                                            Trạng thái
                                        </label>
                                        <select
                                            value={formData.trangThai.toString()}
                                            onChange={(e) => setFormData({...formData, trangThai: e.target.value === 'true'})}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                        >
                                            <option value="true">Hoạt động</option>
                                            <option value="false">Ngừng hoạt động</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 px-6 py-3 bg-linear-to-r from-blue-600 to-blue-600 text-white rounded-xl hover:from-blue-700 hover:to-blue-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <FaSpinner className="animate-spin" />
                                                Đang lưu...
                                            </>
                                        ) : (
                                            editingRole ? 'Cập nhật' : 'Thêm mới'
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={submitting}
                                        className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuanLyVaiTro;
