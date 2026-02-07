import React, { useState, useEffect } from 'react';
import { FaKey, FaSave, FaCheckSquare, FaSquare, FaSearch, FaChevronRight, FaCopy, FaLock, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import Toast from '../../components/common/Toast';
import {
    getAllChucNang,
    getAllHanhDong,
    getAllVaiTroWithSuperAdminFlag,
    getPermissionMatrix,
    updatePhanQuyen,
    copyPermissions
} from '../../services/PhanQuyenService';

const QuanLyPhanQuyen = () => {
    // State cho dữ liệu từ API
    const [roles, setRoles] = useState([]);
    const [features, setFeatures] = useState([]);
    const [actions, setActions] = useState([]);
    
    // Ma trận quyền - key format: "maChucNang-maHanhDong"
    const [permissions, setPermissions] = useState({});
    const [originalPermissions, setOriginalPermissions] = useState({});

    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedRoleInfo, setSelectedRoleInfo] = useState(null);
    const [filterGroup, setFilterGroup] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [saveStatus, setSaveStatus] = useState('');
    const [expandedFeature, setExpandedFeature] = useState(null);
    
    // Loading states
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Toast
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
    
    // Copy permissions modal
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [copyFromRole, setCopyFromRole] = useState(null);

    // Toast functions
    const showToast = (message, type = 'success') => {
        setToast({ isVisible: true, message, type });
    };

    const hideToast = () => {
        setToast({ ...toast, isVisible: false });
    };

    // Fetch data từ API
    useEffect(() => {
        fetchInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            
            // Fetch song song các dữ liệu cần thiết
            const [rolesRes, featuresRes, actionsRes] = await Promise.all([
                getAllVaiTroWithSuperAdminFlag(),
                getAllChucNang(),
                getAllHanhDong()
            ]);

            if (rolesRes.success && rolesRes.data) {
                setRoles(rolesRes.data);
                // Chọn vai trò đầu tiên (ưu tiên không phải SUPER_ADMIN)
                const nonSuperAdmin = rolesRes.data.find(r => !r.isSuperAdmin);
                const firstRole = nonSuperAdmin || rolesRes.data[0];
                if (firstRole) {
                    setSelectedRole(firstRole.maVaiTro);
                    setSelectedRoleInfo(firstRole);
                }
            }

            if (featuresRes.success && featuresRes.data) {
                setFeatures(featuresRes.data);
            }

            if (actionsRes.success && actionsRes.data) {
                setActions(actionsRes.data);
            }

        } catch (error) {
            console.error('Error fetching initial data:', error);
            showToast('Lỗi khi tải dữ liệu. Vui lòng thử lại!', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Fetch permissions khi đổi vai trò
    useEffect(() => {
        if (selectedRole) {
            fetchPermissionMatrix(selectedRole);
            // Cập nhật thông tin vai trò đang chọn
            const roleInfo = roles.find(r => r.maVaiTro === selectedRole);
            setSelectedRoleInfo(roleInfo);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRole, roles]);

    const fetchPermissionMatrix = async (maVaiTro) => {
        try {
            const response = await getPermissionMatrix(maVaiTro);
            if (response.success && response.data) {
                setPermissions(response.data);
                setOriginalPermissions(response.data);
            }
        } catch (error) {
            console.error('Error fetching permission matrix:', error);
            showToast('Lỗi khi tải phân quyền', 'error');
        }
    };

    // Lấy danh sách nhóm
    const groups = ['ALL', ...new Set(features.map(f => f.nhom).filter(Boolean))];

    // Filter features
    const filteredFeatures = features.filter(feature => {
        const matchSearch = feature.tenChucNang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           feature.maCode?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchGroup = filterGroup === 'ALL' || feature.nhom === filterGroup;
        return matchSearch && matchGroup;
    });

    // Kiểm tra vai trò hiện tại có phải SUPER_ADMIN không
    const isSuperAdmin = selectedRoleInfo?.isSuperAdmin || false;

    // Toggle permission
    const togglePermission = (featureId, actionCode) => {
        if (isSuperAdmin) {
            showToast('Không được phép chỉnh sửa phân quyền của vai trò SUPER_ADMIN', 'error');
            return;
        }

        const key = `${featureId}-${actionCode}`;
        setPermissions(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Check all actions for a feature
    const checkAllFeature = (featureId) => {
        if (isSuperAdmin) {
            showToast('Không được phép chỉnh sửa phân quyền của vai trò SUPER_ADMIN', 'error');
            return;
        }

        const allChecked = actions.every(action =>
            permissions[`${featureId}-${action.maHanhDong}`]
        );

        const newPermissions = { ...permissions };
        actions.forEach(action => {
            const key = `${featureId}-${action.maHanhDong}`;
            newPermissions[key] = !allChecked;
        });
        setPermissions(newPermissions);
    };

    // Check if all actions are checked for a feature
    const isFeatureAllChecked = (featureId) => {
        return actions.every(action =>
            permissions[`${featureId}-${action.maHanhDong}`]
        );
    };

    // Kiểm tra có thay đổi không
    const hasChanges = () => {
        return JSON.stringify(permissions) !== JSON.stringify(originalPermissions);
    };

    // Save permissions
    const handleSave = async () => {
        if (isSuperAdmin) {
            showToast('Không được phép chỉnh sửa phân quyền của vai trò SUPER_ADMIN', 'error');
            return;
        }

        if (!hasChanges()) {
            showToast('Không có thay đổi nào để lưu', 'info');
            return;
        }

        try {
            setSaving(true);
            setSaveStatus('saving');

            // Chuyển đổi permissions object thành array
            const permissionList = [];
            Object.entries(permissions).forEach(([key, value]) => {
                if (value) {
                    const [maChucNang, maHanhDong] = key.split('-');
                    permissionList.push({
                        maChucNang: parseInt(maChucNang),
                        maHanhDong: maHanhDong
                    });
                }
            });

            const response = await updatePhanQuyen({
                maVaiTro: selectedRole,
                permissions: permissionList
            });

            if (response.success) {
                showToast('Lưu phân quyền thành công!', 'success');
                setSaveStatus('saved');
                setOriginalPermissions({ ...permissions });
                
                setTimeout(() => setSaveStatus(''), 3000);
            } else {
                showToast(response.message || 'Lỗi khi lưu phân quyền', 'error');
                setSaveStatus('');
            }

        } catch (error) {
            console.error('Error saving permissions:', error);
            const errorMessage = error.response?.data?.message || 'Lỗi khi lưu phân quyền';
            showToast(errorMessage, 'error');
            setSaveStatus('');
        } finally {
            setSaving(false);
        }
    };

    // Handle copy permissions
    const handleCopyPermissions = async () => {
        if (isSuperAdmin) {
            showToast('Không được phép chỉnh sửa phân quyền của vai trò SUPER_ADMIN', 'error');
            return;
        }

        if (!copyFromRole) {
            showToast('Vui lòng chọn vai trò nguồn', 'error');
            return;
        }

        try {
            setSaving(true);
            const response = await copyPermissions(copyFromRole, selectedRole);
            
            if (response.success) {
                showToast('Sao chép phân quyền thành công!', 'success');
                setShowCopyModal(false);
                setCopyFromRole(null);
                // Refresh permission matrix
                await fetchPermissionMatrix(selectedRole);
            } else {
                showToast(response.message || 'Lỗi khi sao chép phân quyền', 'error');
            }
        } catch (error) {
            console.error('Error copying permissions:', error);
            const errorMessage = error.response?.data?.message || 'Lỗi khi sao chép phân quyền';
            showToast(errorMessage, 'error');
        } finally {
            setSaving(false);
        }
    };

    // Count permissions for selected role
    const permissionCount = Object.values(permissions).filter(v => v).length;

    if (loading) {
        return (
            <div className="p-6 bg-linear-to-br from-slate-50 to-slate-100 min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <FaSpinner className="text-4xl text-amber-600 animate-spin" />
                    <p className="text-slate-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-linear-to-br from-slate-50 to-slate-100 min-h-screen">
            <div className="max-w-full mx-auto">

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-amber-600 to-orange-600 flex items-center gap-3">
                        <FaKey className="text-amber-600" />
                        Ma trận Phân quyền (Permission Matrix)
                    </h1>
                    <p className="text-slate-600 mt-2">Cấu hình quyền cho từng vai trò trong hệ thống</p>
                </div>

                {/* Warning for SUPER_ADMIN */}
                {isSuperAdmin && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
                        <div className="flex items-center gap-3">
                            <FaLock className="text-yellow-600 text-xl" />
                            <div>
                                <h3 className="font-bold text-yellow-800">Vai trò SUPER_ADMIN được bảo vệ</h3>
                                <p className="text-yellow-700 text-sm">
                                    Không thể chỉnh sửa phân quyền của vai trò SUPER_ADMIN. Vai trò này có toàn quyền trong hệ thống.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Control Panel */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Role Selection */}
                        <div>
                            <label className="block text-slate-700 font-bold mb-2">
                                Chọn vai trò <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedRole || ''}
                                onChange={(e) => setSelectedRole(parseInt(e.target.value))}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors font-semibold"
                            >
                                {roles.map(role => (
                                    <option key={role.maVaiTro} value={role.maVaiTro}>
                                        {role.tenVaiTro} {role.isSuperAdmin ? '🔒' : ''}
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
                    <div className="flex items-center justify-between mt-6 flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="text-slate-600">
                                <span className="font-semibold">{permissionCount}</span> quyền đã được cấp cho vai trò này
                            </div>
                            {hasChanges() && !isSuperAdmin && (
                                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                                    Có thay đổi chưa lưu
                                </span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {/* Copy Button */}
                            {!isSuperAdmin && (
                                <button
                                    onClick={() => setShowCopyModal(true)}
                                    className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-lg flex items-center gap-2 font-bold"
                                >
                                    <FaCopy /> Sao chép từ vai trò khác
                                </button>
                            )}
                            
                            {/* Save Button */}
                            <button
                                onClick={handleSave}
                                disabled={saving || isSuperAdmin || !hasChanges()}
                                className={`px-8 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2 font-bold
                                    ${isSuperAdmin 
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                        : 'bg-linear-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-amber-500/50 disabled:opacity-50'
                                    }`}
                            >
                                {saving ? (
                                    <><FaSpinner className="animate-spin" /> Đang lưu...</>
                                ) : saveStatus === 'saved' ? (
                                    <><FaCheckSquare /> Đã lưu!</>
                                ) : isSuperAdmin ? (
                                    <><FaLock /> Không thể chỉnh sửa</>
                                ) : (
                                    <><FaSave /> Lưu cấu hình</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Permission Dropdown List */}
                <div className="space-y-3">
                    {filteredFeatures.map((feature) => {
                        const isExpanded = expandedFeature === feature.maChucNang;
                        const grantedCount = actions.filter(action =>
                            permissions[`${feature.maChucNang}-${action.maHanhDong}`]
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
                                                    {feature.nhom && (
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                                            {feature.nhom}
                                                        </span>
                                                    )}
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
                                            {!isSuperAdmin && (
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
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {actions.map(action => {
                                                const key = `${feature.maChucNang}-${action.maHanhDong}`;
                                                const checked = permissions[key] || false;

                                                return (
                                                    <button
                                                        key={action.maHanhDong}
                                                        onClick={() => togglePermission(feature.maChucNang, action.maHanhDong)}
                                                        disabled={isSuperAdmin}
                                                        className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                                                            isSuperAdmin
                                                                ? 'cursor-not-allowed opacity-75'
                                                                : ''
                                                        } ${
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

                {/* Empty State */}
                {filteredFeatures.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <FaExclamationTriangle className="text-5xl text-amber-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-700 mb-2">Không tìm thấy chức năng</h3>
                        <p className="text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                    </div>
                )}

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
                            <FaLock className="text-amber-600 text-xl mt-0.5" />
                            <div>
                                <strong className="text-slate-800">SUPER_ADMIN:</strong>
                                <p>Không thể chỉnh sửa phân quyền của vai trò này</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copy Permissions Modal */}
            {showCopyModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowCopyModal(false)}></div>
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                            <FaCopy className="text-blue-500" />
                            Sao chép phân quyền
                        </h2>
                        <p className="text-slate-600 mb-6">
                            Sao chép tất cả phân quyền từ vai trò nguồn sang vai trò <strong>{selectedRoleInfo?.tenVaiTro}</strong>.
                            Các phân quyền hiện tại sẽ bị ghi đè.
                        </p>

                        <div className="mb-6">
                            <label className="block text-slate-700 font-bold mb-2">
                                Chọn vai trò nguồn
                            </label>
                            <select
                                value={copyFromRole || ''}
                                onChange={(e) => setCopyFromRole(parseInt(e.target.value))}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                            >
                                <option value="">-- Chọn vai trò --</option>
                                {roles.filter(r => r.maVaiTro !== selectedRole).map(role => (
                                    <option key={role.maVaiTro} value={role.maVaiTro}>
                                        {role.tenVaiTro}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowCopyModal(false);
                                    setCopyFromRole(null);
                                }}
                                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-semibold"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleCopyPermissions}
                                disabled={!copyFromRole || saving}
                                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <><FaSpinner className="animate-spin" /> Đang sao chép...</>
                                ) : (
                                    <><FaCopy /> Sao chép</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            <Toast
                isVisible={toast.isVisible}
                message={toast.message}
                type={toast.type}
                onClose={hideToast}
            />
        </div>
    );
};

export default QuanLyPhanQuyen;
