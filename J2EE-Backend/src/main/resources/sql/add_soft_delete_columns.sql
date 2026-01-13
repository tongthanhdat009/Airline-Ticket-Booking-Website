-- =============================================
-- MIGRATION: Thêm cột Soft Delete vào các bảng
-- Ngày: 2026-01-13
-- Mô tả: Thêm cột da_xoa và deleted_at cho các bảng cần soft delete
-- =============================================

-- Vô hiệu hóa kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS=0;

-- 1. Nhóm Bắt Buộc (Critical) - Dữ liệu cốt lõi & Giao dịch
-- =============================================

-- Bảng hanhkhach
ALTER TABLE `hanhkhach` 
ADD COLUMN IF NOT EXISTS `da_xoa` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete: 0 = active, 1 = deleted',
ADD COLUMN IF NOT EXISTS `deleted_at` datetime DEFAULT null COMMENT 'Thời gian xóa mềm';

-- Bảng taikhoan
ALTER TABLE `taikhoan` 
ADD COLUMN IF NOT EXISTS `da_xoa` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete: 0 = active, 1 = deleted',
ADD COLUMN IF NOT EXISTS `deleted_at` datetime DEFAULT null COMMENT 'Thời gian xóa mềm';

-- Bảng taikhoanadmin
ALTER TABLE `taikhoanadmin` 
ADD COLUMN IF NOT EXISTS `da_xoa` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete: 0 = active, 1 = deleted',
ADD COLUMN IF NOT EXISTS `deleted_at` datetime DEFAULT null COMMENT 'Thời gian xóa mềm';

-- Bảng donhang
ALTER TABLE `donhang` 
ADD COLUMN IF NOT EXISTS `da_xoa` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete: 0 = active, 1 = deleted',
ADD COLUMN IF NOT EXISTS `deleted_at` datetime DEFAULT null COMMENT 'Thời gian xóa mềm';

-- Bảng datcho
ALTER TABLE `datcho` 
ADD COLUMN IF NOT EXISTS `da_xoa` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete: 0 = active, 1 = deleted',
ADD COLUMN IF NOT EXISTS `deleted_at` datetime DEFAULT null COMMENT 'Thời gian xóa mềm';

-- Bảng trangthaithanhtoan
ALTER TABLE `trangthaithanhtoan` 
ADD COLUMN IF NOT EXISTS `da_xoa` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete: 0 = active, 1 = deleted',
ADD COLUMN IF NOT EXISTS `deleted_at` datetime DEFAULT null COMMENT 'Thời gian xóa mềm';

-- Bảng hoantien
ALTER TABLE `hoantien` 
ADD COLUMN IF NOT EXISTS `da_xoa` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete: 0 = active, 1 = deleted',
ADD COLUMN IF NOT EXISTS `deleted_at` datetime DEFAULT null COMMENT 'Thời gian xóa mềm';

-- 2. Nhóm Quan Trọng (High Priority) - Dữ liệu danh mục (Master Data)
-- =============================================

-- Bảng sanbay
ALTER TABLE `sanbay` 
ADD COLUMN IF NOT EXISTS `da_xoa` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete: 0 = active, 1 = deleted',
ADD COLUMN IF NOT EXISTS `deleted_at` datetime DEFAULT null COMMENT 'Thời gian xóa mềm';

-- Bảng maybay
ALTER TABLE `maybay` 
ADD COLUMN IF NOT EXISTS `da_xoa` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete: 0 = active, 1 = deleted',
ADD COLUMN IF NOT EXISTS `deleted_at` datetime DEFAULT null COMMENT 'Thời gian xóa mềm';

-- Bảng tuyenbay
ALTER TABLE `tuyenbay` 
ADD COLUMN IF NOT EXISTS `da_xoa` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete: 0 = active, 1 = deleted',
ADD COLUMN IF NOT EXISTS `deleted_at` datetime DEFAULT null COMMENT 'Thời gian xóa mềm';

-- Bảng hangve
ALTER TABLE `hangve` 
ADD COLUMN IF NOT EXISTS `da_xoa` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete: 0 = active, 1 = deleted',
ADD COLUMN IF NOT EXISTS `deleted_at` datetime DEFAULT null COMMENT 'Thời gian xóa mềm';

-- Bảng dichvucungcap
ALTER TABLE `dichvucungcap` 
ADD COLUMN IF NOT EXISTS `da_xoa` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete: 0 = active, 1 = deleted',
ADD COLUMN IF NOT EXISTS `deleted_at` datetime DEFAULT null COMMENT 'Thời gian xóa mềm';

