import React, { useState, useEffect } from 'react';
import { FaKey, FaSave, FaCheckSquare, FaSquare, FaSearch, FaChevronDown, FaChevronRight } from 'react-icons/fa';

const QuanLyPhanQuyen = () => {
    // Hard code danh sách Vai trò
    const [roles] = useState([
        { maVaiTro: 1, tenVaiTro: 'Super Admin' },
        { maVaiTro: 2, tenVaiTro: 'Nhân viên bán vé' },
        { maVaiTro: 3, tenVaiTro: 'Kế toán' },
        { maVaiTro: 4, tenVaiTro: 'Quản lý vận hành' },
        { maVaiTro: 5, tenVaiTro: 'Chăm sóc khách hàng' },
        { maVaiTro: 6, tenVaiTro: 'Báo cáo viên' }
    ]);

    // Hard code danh sách Chức năng theo schema
    const [features] = useState([
        { maChucNang: 1, maCode: 'DASHBOARD', tenChucNang: 'Thống kê & Báo cáo', nhom: 'Báo cáo' },
        { maChucNang: 2, maCode: 'KHACHHANG', tenChucNang: 'Quản lý Khách hàng', nhom: 'Quản lý' },
        { maChucNang: 3, maCode: 'TUYENBAY', tenChucNang: 'Quản lý Tuyến bay', nhom: 'Vận hành' },
        { maChucNang: 4, maCode: 'CHUYENBAY', tenChucNang: 'Quản lý Chuyến bay', nhom: 'Vận hành' },
        { maChucNang: 5, maCode: 'GIABAY', tenChucNang: 'Quản lý Giá vé', nhom: 'Vận hành' },
        { maChucNang: 6, maCode: 'SANBAY', tenChucNang: 'Quản lý Sân bay', nhom: 'Vận hành' },
        { maChucNang: 7, maCode: 'MAYBAY', tenChucNang: 'Quản lý Máy bay', nhom: 'Vận hành' },
        { maChucNang: 8, maCode: 'DICHVU', tenChucNang: 'Quản lý Dịch vụ', nhom: 'Vận hành' },
        { maChucNang: 9, maCode: 'KHUYENMAI', tenChucNang: 'Quản lý Khuyến mãi', nhom: 'Marketing' },
        { maChucNang: 10, maCode: 'HOADON', tenChucNang: 'Quản lý Hóa đơn', nhom: 'Tài chính' },
        { maChucNang: 11, maCode: 'HOANTIEN', tenChucNang: 'Quản lý Hoàn tiền', nhom: 'Tài chính' },
        { maChucNang: 12, maCode: 'DONHANG', tenChucNang: 'Quản lý Đơn hàng', nhom: 'Quản lý' },
        { maChucNang: 13, maCode: 'LICHSU', tenChucNang: 'Lịch sử thao tác', nhom: 'Báo cáo' },
        { maChucNang: 14, maCode: 'ADMIN', tenChucNang: 'Quản lý Tài khoản Admin', nhom: 'Hệ thống' },
        { maChucNang: 15, maCode: 'VAITRO', tenChucNang: 'Quản lý Vai trò', nhom: 'Hệ thống' },
        { maChucNang: 16, maCode: 'PHANQUYEN', tenChucNang: 'Phân quyền', nhom: 'Hệ thống' }
    ]);

    // Hard code danh sách Hành động theo schema
    const [actions] = useState([
        { maHanhDong: 'VIEW', moTa: 'Xem' },
        { maHanhDong: 'CREATE', moTa: 'Thêm mới' },
        { maHanhDong: 'UPDATE', moTa: 'Cập nhật' },
        { maHanhDong: 'DELETE', moTa: 'Xóa' },
        { maHanhDong: 'APPROVE', moTa: 'Duyệt' },
        { maHanhDong: 'EXPORT', moTa: 'Xuất báo cáo' },
        { maHanhDong: 'IMPORT', moTa: 'Nhập dữ liệu' }
    ]);

    // Ma trận quyền - key format: "maVaiTro-maChucNang-maHanhDong"
    const [permissions, setPermissions] = useState({});

    const [selectedRole, setSelectedRole] = useState(1);
    const [filterGroup, setFilterGroup] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [saveStatus, setSaveStatus] = useState('');
    const [expandedFeature, setExpandedFeature] = useState(null); // ID của chức năng đang mở

    // Khởi tạo permissions cho Super Admin (full quyền)
    useEffect(() => {
        const initialPermissions = {};

        // Super Admin có full quyền
        features.forEach(feature => {
            actions.forEach(action => {
                initialPermissions[`1-${feature.maChucNang}-${action.maHanhDong}`] = true;
            });
        });

        // Nhân viên bán vé
        const staffPermissions = [
            '2-1-VIEW', '2-2-VIEW', '2-2-CREATE', '2-12-VIEW', '2-12-CREATE', '2-12-UPDATE',
            '2-4-VIEW', '2-10-VIEW', '2-13-VIEW'
        ];
        staffPermissions.forEach(key => initialPermissions[key] = true);

        // Kế toán
        const accountingPermissions = [
            '3-1-VIEW', '3-10-VIEW', '3-10-CREATE', '3-10-UPDATE', '3-10-APPROVE', '3-10-EXPORT',
            '3-11-VIEW', '3-11-CREATE', '3-11-UPDATE', '3-11-APPROVE', '3-13-VIEW'
        ];
        accountingPermissions.forEach(key => initialPermissions[key] = true);

        // Quản lý vận hành
        const opsPermissions = [
            '4-1-VIEW', '4-3-VIEW', '4-3-CREATE', '4-3-UPDATE', '4-3-DELETE',
            '4-4-VIEW', '4-4-CREATE', '4-4-UPDATE', '4-4-DELETE',
            '4-5-VIEW', '4-5-CREATE', '4-5-UPDATE',
            '4-6-VIEW', '4-6-CREATE', '4-6-UPDATE', '4-6-DELETE',
            '4-7-VIEW', '4-7-CREATE', '4-7-UPDATE', '4-7-DELETE',
            '4-8-VIEW', '4-8-CREATE', '4-8-UPDATE', '4-8-DELETE',
            '4-13-VIEW', '4-13-EXPORT'
        ];
        opsPermissions.forEach(key => initialPermissions[key] = true);

        // Chăm sóc khách hàng
        const csPermissions = [
            '5-1-VIEW', '5-2-VIEW', '5-2-CREATE', '5-2-UPDATE', '5-12-VIEW', '5-12-CREATE', '5-12-UPDATE',
            '5-11-VIEW', '5-11-CREATE', '5-11-UPDATE', '5-13-VIEW', '5-13-EXPORT'
        ];
        csPermissions.forEach(key => initialPermissions[key] = true);

        // Báo cáo viên (chỉ xem)
        const reportPermissions = [
            '6-1-VIEW', '6-1-EXPORT', '6-13-VIEW', '6-13-EXPORT'
        ];
        reportPermissions.forEach(key => initialPermissions[key] = true);

        setPermissions(initialPermissions);
    }, []);

    // Lấy danh sách nhóm
    const groups = ['ALL', ...new Set(features.map(f => f.nhom))];

    // Filter features
    const filteredFeatures = features.filter(feature => {
        const matchSearch = feature.tenChucNang.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           feature.maCode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchGroup = filterGroup === 'ALL' || feature.nhom === filterGroup;
        return matchSearch && matchGroup;
    });

    // Toggle permission
    const togglePermission = (featureCode, actionCode) => {
        const key = `${selectedRole}-${featureCode}-${actionCode}`;
        setPermissions(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Check all actions for a feature
    const checkAllFeature = (featureCode) => {
        const newChecked = !actions.every(action =>
            permissions[`${selectedRole}-${featureCode}-${action.maHanhDong}`]
        );

        actions.forEach(action => {
            const key = `${selectedRole}-${featureCode}-${action.maHanhDong}`;
            setPermissions(prev => ({
                ...prev,
                [key]: newChecked
            }));
        });
    };

    // Check if all actions are checked for a feature
    const isFeatureAllChecked = (featureCode) => {
        return actions.every(action =>
            permissions[`${selectedRole}-${featureCode}-${action.maHanhDong}`]
        );
    };

    // Save permissions
    const handleSave = () => {
        setSaveStatus('saving');

        // Simulate API call
        setTimeout(() => {
            setSaveStatus('saved');

            // Collect all permissions for selected role
            const rolePermissions = [];
            Object.entries(permissions).forEach(([key, value]) => {
                const [maVaiTro, maChucNang, maHanhDong] = key.split('-');
                if (parseInt(maVaiTro) === selectedRole && value) {
                    rolePermissions.push({
                        maVaiTro: parseInt(maVaiTro),
                        maChucNang: parseInt(maChucNang),
                        maHanhDong: maHanhDong
                    });
                }
            });

            console.log('Saving permissions for role:', selectedRole, rolePermissions);

            setTimeout(() => setSaveStatus(''), 3000);
        }, 1000);
    };

    // Count permissions for selected role
    const permissionCount = Object.entries(permissions)
        .filter(([key, value]) => {
            const [maVaiTro] = key.split('-');
            return parseInt(maVaiTro) === selectedRole && value;
        })
        .length;

    return (
        <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
            <div className="max-w-full mx-auto">

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 flex items-center gap-3">
                        <FaKey className="text-amber-600" />
                        Ma trận Phân quyền (Permission Matrix)
                    </h1>
                    <p className="text-slate-600 mt-2">Cấu hình quyền cho từng vai trò trong hệ thống</p>
                </div>

                {/* Control Panel */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Role Selection */}
                        <div>
                            <label className="block text-slate-700 font-bold mb-2">
                                Chọn vai trò <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(parseInt(e.target.value))}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors font-semibold"
                            >
                                {roles.map(role => (
                                    <option key={role.maVaiTro} value={role.maVaiTro}>
                                        {role.tenVaiTro}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Group Filter */}
                        <div>
                            <label className="block text-slate-700 font-bold mb-2">
                                Lọc theo nhóm
                            </label>
                            <select
                                value={filterGroup}
                                onChange={(e) => setFilterGroup(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                            >
                                {groups.map(group => (
                                    <option key={group} value={group}>
                                        {group === 'ALL' ? 'Tất cả nhóm' : group}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Search */}
                        <div>
                            <label className="block text-slate-700 font-bold mb-2">
                                Tìm kiếm chức năng
                            </label>
                            <div className="relative">
                                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Nhập tên chức năng..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mt-6">
                        <div className="text-slate-600">
                            <span className="font-semibold">{permissionCount}</span> quyền đã được cấp cho vai trò này
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saveStatus === 'saving'}
                            className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/50 flex items-center gap-2 font-bold disabled:opacity-50"
                        >
                            {saveStatus === 'saving' ? (
                                <>Đang lưu...</>
                            ) : saveStatus === 'saved' ? (
                                <><FaCheckSquare /> Đã lưu!</>
                            ) : (
                                <><FaSave /> Lưu cấu hình</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Permission Dropdown List */}
                <div className="space-y-3">
                    {filteredFeatures.map((feature) => {
                        const isExpanded = expandedFeature === feature.maChucNang;
                        const grantedCount = actions.filter(action =>
                            permissions[`${selectedRole}-${feature.maChucNang}-${action.maHanhDong}`]
                        ).length;

                        return (
                            <div key={feature.maChucNang} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                {/* Feature Header - Click to Expand */}
                                <button
                                    onClick={() => setExpandedFeature(isExpanded ? null : feature.maChucNang)}
                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-amber-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                                            <FaChevronRight className="text-amber-600" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-slate-800 text-lg">{feature.tenChucNang}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-mono">
                                                        {feature.maCode}
                                                    </span>
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                                        {feature.nhom}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-sm text-slate-500 mt-1">
                                                {grantedCount} / {actions.length} quyền đã cấp
                                            </div>
                                        </div>
                                    </div>
                                </button>

                                {/* Expanded Actions */}
                                {isExpanded && (
                                    <div className="border-t border-slate-200 bg-slate-50 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-bold text-slate-700">Danh sách hành động</h4>
                                            <button
                                                onClick={() => checkAllFeature(feature.maChucNang)}
                                                className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors font-semibold text-sm flex items-center gap-2"
                                            >
                                                {isFeatureAllChecked(feature.maChucNang) ? (
                                                    <><FaCheckSquare /> Bỏ chọn tất cả</>
                                                ) : (
                                                    <><FaSquare /> Chọn tất cả</>
                                                )}
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {actions.map(action => {
                                                const key = `${selectedRole}-${feature.maChucNang}-${action.maHanhDong}`;
                                                const checked = permissions[key] || false;

                                                return (
                                                    <button
                                                        key={action.maHanhDong}
                                                        onClick={() => togglePermission(feature.maChucNang, action.maHanhDong)}
                                                        className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                                                            checked
                                                                ? 'border-amber-500 bg-amber-50 hover:bg-amber-100'
                                                                : 'border-slate-200 bg-white hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        <div className={`text-2xl ${checked ? 'text-amber-600' : 'text-slate-300'}`}>
                                                            {checked ? <FaCheckSquare /> : <FaSquare />}
                                                        </div>
                                                        <div className="flex-1 text-left">
                                                            <div className={`font-semibold ${checked ? 'text-amber-700' : 'text-slate-700'}`}>
                                                                {action.moTa}
                                                            </div>
                                                            <div className="text-xs text-slate-500 font-mono">
                                                                {action.maHanhDong}
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
                    <h3 className="font-bold text-slate-800 mb-4">Hướng dẫn sử dụng:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                        <div className="flex items-start gap-3">
                            <FaChevronRight className="text-amber-600 text-xl mt-0.5" />
                            <div>
                                <strong className="text-slate-800">Mở rộng chức năng:</strong>
                                <p>Click vào tên chức năng để xem danh sách hành động</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <FaCheckSquare className="text-amber-600 text-xl mt-0.5" />
                            <div>
                                <strong className="text-slate-800">Cấp quyền:</strong>
                                <p>Click vào hành động để bật/tắt quyền cho vai trò</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <FaKey className="text-amber-600 text-xl mt-0.5" />
                            <div>
                                <strong className="text-slate-800">Lưu cấu hình:</strong>
                                <p>Nhấn nút "Lưu cấu hình" để áp dụng thay đổi</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuanLyPhanQuyen;
