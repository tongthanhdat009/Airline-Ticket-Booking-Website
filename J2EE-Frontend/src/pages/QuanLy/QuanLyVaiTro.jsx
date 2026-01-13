import React, { useState } from 'react';
import { FaUserShield, FaPlus, FaEdit, FaTrash, FaSearch, FaCheck, FaTimes } from 'react-icons/fa';

const QuanLyVaiTro = () => {
    // Hard code data theo schema
    const [roles, setRoles] = useState([
        {
            maVaiTro: 1,
            tenVaiTro: 'Super Admin',
            moTa: 'Quản trị viên hệ thống - Full quyền',
            trangThai: true,
            soAdmin: 2,
            createdAt: '2024-01-01'
        },
        {
            maVaiTro: 2,
            tenVaiTro: 'Nhân viên bán vé',
            moTa: 'Nhân viên trực tiếp bán vé và xử lý đặt chỗ',
            trangThai: true,
            soAdmin: 5,
            createdAt: '2024-01-15'
        },
        {
            maVaiTro: 3,
            tenVaiTro: 'Kế toán',
            moTa: 'Quản lý hóa đơn, thanh toán, hoàn tiền',
            trangThai: true,
            soAdmin: 3,
            createdAt: '2024-02-01'
        },
        {
            maVaiTro: 4,
            tenVaiTro: 'Quản lý vận hành',
            moTa: 'Quản lý chuyến bay, tuyến bay, máy bay',
            trangThai: true,
            soAdmin: 4,
            createdAt: '2024-02-15'
        },
        {
            maVaiTro: 5,
            tenVaiTro: 'Chăm sóc khách hàng',
            moTa: 'Xử lý khiếu nại, hỗ trợ khách hàng',
            trangThai: true,
            soAdmin: 6,
            createdAt: '2024-03-01'
        },
        {
            maVaiTro: 6,
            tenVaiTro: 'Báo cáo viên',
            moTa: 'Chỉ xem báo cáo, thống kê',
            trangThai: false,
            soAdmin: 0,
            createdAt: '2024-03-15'
        }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [formData, setFormData] = useState({
        tenVaiTro: '',
        moTa: '',
        trangThai: true
    });

    // Statistics
    const stats = {
        total: roles.length,
        active: roles.filter(r => r.trangThai).length,
        inactive: roles.filter(r => !r.trangThai).length,
        totalAdmin: roles.reduce((sum, r) => sum + r.soAdmin, 0)
    };

    // Filter roles
    const filteredRoles = roles.filter(role =>
        role.tenVaiTro.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.moTa.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle Add/Edit
    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingRole) {
            // Update existing role
            setRoles(roles.map(role =>
                role.maVaiTro === editingRole.maVaiTro
                    ? { ...role, ...formData }
                    : role
            ));
        } else {
            // Add new role
            const newRole = {
                maVaiTro: Math.max(...roles.map(r => r.maVaiTro)) + 1,
                ...formData,
                soAdmin: 0,
                createdAt: new Date().toISOString().split('T')[0]
            };
            setRoles([...roles, newRole]);
        }

        closeModal();
    };

    // Handle Delete
    const handleDelete = (role) => {
        if (role.soAdmin > 0) {
            alert('Không thể xóa vai trò này vì đang có ' + role.soAdmin + ' admin được gán!');
            return;
        }

        if (window.confirm(`Bạn có chắc chắn muốn xóa vai trò "${role.tenVaiTro}"?`)) {
            setRoles(roles.filter(r => r.maVaiTro !== role.maVaiTro));
        }
    };

    // Open modal for edit
    const openEditModal = (role) => {
        setEditingRole(role);
        setFormData({
            tenVaiTro: role.tenVaiTro,
            moTa: role.moTa,
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
            trangThai: true
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
        <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 flex items-center gap-3">
                            <FaUserShield className="text-violet-600" />
                            Quản lý Vai trò
                        </h1>
                        <p className="text-slate-600 mt-2">Danh sách vai trò trong hệ thống RBAC</p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-600/50 flex items-center gap-2 font-semibold"
                    >
                        <FaPlus /> Thêm vai trò
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-2xl p-5 shadow-lg border border-violet-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Tổng vai trò</p>
                                <p className="text-3xl font-bold text-slate-800 mt-1">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
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
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
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
                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center">
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
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                <FaUserShield className="text-white text-xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-2xl p-4 shadow-lg mb-6">
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm vai trò..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-violet-500 focus:outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* Roles Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-violet-600 to-purple-600">
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
                                {filteredRoles.map((role, index) => (
                                    <tr key={role.maVaiTro} className={`border-b border-slate-200 hover:bg-violet-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                                        <td className="px-6 py-4 font-semibold text-violet-600">#{role.maVaiTro}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-800">{role.tenVaiTro}</td>
                                        <td className="px-6 py-4 text-slate-600">{role.moTa}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                                role.trangThai
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}>
                                                {role.trangThai ? 'Hoạt động' : 'Ngừng'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                                {role.soAdmin} admin
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(role)}
                                                    className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                                                    title="Sửa"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(role)}
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        role.soAdmin > 0
                                                            ? 'text-slate-400 cursor-not-allowed'
                                                            : 'text-red-600 hover:bg-red-100'
                                                    }`}
                                                    title={role.soAdmin > 0 ? 'Không thể xóa' : 'Xóa'}
                                                    disabled={role.soAdmin > 0}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                            <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 rounded-t-2xl">
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
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-violet-500 focus:outline-none transition-colors"
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
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-violet-500 focus:outline-none transition-colors resize-none"
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
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-violet-500 focus:outline-none transition-colors"
                                        >
                                            <option value="true">Hoạt động</option>
                                            <option value="false">Ngừng hoạt động</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all font-semibold"
                                    >
                                        {editingRole ? 'Cập nhật' : 'Thêm mới'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all font-semibold"
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
