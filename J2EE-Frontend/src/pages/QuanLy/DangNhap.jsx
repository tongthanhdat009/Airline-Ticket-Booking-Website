import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaPlaneDeparture } from 'react-icons/fa';
import { loginAdmin } from '../../services/AuthService';
import { isAuthenticated } from '../../services/apiClient';

function DangNhapAdmin() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Nếu đã đăng nhập, chuyển về trang thống kê
    useEffect(() => {
        if (isAuthenticated('admin')) {
            navigate('/admin/dashboard/ThongKe');
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Xóa error khi user bắt đầu nhập
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate
            if (!formData.username || !formData.password) {
                setError('Vui lòng nhập đầy đủ thông tin');
                setLoading(false);
                return;
            }

            // Gọi API đăng nhập
            const response = await loginAdmin({
                username: formData.username,
                password: formData.password
            });

            // Đăng nhập thành công, chuyển về trang thống kê
            console.log('Đăng nhập thành công:', response);
            navigate('/admin/dashboard/ThongKe');
            
        } catch (err) {
            console.error('Lỗi đăng nhập:', err);
            
            // Xử lý các loại lỗi khác nhau
            if (err.response) {
                switch (err.response.status) {
                    case 401:
                        setError('Tên đăng nhập hoặc mật khẩu không đúng');
                        break;
                    case 403:
                        setError('Tài khoản không có quyền truy cập');
                        break;
                    case 500:
                        setError('Lỗi server. Vui lòng thử lại sau');
                        break;
                    default:
                        setError(err.response.data?.message || 'Đăng nhập thất bại');
                }
            } else if (err.request) {
                setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối');
            } else {
                setError('Đã xảy ra lỗi. Vui lòng thử lại');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-linear-to-r from-sky-500 to-blue-600 p-8 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
                            <FaPlaneDeparture className="text-blue-600" size={40} />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
                        <p className="text-blue-100">Hệ thống quản lý chuyến bay</p>
                    </div>

                    {/* Form */}
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Username Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Tên đăng nhập
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaUser className="text-gray-400" size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                                        placeholder="Nhập tên đăng nhập"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Mật khẩu
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaLock className="text-gray-400" size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                                        placeholder="Nhập mật khẩu"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</span>
                                </label>
                                <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                                    Quên mật khẩu?
                                </a>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang đăng nhập...
                                    </span>
                                ) : (
                                    'Đăng nhập'
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
                        <p className="text-center text-sm text-gray-600">
                            © 2025 Admin Portal. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DangNhapAdmin;