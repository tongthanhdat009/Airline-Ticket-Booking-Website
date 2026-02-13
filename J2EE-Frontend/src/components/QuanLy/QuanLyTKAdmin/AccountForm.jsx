import { useState, useEffect } from 'react';
import { FaUserShield, FaTimes } from 'react-icons/fa';
import { FaUserShield as FaUserShieldIcon } from 'react-icons/fa6';

const AccountForm = ({ account, roles = [], onClose, onSave }) => {
    const [formData, setFormData] = useState({
        tenDangNhap: '',
        hoVaTen: '',
        email: '',
        matKhauBang: '',
        vaiTro: [], // Mảng chứa các maVaiTro
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState({
        email: '',
        matKhauBang: ''
    });

    useEffect(() => {
        if (account) {
            setFormData({
                hoVaTen: account.hoVaTen || '',
                tenDangNhap: account.tenDangNhap || '',
                email: account.email || '',
                matKhauBang: '', // Không điền mật khẩu khi sửa
                vaiTro: account.vaiTro || [],
            });
        } else {
            setFormData({ tenDangNhap: '', hoVaTen: '', email: '', matKhauBang: '', vaiTro: [] });
        }
        setErrorMessage('');
        setFieldErrors({ email: '', matKhauBang: '' });
    }, [account]);

    const validateEmail = (email) => {
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        // Mật khẩu phải bắt đầu bằng chữ in hoa, có ít nhất 6 ký tự và chứa ký tự đặc biệt
        const passwordRegex = /^[A-Z](?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]).{5,}$/;
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
        } else if (name === 'matKhauBang') {
            if (value && !validatePassword(value)) {
                setFieldErrors(prev => ({
                    ...prev,
                    matKhauBang: 'Mật khẩu phải bắt đầu bằng chữ in hoa, có ít nhất 6 ký tự và chứa ký tự đặc biệt'
                }));
            } else {
                setFieldErrors(prev => ({ ...prev, matKhauBang: '' }));
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
        if (!account && !formData.matKhauBang) {
            setErrorMessage('Vui lòng nhập mật khẩu!');
            return;
        }

        // Validate email
        if (!validateEmail(formData.email)) {
            setErrorMessage('Email không đúng định dạng (ví dụ: user@example.com)');
            return;
        }

        // Validate mật khẩu khi có nhập
        if (formData.matKhauBang && !validatePassword(formData.matKhauBang)) {
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
        <div className="fixed inset-0 flex justify-center items-center z-50 p-4 overflow-y-auto">
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto relative">
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
                                    name="matKhauBang"
                                    type="password"
                                    value={formData.matKhauBang}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 shadow-sm ${
                                        fieldErrors.matKhauBang
                                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                                    }`}
                                    placeholder={account ? "Để trống nếu không muốn đổi mật khẩu" : "Nhập mật khẩu"}
                                    required={!account}
                                />
                                {fieldErrors.matKhauBang && (
                                    <p className="text-red-500 text-xs mt-1">{fieldErrors.matKhauBang}</p>
                                )}
                                {!fieldErrors.matKhauBang && (
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
                                                    <FaUserShieldIcon className="text-blue-600" />
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

export default AccountForm;
