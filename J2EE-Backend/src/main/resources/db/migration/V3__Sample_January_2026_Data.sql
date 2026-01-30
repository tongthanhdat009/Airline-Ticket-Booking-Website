-- =================================================================
-- FLYWAY MIGRATION V3: Sample Data for January 2026
-- Description: Add sample booking/payment data for testing statistics in current period
-- =================================================================

-- 1. Thêm đơn hàng trong tháng 1/2026
INSERT INTO `donhang` (`pnr`, `mahanhkhach_nguoidat`, `ngaydat`, `tonggia`, `trangthai`, `email_nguoidat`, `sodienthoai_nguoidat`, `ghichu`, `created_at`, `updated_at`, `da_xoa`, `deleted_at`) VALUES
('JAN101', 1, '2026-01-24 09:00:00', 3500000.00, 'ĐÃ THANH TOÁN', 'nguyenvana@example.com', '0909123456', 'Đặt vé SGN-HAN tháng 1/2026', '2026-01-24 09:00:00', '2026-01-24 09:00:00', 0, NULL),
('JAN102', 2, '2026-01-25 10:30:00', 2500000.00, 'ĐÃ THANH TOÁN', 'tranthib@example.com', '0987654321', 'Đặt vé HAN-DAD tháng 1/2026', '2026-01-25 10:30:00', '2026-01-25 10:30:00', 0, NULL),
('JAN103', 3, '2026-01-26 14:00:00', 4000000.00, 'ĐÃ THANH TOÁN', 'levanc@example.com', '0912345678', 'Đặt vé SGN-DAD tháng 1/2026', '2026-01-26 14:00:00', '2026-01-26 14:00:00', 0, NULL),
('JAN104', 4, '2026-01-27 11:15:00', 1800000.00, 'CHỜ THANH TOÁN', 'phamthid@example.com', '0987654322', 'Đặt vé DAD-HAN tháng 1/2026', '2026-01-27 11:15:00', '2026-01-27 11:15:00', 0, NULL),
('JAN105', 5, '2026-01-28 08:30:00', 5500000.00, 'ĐÃ THANH TOÁN', 'hoangmine@example.com', '0909876543', 'Đặt vé SGN-HAN khứ hồi', '2026-01-28 08:30:00', '2026-01-28 08:30:00', 0, NULL),
('JAN106', 6, '2026-01-29 16:00:00', 2200000.00, 'ĐÃ THANH TOÁN', 'nguyenthif@example.com', '0976543210', 'Đặt vé HAN-SGN tháng 1/2026', '2026-01-29 16:00:00', '2026-01-29 16:00:00', 0, NULL),
('JAN107', 7, '2026-01-30 07:45:00', 3000000.00, 'ĐÃ THANH TOÁN', 'tranvang@example.com', '0965432109', 'Đặt vé SGN-DAD hôm nay', '2026-01-30 07:45:00', '2026-01-30 07:45:00', 0, NULL),
('JAN108', 1, '2026-01-30 12:00:00', 1500000.00, 'ĐÃ HỦY', 'nguyenvana@example.com', '0909123456', 'Đặt vé đã hủy', '2026-01-30 12:00:00', '2026-01-30 12:00:00', 0, NULL);

-- Lấy MAX madonhang để tham chiếu
SET @dh_jan101 = (SELECT madonhang FROM donhang WHERE pnr = 'JAN101');
SET @dh_jan102 = (SELECT madonhang FROM donhang WHERE pnr = 'JAN102');
SET @dh_jan103 = (SELECT madonhang FROM donhang WHERE pnr = 'JAN103');
SET @dh_jan104 = (SELECT madonhang FROM donhang WHERE pnr = 'JAN104');
SET @dh_jan105 = (SELECT madonhang FROM donhang WHERE pnr = 'JAN105');
SET @dh_jan106 = (SELECT madonhang FROM donhang WHERE pnr = 'JAN106');
SET @dh_jan107 = (SELECT madonhang FROM donhang WHERE pnr = 'JAN107');
SET @dh_jan108 = (SELECT madonhang FROM donhang WHERE pnr = 'JAN108');

-- 2. Thêm đặt chỗ cho các đơn hàng mới
INSERT INTO `datcho` (`madonhang`, `mahanhkhach`, `machuyenbay`, `mahangve`, `giave`, `maghe_da_chon`, `ngaydatcho`, `trangthai`, `checkin_status`, `checkin_time`, `da_xoa`, `deleted_at`) VALUES
(@dh_jan101, 1, 10, 1, 1200000.00, 13, '2026-01-24 09:00:00', 'ACTIVE', 1, '2026-01-30 06:00:00', 0, NULL),
(@dh_jan101, 2, 10, 1, 1200000.00, 14, '2026-01-24 09:00:00', 'ACTIVE', 1, '2026-01-30 06:05:00', 0, NULL),
(@dh_jan102, 2, 11, 2, 1000000.00, 25, '2026-01-25 10:30:00', 'ACTIVE', 0, NULL, 0, NULL),
(@dh_jan102, 3, 11, 1, 1200000.00, 26, '2026-01-25 10:30:00', 'ACTIVE', 0, NULL, 0, NULL),
(@dh_jan103, 3, 13, 4, 4000000.00, 93, '2026-01-26 14:00:00', 'ACTIVE', 0, NULL, 0, NULL),
(@dh_jan104, 4, 14, 1, 1200000.00, 15, '2026-01-27 11:15:00', 'ACTIVE', 0, NULL, 0, NULL),
(@dh_jan105, 5, 15, 4, 4000000.00, 94, '2026-01-28 08:30:00', 'ACTIVE', 0, NULL, 0, NULL),
(@dh_jan105, 5, 4, 1, 1200000.00, 16, '2026-01-28 08:30:00', 'ACTIVE', 0, NULL, 0, NULL),
(@dh_jan106, 6, 4, 2, 1000000.00, 27, '2026-01-29 16:00:00', 'ACTIVE', 0, NULL, 0, NULL),
(@dh_jan106, 6, 4, 1, 1200000.00, 17, '2026-01-29 16:00:00', 'ACTIVE', 0, NULL, 0, NULL),
(@dh_jan107, 7, 19, 3, 2000000.00, 45, '2026-01-30 07:45:00', 'ACTIVE', 0, NULL, 0, NULL),
(@dh_jan107, 7, 19, 1, 1000000.00, 18, '2026-01-30 07:45:00', 'ACTIVE', 0, NULL, 0, NULL),
(@dh_jan108, 1, 19, 1, 1200000.00, 19, '2026-01-30 12:00:00', 'CANCELLED', 0, NULL, 0, NULL);

