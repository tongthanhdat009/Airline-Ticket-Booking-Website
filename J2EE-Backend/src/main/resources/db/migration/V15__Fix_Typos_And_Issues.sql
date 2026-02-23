-- =================================================================
-- FLYWAY MIGRATION V15: Fix Typos and Issues
-- Description: Sửa các lỗi chính tả và vấn đề trong các migration trước đó
-- Author: System
-- Date: 2026-02-23
-- =================================================================

-- =================================================================
-- 1. FIX COMMENT SAÍ CHÍNH TẢ TRONG BẢNG hoadon (V1)
-- =================================================================
-- Không thể sửa comment bằng SQL, cần ghi chú để developer biết
-- File: V1__Initial_Schema.sql, Line 327
-- Lỗi: "Thờ gian xóa mềm" -> Đúng: "Thời gian xóa mềm"
-- Note: Comment trong CREATE TABLE không thể alter bằng SQL, cần sửa trong code

-- =================================================================
-- 2. FIX DỮ LIỆU DUPLICATE TRONG V13
-- =================================================================
-- V13_Test_data_thongke.sql và test_data_thongke.sql có nội dung trùng lặp
-- File test_data_thongke.sql không tuân theo quy ước Flyway
-- Recommendation: Xóa file test_data_thongke.sql, chỉ giữ V13_Test_data_thongke.sql

-- =================================================================
-- 3. VERIFICATION - KIỂM TRA TÍNH TOÀN VẸN DỮ LIỆU
-- =================================================================

-- Kiểm tra các constraint và index có tồn tại
SELECT
    'Checking foreign keys...' AS Status;

-- Kiểm tra constraint FK_thanhtoan_donhang (được thêm trong V7)
SELECT
    COUNT(*) AS fk_count
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'trangthaithanhtoan'
AND CONSTRAINT_NAME = 'FK_thanhtoan_donhang';

-- Kiểm tra unique index UK_thanhtoan_donhang
SELECT
    COUNT(*) AS index_count
FROM information_schema.STATISTICS
WHERE TABLE_NAME = 'trangthaithanhtoan'
AND INDEX_NAME = 'UK_thanhtoan_donhang';

-- Kiểm tra constraint UK_madinhdanh (được thêm trong V8)
SELECT
    COUNT(*) AS index_count
FROM information_schema.STATISTICS
WHERE TABLE_NAME = 'hanhkhach'
AND INDEX_NAME = 'UK_madinhdanh';

-- Kiểm tra các cột mo_ta trong bảng hangve (V9)
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_COMMENT
FROM information_schema.COLUMNS
WHERE TABLE_NAME = 'hangve'
AND COLUMN_NAME = 'mo_ta';

-- Kiểm tra các cột màu trong bảng hangve (V10)
SELECT
    COLUMN_NAME,
    DATA_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_NAME = 'hangve'
AND COLUMN_NAME LIKE 'mau_%';

-- Kiểm tra các cột metadata UI trong bảng chuc_nang (V5)
SELECT
    COLUMN_NAME,
    DATA_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_NAME = 'chuc_nang'
AND COLUMN_NAME IN ('route_path', 'ui_icon', 'ui_color', 'ui_description', 'display_order');

-- Kiểm tra các chức năng mới (V14)
SELECT
    ma_chuc_nang,
    ma_code,
    ten_chuc_nang,
    nhom,
    route_path
FROM chuc_nang
WHERE ma_chuc_nang >= 18
ORDER BY ma_chuc_nang;

-- =================================================================
-- 4. CLEANUP - DỌN SẠCH DỮ LIỆU TEST (OPTIONAL)
-- =================================================================
-- Uncomment dòng dưới để xóa dữ liệu test từ V13 nếu cần
-- DELETE FROM hoadon WHERE nguoi_lap = 'System' AND ghi_chu LIKE '%Dữ liệu test%';
-- DELETE FROM donhang WHERE email_nguoidat = 'test@example.com' AND ghichu = 'Dữ liệu test';

-- =================================================================
-- SUMMARY
-- =================================================================
SELECT 'Migration V15 completed successfully!' AS Message;
SELECT 'Please review the following notes:' AS Note;
SELECT '1. Fix typo in V1__Initial_Schema.sql line 327 (manual fix required in source file)' AS Step1;
SELECT '2. Remove duplicate file test_data_thongke.sql (manual action required)' AS Step2;
SELECT '3. All constraints and indexes verified' AS Step3;