-- Bảng luachondichvu
ALTER TABLE `luachondichvu` 
ADD COLUMN IF NOT EXISTS `da_xoa` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete: 0 = active, 1 = deleted',
ADD COLUMN IF NOT EXISTS `deleted_at` datetime DEFAULT null COMMENT 'Thời gian xóa mềm';

-- Bảng khuyenmai
ALTER TABLE `khuyenmai` 
ADD COLUMN IF NOT EXISTS `da_xoa` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete: 0 = active, 1 = deleted',
ADD COLUMN IF NOT EXISTS `deleted_at` datetime DEFAULT null COMMENT 'Thời gian xóa mềm';

-- 3. Nhóm Vận Hành (Operational)
-- =============================================

-- Bảng chitietchuyenbay
ALTER TABLE `chitietchuyenbay` 
ADD COLUMN IF NOT EXISTS `da_xoa` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete: 0 = active, 1 = deleted',
ADD COLUMN IF NOT EXISTS `deleted_at` datetime DEFAULT null COMMENT 'Thời gian xóa mềm';

-- Bảng giachuyenbay
ALTER TABLE `giachuyenbay` 
ADD COLUMN IF NOT EXISTS `da_xoa` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete: 0 = active, 1 = deleted',
ADD COLUMN IF NOT EXISTS `deleted_at` datetime DEFAULT null COMMENT 'Thời gian xóa mềm';

-- 4. Nhóm Quản trị hệ thống (RBAC)
-- =============================================

-- Bảng vai_tro
ALTER TABLE `vai_tro` 
ADD COLUMN IF NOT EXISTS `da_xoa` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete: 0 = active, 1 = deleted',
ADD COLUMN IF NOT EXISTS `deleted_at` datetime DEFAULT null COMMENT 'Thời gian xóa mềm';

-- =============================================
-- TẠO INDEX CHO CÁC CỘT SOFT DELETE (Tối ưu hiệu năng truy vấn)
-- =============================================

CREATE INDEX IF NOT EXISTS `idx_hanhkhach_da_xoa` ON `hanhkhach` (`da_xoa`);
CREATE INDEX IF NOT EXISTS `idx_taikhoan_da_xoa` ON `taikhoan` (`da_xoa`);
CREATE INDEX IF NOT EXISTS `idx_taikhoanadmin_da_xoa` ON `taikhoanadmin` (`da_xoa`);
CREATE INDEX IF NOT EXISTS `idx_donhang_da_xoa` ON `donhang` (`da_xoa`);
CREATE INDEX IF NOT EXISTS `idx_datcho_da_xoa` ON `datcho` (`da_xoa`);
CREATE INDEX IF NOT EXISTS `idx_trangthaithanhtoan_da_xoa` ON `trangthaithanhtoan` (`da_xoa`);
CREATE INDEX IF NOT EXISTS `idx_hoantien_da_xoa` ON `hoantien` (`da_xoa`);
CREATE INDEX IF NOT EXISTS `idx_sanbay_da_xoa` ON `sanbay` (`da_xoa`);
CREATE INDEX IF NOT EXISTS `idx_maybay_da_xoa` ON `maybay` (`da_xoa`);
CREATE INDEX IF NOT EXISTS `idx_tuyenbay_da_xoa` ON `tuyenbay` (`da_xoa`);
CREATE INDEX IF NOT EXISTS `idx_hangve_da_xoa` ON `hangve` (`da_xoa`);
CREATE INDEX IF NOT EXISTS `idx_dichvucungcap_da_xoa` ON `dichvucungcap` (`da_xoa`);
CREATE INDEX IF NOT EXISTS `idx_luachondichvu_da_xoa` ON `luachondichvu` (`da_xoa`);
CREATE INDEX IF NOT EXISTS `idx_khuyenmai_da_xoa` ON `khuyenmai` (`da_xoa`);
CREATE INDEX IF NOT EXISTS `idx_chitietchuyenbay_da_xoa` ON `chitietchuyenbay` (`da_xoa`);
CREATE INDEX IF NOT EXISTS `idx_giachuyenbay_da_xoa` ON `giachuyenbay` (`da_xoa`);
CREATE INDEX IF NOT EXISTS `idx_vai_tro_da_xoa` ON `vai_tro` (`da_xoa`);

-- Bật lại kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS=1;

-- =============================================
-- GHI CHÚ:
-- 1. File này dùng để migrate database hiện có
-- 2. Sau khi chạy migration, tất cả bản ghi hiện tại sẽ có da_xoa = 0
-- 3. Khi xóa dữ liệu, hệ thống sẽ tự động set da_xoa = 1 thay vì xóa cứng
-- 4. Để khôi phục bản ghi đã xóa, sử dụng: UPDATE table SET da_xoa = 0, deleted_at = NULL WHERE id = ?
-- =============================================
