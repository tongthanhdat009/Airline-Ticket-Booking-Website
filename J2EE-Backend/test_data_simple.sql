-- ========================================
-- DỮ LIỆU TEST ĐƠN GIẢN CHO THỐNG KÊ
-- Chạy script này trực tiếp trên MySQL database
-- ========================================

USE datvemaybay;

-- 1. Thêm hóa đơn mẫu cho các ngày gần đây
INSERT INTO hoadon (madonhang, sohoadon, ngaylap, ngayhachtoan, tongtien, thuevat, tongthanhtoan, trangthai, nguoi_lap, ghi_chu, created_at, updated_at, da_xoa)
SELECT
    madonhang,
    CONCAT('HD', DATE_FORMAT(CURDATE() - INTERVAL FLOOR(RAND() * 30) DAY, '%Y%m%d'), LPAD(madonhang, 6, '0')) AS sohoadon,
    CURDATE() - INTERVAL FLOOR(RAND() * 30) DAY AS ngaylap,
    CURDATE() - INTERVAL FLOOR(RAND() * 30) DAY AS ngayhachtoan,
    (1000000 + FLOOR(RAND() * 10) * 500000) AS tongtien,
    (100000 + FLOOR(RAND() * 10) * 50000) AS thuevat,
    (1100000 + FLOOR(RAND() * 10) * 550000) AS tongthanhtoan,
    'DA_PHAT_HANH' AS trangthai,
    'System' AS nguoi_lap,
    'Test data' AS ghi_chu,
    NOW() AS created_at,
    NOW() AS updated_at,
    0 AS da_xoa
FROM donhang
WHERE trangthai = 'ĐÃ THANH TOÁN'
AND da_xoa = 0
LIMIT 50
ON DUPLICATE KEY UPDATE tongthanhtoan = VALUES(tongthanhtoan);

-- 2. Thêm đơn hàng mẫu với các trạng thái khác nhau
INSERT INTO donhang (pnr, mahanhkhach_nguoidat, ngaydat, tonggia, trangthai, email_nguoidat, sodienthoai_nguoidat, ghichu, created_at, updated_at, da_xoa)
SELECT
    CONCAT('TEST', LPAD(madonhang + 1000, 6, '0')) AS pnr,
    mahanhkhach_nguoidat,
    CURDATE() - INTERVAL FLOOR(RAND() * 30) DAY AS ngaydat,
    (1000000 + FLOOR(RAND() * 5) * 500000) AS tonggia,
    CASE FLOOR(RAND() * 3)
        WHEN 0 THEN 'ĐÃ THANH TOÁN'
        WHEN 1 THEN 'CHỜ THANH TOÁN'
        ELSE 'ĐÃ HỦY'
    END AS trangthai,
    'test@example.com' AS email_nguoidat,
    '0901234567' AS sodienthoai_nguoidat,
    'Test data' AS ghichu,
    NOW() AS created_at,
    NOW() AS updated_at,
    0 AS da_xoa
FROM donhang
WHERE da_xoa = 0
LIMIT 30
ON DUPLICATE KEY UPDATE trangthai = VALUES(trangthai);

-- 3. Thêm đặt chỗ mẫu cho thống kê khung giờ
INSERT INTO datcho (madonhang, mahanhkhach, machuyenbay, mahangve, giave, maghe_da_chon, ngaydatcho, trangthai, checkin_status, da_xoa)
SELECT
    dh.madonhang,
    dh.mahanhkhach_nguoidat,
    (SELECT machuyenbay FROM chitietchuyenbay WHERE da_xoa = 0 ORDER BY RAND() LIMIT 1),
    (SELECT mahangve FROM hangve WHERE da_xoa = 0 ORDER BY RAND() LIMIT 1),
    (800000 + FLOOR(RAND() * 8) * 200000) AS giave,
    (SELECT maghe FROM chitietghe WHERE da_xoa = 0 ORDER BY RAND() LIMIT 1),
    TIMESTAMP(CURDATE() - INTERVAL FLOOR(RAND() * 30) DAY, INTERVAL FLOOR(RAND() * 24) HOUR, INTERVAL FLOOR(RAND() * 60) MINUTE) AS ngaydatcho,
    'ACTIVE' AS trangthai,
    0 AS checkin_status,
    0 AS da_xoa
FROM donhang dh
WHERE dh.da_xoa = 0
LIMIT 100
ON DUPLICATE KEY UPDATE ngaydatcho = VALUES(ngaydatcho);

-- Kiểm tra kết quả
SELECT 'Đã thêm dữ liệu test!' AS Message;
SELECT
    'Hóa đơn' AS Loai,
    COUNT(*) AS So_luong
FROM hoadon WHERE nguoi_lap = 'System'
UNION ALL
SELECT
    'Đơn hàng' AS Loai,
    COUNT(*) AS So_luong
FROM donhang WHERE email_nguoidat = 'test@example.com'
UNION ALL
SELECT
    'Đặt chỗ' AS Loai,
    COUNT(*) AS So_luong
FROM datcho WHERE madatcho > 10000;
