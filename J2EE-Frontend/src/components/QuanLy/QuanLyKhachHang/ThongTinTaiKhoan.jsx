import React, { useState, useEffect } from 'react';
import { getTaiKhoanKhachHang, doiMatKhauKhachHang } from '../../../services/QLKhachHangService';

const ThongTinTaiKhoan = ({ customer }) => {
    const [accountInfo, setAccountInfo] = useState(null);
    const [loadingAccount, setLoadingAccount] = useState(true);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        matKhauMoi: '',
        xacNhanMatKhau: ''
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (customer) {
            fetchAccountInfo();
        }
    }, [customer]);

    const fetchAccountInfo = async () => {
        if (!customer) return;
        try {
            setLoadingAccount(true);
            const data = await getTaiKhoanKhachHang(customer.maHanhKhach);
            setAccountInfo(data.data);
        } catch (error) {
            console.error('Error fetching account info:', error);
            setAccountInfo(null);
        } finally {
            setLoadingAccount(false);
        }
    };

    const validatePasswordForm = () => {
        const errors = {};

        if (!passwordForm.matKhauMoi || passwordForm.matKhauMoi.length < 6) {
            errors.matKhauMoi = 'Mật khẩu phải có ít nhất 6 ký tự';
        }
        if (passwordForm.matKhauMoi && passwordForm.matKhauMoi.length > 50) {
            errors.matKhauMoi = 'Mật khẩu không được vượt quá 50 ký tự';
        }
        if (!passwordForm.xacNhanMatKhau) {
            errors.xacNhanMatKhau = 'Vui lòng xác nhận mật khẩu';
        } else if (passwordForm.matKhauMoi !== passwordForm.xacNhanMatKhau) {
            errors.xacNhanMatKhau = 'Mật khẩu xác nhận không khớp';
        }

        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (passwordErrors[name]) {
            setPasswordErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleDoiMatKhau = async (e) => {
        e.preventDefault();

        if (!validatePasswordForm()) {
            return;
        }

        if (!window.confirm('Bạn có chắc chắn muốn đổi mật khẩu cho khách hàng này?')) {
            return;
        }

        setIsSubmitting(true);
        try {
            await doiMatKhauKhachHang(customer.maHanhKhach, passwordForm.matKhauMoi);
            alert('Đổi mật khẩu thành công!');
            // Reset form
            setPasswordForm({
                matKhauMoi: '',
                xacNhanMatKhau: ''
            });
            setIsChangingPassword(false);
            setPasswordErrors({});
        } catch (error) {
            console.error('Error changing password:', error);
            if (error.response && error.response.data && error.response.data.message) {
                alert(error.response.data.message);
            } else {
                alert('Có lỗi xảy ra khi đổi mật khẩu.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleHuyDoiMatKhau = () => {
        setPasswordForm({
            matKhauMoi: '',
            xacNhanMatKhau: ''
        });
        setIsChangingPassword(false);
        setPasswordErrors({});
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '-';
        return new Date(dateTimeString).toLocaleString('vi-VN');
    };

    const getTrangThaiBadge = (trangThai) => {
        if (trangThai === 'HOAT_DONG' || trangThai === 'ACTIVE') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <span className="w-2 h-2 mr-1 bg-green-600 rounded-full"></span>
                    Hoạt động
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <span className="w-2 h-2 mr-1 bg-red-600 rounded-full"></span>
                Bị khóa
            </span>
        );
    };

    const getPhuongThucDangNhapBadge = (phuongThuc) => {
        if (phuongThuc === 'GOOGLE') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
            </span>
        );
    };

    const canChangePassword = accountInfo && accountInfo.phuongThucDangNhap !== 'GOOGLE';

    if (loadingAccount) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-sm text-gray-600">Đang tải thông tin tài khoản...</p>
                </div>
            </div>
        );
    }

    if (!accountInfo) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Không tìm thấy thông tin tài khoản</h3>
                    <p className="mt-2 text-sm text-gray-500">Khách hàng này chưa có tài khoản đăng nhập.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Thông tin tài khoản
            </h3>

            {/* Account Info Section */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Chi tiết tài khoản</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                        <p className="text-sm text-gray-900 font-medium">{accountInfo.email || '-'}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Trạng thái</label>
                        <p className="text-sm">{getTrangThaiBadge(accountInfo.trangThai)}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Ngày tạo tài khoản</label>
                        <p className="text-sm text-gray-900">{formatDateTime(accountInfo.ngayTao)}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Phương thức đăng nhập</label>
                        <p className="text-sm">{getPhuongThucDangNhapBadge(accountInfo.phuongThucDangNhap)}</p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Xác thực email</label>
                        <p className="text-sm">
                            {accountInfo.daXacThucEmail ? (
                                <span className="inline-flex items-center text-green-600">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Đã xác thực
                                </span>
                            ) : (
                                <span className="inline-flex items-center text-orange-600">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    Chưa xác thực
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Change Password Section - Only show for email accounts */}
            {canChangePassword && (
                <div className="border-t pt-6">
                    {!isChangingPassword ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700">Đổi mật khẩu</h4>
                                <p className="text-xs text-gray-500 mt-1">Đặt lại mật khẩu mới cho khách hàng</p>
                            </div>
                            <button
                                onClick={() => setIsChangingPassword(true)}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm flex items-center"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                Đổi mật khẩu
                            </button>
                        </div>
                    ) : (
                        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                            <h4 className="text-sm font-semibold text-gray-700 mb-4">Đổi mật khẩu mới</h4>
                            <form onSubmit={handleDoiMatKhau} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mật khẩu mới <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="matKhauMoi"
                                        value={passwordForm.matKhauMoi}
                                        onChange={handlePasswordInputChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${passwordErrors.matKhauMoi ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                                    />
                                    {passwordErrors.matKhauMoi && (
                                        <p className="text-xs text-red-500 mt-1">{passwordErrors.matKhauMoi}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Xác nhận mật khẩu <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="xacNhanMatKhau"
                                        value={passwordForm.xacNhanMatKhau}
                                        onChange={handlePasswordInputChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${passwordErrors.xacNhanMatKhau ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Nhập lại mật khẩu mới"
                                    />
                                    {passwordErrors.xacNhanMatKhau && (
                                        <p className="text-xs text-red-500 mt-1">{passwordErrors.xacNhanMatKhau}</p>
                                    )}
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleHuyDoiMatKhau}
                                        disabled={isSubmitting}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Xác nhận đổi mật khẩu
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* Warning for Google OAuth accounts */}
            {!canChangePassword && (
                <div className="border-t pt-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <h4 className="text-sm font-semibold text-yellow-800">Tài khoản Google OAuth</h4>
                                <p className="text-xs text-yellow-700 mt-1">
                                    Tài khoản này đăng nhập bằng Google. Không thể đổi mật khẩu vì mật khẩu được quản lý bởi Google.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThongTinTaiKhoan;