-- 3. Thêm trạng thái thanh toán (dathanhtoan = 1 cho đã thanh toán, 0 cho chưa)
INSERT INTO `trangthaithanhtoan` (`dathanhtoan`, `phuongthucthanhtoan`, `ngayhethan`, `sotien`, `madatcho`, `da_xoa`, `deleted_at`)
SELECT 
    1 AS dathanhtoan,
    'VNPAY' AS phuongthucthanhtoan,
    '2026-02-15' AS ngayhethan,
    dc.giave AS sotien,
    dc.madatcho,
    0 AS da_xoa,
    NULL AS deleted_at
FROM datcho dc
JOIN donhang dh ON dc.madonhang = dh.madonhang
WHERE dh.pnr IN ('JAN101', 'JAN102', 'JAN103', 'JAN105', 'JAN106', 'JAN107')
AND dc.trangthai = 'ACTIVE';

-- Thêm thanh toán chưa thanh toán cho JAN104
INSERT INTO `trangthaithanhtoan` (`dathanhtoan`, `phuongthucthanhtoan`, `ngayhethan`, `sotien`, `madatcho`, `da_xoa`, `deleted_at`)
SELECT 
    0 AS dathanhtoan,
    NULL AS phuongthucthanhtoan,
    '2026-02-10' AS ngayhethan,
    dc.giave AS sotien,
    dc.madatcho,
    0 AS da_xoa,
    NULL AS deleted_at
FROM datcho dc
JOIN donhang dh ON dc.madonhang = dh.madonhang
WHERE dh.pnr = 'JAN104';

-- 4. Thêm dịch vụ đã đặt cho một số booking
INSERT INTO `datchodichvu` (`madatcho`, `maluachon`, `soluong`, `dongia`)
SELECT dc.madatcho, 1, 1, 250000.00
FROM datcho dc
JOIN donhang dh ON dc.madonhang = dh.madonhang
WHERE dh.pnr IN ('JAN101', 'JAN103', 'JAN105')
  AND dc.madatcho NOT IN (SELECT madatcho FROM datchodichvu)
LIMIT 3;

INSERT INTO `datchodichvu` (`madatcho`, `maluachon`, `soluong`, `dongia`)
SELECT dc.madatcho, 3, 2, 150000.00
FROM datcho dc
JOIN donhang dh ON dc.madonhang = dh.madonhang
WHERE dh.pnr IN ('JAN105', 'JAN107')
  AND dc.madatcho NOT IN (SELECT dd.madatcho FROM datchodichvu dd WHERE dd.maluachon = 3)
LIMIT 2;

-- 5. Thêm ghế đã đặt
INSERT INTO `ghe_da_dat` (`machuyenbay`, `maghe`, `madatcho`, `thoigian_dat`)
SELECT dc.machuyenbay, dc.maghe_da_chon, dc.madatcho, dc.ngaydatcho
FROM datcho dc
JOIN donhang dh ON dc.madonhang = dh.madonhang
WHERE dh.pnr LIKE 'JAN1%'
  AND dc.maghe_da_chon IS NOT NULL
  AND dc.trangthai = 'ACTIVE';

-- 6. Thêm hóa đơn cho các đơn hàng đã thanh toán
INSERT INTO `hoadon` (`madonhang`, `sohoadon`, `ngaylap`, `ngayhachtoan`, `tongtien`, `thuevat`, `tongthanhtoan`, `trangthai`, `nguoi_lap`, `ghi_chu`, `created_at`, `updated_at`, `da_xoa`, `deleted_at`)
SELECT 
    dh.madonhang,
    CONCAT('HD', YEAR(dh.ngaydat), LPAD(MONTH(dh.ngaydat), 2, '0'), LPAD(dh.madonhang, 5, '0')) AS sohoadon,
    dh.ngaydat AS ngaylap,
    DATE(dh.ngaydat) AS ngayhachtoan,
    dh.tonggia AS tongtien,
    ROUND(dh.tonggia * 0.1, 2) AS thuevat,
    ROUND(dh.tonggia * 1.1, 2) AS tongthanhtoan,
    'DA_PHAT_HANH' AS trangthai,
    'System' AS nguoi_lap,
    dh.ghichu AS ghi_chu,
    dh.created_at,
    dh.updated_at,
    0 AS da_xoa,
    NULL AS deleted_at
FROM donhang dh
WHERE dh.pnr IN ('JAN101', 'JAN102', 'JAN103', 'JAN105', 'JAN106', 'JAN107')
AND dh.trangthai = 'ĐÃ THANH TOÁN';
