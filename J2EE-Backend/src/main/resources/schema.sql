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

-- Tạo lại các bảng với cấu trúc chuẩn

CREATE TABLE `sanbay` (
  `masanbay` int NOT NULL AUTO_INCREMENT,
  `ma_iata` varchar(3) DEFAULT NULL,
  `ma_icao` varchar(4) DEFAULT NULL,
  `tensanbay` varchar(255) NOT NULL,
  `thanhphosanbay` varchar(255) DEFAULT NULL,
  `quocgiasanbay` varchar(255) DEFAULT NULL,
  `trangthaihoatdong` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`masanbay`),
  UNIQUE KEY `UK_ma_iata` (`ma_iata`)
) ENGINE=InnoDB;

CREATE TABLE `hangve` (
  `mahangve` int NOT NULL AUTO_INCREMENT,
  `tenhangve` varchar(255) NOT NULL,
  `succhua` int NOT NULL,
  PRIMARY KEY (`mahangve`),
  UNIQUE KEY `UK_tenhangve` (`tenhangve`)
) ENGINE=InnoDB;

CREATE TABLE `tuyenbay` (
  `matuyenbay` int NOT NULL AUTO_INCREMENT,
  `masanbaydi` int NOT NULL,
  `masanbayden` int NOT NULL,
  PRIMARY KEY (`matuyenbay`),
  CONSTRAINT `FK_tuyenbay_sanbaydi` FOREIGN KEY (`masanbaydi`) REFERENCES `sanbay` (`masanbay`),
  CONSTRAINT `FK_tuyenbay_sanbayden` FOREIGN KEY (`masanbayden`) REFERENCES `sanbay` (`masanbay`)
) ENGINE=InnoDB;

CREATE TABLE `chitietchuyenbay` (
  `machuyenbay` int NOT NULL AUTO_INCREMENT,
  `matuyenbay` int NOT NULL,
  `sohieuchuyenbay` varchar(10) DEFAULT NULL,
  `ngaydi` date NOT NULL,
  `giodi` time(6) NOT NULL,
  `ngayden` date NOT NULL,
  `gioden` time(6) NOT NULL,
  `trangthai` varchar(20) DEFAULT 'Đang mở bán',
  `thoigianden_thucte` timestamp NULL DEFAULT NULL,
  `thoigiandi_thucte` timestamp NULL DEFAULT NULL,
  `lydodDelay` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`machuyenbay`),
  CONSTRAINT `FK_chitiet_tuyenbay` FOREIGN KEY (`matuyenbay`) REFERENCES `tuyenbay` (`matuyenbay`)
) ENGINE=InnoDB;

CREATE TABLE `chitietghe` (
  `maghe` int NOT NULL AUTO_INCREMENT,
  `machuyenbay` int DEFAULT NULL,
  `mahangve` int DEFAULT NULL,
  PRIMARY KEY (`maghe`),
  CONSTRAINT `FK_ghe_chuyenbay` FOREIGN KEY (`machuyenbay`) REFERENCES `chitietchuyenbay` (`machuyenbay`),
  CONSTRAINT `FK_ghe_hangve` FOREIGN KEY (`mahangve`) REFERENCES `hangve` (`mahangve`)
) ENGINE=InnoDB;

CREATE TABLE `hanhkhach` (
  `mahanhkhach` int NOT NULL AUTO_INCREMENT,
  `hovaten` varchar(50),
  `ngaysinh` date,
  `gioitinh` varchar(10) DEFAULT NULL,
  `sodienthoai` varchar(20),
  `email` varchar(100),
  `madinhdanh` varchar(50) DEFAULT NULL,
  `diachi` varchar(255) DEFAULT NULL,
  `quocgia` varchar(100),
  PRIMARY KEY (`mahanhkhach`),
  UNIQUE KEY `UK_sodienthoai` (`sodienthoai`),
  UNIQUE KEY `UK_email_hanhkhach` (`email`)
) ENGINE=InnoDB;

CREATE TABLE `taikhoan` (
  `mataikhoan` int NOT NULL AUTO_INCREMENT,
  `mahanhkhach` int NOT NULL,
  `email` varchar(100) NOT NULL,
  `matkhaubam` varchar(255) NOT NULL,
  `trangthai` varchar(20) NOT NULL,
  `ngaytao` datetime(6) NOT NULL,
  `email_verified` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`mataikhoan`),
  UNIQUE KEY `UK_email_taikhoan` (`email`),
  UNIQUE KEY `UK_mahanhkhach` (`mahanhkhach`),
  CONSTRAINT `FK_taikhoan_hanhkhach` FOREIGN KEY (`mahanhkhach`) REFERENCES `hanhkhach` (`mahanhkhach`)
) ENGINE=InnoDB;

