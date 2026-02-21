-- ========================================
-- DỮ LIỆU MẪU ĐỂ TEST CHỨC NĂNG THỐNG KÊ
-- ========================================
-- Chạy script này để thêm dữ liệu mẫu cho thống kê
-- Lưu ý: Script này chỉ dùng cho development/testing

-- Set session variables để dễ dàng chèn dữ liệu
SET @current_date = CURDATE();
SET @past_date_30 = DATE_SUB(@current_date, INTERVAL 30 DAY);
SET @past_date_15 = DATE_SUB(@current_date, INTERVAL 15 DAY);
SET @past_date_7 = DATE_SUB(@current_date, INTERVAL 7 DAY);
SET @past_date_1 = DATE_SUB(@current_date, INTERVAL 1 DAY);

-- ========================================
-- 1. DỮ LIỆU CHO THỐNG KÊ DOANH THU THEO NGÀY
-- ========================================

-- Thêm dữ liệu hóa đơn cho 30 ngày qua
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS insert_sample_hoadon()
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE random_date DATE;
    DECLARE random_amount DECIMAL(10,2);

    WHILE i < 50 DO
        SET random_date = DATE_SUB(@current_date, INTERVAL FLOOR(RAND() * 30) DAY);
        SET random_amount = 1000000 + (FLOOR(RAND() * 10) * 500000);

        INSERT IGNORE INTO hoadon (madonhang, sohoadon, ngaylap, ngayhachtoan, tongtien, thuevat, tongthanhtoan, trangthai, nguoi_lap, ghi_chu, created_at, updated_at, da_xoa)
        VALUES (
            (SELECT madonhang FROM donhang WHERE trangthai = 'ĐÃ THANH TOÁN' AND da_xoa = 0 ORDER BY RAND() LIMIT 1),
            CONCAT('HD-', DATE_FORMAT(random_date, '%Y%m%d'), '-', LPAD(i + 1, 4, '0')),
            random_date,
            random_date,
            random_amount * 0.9,
            random_amount * 0.1,
            random_amount,
            'DA_PHAT_HANH',
            'System',
            'Dữ liệu test',
            NOW(),
            NOW(),
            0
        );

        SET i = i + 1;
    END WHILE;
END$$
DELIMITER ;

CALL insert_sample_hoadon();
DROP PROCEDURE insert_sample_hoadon;

-- ========================================
-- 2. DỮ LIỆU CHO THỐNG KÊ TOP CHẶNG BAY
-- ========================================

-- Đảm bảo có sẵn các sân bay
INSERT IGNORE INTO sanbay (masanbay, ma_iata, ma_icao, tensanbay, thanhphosanbay, quocgiasanbay, trangthaihoatdong, da_xoa) VALUES
(1, 'HAN', 'VVNB', 'Sân bay Nội Bài', 'Hà Nội', 'Việt Nam', 'ACTIVE', 0),
(2, 'SGN', 'VVTS', 'Sân bay Tân Sơn Nhất', 'TP. Hồ Chí Minh', 'Việt Nam', 'ACTIVE', 0),
(3, 'DAD', 'VVDN', 'Sân bay Đà Nẵng', 'Đà Nẵng', 'Việt Nam', 'ACTIVE', 0),
(4, 'CXR', 'VVCR', 'Sân bay Cam Ranh', 'Nha Trang', 'Việt Nam', 'ACTIVE', 0),
(5, 'PQC', 'VVPC', 'Sân bay Phú Quốc', 'Phú Quốc', 'Việt Nam', 'ACTIVE', 0),
(6, 'HUI', 'VVTH', 'Sân bay Phú Bài', 'Huế', 'Việt Nam', 'ACTIVE', 0),
(7, 'VII', 'VVCS', 'Sân bay Côn Đảo', 'Côn Đảo', 'Việt Nam', 'ACTIVE', 0),
(8, 'UIH', 'VVDH', 'Sân bay Điện Biên', 'Điện Biên Phủ', 'Việt Nam', 'ACTIVE', 0);

