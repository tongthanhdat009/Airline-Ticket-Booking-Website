import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TaiKhoanService from '../../services/TaiKhoanService';
import { getClientAccessToken, getClientUserEmail } from '../../utils/cookieUtils';

function HoanThienThongTin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [accountInfo, setAccountInfo] = useState(null);
  
  const [formData, setFormData] = useState({
    hoVaTen: '',
    soDienThoai: '',
    ngaySinh: '',
    gioiTinh: 'Nam',
    quocGia: 'Vietnam'
  });

  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [countriesError, setCountriesError] = useState('');

  useEffect(() => {
    
    const fetchAccountInfo = async () => {
      try {
        const email = getClientUserEmail();
        const token = getClientAccessToken();
        
        if (!email || !token) {
          navigate('/dang-nhap-client');
          return;
        }

        const response = await TaiKhoanService.getTaiKhoanByEmail(email);
        // Nếu đã có đủ thông tin, redirect về trang chủ
        if (response.data.hanhKhach?.soDienThoai && response.data.hanhKhach?.ngaySinh) {
            navigate('/');
        }
        console.log("Account info for profile completion:", response);
        
        setAccountInfo(response.data);
        
        // Pre-fill tất cả thông tin từ database nếu có
        if (response.data.hanhKhach) {
          setFormData(prev => ({
            ...prev,
            hoVaTen: response.data.hanhKhach.hoVaTen || '',
            soDienThoai: response.data.hanhKhach.soDienThoai || '',
            ngaySinh: response.data.hanhKhach.ngaySinh ? response.data.hanhKhach.ngaySinh.split('T')[0] : '',
            gioiTinh: response.data.hanhKhach.gioiTinh || 'Nam',
            quocGia: response.data.hanhKhach.quocGia || 'Vietnam'
          }));
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin:', error);
        setError('Không thể tải thông tin tài khoản');
      }
      finally {
        setPageLoading(false);
      }
    };
    
    setPageLoading(true);
    fetchAccountInfo();
  }, [navigate]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchCountries = async () => {
      setCountriesLoading(true);
      try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2', { signal: controller.signal });
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        const list = data
          .map(c => ({ code: c.cca2 || c.ccn3 || c.cioc || c.name.common, name: c.name?.common || '' }))
          .filter(c => c.name)
          .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
        setCountries(list);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching countries', err);
          setCountriesError('Không thể tải danh sách quốc gia');
        }
      } finally {
        setCountriesLoading(false);
      }
    };

    fetchCountries();
    return () => controller.abort();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validate họ tên - chỉ cho phép chữ cái, khoảng trắng và dấu tiếng Việt
    if (name === 'hoVaTen') {
      const nameRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]*$/;
      if (value && !nameRegex.test(value)) {
        return; // Không cập nhật nếu có ký tự đặc biệt
      }
    }
    
    // Validate số điện thoại - chỉ cho phép số
    if (name === 'soDienThoai') {
      const phoneRegex = /^[0-9]*$/;
      if (value && !phoneRegex.test(value)) {
        return; // Không cập nhật nếu có ký tự không phải số
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.hoVaTen.trim()) {
      setError('Vui lòng nhập họ và tên');
      return;
    }
    
    // Kiểm tra họ tên không chứa ký tự đặc biệt
    const nameRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]+$/;
    if (!nameRegex.test(formData.hoVaTen.trim())) {
      setError('Họ và tên không được chứa ký tự đặc biệt, chỉ bao gồm chữ cái và khoảng trắng');
      return;
    }
    
    if (!formData.soDienThoai.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return;
    }
    
    // Kiểm tra số điện thoại: 10 số, bắt đầu bằng 0
    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(formData.soDienThoai)) {
      setError('Số điện thoại không hợp lệ. Vui lòng nhập 10 số, bắt đầu bằng 0 (VD: 0912345678)');
      return;
    }
    
    if (!formData.ngaySinh) {
      setError('Vui lòng chọn ngày sinh');
      return;
    }

    setIsLoading(true);
    try {
      if (!accountInfo || !accountInfo.maTaiKhoan) {
        setError('Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.');
        return;
      }

      // Gọi API cập nhật thông tin
      await TaiKhoanService.updateTaiKhoan(accountInfo.maTaiKhoan, {
        hanhKhach: {
          hoVaTen: formData.hoVaTen,
          soDienThoai: formData.soDienThoai,
          ngaySinh: formData.ngaySinh,
          gioiTinh: formData.gioiTinh,
          quocGia: formData.quocGia
        }
      });
      // Redirect về trang chủ
      navigate('/', { replace: true });
      
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/', { replace: true });
  };

  if (pageLoading) {
    return (
      <>
        <div 
          className="min-h-[calc(100vh-70px)] flex items-center justify-center py-8 px-4 bg-cover bg-center bg-no-repeat relative"
          style={{ backgroundImage: 'url(/background/auth/bg_footer.2f611c1f.webp)' }}
        >
          <div className="absolute inset-0 bg-linear-to-br from-red-50/80 via-orange-50/80 to-yellow-50/80"></div>
          <div className="relative z-10 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Đang tải thông tin...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div 
        className="min-h-[calc(100vh-70px)] flex items-center justify-center py-8 px-4 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: 'url(/background/auth/bg_footer.2f611c1f.webp)' }}
      >
        <div className="absolute inset-0 bg-linear-to-br from-red-50/80 via-orange-50/80 to-yellow-50/80"></div>
        
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10">
          <div className="bg-linear-to-r from-red-600 to-orange-600 p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,213,0,0.2),transparent_50%)]" />
            <div className="relative z-10">
              <div className="text-5xl mb-3">✨</div>
              <h2 className="text-2xl font-bold text-white mb-2">Hoàn thiện thông tin</h2>
              <p className="text-orange-100 text-sm">
                Vui lòng cung cấp thêm thông tin để trải nghiệm tốt nhất
              </p>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Họ và tên */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Họ và tên <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">👤</span>
                    <input
                      type="text"
                      name="hoVaTen"
                      value={formData.hoVaTen}
                      onChange={handleChange}
                      className="w-full py-3 pl-11 pr-4 border-2 border-gray-200 rounded-lg text-sm transition-all bg-gray-50 focus:outline-none focus:border-red-600 focus:bg-white focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]"
                      placeholder="Nguyễn Văn A"
                      title="Chỉ được nhập chữ cái và khoảng trắng"
                    />
                    <p className="mt-1 text-xs text-gray-500">💡 Chỉ bao gồm chữ cái và khoảng trắng, không có ký tự đặc biệt</p>
                  </div>
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Số điện thoại <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">📱</span>
                    <input
                      type="tel"
                      name="soDienThoai"
                      value={formData.soDienThoai}
                      onChange={handleChange}
                      maxLength="10"
                      className="w-full py-3 pl-11 pr-4 border-2 border-gray-200 rounded-lg text-sm transition-all bg-gray-50 focus:outline-none focus:border-red-600 focus:bg-white focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]"
                      placeholder="0912345678"
                      title="Nhập 10 số, bắt đầu bằng 0"
                    />
                    <p className="mt-1 text-xs text-gray-500">💡 Nhập 10 số, bắt đầu bằng 0 (VD: 0912345678)</p>
                  </div>
                </div>

                {/* Ngày sinh */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Ngày sinh <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🎂</span>
                    <input
                      type="date"
                      name="ngaySinh"
                      value={formData.ngaySinh}
                      onChange={handleChange}
                      className="w-full py-3 pl-11 pr-4 border-2 border-gray-200 rounded-lg text-sm transition-all bg-gray-50 focus:outline-none focus:border-red-600 focus:bg-white focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]"
                    />
                  </div>
                </div>

                {/* Giới tính */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Giới tính
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">⚧️</span>
                    <select
                      name="gioiTinh"
                      value={formData.gioiTinh}
                      onChange={handleChange}
                      className="w-full py-3 pl-11 pr-4 border-2 border-gray-200 rounded-lg text-sm transition-all bg-gray-50 focus:outline-none focus:border-red-600 focus:bg-white focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                </div>

                {/* Quốc gia */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Quốc gia
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🌍</span>
                    {countriesLoading ? (
                      <div className="w-full py-3 pl-11 pr-4 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500">Đang tải danh sách quốc gia...</div>
                    ) : countriesError ? (
                      <div className="w-full py-3 pl-11 pr-4 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 text-red-600">{countriesError}</div>
                    ) : (
                      <select
                        name="quocGia"
                        value={formData.quocGia}
                        onChange={handleChange}
                        className="w-full py-3 pl-11 pr-4 border-2 border-gray-200 rounded-lg text-sm transition-all bg-gray-50 focus:outline-none focus:border-red-600 focus:bg-white"
                      >
                        <option value="">-- Chọn quốc gia --</option>
                        {countries.map(c => (
                          <option key={c.code} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-6 py-3 px-4 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">
                  ❌ {error}
                </div>
              )}

              <div className="mt-8 flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 bg-linear-to-r from-red-600 to-orange-600 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-red-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:from-red-700 hover:to-orange-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? '⏳ Đang lưu...' : '💾 Lưu thông tin'}
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={isLoading}
                  className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg text-sm font-semibold transition-all hover:bg-gray-50 hover:border-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  ← Quay lại
                </button>
              </div>

              <p className="mt-4 text-center text-xs text-gray-500">
                💡 Bạn có thể cập nhật thông tin này bất cứ lúc nào trong phần Tài khoản
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default HoanThienThongTin;
