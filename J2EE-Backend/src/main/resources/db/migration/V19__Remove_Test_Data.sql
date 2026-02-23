-- Migration V19: Remove test/hardcoded data
-- Author: Claude Code
-- Date: 2026-02-23
-- Description: Clean up test data and hardcoded values from database

-- =================================================================
-- 1. XÓA DỮ LIỆU TEST TỪ VNPAY_TRANSACTION_LOG
-- =================================================================
-- Xóa các giao dịch có processing_result là FAILED hoặc CANCELLED 
-- và là dữ liệu test (được tạo trong migration V18)
DELETE FROM vnpay_transaction_log 
WHERE processing_result IN ('FAILED', 'CANCELLED', 'DUPLICATE')
AND processing_message LIKE '%test%'
AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY);

-- =================================================================
-- 2. CẬP NHẬT DỮ LIỆU HÓA ĐƠN CÓ GHI CHÚ TEST
-- =================================================================
-- Xóa ghi chú test từ hoadon
-- Lưu ý: Trong bảng hoadon, cột là 'ghi_chu' (có dấu gạch dưới)
UPDATE hoadon 
SET 
    ghi_chu = NULL,
    trangthai_doisoat = 'PENDING',
    updated_at = NOW()
WHERE ghi_chu LIKE '%test%'
OR ghi_chu LIKE '%Dữ liệu test%'
OR ghi_chu LIKE '%demo%'
OR ghi_chu LIKE '%mẫu%';

-- =================================================================
-- 3. CẬP NHẬT ĐƠN HÀNG CÓ EMAIL TEST
-- =================================================================
-- Cập nhật email test thành placeholder hợp lệ (không thể NULL)
-- Lưu ý: email_nguoidat là NOT NULL nên không thể set NULL
UPDATE donhang 
SET 
    email_nguoidat = CONCAT('removed_', SUBSTRING(MD5(RAND()), 1, 8), '@system.local'),
    ghichu = CONCAT(COALESCE(ghichu, ''), ' [Cập nhật: Xóa email test]'),
    updated_at = NOW()
WHERE email_nguoidat LIKE '%test@%'
OR email_nguoidat LIKE '%example.com%'
OR email_nguoidat LIKE '%demo%';

-- =================================================================
-- 4. XÓA DỮ LIỆU TEST TỪ HÀNH KHÁCH
-- =================================================================
-- Cập nhật hành khách có thông tin test
UPDATE hanhkhach 
SET 
    email = NULL,
    sodienthoai = NULL
WHERE email LIKE '%test@%'
OR email LIKE '%example.com%'
OR sodienthoai = '0901234567';

-- =================================================================
-- 5. XÓA CÁC GIAO DỊCH VNPAY KHÔNG HỢP LỆ
-- =================================================================
-- Xóa các giao dịch không liên kết với thanh toán thực tế
DELETE FROM vnpay_transaction_log 
WHERE vnp_txn_ref LIKE 'MAT%'
AND ipn_received_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
AND processing_result = 'FAILED'
AND NOT EXISTS (
    SELECT 1 FROM trangthaithanhtoan tt 
    WHERE tt.transaction_code = vnpay_transaction_log.vnp_txn_ref
);

-- =================================================================
-- 6. ĐẢM BẢO DỮ LIỆU SẠCH SẼ
-- =================================================================
-- Cập nhật tất cả trangthai_doisoat NULL thành PENDING
UPDATE hoadon 
SET trangthai_doisoat = 'PENDING'
WHERE trangthai_doisoat IS NULL;

-- Xóa ghi chú đối soát chứa từ khóa test
UPDATE hoadon 
SET 
    ghichu_doisoat = NULL,
    nguoi_xuly_doisoat = NULL,
    ngay_xuly_doisoat = NULL,
    trangthai_doisoat = 'PENDING'
WHERE ghichu_doisoat LIKE '%test%'
OR ghichu_doisoat LIKE '%demo%'
OR ghichu_doisoat LIKE '%mẫu%';

-- =================================================================
-- NOTE: Các file sau KHÔNG được chạy trong production:
-- - test_data_thongke.sql
-- - V13_Test_data_thongke.sql  
-- - V3__Sample_January_2026_Data.sql
-- Các file này chỉ dùng cho development/testing
-- =================================================================