-- Thêm các tuyến bay phổ biến
INSERT IGNORE INTO tuyenbay (matuyenbay, masanbaydi, masanbayden, da_xoa) VALUES
(1, 1, 2, 0),  -- HAN -> SGN
(2, 2, 1, 0),  -- SGN -> HAN
(3, 1, 3, 0),  -- HAN -> DAD
(4, 2, 3, 0),  -- SGN -> DAD
(5, 1, 4, 0),  -- HAN -> CXR
(6, 2, 4, 0),  -- SGN -> CXR
(7, 1, 5, 0),  -- HAN -> PQC
(8, 2, 5, 0),  -- SGN -> PQC
(9, 3, 5, 0),  -- DAD -> PQC
(10, 3, 6, 0); -- DAD -> HUI

-- ========================================
-- 3. DỮ LIỆU CHO THỐNG KÊ HÃNG HÀNG KHÔNG
-- ========================================

-- Đảm bảo có máy bay với các hãng khác nhau
INSERT IGNORE INTO maybay (mamaybay, tenmaybay, hangmaybay, loaimaybay, sohieu, tongsoghe, trangthai, namkhaithac, da_xoa) VALUES
(1, 'Boeing 737-800', 'Vietnam Airlines', 'Boeing 737', 'VN-A101', 180, 'Active', 2015, 0),
(2, 'Airbus A321', 'Vietnam Airlines', 'Airbus A320', 'VN-A201', 200, 'Active', 2018, 0),
(3, 'Airbus A320', 'Vietjet Air', 'Airbus A320', 'VJ-A101', 180, 'Active', 2019, 0),
(4, 'Airbus A321', 'Vietjet Air', 'Airbus A321', 'VJ-A201', 220, 'Active', 2020, 0),
(5, 'Embraer ERJ-190', 'Bamboo Airways', 'Embraer E190', 'BH-A101', 100, 'Active', 2021, 0),
(6, 'Airbus A320', 'Bamboo Airways', 'Airbus A320', 'BH-A201', 180, 'Active', 2020, 0),
(7, 'Boeing 787-9', 'Vietnam Airlines', 'Boeing 787', 'VN-A301', 300, 'Active', 2017, 0),
(8, 'Airbus A350', 'Vietnam Airlines', 'Airbus A350', 'VN-A401', 350, 'Active', 2019, 0);

-- ========================================
-- 4. DỮ LIỆU CHO THỐNG KÊ TRẠNG THÁI ĐƠN HÀNG
-- ========================================

DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS insert_sample_donhang()
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE random_date DATE;
    DECLARE random_status VARCHAR(50);

    WHILE i < 30 DO
        SET random_date = DATE_SUB(@current_date, INTERVAL FLOOR(RAND() * 30) DAY);

        CASE FLOOR(RAND() * 4)
            WHEN 0 THEN SET random_status = 'ĐÃ THANH TOÁN';
            WHEN 1 THEN SET random_status = 'ĐÃ THANH TOÁN';
            WHEN 2 THEN SET random_status = 'CHỜ THANH TOÁN';
            WHEN 3 THEN SET random_status = 'ĐÃ HỦY';
        END CASE;

        INSERT IGNORE INTO donhang (pnr, mahanhkhach_nguoidat, ngaydat, tonggia, trangthai, email_nguoidat, sodienthoai_nguoidat, ghichu, created_at, updated_at, da_xoa)
        VALUES (
            CONCAT('ABC', LPAD(FLOOR(RAND() * 10000), 4, '0')),
            (SELECT mahanhkhach FROM hanhkhach WHERE da_xoa = 0 ORDER BY RAND() LIMIT 1),
            random_date,
            1000000 + (FLOOR(RAND() * 5) * 500000),
            random_status,
            'test@example.com',
            '0901234567',
            'Dữ liệu test',
            NOW(),
            NOW(),
            0
        );

        SET i = i + 1;
    END WHILE;
END$$
DELIMITER ;

CALL insert_sample_donhang();
DROP PROCEDURE insert_sample_donhang();

-- ========================================
-- 5. DỮ LIỆU CHO THỐNG KÊ KHUNG GIỜ CAO ĐIỂM
-- ========================================

DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS insert_sample_datcho_khunggio()
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE random_date DATETIME;
    DECLARE random_day_offset INT;
    DECLARE random_hour INT;

    WHILE i < 100 DO
        SET random_day_offset = FLOOR(RAND() * 30);
        SET random_hour = FLOOR(RAND() * 24);
        SET random_date = DATE_SUB(DATE_FORMAT(@current_date, '%Y-%m-%d'), INTERVAL random_day_offset DAY);
        SET random_date = DATE_ADD(random_date, INTERVAL random_hour HOUR);
        SET random_date = DATE_ADD(random_date, INTERVAL FLOOR(RAND() * 60) MINUTE);

        INSERT IGNORE INTO datcho (madonhang, mahanhkhach, machuyenbay, mahangve, giave, maghe_da_chon, ngaydatcho, trangthai, checkin_status, da_xoa)
        VALUES (
            (SELECT madonhang FROM donhang WHERE da_xoa = 0 ORDER BY RAND() LIMIT 1),
            (SELECT mahanhkhach FROM hanhkhach WHERE da_xoa = 0 ORDER BY RAND() LIMIT 1),
            (SELECT machuyenbay FROM chitietchuyenbay WHERE da_xoa = 0 ORDER BY RAND() LIMIT 1),
            (SELECT mahangve FROM hangve WHERE da_xoa = 0 ORDER BY RAND() LIMIT 1),
            1000000 + (FLOOR(RAND() * 5) * 200000),
            (SELECT maghe FROM chitietghe WHERE da_xoa = 0 ORDER BY RAND() LIMIT 1),
            random_date,
            'ACTIVE',
            0,
            0
        );

        SET i = i + 1;
    END WHILE;
END$$
DELIMITER ;

CALL insert_sample_datcho_khunggio();
DROP PROCEDURE insert_sample_datcho_khunggio();

-- ========================================
-- 6. DỮ LIỆU CHO THỐNG KÊ TỶ LỆ CHUYỂN ĐỔI
-- ========================================

-- Đảm bảo có đủ các trạng thái chuyển đổi
-- Đã có dữ liệu từ các procedure trên

-- ========================================
-- 7. DỮ LIỆU CHO SO SÁNH CÙNG KỲ
-- ========================================

-- Thêm thêm dữ liệu cho tháng trước
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS insert_sample_hoadon_last_month()
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE random_date DATE;
    DECLARE random_amount DECIMAL(10,2);

    WHILE i < 30 DO
        SET random_date = DATE_SUB(@past_date_30, INTERVAL FLOOR(RAND() * 30) DAY);
        SET random_amount = 800000 + (FLOOR(RAND() * 8) * 400000);

        INSERT IGNORE INTO hoadon (madonhang, sohoadon, ngaylap, ngayhachtoan, tongtien, thuevat, tongthanhtoan, trangthai, nguoi_lap, ghi_chu, created_at, updated_at, da_xoa)
        VALUES (
            (SELECT madonhang FROM donhang WHERE trangthai = 'ĐÃ THANH TOÁN' AND da_xoa = 0 ORDER BY RAND() LIMIT 1),
            CONCAT('HD-', DATE_FORMAT(random_date, '%Y%m%d'), '-', LPAD(i + 100, 4, '0')),
            random_date,
            random_date,
            random_amount * 0.9,
            random_amount * 0.1,
            random_amount,
            'DA_PHAT_HANH',
            'System',
            'Dữ liệu test tháng trước',
            NOW(),
            NOW(),
            0
        );

        SET i = i + 1;
    END WHILE;
END$$
DELIMITER ;

CALL insert_sample_hoadon_last_month();
DROP PROCEDURE insert_sample_hoadon_last_month();

-- ========================================
-- XÓA DỮ LIỆU TEST (OPTIONAL - Chạy khi muốn xóa)
-- ========================================
-- DELETE FROM hoadon WHERE nguoi_lap = 'System';
-- DELETE FROM donhang WHERE email_nguoidat = 'test@example.com';

SELECT 'Đã thêm dữ liệu mẫu cho thống kê thành công!' AS Message;
SELECT COUNT(*) AS 'Số hóa đơn' FROM hoadon WHERE nguoi_lap = 'System';
SELECT COUNT(*) AS 'Số đơn hàng test' FROM donhang WHERE email_nguoidat = 'test@example.com';
