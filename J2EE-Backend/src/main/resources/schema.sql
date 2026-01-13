-- Vô hiệu hóa kiểm tra khóa ngoại để xóa bảng không bị lỗi
SET FOREIGN_KEY_CHECKS=0;

-- Xóa các bảng nếu chúng đã tồn tại
DROP TABLE IF EXISTS `taikhoanadmin`;
DROP TABLE IF EXISTS `datchodichvu`;
DROP TABLE IF EXISTS `dichvuchuyenbay`;
DROP TABLE IF EXISTS `luachondichvu`;
DROP TABLE IF EXISTS `dichvucungcap`;
DROP TABLE IF EXISTS `trangthaithanhtoan`;
DROP TABLE IF EXISTS `datcho`;
DROP TABLE IF EXISTS `giachuyenbay`;
DROP TABLE IF EXISTS `taikhoan`;
DROP TABLE IF EXISTS `hanhkhach`;
DROP TABLE IF EXISTS `chitietghe`;
DROP TABLE IF EXISTS `chitietchuyenbay`;
DROP TABLE IF EXISTS `tuyenbay`;
DROP TABLE IF EXISTS `sanbay`;
DROP TABLE IF EXISTS `hangve`;
DROP TABLE IF EXISTS `email_verification_token`;

-- Bật lại kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS=1;
CREATE TABLE `sanbay` (
  `masanbay` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `ma_iata` varchar(3) DEFAULT null,
  `ma_icao` varchar(4) DEFAULT null,
  `tensanbay` varchar(255) NOT NULL,
  `thanhphosanbay` varchar(255) DEFAULT null,
  `quocgiasanbay` varchar(255) DEFAULT null,
  `trangthaihoatdong` varchar(20) DEFAULT null
);

CREATE TABLE `hangve` (
  `mahangve` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `tenhangve` varchar(255) NOT NULL
);

CREATE TABLE `maybay` (
  `mamaybay` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `tenmaybay` varchar(255) NOT NULL,
  `hangmaybay` varchar(100) NOT NULL,
  `loaimaybay` varchar(100) NOT NULL,
  `sohieu` varchar(50) NOT NULL,
  `tongsoghe` int NOT NULL,
  `trangthai` varchar(50) DEFAULT 'Active',
  `namkhaithac` int DEFAULT null
);

CREATE TABLE `tuyenbay` (
  `matuyenbay` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `masanbaydi` int NOT NULL,
  `masanbayden` int NOT NULL
);

CREATE TABLE `chitietchuyenbay` (
  `machuyenbay` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `matuyenbay` int NOT NULL,
  `mamaybay` int DEFAULT null,
  `sohieuchuyenbay` varchar(10) DEFAULT null,
  `ngaydi` date NOT NULL,
  `giodi` time(6) NOT NULL,
  `ngayden` date NOT NULL,
  `gioden` time(6) NOT NULL,
  `trangthai` varchar(20) DEFAULT 'OPEN',
  `thoigianden_thucte` timestamp DEFAULT null,
  `thoigiandi_thucte` timestamp DEFAULT null,
  `lydoDelay` varchar(255) DEFAULT null
);

CREATE TABLE `chitietghe` (
  `maghe` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `mamaybay` int NOT NULL COMMENT 'Máy bay có sơ đồ ghế này',
  `mahangve` int NOT NULL COMMENT 'Hạng vé của ghế',
  `soghe` varchar(10) NOT NULL COMMENT 'Số ghế (vd: 1A, 12F)',
  `vitrighe` varchar(20) DEFAULT null COMMENT 'Vị trí: CỬA SỔ, LỐI ĐI, GIỮA',
  `hang` int DEFAULT null COMMENT 'Số hàng',
  `cot` varchar(2) DEFAULT null COMMENT 'Cột (A, B, C, D, E, F)',
  UNIQUE KEY `UK_maybay_soghe` (`mamaybay`, `soghe`)
);

CREATE TABLE `hanhkhach` (
  `mahanhkhach` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `hovaten` varchar(50),
  `ngaysinh` date,
  `gioitinh` varchar(10) DEFAULT null,
  `sodienthoai` varchar(20),
  `email` varchar(100),
  `madinhdanh` varchar(50) DEFAULT null,
  `diachi` varchar(255) DEFAULT null,
  `quocgia` varchar(100)
);

