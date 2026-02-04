import React, { useState, useEffect } from 'react';
import { FaUser, FaLock, FaPlane, FaEdit, FaSave, FaTimes, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';
import { getChuyenBayByKhachHangId, updateCustomer } from '../../services/CustomerService';
import Toast from '../common/Toast';

const ViewKhachHangModal = ({ isOpen, onClose, customer, onCustomerUpdated }) => {
    const [activeTab, setActiveTab] = useState('info');
    const [flights, setFlights] = useState([]);
    const [loadingFlights, setLoadingFlights] = useState(false);
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [saving, setSaving] = useState(false);
    
    // Form states
    const [formData, setFormData] = useState({
        hoVaTen: '',
        email: '',
        soDienThoai: '',
        gioiTinh: '',
        ngaySinh: '',
        quocGia: '',
        maDinhDanh: '',
        diaChi: ''
    });
    
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });

    useEffect(() => {
        if (isOpen && customer) {
            fetchFlights();
            resetFormData();
            setActiveTab('info');
            setIsEditing(false);
            setShowPasswordForm(false);
        }
    }, [isOpen, customer]);

    const resetFormData = () => {
        if (customer) {
            setFormData({
                hoVaTen: customer.hanhKhach?.hoVaTen || '',
                email: customer.hanhKhach?.email || customer.email || '',
                soDienThoai: customer.hanhKhach?.soDienThoai || customer.soDienThoai || '',
                gioiTinh: customer.hanhKhach?.gioiTinh || '',
                ngaySinh: customer.hanhKhach?.ngaySinh ? customer.hanhKhach.ngaySinh.split('T')[0] : '',
                quocGia: customer.hanhKhach?.quocGia || '',
                maDinhDanh: customer.hanhKhach?.maDinhDanh || '',
                diaChi: customer.hanhKhach?.diaChi || ''
            });
        }
    };

    const fetchFlights = async () => {
        if (!customer) return;
        try {
            setLoadingFlights(true);
            const data = await getChuyenBayByKhachHangId(customer.maHanhKhach);
            setFlights(data.data || []);
        } catch (error) {
            console.error('Error fetching flights:', error);
            setFlights([]);
        } finally {
            setLoadingFlights(false);
        }
    };

    const handleFlightClick = (flight, index) => {
        setSelectedFlight(selectedFlight === index ? null : index);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                ...customer,
                email: formData.email,
                hanhKhach: {
                    hoVaTen: formData.hoVaTen,
                    email: formData.email,
                    soDienThoai: formData.soDienThoai,
                    gioiTinh: formData.gioiTinh,
                    ngaySinh: formData.ngaySinh,
                    quocGia: formData.quocGia,
                    maDinhDanh: formData.maDinhDanh,
                    diaChi: formData.diaChi
                }
            };
            
            await updateCustomer(customer.maHanhKhach, payload);
            setToast({ show: true, message: 'Cập nhật thông tin thành công!', type: 'success' });
            setIsEditing(false);
            if (onCustomerUpdated) onCustomerUpdated();
        } catch (error) {
            console.error('Error updating customer:', error);
            setToast({ show: true, message: 'Cập nhật thất bại!', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setToast({ show: true, message: 'Mật khẩu xác nhận không khớp!', type: 'error' });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setToast({ show: true, message: 'Mật khẩu mới phải có ít nhất 6 ký tự!', type: 'error' });
            return;
        }
        // TODO: Call API to change password
        setToast({ show: true, message: 'Đổi mật khẩu thành công!', type: 'success' });
        setShowPasswordForm(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        resetFormData();
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const formatCurrency = (amount) => {
        if (!amount) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    if (!isOpen || !customer) return null;

    const renderSidebar = () => (
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {customer.hanhKhach?.hoVaTen?.charAt(0) || '?'}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 truncate max-w-[140px]">
                            {customer.hanhKhach?.hoVaTen || 'Khách hàng'}
                        </p>
                        <p className="text-sm text-gray-500">#{customer.maHanhKhach}</p>
                    </div>
                </div>
            </div>
            
            <nav className="flex-1 p-4 space-y-2">
                <button
                    onClick={() => setActiveTab('info')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === 'info' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'hover:bg-gray-100 text-gray-700'
                    }`}
                >
                    <FaUser className="w-5 h-5" />
                    <span className="font-medium">Thông tin khách hàng</span>
                </button>
                
                <button
                    onClick={() => setActiveTab('account')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === 'account' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'hover:bg-gray-100 text-gray-700'
                    }`}
                >
                    <FaLock className="w-5 h-5" />
                    <span className="font-medium">Thông tin tài khoản</span>
                </button>
                
                <button
                    onClick={() => setActiveTab('flights')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === 'flights' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'hover:bg-gray-100 text-gray-700'
                    }`}
                >
                    <FaPlane className="w-5 h-5" />
                    <span className="font-medium">Thông tin chuyến bay</span>
                    {flights.length > 0 && (
                        <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                            {flights.length}
                        </span>
                    )}
                </button>
            </nav>
        </div>
    );

    const renderCustomerInfo = () => (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Thông tin khách hàng</h3>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <FaEdit className="w-4 h-4" />
                        <span>Chỉnh sửa</span>
                    </button>
                ) : (
                    <div className="flex space-x-2">
                        <button
                            onClick={handleCancelEdit}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            <FaTimes className="w-4 h-4" />
                            <span>Hủy</span>
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            <FaSave className="w-4 h-4" />
                            <span>{saving ? 'Đang lưu...' : 'Lưu'}</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                    {isEditing ? (
                        <input
                            type="text"
                            name="hoVaTen"
                            value={formData.hoVaTen}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    ) : (
                        <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{customer.hanhKhach?.hoVaTen || '-'}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    {isEditing ? (
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    ) : (
                        <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{customer.hanhKhach?.email || customer.email || '-'}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                    {isEditing ? (
                        <input
                            type="tel"
                            name="soDienThoai"
                            value={formData.soDienThoai}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    ) : (
                        <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{customer.hanhKhach?.soDienThoai || '-'}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
                    {isEditing ? (
                        <select
                            name="gioiTinh"
                            value={formData.gioiTinh}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Chọn giới tính</option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                        </select>
                    ) : (
                        <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{customer.hanhKhach?.gioiTinh || '-'}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
                    {isEditing ? (
                        <input
                            type="date"
                            name="ngaySinh"
                            value={formData.ngaySinh}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    ) : (
                        <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{formatDate(customer.hanhKhach?.ngaySinh)}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quốc gia</label>
                    {isEditing ? (
                        <input
                            type="text"
                            name="quocGia"
                            value={formData.quocGia}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    ) : (
                        <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{customer.hanhKhach?.quocGia || '-'}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mã định danh</label>
                    {isEditing ? (
                        <input
                            type="text"
                            name="maDinhDanh"
                            value={formData.maDinhDanh}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    ) : (
                        <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{customer.hanhKhach?.maDinhDanh || '-'}</p>
                    )}
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                    {isEditing ? (
                        <textarea
                            name="diaChi"
                            value={formData.diaChi}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    ) : (
                        <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{customer.hanhKhach?.diaChi || '-'}</p>
                    )}
                </div>
            </div>
        </div>
    );

    const renderAccountInfo = () => (
        <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Thông tin tài khoản</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mã tài khoản</label>
                    <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">#{customer.maHanhKhach}</p>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email đăng nhập</label>
                    <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{customer.email || '-'}</p>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái tài khoản</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        customer.daXoa 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                    }`}>
                        <span className={`w-2 h-2 mr-2 rounded-full ${
                            customer.daXoa ? 'bg-red-600' : 'bg-green-600'
                        }`}></span>
                        {customer.daXoa ? 'Đã khóa' : 'Hoạt động'}
                    </span>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày tạo</label>
                    <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                        {customer.ngayTao ? formatDate(customer.ngayTao) : '-'}
                    </p>
                </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
                {customer.oauth2Provider === 'GOOGLE' ? (
                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                        <div className="flex items-center space-x-3">
                            <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800">Tài khoản Google</h4>
                                <p className="text-sm text-gray-600">Tài khoản này đăng nhập qua Google. Không thể đổi mật khẩu tại đây.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                                <FaKey className="w-5 h-5 mr-2 text-orange-500" />
                                Đổi mật khẩu
                            </h4>
                            <button
                                onClick={() => setShowPasswordForm(!showPasswordForm)}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                {showPasswordForm ? 'Ẩn form' : 'Đổi mật khẩu'}
                            </button>
                        </div>

                        {showPasswordForm && (
                    <form onSubmit={handlePasswordSubmit} className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                        <div className="space-y-4 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
                                <div className="relative">
                                    <input
                                        type={showPassword.current ? 'text' : 'password'}
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                    >
                                        {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                                <div className="relative">
                                    <input
                                        type={showPassword.new ? 'text' : 'password'}
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        minLength={6}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                    >
                                        {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                                <div className="relative">
                                    <input
                                        type={showPassword.confirm ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                    >
                                        {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                            >
                                <FaKey className="w-4 h-4" />
                                <span>Xác nhận đổi mật khẩu</span>
                            </button>
                        </div>
                    </form>
                )}
                    </>
                )}
            </div>
        </div>
    );

    const renderFlightsInfo = () => (
        <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <FaPlane className="w-6 h-6 mr-2 text-blue-600" />
                Chuyến bay đã tham gia
                {flights.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-500">({flights.length} chuyến)</span>
                )}
            </h3>

            {loadingFlights ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-sm text-gray-600">Đang tải dữ liệu chuyến bay...</p>
                </div>
            ) : flights.length > 0 ? (
                <div className="space-y-4">
                    {flights.map((flight, index) => {
                        const isSelected = selectedFlight === index;
                        const tongTienDichVu = flight.dichVuDaDat?.reduce((sum, dv) => sum + (dv.donGia * dv.soLuong), 0) || 0;
                        
                        return (
                            <div 
                                key={index} 
                                className={`border rounded-lg transition-all duration-200 ${
                                    isSelected 
                                        ? 'border-blue-500 shadow-lg bg-blue-50' 
                                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md bg-white'
                                }`}
                            >
                                <div 
                                    className="p-4 cursor-pointer"
                                    onClick={() => handleFlightClick(flight, index)}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h5 className="text-lg font-semibold text-gray-900">{flight.soHieuChuyenBay}</h5>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Mã đặt chỗ: <span className="font-medium text-gray-700">#{flight.maDatCho}</span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-green-600">{formatCurrency(flight.tongTien)}</p>
                                            <p className="text-xs text-gray-500">Tổng tiền</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-xs text-gray-500">Điểm đi</p>
                                            <p className="font-medium text-gray-900">{flight.diemDi}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Điểm đến</p>
                                            <p className="font-medium text-gray-900">{flight.diemDen}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Ngày bay</p>
                                            <p className="font-medium text-gray-900">{formatDate(flight.ngayDi)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Dịch vụ</p>
                                            <p className="font-medium text-orange-600">{flight.dichVuDaDat?.length || 0} dịch vụ</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {isSelected && (
                                    <div className="border-t border-blue-200 bg-white p-4">
                                        <h6 className="text-sm font-semibold text-gray-800 mb-3">Dịch vụ đã đặt</h6>
                                        {flight.dichVuDaDat && flight.dichVuDaDat.length > 0 ? (
                                            <div className="space-y-2">
                                                {flight.dichVuDaDat.map((dv, idx) => (
                                                    <div key={idx} className="flex justify-between items-center bg-orange-50 rounded-lg p-3 border border-orange-100">
                                                        <span className="text-sm font-medium text-gray-900">{dv.tenLuaChon}</span>
                                                        <div className="text-right">
                                                            <p className="text-sm font-semibold text-orange-600">{formatCurrency(dv.donGia)}</p>
                                                            <p className="text-xs text-gray-500">SL: {dv.soLuong}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="flex justify-between items-center pt-2 border-t border-orange-200">
                                                    <span className="text-sm font-medium text-gray-700">Tổng dịch vụ:</span>
                                                    <span className="text-lg font-bold text-orange-600">{formatCurrency(tongTienDichVu)}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-center py-4 text-gray-500">Không có dịch vụ nào</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <FaPlane className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Không có chuyến bay</h3>
                    <p className="mt-2 text-sm text-gray-500">Khách hàng chưa tham gia chuyến bay nào.</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 " onClick={onClose}></div>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col relative z-10">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
                    <h3 className="text-xl font-bold">Chi tiết khách hàng</h3>
                    <button onClick={onClose} className="text-white hover:text-gray-200">
                        <FaTimes className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 flex overflow-hidden">
                    {renderSidebar()}
                    
                    <div className="flex-1 overflow-y-auto">
                        {activeTab === 'info' && renderCustomerInfo()}
                        {activeTab === 'account' && renderAccountInfo()}
                        {activeTab === 'flights' && renderFlightsInfo()}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-4 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                        Đóng
                    </button>
                </div>

                {/* Toast */}
                {toast.show && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast({ ...toast, show: false })}
                    />
                )}
            </div>
        </div>
    );
};

export default ViewKhachHangModal;
