-- =================================================================
-- V15: Banner & Tin Tuc Tables
-- Description: Tạo bảng banners và tin_tuc cho hệ thống quản lý banner và tin tức
-- =================================================================

-- Bảng banners
CREATE TABLE `banners` (
  `mabanner` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `tieu_de` varchar(255) NOT NULL COMMENT 'Tiêu đề banner',
  `mo_ta` text COMMENT 'Mô tả chi tiết',
  `hinh_anh` varchar(500) COMMENT 'Đường dẫn hình ảnh',
  `link_url` varchar(255) COMMENT 'Link đích khi click vào banner',
  `vi_tri` varchar(50) COMMENT 'Vị trí hiển thị: hero, sidebar, popup',
  `thu_tu` int DEFAULT 0 COMMENT 'Thứ tự hiển thị',
  `trang_thai` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Trạng thái hoạt động: 1 = active, 0 = inactive',
  `ngay_bat_dau` date COMMENT 'Ngày bắt đầu hiển thị',
  `ngay_ket_thuc` date COMMENT 'Ngày kết thúc hiển thị',
  `ngay_tao` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP) COMMENT 'Thời gian tạo',
  `ngay_cap_nhat` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật',
  `da_xoa` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete: 0 = active, 1 = deleted',
  `deleted_at` datetime DEFAULT null COMMENT 'Thời gian xóa mềm'
);

-- Bảng tin_tuc
CREATE TABLE `tin_tuc` (
  `matintuc` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `tieu_de` varchar(255) NOT NULL COMMENT 'Tiêu đề tin tức',
  `tom_tat` text COMMENT 'Tóm tắt nội dung',
  `noi_dung` longtext COMMENT 'Nội dung chi tiết',
  `hinh_anh` varchar(500) COMMENT 'Đường dẫn hình ảnh thumbnail',
  `danh_muc` varchar(100) COMMENT 'Danh mục: Tin tức, Thông báo, Khuyến mãi',
  `trang_thai` varchar(50) DEFAULT 'ban_nhap' COMMENT 'Trạng thái: da_xuat_ban, ban_nhap',
  `ngay_dang` datetime COMMENT 'Ngày đăng tin',
  `luot_xem` int NOT NULL DEFAULT 0 COMMENT 'Số lượt xem',
  `tac_gia` varchar(100) COMMENT 'Tác giả bài viết',
  `ngay_tao` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP) COMMENT 'Thời gian tạo',
  `ngay_cap_nhat` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật',
  `da_xoa` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete: 0 = active, 1 = deleted',
  `deleted_at` datetime DEFAULT null COMMENT 'Thời gian xóa mềm'
);

-- =================================================================
-- INDEXES
-- =================================================================

-- Indexes for banners
CREATE INDEX `idx_banners_trang_thai` ON `banners` (`trang_thai`);
CREATE INDEX `idx_banners_vi_tri` ON `banners` (`vi_tri`);
CREATE INDEX `idx_banners_thu_tu` ON `banners` (`thu_tu`);
CREATE INDEX `idx_banners_ngay_bat_dau` ON `banners` (`ngay_bat_dau`);
CREATE INDEX `idx_banners_ngay_ket_thuc` ON `banners` (`ngay_ket_thuc`);

-- Indexes for tin_tuc
CREATE INDEX `idx_tintuc_trang_thai` ON `tin_tuc` (`trang_thai`);
CREATE INDEX `idx_tintuc_danh_muc` ON `tin_tuc` (`danh_muc`);
CREATE INDEX `idx_tintuc_ngay_dang` ON `tin_tuc` (`ngay_dang`);
CREATE INDEX `idx_tintuc_luot_xem` ON `tin_tuc` (`luot_xem`);