CREATE TABLE `donhang` (
  `madonhang` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `pnr` varchar(6) UNIQUE NOT NULL COMMENT 'Mã PNR - Passenger Name Record',
  `mahanhkhach_nguoidat` int NOT NULL COMMENT 'Hành khách đặt vé',
  `ngaydat` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `tonggia` decimal(10,2) NOT NULL DEFAULT 0.00,
  `trangthai` varchar(50) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING, PAID, CANCELLED',
  `email_nguoidat` varchar(100) NOT NULL,
  `sodienthoai_nguoidat` varchar(20) NOT NULL,
  `ghichu` varchar(500) DEFAULT null,
  `created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `taikhoan` (
  `mataikhoan` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `mahanhkhach` int NOT NULL,
  `email` varchar(100) NOT NULL,
  `matkhaubam` varchar(255) NOT NULL,
  `trangthai` varchar(20) NOT NULL,
  `ngaytao` datetime(6) NOT NULL,
  `email_verified` tinyint(1) NOT NULL DEFAULT 0,
  `oauth2_provider` varchar(20) DEFAULT null COMMENT 'GOOGLE, FACEBOOK, null for normal accounts'
);

CREATE TABLE `datcho` (
  `madatcho` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `madonhang` int NOT NULL COMMENT 'Tham chiếu đến đơn hàng',
  `mahanhkhach` int NOT NULL COMMENT 'Hành khách thực tế (có thể khác người đặt)',
  `machuyenbay` int NOT NULL COMMENT 'Chuyến bay của đặt chỗ này',
  `mahangve` int NOT NULL COMMENT 'Hạng vé đã đặt',
  `giave` decimal(10,2) NOT NULL COMMENT 'Giá vé tại thời điểm đặt',
  `maghe_da_chon` int DEFAULT null COMMENT 'Ghế đã chọn (nếu có)',
  `ngaydatcho` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `trangthai` varchar(50) NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE, CANCELLED',
  `checkin_status` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0: chưa check-in, 1: đã check-in',
  `checkin_time` datetime DEFAULT null COMMENT 'Thời gian check-in'
);

CREATE TABLE `dichvucungcap` (
  `madichvu` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `tendichvu` varchar(100) NOT NULL,
  `mota` varchar(255),
  `anh` varchar(255)
);

CREATE TABLE `dichvuchuyenbay` (
  `machuyenbay` int NOT NULL,
  `madichvu` int NOT NULL,
  PRIMARY KEY (`machuyenbay`, `madichvu`)
);

CREATE TABLE `giachuyenbay` (
  `magia` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `matuyenbay` int NOT NULL,
  `mahangve` int NOT NULL,
  `giave` decimal(10,2) NOT NULL,
  `soluong_phanbo` int NOT NULL DEFAULT 0 COMMENT 'Số ghế phân bổ cho mức giá này',
  `soluong_daban` int NOT NULL DEFAULT 0 COMMENT 'Số ghế đã bán với mức giá này',
  `ngayapdungtu` date NOT NULL,
  `ngayapdungden` date DEFAULT null
);

CREATE TABLE `luachondichvu` (
  `maluachon` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `madichvu` int DEFAULT null,
  `tenluachon` varchar(100) NOT NULL,
  `mota` varchar(255) DEFAULT null,
  `gia` decimal(10,2) NOT NULL,
  `anh` varchar(255) DEFAULT null
);

CREATE TABLE `ghe_da_dat` (
  `ma_ghe_da_dat` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `machuyenbay` int NOT NULL COMMENT 'Chuyến bay cụ thể',
  `maghe` int NOT NULL COMMENT 'Ghế từ sơ đồ máy bay (chitietghe)',
  `madatcho` int NOT NULL COMMENT 'Đặt chỗ đã chọn ghế này',
  `thoigian_dat` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  UNIQUE KEY `UK_chuyenbay_ghe` (`machuyenbay`, `maghe`),
  INDEX `idx_datcho` (`madatcho`)
);

CREATE TABLE `trangthaithanhtoan` (
  `mathanhtoan` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `madatcho` int DEFAULT null,
  `sotien` decimal(10,2) NOT NULL,
  `dathanhtoan` char(1) NOT NULL,
  `ngayhethan` date DEFAULT null
);

CREATE TABLE `audit_log` (
  `ma_log` bigint PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `loai_thao_tac` varchar(50) NOT NULL COMMENT 'HỦY VÉ, ĐỔI GIỜ BAY, ĐỔI CHUYẾN BAY, CHECK-IN, HOÀN TIỀN, etc.',
  `bang_anh_huong` varchar(50) NOT NULL COMMENT 'Bảng bị ảnh hưởng: datcho, chitietchuyenbay, etc.',
  `ma_ban_ghi` int NOT NULL COMMENT 'ID của bản ghi bị ảnh hưởng',
  `nguoi_thuc_hien` varchar(100) NOT NULL COMMENT 'Email hoặc tên người thực hiện',
  `loai_tai_khoan` varchar(20) NOT NULL COMMENT 'ADMIN, CUSTOMER',
  `du_lieu_cu` text DEFAULT null COMMENT 'Dữ liệu trước khi thay đổi (JSON)',
  `du_lieu_moi` text DEFAULT null COMMENT 'Dữ liệu sau khi thay đổi (JSON)',
  `mo_ta` varchar(500) DEFAULT null COMMENT 'Mô tả chi tiết',
  `dia_chi_ip` varchar(45) DEFAULT null COMMENT 'IP của người thực hiện',
  `thoi_gian` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  INDEX `idx_loai_thao_tac` (`loai_thao_tac`),
  INDEX `idx_bang_anh_huong` (`bang_anh_huong`, `ma_ban_ghi`),
  INDEX `idx_nguoi_thuc_hien` (`nguoi_thuc_hien`),
  INDEX `idx_thoi_gian` (`thoi_gian`)
);

CREATE TABLE `datchodichvu` (
  `madatcho` int NOT NULL,
  `maluachon` int NOT NULL,
  `soluong` int NOT NULL,
  `dongia` decimal(10,2) NOT NULL,
  PRIMARY KEY (`madatcho`, `maluachon`)
);

CREATE TABLE `taikhoanadmin` (
  `mataikhoan` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `tendangnhap` VARCHAR(50) NOT NULL,
  `matkhaubam` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `hovaten` VARCHAR(100) DEFAULT null,
  `ngaytao` DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `email_verification_token` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `token` VARCHAR(255) UNIQUE NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `expiry_date` DATETIME NOT NULL,
  `used` TINYINT(1) NOT NULL DEFAULT 0,
  `created_date` DATETIME NOT NULL
);

CREATE TABLE `refreshtoken` (
  `matoken` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `mataikhoan` INT DEFAULT null,
  `mataikhoanadmin` INT DEFAULT null,
  `token` VARCHAR(500) UNIQUE NOT NULL,
  `ngaytao` DATETIME NOT NULL,
  `ngayhethan` DATETIME NOT NULL,
  `daxoa` TINYINT(1) NOT NULL DEFAULT 0
);

CREATE TABLE `khuyenmai` (
  `makhuyenmai` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `makm` VARCHAR(20) UNIQUE NOT NULL,
  `tenkhuyenmai` VARCHAR(255) NOT NULL,
  `mota` VARCHAR(500),
  `loaikhuyenmai` VARCHAR(50) NOT NULL COMMENT 'PERCENT: phần trăm, FIXED: số tiền cố định',
  `giatrigiam` DECIMAL(10,2) NOT NULL,
  `giatritoithieu` DECIMAL(10,2) COMMENT 'Giá trị đơn hàng tối thiểu',
  `giatritoida` DECIMAL(10,2) COMMENT 'Giá trị giảm tối đa',
  `soluong` INT DEFAULT null COMMENT 'Số lượng mã có thể sử dụng',
  `soluongdaduocdung` INT DEFAULT 0 COMMENT 'Số lượng đã được sử dụng',
  `ngaybatdau` DATETIME NOT NULL,
  `ngayketthuc` DATETIME NOT NULL,
  `trangthai` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE: active, INACTIVE: inactive, EXPIRED: expired',
  `ngaytao` DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `hoantien` (
  `mahp` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `madatcho` INT NOT NULL,
  `mathanhtoan` INT NOT NULL,
  `sotienhoan` DECIMAL(10,2) NOT NULL,
  `lydohoantien` VARCHAR(500) NOT NULL,
  `trangthai` VARCHAR(50) NOT NULL DEFAULT 'PROCESSING' COMMENT 'PROCESSING, COMPLETED, REJECTED',
  `ngayycau` DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `ngayhoan` DATETIME COMMENT 'Ngày hoàn tiền thực tế',
  `nguoixuly` VARCHAR(100) COMMENT 'Người xử lý yêu cầu hoàn tiền',
  `ghichu` VARCHAR(500) COMMENT 'Ghi chú thêm',
  `created_at` DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `khuyenmai_datcho` (
  `makhuyenmai` INT NOT NULL,
  `madatcho` INT NOT NULL,
  `sotiengiam` DECIMAL(10,2) NOT NULL COMMENT 'Số tiền giảm cho đơn hàng này',
  `ngaysudung` DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (`makhuyenmai`, `madatcho`)
);

CREATE UNIQUE INDEX `UK_ma_iata` ON `sanbay` (`ma_iata`);

CREATE UNIQUE INDEX `UK_tenhangve` ON `hangve` (`tenhangve`);

CREATE UNIQUE INDEX `UK_sohieu` ON `maybay` (`sohieu`);

CREATE UNIQUE INDEX `UK_sodienthoai` ON `hanhkhach` (`sodienthoai`);

CREATE UNIQUE INDEX `UK_email_hanhkhach` ON `hanhkhach` (`email`);

CREATE UNIQUE INDEX `UK_email_taikhoan` ON `taikhoan` (`email`);

CREATE UNIQUE INDEX `UK_mahanhkhach` ON `taikhoan` (`mahanhkhach`);

CREATE UNIQUE INDEX `UK_madatcho` ON `trangthaithanhtoan` (`madatcho`);

CREATE UNIQUE INDEX `UK_pnr` ON `donhang` (`pnr`);

CREATE INDEX `idx_donhang_nguoidat` ON `donhang` (`mahanhkhach_nguoidat`);

CREATE INDEX `idx_datcho_donhang` ON `datcho` (`madonhang`);

CREATE INDEX `idx_datcho_chuyenbay` ON `datcho` (`machuyenbay`);

CREATE UNIQUE INDEX `UK_tendangnhap` ON `taikhoanadmin` (`tendangnhap`);

CREATE UNIQUE INDEX `UK_email_quantri` ON `taikhoanadmin` (`email`);

CREATE INDEX `idx_token` ON `email_verification_token` (`token`);

CREATE INDEX `idx_email` ON `email_verification_token` (`email`);

CREATE INDEX `idx_expiry` ON `email_verification_token` (`expiry_date`);

CREATE INDEX `idx_token` ON `refreshtoken` (`token`);

CREATE INDEX `idx_mataikhoan` ON `refreshtoken` (`mataikhoan`);

CREATE INDEX `idx_mataikhoanadmin` ON `refreshtoken` (`mataikhoanadmin`);

ALTER TABLE `tuyenbay` ADD CONSTRAINT `FK_tuyenbay_sanbaydi` FOREIGN KEY (`masanbaydi`) REFERENCES `sanbay` (`masanbay`);

ALTER TABLE `tuyenbay` ADD CONSTRAINT `FK_tuyenbay_sanbayden` FOREIGN KEY (`masanbayden`) REFERENCES `sanbay` (`masanbay`);

ALTER TABLE `chitietchuyenbay` ADD CONSTRAINT `FK_chitiet_tuyenbay` FOREIGN KEY (`matuyenbay`) REFERENCES `tuyenbay` (`matuyenbay`);

ALTER TABLE `chitietchuyenbay` ADD CONSTRAINT `FK_chitiet_maybay` FOREIGN KEY (`mamaybay`) REFERENCES `maybay` (`mamaybay`);

ALTER TABLE `chitietghe` ADD CONSTRAINT `FK_ghe_maybay` FOREIGN KEY (`mamaybay`) REFERENCES `maybay` (`mamaybay`);

ALTER TABLE `chitietghe` ADD CONSTRAINT `FK_ghe_hangve` FOREIGN KEY (`mahangve`) REFERENCES `hangve` (`mahangve`);

ALTER TABLE `taikhoan` ADD CONSTRAINT `FK_taikhoan_hanhkhach` FOREIGN KEY (`mahanhkhach`) REFERENCES `hanhkhach` (`mahanhkhach`);

ALTER TABLE `donhang` ADD CONSTRAINT `FK_donhang_nguoidat` FOREIGN KEY (`mahanhkhach_nguoidat`) REFERENCES `hanhkhach` (`mahanhkhach`);

ALTER TABLE `datcho` ADD CONSTRAINT `FK_datcho_donhang` FOREIGN KEY (`madonhang`) REFERENCES `donhang` (`madonhang`);

ALTER TABLE `datcho` ADD CONSTRAINT `FK_datcho_hanhkhach` FOREIGN KEY (`mahanhkhach`) REFERENCES `hanhkhach` (`mahanhkhach`);

ALTER TABLE `datcho` ADD CONSTRAINT `FK_datcho_chuyenbay` FOREIGN KEY (`machuyenbay`) REFERENCES `chitietchuyenbay` (`machuyenbay`);

ALTER TABLE `datcho` ADD CONSTRAINT `FK_datcho_hangve` FOREIGN KEY (`mahangve`) REFERENCES `hangve` (`mahangve`);

ALTER TABLE `datcho` ADD CONSTRAINT `FK_datcho_ghe_da_chon` FOREIGN KEY (`maghe_da_chon`) REFERENCES `chitietghe` (`maghe`);

ALTER TABLE `ghe_da_dat` ADD CONSTRAINT `FK_ghe_da_dat_chuyenbay` FOREIGN KEY (`machuyenbay`) REFERENCES `chitietchuyenbay` (`machuyenbay`);

ALTER TABLE `ghe_da_dat` ADD CONSTRAINT `FK_ghe_da_dat_ghe` FOREIGN KEY (`maghe`) REFERENCES `chitietghe` (`maghe`);

ALTER TABLE `ghe_da_dat` ADD CONSTRAINT `FK_ghe_da_dat_datcho` FOREIGN KEY (`madatcho`) REFERENCES `datcho` (`madatcho`);

ALTER TABLE `dichvuchuyenbay` ADD CONSTRAINT `FK_dvcb_chuyenbay` FOREIGN KEY (`machuyenbay`) REFERENCES `chitietchuyenbay` (`machuyenbay`);

ALTER TABLE `dichvuchuyenbay` ADD CONSTRAINT `FK_dvcb_dichvu` FOREIGN KEY (`madichvu`) REFERENCES `dichvucungcap` (`madichvu`);

ALTER TABLE `giachuyenbay` ADD CONSTRAINT `FK_gia_tuyenbay` FOREIGN KEY (`matuyenbay`) REFERENCES `tuyenbay` (`matuyenbay`);

ALTER TABLE `giachuyenbay` ADD CONSTRAINT `FK_gia_hangve` FOREIGN KEY (`mahangve`) REFERENCES `hangve` (`mahangve`);

ALTER TABLE `luachondichvu` ADD CONSTRAINT `FK_luachon_dichvu` FOREIGN KEY (`madichvu`) REFERENCES `dichvucungcap` (`madichvu`);

ALTER TABLE `trangthaithanhtoan` ADD CONSTRAINT `FK_thanhtoan_datcho` FOREIGN KEY (`madatcho`) REFERENCES `datcho` (`madatcho`);

ALTER TABLE `datchodichvu` ADD CONSTRAINT `FK_dcdv_datcho` FOREIGN KEY (`madatcho`) REFERENCES `datcho` (`madatcho`);

ALTER TABLE `datchodichvu` ADD CONSTRAINT `FK_dcdv_luachon` FOREIGN KEY (`maluachon`) REFERENCES `luachondichvu` (`maluachon`);

ALTER TABLE `refreshtoken` ADD CONSTRAINT `FK_refreshtoken_taikhoan` FOREIGN KEY (`mataikhoan`) REFERENCES `taikhoan` (`mataikhoan`);

ALTER TABLE `refreshtoken` ADD CONSTRAINT `FK_refreshtoken_taikhoanadmin` FOREIGN KEY (`mataikhoanadmin`) REFERENCES `taikhoanadmin` (`mataikhoan`);

ALTER TABLE `hoantien` ADD CONSTRAINT `FK_hoantien_datcho` FOREIGN KEY (`madatcho`) REFERENCES `datcho` (`madatcho`);

ALTER TABLE `hoantien` ADD CONSTRAINT `FK_hoantien_thanhtoan` FOREIGN KEY (`mathanhtoan`) REFERENCES `trangthaithanhtoan` (`mathanhtoan`);

ALTER TABLE `khuyenmai_datcho` ADD CONSTRAINT `FK_kmd_khuyenmai` FOREIGN KEY (`makhuyenmai`) REFERENCES `khuyenmai` (`makhuyenmai`);

ALTER TABLE `khuyenmai_datcho` ADD CONSTRAINT `FK_kmd_datcho` FOREIGN KEY (`madatcho`) REFERENCES `datcho` (`madatcho`);

-- =============================================
-- BẢNG QUẢN LÝ PHÂN QUYỀN (RBAC - Role-Based Access Control)
-- =============================================

-- 1. Bảng Vai trò (Roles)
-- Định nghĩa các nhóm quyền: Super Admin, Nhân viên vé, Kế toán...
CREATE TABLE `vai_tro` (
  `ma_vai_tro` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `ten_vai_tro` varchar(50) NOT NULL UNIQUE,
  `mo_ta` varchar(255) DEFAULT null,
  `trang_thai` tinyint(1) DEFAULT 1 COMMENT '1: Active, 0: Inactive'
);

-- 2. Bảng Chức năng (Features / Resources)
-- Định nghĩa các màn hình hoặc module: Quản lý chuyến bay, Quản lý đơn hàng...
CREATE TABLE `chuc_nang` (
  `ma_chuc_nang` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `ma_code` varchar(50) NOT NULL UNIQUE COMMENT 'Mã code dùng trong Backend (VD: FLIGHT, ORDER, CUSTOMER)',
  `ten_chuc_nang` varchar(100) NOT NULL COMMENT 'Tên hiển thị ra UI',
  `nhom` varchar(50) DEFAULT null COMMENT 'Dùng để group menu (VD: Vận hành, Báo cáo)'
);

-- 3. Bảng Từ điển Hành động (Action Dictionary)
-- Định nghĩa các key word hành động chuẩn.
-- Dùng bảng này để tránh việc dev nhập lung tung (lúc thì 'READ', lúc thì 'VIEW')
CREATE TABLE `hanh_dong` (
  `ma_hanh_dong` varchar(50) PRIMARY KEY NOT NULL COMMENT 'Key word: VIEW, CREATE, UPDATE, DELETE, IMPORT, EXPORT, APPROVE...',
  `mo_ta` varchar(100) DEFAULT null
);

-- 4. Bảng Phân quyền (Permissions) - BẢNG QUAN TRỌNG NHẤT
-- Lưu trữ: Vai trò A - Tại Chức năng B - Được làm Hành động C
CREATE TABLE `phan_quyen` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `ma_vai_tro` int NOT NULL,
  `ma_chuc_nang` int NOT NULL,
  `ma_hanh_dong` varchar(50) NOT NULL,

  -- Ràng buộc: Một vai trò tại 1 chức năng không được trùng hành động
  UNIQUE KEY `UK_permission` (`ma_vai_tro`, `ma_chuc_nang`, `ma_hanh_dong`)
);

-- 5. Bảng liên kết Admin và Vai trò
-- Gán tài khoản vào nhóm quyền
CREATE TABLE `admin_vai_tro` (
  `mataikhoan` int NOT NULL,
  `ma_vai_tro` int NOT NULL,
  PRIMARY KEY (`mataikhoan`, `ma_vai_tro`)
);

-- --- TẠO KHÓA NGOẠI (Foreign Keys) CHO RBAC ---

ALTER TABLE `phan_quyen` ADD CONSTRAINT `FK_pq_vaitro` FOREIGN KEY (`ma_vai_tro`) REFERENCES `vai_tro` (`ma_vai_tro`);

ALTER TABLE `phan_quyen` ADD CONSTRAINT `FK_pq_chucnang` FOREIGN KEY (`ma_chuc_nang`) REFERENCES `chuc_nang` (`ma_chuc_nang`);

ALTER TABLE `phan_quyen` ADD CONSTRAINT `FK_pq_hanhdong` FOREIGN KEY (`ma_hanh_dong`) REFERENCES `hanh_dong` (`ma_hanh_dong`);

ALTER TABLE `admin_vai_tro` ADD CONSTRAINT `FK_avt_admin` FOREIGN KEY (`mataikhoan`) REFERENCES `taikhoanadmin` (`mataikhoan`);

ALTER TABLE `admin_vai_tro` ADD CONSTRAINT `FK_avt_vaitro` FOREIGN KEY (`ma_vai_tro`) REFERENCES `vai_tro` (`ma_vai_tro`);

-- --- TẠO INDEX CHO RBAC ---

CREATE INDEX `idx_vaitro_ten` ON `vai_tro` (`ten_vai_tro`);

CREATE INDEX `idx_chucnang_code` ON `chuc_nang` (`ma_code`);

CREATE INDEX `idx_chucnang_nhom` ON `chuc_nang` (`nhom`);

CREATE INDEX `idx_pq_vaitro` ON `phan_quyen` (`ma_vai_tro`);

CREATE INDEX `idx_pq_chucnang` ON `phan_quyen` (`ma_chuc_nang`);

CREATE INDEX `idx_avt_admin` ON `admin_vai_tro` (`mataikhoan`);

CREATE INDEX `idx_avt_vaitro` ON `admin_vai_tro` (`ma_vai_tro`);
