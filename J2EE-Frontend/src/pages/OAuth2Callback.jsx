import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { loginAndSetTokens } from '../services/apiClient';
import { setClientUserEmail } from '../utils/cookieUtils';
import TaiKhoanService from '../services/TaiKhoanService';

function OAuth2Callback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState('Đang xử lý đăng nhập...');

    useEffect(() => {
    const handleOAuth2Callback = async () => {
        const error = searchParams.get('error');
        if (error) {
            setMessage('❌ Đăng nhập thất bại! ' + (searchParams.get('message') || ''));
            setTimeout(() => {
                navigate('/dang-nhap-client');
            }, 2000);
            return;
        }

        let accessToken = searchParams.get('accessToken');
        let refreshToken = searchParams.get('refreshToken');
        let email = searchParams.get('email');

        // Luồng mới: đổi one-time code lấy token (token không bao giờ lên URL)
        const code = searchParams.get('code');
        if (code) {
            try {
                const { data } = await apiClient.post('/oauth2/exchange', { code });
                accessToken = data?.accessToken;
                refreshToken = data?.refreshToken;
                email = data?.email;
                // Xóa code khỏi URL để không lưu lại trong browser history
                window.history.replaceState(null, '', window.location.pathname);
                } catch {
                setMessage('❌ Mã xác thực không hợp lệ hoặc đã hết hạn!');
                setTimeout(() => {
                    navigate('/dang-nhap-client');
                }, 2000);
                return;
            }
        }

        if (accessToken && refreshToken && email) {
                // Lưu tokens - access token vào cookie, refresh token vào memory
                loginAndSetTokens('customer', accessToken, refreshToken);
                setClientUserEmail(email);

                // Dispatch custom event để thông báo cho Navbar và các component khác
                window.dispatchEvent(new Event('storage'));
                localStorage.setItem('auth_update', Date.now().toString());

                setMessage('✅ Đăng nhập thành công! Đang kiểm tra thông tin...');
                
                // Kiểm tra xem đã có đủ thông tin chưa
                try {
                    const accountInfo = await TaiKhoanService.getTaiKhoanByEmail(email);
                    
                    // Nếu thiếu thông tin cơ bản (số điện thoại hoặc ngày sinh), redirect sang trang hoàn thiện
                    if (!accountInfo.hanhKhach?.soDienThoai || !accountInfo.hanhKhach?.ngaySinh) {
                        setTimeout(() => {
                            navigate('/hoan-thien-thong-tin');
                        }, 1500);
                    } else {
                        setTimeout(() => {
                            navigate('/');
                        }, 1500);
                    }
                } catch (error) {
                    console.error('Lỗi khi kiểm tra thông tin:', error);
                    setTimeout(() => {
                        navigate('/');
                    }, 1500);
                }
            } else {
                setMessage('❌ Thông tin đăng nhập không hợp lệ!');
                setTimeout(() => {
                    navigate('/dang-nhap-client');
                }, 2000);
            }
        };

        handleOAuth2Callback();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-pink-50 via-yellow-50 to-white">
            <div className="text-center bg-white p-8 rounded-xl shadow-xl max-w-md w-full mx-4">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mb-6"></div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">{message}</h2>
                <p className="text-gray-600 text-sm">Vui lòng đợi trong giây lát...</p>
            </div>
        </div>
    );
}
export default OAuth2Callback;