CREATE TABLE `datcho` (
  `madatcho` int NOT NULL AUTO_INCREMENT,
  `maghe` int DEFAULT NULL,
  `mahanhkhach` int DEFAULT NULL,
  `ngaydatcho` date NOT NULL,
  `checkin_status` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0: chưa check-in, 1: đã check-in',
  `checkin_time` datetime DEFAULT NULL COMMENT 'Thời gian check-in',
  PRIMARY KEY (`madatcho`),
  UNIQUE KEY `UK_maghe` (`maghe`),
  CONSTRAINT `FK_datcho_hanhkhach` FOREIGN KEY (`mahanhkhach`) REFERENCES `hanhkhach` (`mahanhkhach`),
  CONSTRAINT `FK_datcho_ghe` FOREIGN KEY (`maghe`) REFERENCES `chitietghe` (`maghe`)
) ENGINE=InnoDB;

CREATE TABLE `dichvucungcap` (
  `madichvu` int NOT NULL AUTO_INCREMENT,
  `tendichvu` varchar(100) NOT NULL,
  `mota` varchar(255),
  `anh` varchar(255),
  PRIMARY KEY (`madichvu`)
) ENGINE=InnoDB;

CREATE TABLE `dichvuchuyenbay` (
  `machuyenbay` int NOT NULL,
  `madichvu` int NOT NULL,
  PRIMARY KEY (`machuyenbay`,`madichvu`),
  CONSTRAINT `FK_dvcb_chuyenbay` FOREIGN KEY (`machuyenbay`) REFERENCES `chitietchuyenbay` (`machuyenbay`),
  CONSTRAINT `FK_dvcb_dichvu` FOREIGN KEY (`madichvu`) REFERENCES `dichvucungcap` (`madichvu`)
) ENGINE=InnoDB;

CREATE TABLE `giachuyenbay` (
  `magia` int NOT NULL AUTO_INCREMENT,
  `matuyenbay` int NOT NULL,
  `mahangve` int NOT NULL,
  `giave` decimal(10,2) NOT NULL,
  `ngayapdungtu` date NOT NULL,
  `ngayapdungden` date DEFAULT NULL,
  PRIMARY KEY (`magia`),
  CONSTRAINT `FK_gia_tuyenbay` FOREIGN KEY (`matuyenbay`) REFERENCES `tuyenbay` (`matuyenbay`),
  CONSTRAINT `FK_gia_hangve` FOREIGN KEY (`mahangve`) REFERENCES `hangve` (`mahangve`)
) ENGINE=InnoDB;

CREATE TABLE `luachondichvu` (
  `maluachon` int NOT NULL AUTO_INCREMENT,
  `madichvu` int DEFAULT NULL,
  `tenluachon` varchar(100) NOT NULL,
  `mota` varchar(255) DEFAULT NULL,
  `gia` decimal(10,2) NOT NULL,
  `anh` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`maluachon`),
  CONSTRAINT `FK_luachon_dichvu` FOREIGN KEY (`madichvu`) REFERENCES `dichvucungcap` (`madichvu`)
) ENGINE=InnoDB;

CREATE TABLE `trangthaithanhtoan` (
  `mathanhtoan` int NOT NULL AUTO_INCREMENT,
  `madatcho` int DEFAULT NULL,
  `sotien` decimal(10,2) NOT NULL,
  `dathanhtoan` char(1) NOT NULL,
  `ngayhethan` date DEFAULT NULL,
  PRIMARY KEY (`mathanhtoan`),
  UNIQUE KEY `UK_madatcho` (`madatcho`),
  CONSTRAINT `FK_thanhtoan_datcho` FOREIGN KEY (`madatcho`) REFERENCES `datcho` (`madatcho`)
) ENGINE=InnoDB;

CREATE TABLE `datchodichvu` (
  `madatcho` int NOT NULL,
  `maluachon` int NOT NULL,
  `soluong` int NOT NULL,
  `dongia` decimal(10,2) NOT NULL,
  PRIMARY KEY (`madatcho`,`maluachon`),
  CONSTRAINT `FK_dcdv_datcho` FOREIGN KEY (`madatcho`) REFERENCES `datcho` (`madatcho`),
  CONSTRAINT `FK_dcdv_luachon` FOREIGN KEY (`maluachon`) REFERENCES `luachondichvu` (`maluachon`)
) ENGINE=InnoDB;

CREATE TABLE `taikhoanadmin` (
  `mataikhoan` INT NOT NULL AUTO_INCREMENT,
  `tendangnhap` VARCHAR(50) NOT NULL,
  `matkhaubam` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `hovaten` VARCHAR(100) DEFAULT NULL,
  `ngaytao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`mataikhoan`),
  UNIQUE KEY `UK_tendangnhap` (`tendangnhap`),
  UNIQUE KEY `UK_email_quantri` (`email`)
) ENGINE=InnoDB;

-- Tạo bảng email_verification_token
CREATE TABLE `email_verification_token` (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    expiry_date DATETIME NOT NULL,
    used TINYINT(1) NOT NULL DEFAULT 0,
    created_date DATETIME NOT NULL,
    INDEX idx_token (token),
    INDEX idx_email (email),
    INDEX idx_expiry (expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE taikhoan ADD COLUMN oauth2_provider VARCHAR(20) NULL;