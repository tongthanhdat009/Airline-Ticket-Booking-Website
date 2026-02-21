-- V14__Add_New_Admin_Features.sql
-- Thêm 5 chức năng mới: Xuất báo cáo, Đối soát giao dịch, Banner/Tin tức, Lịch sử giao dịch VNPay, Hỗ trợ/Liên hệ

-- =================================================================
-- 1. THÊM CHỨC NĂNG MỚI
-- =================================================================

INSERT INTO `chuc_nang` (`ma_chuc_nang`, `ma_code`, `ten_chuc_nang`, `nhom`) VALUES
(18, 'EXPORT_REPORT', 'Xuất báo cáo', 'Báo cáo'),
(19, 'RECONCILIATION', 'Đối soát giao dịch', 'Tài chính'),
(20, 'BANNER_NEWS', 'Quản lý Banner/Tin tức', 'Marketing'),
(21, 'TRANSACTION_LOG', 'Lịch sử giao dịch VNPay', 'Tài chính'),
(22, 'SUPPORT', 'Hỗ trợ/Liên hệ', 'Dịch vụ');

-- =================================================================
-- 2. CẬP NHẬT UI METADATA CHO CHỨC NĂNG MỚI
-- =================================================================

-- 18. EXPORT_REPORT - Xuất báo cáo
UPDATE `chuc_nang`
SET route_path = 'XuatBaoCao',
    ui_icon = 'FaFileExport',
    ui_color = 'from-emerald-500 to-teal-600',
    ui_description = 'Xuất báo cáo doanh thu, hành khách, chuyến bay dưới dạng PDF/Excel',
    display_order = 18
WHERE ma_code = 'EXPORT_REPORT';

-- 19. RECONCILIATION - Đối soát giao dịch
UPDATE `chuc_nang`
SET route_path = 'DoiSoatGiaoDich',
    ui_icon = 'FaBalanceScale',
    ui_color = 'from-red-500 to-rose-600',
    ui_description = 'Đối soát giao dịch thanh toán với VNPay',
    display_order = 19
WHERE ma_code = 'RECONCILIATION';

-- 20. BANNER_NEWS - Quản lý Banner/Tin tức
UPDATE `chuc_nang`
SET route_path = 'BannerTinTuc',
    ui_icon = 'FaImage',
    ui_color = 'from-fuchsia-500 to-pink-600',
    ui_description = 'Quản lý banner trang chủ và tin tức, bài viết',
    display_order = 20
WHERE ma_code = 'BANNER_NEWS';

-- 21. TRANSACTION_LOG - Lịch sử giao dịch VNPay
UPDATE `chuc_nang`
SET route_path = 'LichSuGiaoDichVNPay',
    ui_icon = 'FaServer',
    ui_color = 'from-slate-500 to-gray-700',
    ui_description = 'Xem log giao dịch VNPay IPN/callback chi tiết',
    display_order = 21
WHERE ma_code = 'TRANSACTION_LOG';

-- 22. SUPPORT - Hỗ trợ/Liên hệ
UPDATE `chuc_nang`
SET route_path = 'HoTroLienHe',
    ui_icon = 'FaHeadset',
    ui_color = 'from-sky-500 to-indigo-600',
    ui_description = 'Quản lý yêu cầu hỗ trợ và liên hệ từ khách hàng',
    display_order = 22
WHERE ma_code = 'SUPPORT';

-- =================================================================
-- 3. PHÂN QUYỀN CHO CÁC VAI TRÒ
-- =================================================================

-- SUPER_ADMIN (1): Toàn quyền tất cả chức năng mới
INSERT INTO `phan_quyen` (`ma_vai_tro`, `ma_chuc_nang`, `ma_hanh_dong`) VALUES
(1, 18, 'MANAGE'),
(1, 19, 'MANAGE'),
(1, 20, 'MANAGE'),
(1, 21, 'MANAGE'),
(1, 22, 'MANAGE');

-- QUAN_LY (2): Xuất báo cáo, đối soát giao dịch, quản lý banner/tin tức, hỗ trợ
INSERT INTO `phan_quyen` (`ma_vai_tro`, `ma_chuc_nang`, `ma_hanh_dong`) VALUES
(2, 18, 'VIEW'), (2, 18, 'EXPORT'),
(2, 19, 'VIEW'),
(2, 20, 'VIEW'), (2, 20, 'CREATE'), (2, 20, 'UPDATE'), (2, 20, 'DELETE'),
(2, 22, 'VIEW'), (2, 22, 'UPDATE');

-- NHAN_VIEN_VE (3): Xem và trả lời hỗ trợ khách hàng
INSERT INTO `phan_quyen` (`ma_vai_tro`, `ma_chuc_nang`, `ma_hanh_dong`) VALUES
(3, 22, 'VIEW'), (3, 22, 'UPDATE');

-- KE_TOAN (4): Xuất báo cáo, đối soát giao dịch, xem log giao dịch VNPay
INSERT INTO `phan_quyen` (`ma_vai_tro`, `ma_chuc_nang`, `ma_hanh_dong`) VALUES
(4, 18, 'VIEW'), (4, 18, 'EXPORT'),
(4, 19, 'VIEW'), (4, 19, 'UPDATE'),
(4, 21, 'VIEW');

-- VAN_HANH (5): Xem log giao dịch VNPay
INSERT INTO `phan_quyen` (`ma_vai_tro`, `ma_chuc_nang`, `ma_hanh_dong`) VALUES
(5, 21, 'VIEW');
