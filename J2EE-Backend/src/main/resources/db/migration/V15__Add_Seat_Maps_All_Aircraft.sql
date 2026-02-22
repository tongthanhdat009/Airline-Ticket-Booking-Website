-- =============================================================================
-- V15__Add_Seat_Maps_All_Aircraft.sql
-- Thêm sơ đồ ghế cho các máy bay chưa có (maybay 2 → 7)
-- Máy bay 1 (VN-A320, 180 ghế) đã có dữ liệu trong V2
--
-- Hạng vé:
--   1 = Economy        (hàng cuối)
--   2 = Economy Saver  (hàng giữa-cuối)
--   3 = Deluxe         (hàng giữa)
--   4 = Business       (hàng đầu-giữa)
--   5 = First Class    (hàng đầu)
--
-- Bố cục cột theo loại máy bay:
--   A320 / A321 / B737 → 3-3  (A B C | D E F)   6 cột
--   B787-9             → 3-3-3 (A B C | D E F | G H I) 9 cột – Phổ thông; Business 2-2-2
--   A350-900           → 3-3-3 (A B C | D E F | G H I) 9 cột
--   B777-300ER         → 3-4-3 (A B C | D E F G | H J K) 10 cột
--   A330-200           → 2-4-2 (A B | C D E F | G H) 8 cột
-- =============================================================================

-- =============================================================================
-- Máy bay 2: Boeing 737-800 (VN-B737) — 180 ghế, bố cục 3-3, 30 hàng
--   Rows  1-2  : First Class   (2 hàng × 6 = 12 ghế)  mahangve=5
--   Rows  3-6  : Business      (4 hàng × 6 = 24 ghế)  mahangve=4
--   Rows  7-14 : Deluxe        (8 hàng × 6 = 48 ghế)  mahangve=3
--   Rows 15-20 : Economy Saver (6 hàng × 6 = 36 ghế)  mahangve=2
--   Rows 21-30 : Economy       (10 hàng × 6 = 60 ghế) mahangve=1
--   Tổng: 12+24+48+36+60 = 180 ✓
-- =============================================================================
INSERT IGNORE INTO `chitietghe` (`mamaybay`, `mahangve`, `soghe`, `vitrighe`, `hang`, `cot`) VALUES
-- First Class (rows 1-2)
(2,5,'1A','WINDOW',1,'A'),(2,5,'1B','MIDDLE',1,'B'),(2,5,'1C','AISLE',1,'C'),
(2,5,'1D','AISLE',1,'D'),(2,5,'1E','MIDDLE',1,'E'),(2,5,'1F','WINDOW',1,'F'),
(2,5,'2A','WINDOW',2,'A'),(2,5,'2B','MIDDLE',2,'B'),(2,5,'2C','AISLE',2,'C'),
(2,5,'2D','AISLE',2,'D'),(2,5,'2E','MIDDLE',2,'E'),(2,5,'2F','WINDOW',2,'F'),
-- Business (rows 3-6)
(2,4,'3A','WINDOW',3,'A'),(2,4,'3B','MIDDLE',3,'B'),(2,4,'3C','AISLE',3,'C'),
(2,4,'3D','AISLE',3,'D'),(2,4,'3E','MIDDLE',3,'E'),(2,4,'3F','WINDOW',3,'F'),
(2,4,'4A','WINDOW',4,'A'),(2,4,'4B','MIDDLE',4,'B'),(2,4,'4C','AISLE',4,'C'),
(2,4,'4D','AISLE',4,'D'),(2,4,'4E','MIDDLE',4,'E'),(2,4,'4F','WINDOW',4,'F'),
(2,4,'5A','WINDOW',5,'A'),(2,4,'5B','MIDDLE',5,'B'),(2,4,'5C','AISLE',5,'C'),
(2,4,'5D','AISLE',5,'D'),(2,4,'5E','MIDDLE',5,'E'),(2,4,'5F','WINDOW',5,'F'),
(2,4,'6A','WINDOW',6,'A'),(2,4,'6B','MIDDLE',6,'B'),(2,4,'6C','AISLE',6,'C'),
(2,4,'6D','AISLE',6,'D'),(2,4,'6E','MIDDLE',6,'E'),(2,4,'6F','WINDOW',6,'F'),
-- Deluxe (rows 7-14)
(2,3,'7A','WINDOW',7,'A'),(2,3,'7B','MIDDLE',7,'B'),(2,3,'7C','AISLE',7,'C'),
(2,3,'7D','AISLE',7,'D'),(2,3,'7E','MIDDLE',7,'E'),(2,3,'7F','WINDOW',7,'F'),
(2,3,'8A','WINDOW',8,'A'),(2,3,'8B','MIDDLE',8,'B'),(2,3,'8C','AISLE',8,'C'),
(2,3,'8D','AISLE',8,'D'),(2,3,'8E','MIDDLE',8,'E'),(2,3,'8F','WINDOW',8,'F'),
(2,3,'9A','WINDOW',9,'A'),(2,3,'9B','MIDDLE',9,'B'),(2,3,'9C','AISLE',9,'C'),
(2,3,'9D','AISLE',9,'D'),(2,3,'9E','MIDDLE',9,'E'),(2,3,'9F','WINDOW',9,'F'),
(2,3,'10A','WINDOW',10,'A'),(2,3,'10B','MIDDLE',10,'B'),(2,3,'10C','AISLE',10,'C'),
(2,3,'10D','AISLE',10,'D'),(2,3,'10E','MIDDLE',10,'E'),(2,3,'10F','WINDOW',10,'F'),
(2,3,'11A','WINDOW',11,'A'),(2,3,'11B','MIDDLE',11,'B'),(2,3,'11C','AISLE',11,'C'),
(2,3,'11D','AISLE',11,'D'),(2,3,'11E','MIDDLE',11,'E'),(2,3,'11F','WINDOW',11,'F'),
(2,3,'12A','WINDOW',12,'A'),(2,3,'12B','MIDDLE',12,'B'),(2,3,'12C','AISLE',12,'C'),
(2,3,'12D','AISLE',12,'D'),(2,3,'12E','MIDDLE',12,'E'),(2,3,'12F','WINDOW',12,'F'),
(2,3,'13A','WINDOW',13,'A'),(2,3,'13B','MIDDLE',13,'B'),(2,3,'13C','AISLE',13,'C'),
(2,3,'13D','AISLE',13,'D'),(2,3,'13E','MIDDLE',13,'E'),(2,3,'13F','WINDOW',13,'F'),
(2,3,'14A','WINDOW',14,'A'),(2,3,'14B','MIDDLE',14,'B'),(2,3,'14C','AISLE',14,'C'),
(2,3,'14D','AISLE',14,'D'),(2,3,'14E','MIDDLE',14,'E'),(2,3,'14F','WINDOW',14,'F'),
-- Economy Saver (rows 15-20)
(2,2,'15A','WINDOW',15,'A'),(2,2,'15B','MIDDLE',15,'B'),(2,2,'15C','AISLE',15,'C'),
(2,2,'15D','AISLE',15,'D'),(2,2,'15E','MIDDLE',15,'E'),(2,2,'15F','WINDOW',15,'F'),
(2,2,'16A','WINDOW',16,'A'),(2,2,'16B','MIDDLE',16,'B'),(2,2,'16C','AISLE',16,'C'),
(2,2,'16D','AISLE',16,'D'),(2,2,'16E','MIDDLE',16,'E'),(2,2,'16F','WINDOW',16,'F'),
(2,2,'17A','WINDOW',17,'A'),(2,2,'17B','MIDDLE',17,'B'),(2,2,'17C','AISLE',17,'C'),
(2,2,'17D','AISLE',17,'D'),(2,2,'17E','MIDDLE',17,'E'),(2,2,'17F','WINDOW',17,'F'),
(2,2,'18A','WINDOW',18,'A'),(2,2,'18B','MIDDLE',18,'B'),(2,2,'18C','AISLE',18,'C'),
(2,2,'18D','AISLE',18,'D'),(2,2,'18E','MIDDLE',18,'E'),(2,2,'18F','WINDOW',18,'F'),
(2,2,'19A','WINDOW',19,'A'),(2,2,'19B','MIDDLE',19,'B'),(2,2,'19C','AISLE',19,'C'),
(2,2,'19D','AISLE',19,'D'),(2,2,'19E','MIDDLE',19,'E'),(2,2,'19F','WINDOW',19,'F'),
(2,2,'20A','WINDOW',20,'A'),(2,2,'20B','MIDDLE',20,'B'),(2,2,'20C','AISLE',20,'C'),
(2,2,'20D','AISLE',20,'D'),(2,2,'20E','MIDDLE',20,'E'),(2,2,'20F','WINDOW',20,'F'),
-- Economy (rows 21-30)
(2,1,'21A','WINDOW',21,'A'),(2,1,'21B','MIDDLE',21,'B'),(2,1,'21C','AISLE',21,'C'),
(2,1,'21D','AISLE',21,'D'),(2,1,'21E','MIDDLE',21,'E'),(2,1,'21F','WINDOW',21,'F'),
(2,1,'22A','WINDOW',22,'A'),(2,1,'22B','MIDDLE',22,'B'),(2,1,'22C','AISLE',22,'C'),
(2,1,'22D','AISLE',22,'D'),(2,1,'22E','MIDDLE',22,'E'),(2,1,'22F','WINDOW',22,'F'),
(2,1,'23A','WINDOW',23,'A'),(2,1,'23B','MIDDLE',23,'B'),(2,1,'23C','AISLE',23,'C'),
(2,1,'23D','AISLE',23,'D'),(2,1,'23E','MIDDLE',23,'E'),(2,1,'23F','WINDOW',23,'F'),
(2,1,'24A','WINDOW',24,'A'),(2,1,'24B','MIDDLE',24,'B'),(2,1,'24C','AISLE',24,'C'),
(2,1,'24D','AISLE',24,'D'),(2,1,'24E','MIDDLE',24,'E'),(2,1,'24F','WINDOW',24,'F'),
(2,1,'25A','WINDOW',25,'A'),(2,1,'25B','MIDDLE',25,'B'),(2,1,'25C','AISLE',25,'C'),
(2,1,'25D','AISLE',25,'D'),(2,1,'25E','MIDDLE',25,'E'),(2,1,'25F','WINDOW',25,'F'),
(2,1,'26A','WINDOW',26,'A'),(2,1,'26B','MIDDLE',26,'B'),(2,1,'26C','AISLE',26,'C'),
(2,1,'26D','AISLE',26,'D'),(2,1,'26E','MIDDLE',26,'E'),(2,1,'26F','WINDOW',26,'F'),
(2,1,'27A','WINDOW',27,'A'),(2,1,'27B','MIDDLE',27,'B'),(2,1,'27C','AISLE',27,'C'),
(2,1,'27D','AISLE',27,'D'),(2,1,'27E','MIDDLE',27,'E'),(2,1,'27F','WINDOW',27,'F'),
(2,1,'28A','WINDOW',28,'A'),(2,1,'28B','MIDDLE',28,'B'),(2,1,'28C','AISLE',28,'C'),
(2,1,'28D','AISLE',28,'D'),(2,1,'28E','MIDDLE',28,'E'),(2,1,'28F','WINDOW',28,'F'),
(2,1,'29A','WINDOW',29,'A'),(2,1,'29B','MIDDLE',29,'B'),(2,1,'29C','AISLE',29,'C'),
(2,1,'29D','AISLE',29,'D'),(2,1,'29E','MIDDLE',29,'E'),(2,1,'29F','WINDOW',29,'F'),
(2,1,'30A','WINDOW',30,'A'),(2,1,'30B','MIDDLE',30,'B'),(2,1,'30C','AISLE',30,'C'),
(2,1,'30D','AISLE',30,'D'),(2,1,'30E','MIDDLE',30,'E'),(2,1,'30F','WINDOW',30,'F');

-- =============================================================================
-- Máy bay 3: Airbus A321 (VJ-A321, VietJet) — 180 ghế, bố cục 3-3, 30 hàng
--   Rows  1-2  : First Class   (12 ghế) mahangve=5
--   Rows  3-6  : Business      (24 ghế) mahangve=4
--   Rows  7-14 : Deluxe        (48 ghế) mahangve=3
--   Rows 15-20 : Economy Saver (36 ghế) mahangve=2
--   Rows 21-30 : Economy       (60 ghế) mahangve=1
-- =============================================================================
INSERT IGNORE INTO `chitietghe` (`mamaybay`, `mahangve`, `soghe`, `vitrighe`, `hang`, `cot`) VALUES
-- First Class (rows 1-2)
(3,5,'1A','WINDOW',1,'A'),(3,5,'1B','MIDDLE',1,'B'),(3,5,'1C','AISLE',1,'C'),
(3,5,'1D','AISLE',1,'D'),(3,5,'1E','MIDDLE',1,'E'),(3,5,'1F','WINDOW',1,'F'),
(3,5,'2A','WINDOW',2,'A'),(3,5,'2B','MIDDLE',2,'B'),(3,5,'2C','AISLE',2,'C'),
(3,5,'2D','AISLE',2,'D'),(3,5,'2E','MIDDLE',2,'E'),(3,5,'2F','WINDOW',2,'F'),
-- Business (rows 3-6)
(3,4,'3A','WINDOW',3,'A'),(3,4,'3B','MIDDLE',3,'B'),(3,4,'3C','AISLE',3,'C'),
(3,4,'3D','AISLE',3,'D'),(3,4,'3E','MIDDLE',3,'E'),(3,4,'3F','WINDOW',3,'F'),
(3,4,'4A','WINDOW',4,'A'),(3,4,'4B','MIDDLE',4,'B'),(3,4,'4C','AISLE',4,'C'),
(3,4,'4D','AISLE',4,'D'),(3,4,'4E','MIDDLE',4,'E'),(3,4,'4F','WINDOW',4,'F'),
(3,4,'5A','WINDOW',5,'A'),(3,4,'5B','MIDDLE',5,'B'),(3,4,'5C','AISLE',5,'C'),
(3,4,'5D','AISLE',5,'D'),(3,4,'5E','MIDDLE',5,'E'),(3,4,'5F','WINDOW',5,'F'),
(3,4,'6A','WINDOW',6,'A'),(3,4,'6B','MIDDLE',6,'B'),(3,4,'6C','AISLE',6,'C'),
(3,4,'6D','AISLE',6,'D'),(3,4,'6E','MIDDLE',6,'E'),(3,4,'6F','WINDOW',6,'F'),
-- Deluxe (rows 7-14)
(3,3,'7A','WINDOW',7,'A'),(3,3,'7B','MIDDLE',7,'B'),(3,3,'7C','AISLE',7,'C'),
(3,3,'7D','AISLE',7,'D'),(3,3,'7E','MIDDLE',7,'E'),(3,3,'7F','WINDOW',7,'F'),
(3,3,'8A','WINDOW',8,'A'),(3,3,'8B','MIDDLE',8,'B'),(3,3,'8C','AISLE',8,'C'),
(3,3,'8D','AISLE',8,'D'),(3,3,'8E','MIDDLE',8,'E'),(3,3,'8F','WINDOW',8,'F'),
(3,3,'9A','WINDOW',9,'A'),(3,3,'9B','MIDDLE',9,'B'),(3,3,'9C','AISLE',9,'C'),
(3,3,'9D','AISLE',9,'D'),(3,3,'9E','MIDDLE',9,'E'),(3,3,'9F','WINDOW',9,'F'),
(3,3,'10A','WINDOW',10,'A'),(3,3,'10B','MIDDLE',10,'B'),(3,3,'10C','AISLE',10,'C'),
(3,3,'10D','AISLE',10,'D'),(3,3,'10E','MIDDLE',10,'E'),(3,3,'10F','WINDOW',10,'F'),
(3,3,'11A','WINDOW',11,'A'),(3,3,'11B','MIDDLE',11,'B'),(3,3,'11C','AISLE',11,'C'),
(3,3,'11D','AISLE',11,'D'),(3,3,'11E','MIDDLE',11,'E'),(3,3,'11F','WINDOW',11,'F'),
(3,3,'12A','WINDOW',12,'A'),(3,3,'12B','MIDDLE',12,'B'),(3,3,'12C','AISLE',12,'C'),
(3,3,'12D','AISLE',12,'D'),(3,3,'12E','MIDDLE',12,'E'),(3,3,'12F','WINDOW',12,'F'),
(3,3,'13A','WINDOW',13,'A'),(3,3,'13B','MIDDLE',13,'B'),(3,3,'13C','AISLE',13,'C'),
(3,3,'13D','AISLE',13,'D'),(3,3,'13E','MIDDLE',13,'E'),(3,3,'13F','WINDOW',13,'F'),
(3,3,'14A','WINDOW',14,'A'),(3,3,'14B','MIDDLE',14,'B'),(3,3,'14C','AISLE',14,'C'),
(3,3,'14D','AISLE',14,'D'),(3,3,'14E','MIDDLE',14,'E'),(3,3,'14F','WINDOW',14,'F'),
-- Economy Saver (rows 15-20)
(3,2,'15A','WINDOW',15,'A'),(3,2,'15B','MIDDLE',15,'B'),(3,2,'15C','AISLE',15,'C'),
(3,2,'15D','AISLE',15,'D'),(3,2,'15E','MIDDLE',15,'E'),(3,2,'15F','WINDOW',15,'F'),
(3,2,'16A','WINDOW',16,'A'),(3,2,'16B','MIDDLE',16,'B'),(3,2,'16C','AISLE',16,'C'),
(3,2,'16D','AISLE',16,'D'),(3,2,'16E','MIDDLE',16,'E'),(3,2,'16F','WINDOW',16,'F'),
(3,2,'17A','WINDOW',17,'A'),(3,2,'17B','MIDDLE',17,'B'),(3,2,'17C','AISLE',17,'C'),
(3,2,'17D','AISLE',17,'D'),(3,2,'17E','MIDDLE',17,'E'),(3,2,'17F','WINDOW',17,'F'),
(3,2,'18A','WINDOW',18,'A'),(3,2,'18B','MIDDLE',18,'B'),(3,2,'18C','AISLE',18,'C'),
(3,2,'18D','AISLE',18,'D'),(3,2,'18E','MIDDLE',18,'E'),(3,2,'18F','WINDOW',18,'F'),
(3,2,'19A','WINDOW',19,'A'),(3,2,'19B','MIDDLE',19,'B'),(3,2,'19C','AISLE',19,'C'),
(3,2,'19D','AISLE',19,'D'),(3,2,'19E','MIDDLE',19,'E'),(3,2,'19F','WINDOW',19,'F'),
(3,2,'20A','WINDOW',20,'A'),(3,2,'20B','MIDDLE',20,'B'),(3,2,'20C','AISLE',20,'C'),
(3,2,'20D','AISLE',20,'D'),(3,2,'20E','MIDDLE',20,'E'),(3,2,'20F','WINDOW',20,'F'),
-- Economy (rows 21-30)
(3,1,'21A','WINDOW',21,'A'),(3,1,'21B','MIDDLE',21,'B'),(3,1,'21C','AISLE',21,'C'),
(3,1,'21D','AISLE',21,'D'),(3,1,'21E','MIDDLE',21,'E'),(3,1,'21F','WINDOW',21,'F'),
(3,1,'22A','WINDOW',22,'A'),(3,1,'22B','MIDDLE',22,'B'),(3,1,'22C','AISLE',22,'C'),
(3,1,'22D','AISLE',22,'D'),(3,1,'22E','MIDDLE',22,'E'),(3,1,'22F','WINDOW',22,'F'),
(3,1,'23A','WINDOW',23,'A'),(3,1,'23B','MIDDLE',23,'B'),(3,1,'23C','AISLE',23,'C'),
(3,1,'23D','AISLE',23,'D'),(3,1,'23E','MIDDLE',23,'E'),(3,1,'23F','WINDOW',23,'F'),
(3,1,'24A','WINDOW',24,'A'),(3,1,'24B','MIDDLE',24,'B'),(3,1,'24C','AISLE',24,'C'),
(3,1,'24D','AISLE',24,'D'),(3,1,'24E','MIDDLE',24,'E'),(3,1,'24F','WINDOW',24,'F'),
(3,1,'25A','WINDOW',25,'A'),(3,1,'25B','MIDDLE',25,'B'),(3,1,'25C','AISLE',25,'C'),
(3,1,'25D','AISLE',25,'D'),(3,1,'25E','MIDDLE',25,'E'),(3,1,'25F','WINDOW',25,'F'),
(3,1,'26A','WINDOW',26,'A'),(3,1,'26B','MIDDLE',26,'B'),(3,1,'26C','AISLE',26,'C'),
(3,1,'26D','AISLE',26,'D'),(3,1,'26E','MIDDLE',26,'E'),(3,1,'26F','WINDOW',26,'F'),
(3,1,'27A','WINDOW',27,'A'),(3,1,'27B','MIDDLE',27,'B'),(3,1,'27C','AISLE',27,'C'),
(3,1,'27D','AISLE',27,'D'),(3,1,'27E','MIDDLE',27,'E'),(3,1,'27F','WINDOW',27,'F'),
(3,1,'28A','WINDOW',28,'A'),(3,1,'28B','MIDDLE',28,'B'),(3,1,'28C','AISLE',28,'C'),
(3,1,'28D','AISLE',28,'D'),(3,1,'28E','MIDDLE',28,'E'),(3,1,'28F','WINDOW',28,'F'),
(3,1,'29A','WINDOW',29,'A'),(3,1,'29B','MIDDLE',29,'B'),(3,1,'29C','AISLE',29,'C'),
(3,1,'29D','AISLE',29,'D'),(3,1,'29E','MIDDLE',29,'E'),(3,1,'29F','WINDOW',29,'F'),
(3,1,'30A','WINDOW',30,'A'),(3,1,'30B','MIDDLE',30,'B'),(3,1,'30C','AISLE',30,'C'),
(3,1,'30D','AISLE',30,'D'),(3,1,'30E','MIDDLE',30,'E'),(3,1,'30F','WINDOW',30,'F');

-- =============================================================================
-- Máy bay 4: Boeing 787-9 (VN-B789) — 280 ghế, bố cục 3-3-3, 32 hàng đủ
--   Rows  1-2  : First Class   (2×9=18 ghế → bỏ cột giữa I: 2×9=18)  mahangve=5
--   Rows  3-6  : Business      (4×9=36 ghế)   mahangve=4
--   Rows  7-16 : Deluxe        (10×9=90 ghế)  mahangve=3
--   Rows 17-22 : Economy Saver (6×9=54 ghế)   mahangve=2
--   Rows 23-... : Economy      còn lại         mahangve=1
--
--   Bố cục: A B C | D E F | G H I  (9 cột)
--   280 / 9 ≈ 31.1 → 18+36+90+54 = 198; Economy = 280-198 = 82 ghế
--   82 / 9 = 9 hàng đủ (81) + 1 ghế dư → dùng 10 hàng nhưng hàng cuối chỉ 1 ghế
--   Điều chỉnh: Economy Saver 54→54, Economy = 82 → hàng 23-31 (9 hàng=81) + 1 ghế ở hàng 32 Col A
--   Để đơn giản: điều chỉnh Economy Saver thêm 1 = 55? Không, ta dùng đúng 280:
--   First Class 18, Business 36, Deluxe 90, Economy Saver 54, Economy 82 = 280
--   Hàng Economy: rows 23-31 = 9 hàng × 9 = 81, hàng 32 thêm 1 ghế (chỉ col A) => không đẹp
--   → Điều chỉnh lại: Economy 9 hàng × 9 = 81, Economy Saver = 280-18-36-90-81=55 (rows 17-22=54, thêm 1 => rows 17-23=63 quá nhiều)
--   → Giải pháp sạch: First Class 2×9=18, Business 4×9=36, Deluxe 10×9=90, Economy Saver 6×9=54, Economy 10×9=90
--   = 18+36+90+54+90=288 > 280. Giảm Economy xuống còn 280-198=82 bằng cách bỏ hàng 32 cột G H I (3 ghế bỏ từ 90)
--   → Economy: rows 23-31 (9 hàng×9=81) + row 32 col A only = 82
--   Quá phức tạp. Sử dụng 280 ghế sạch với bố cục 31 hàng × 9 = 279 + 1 ghế:
--   → Tốt nhất: tongsoghe = 280 nhưng bố cục thực dùng 31 hàng đủ 9 cột (279) + 1 col thêm
--   → QUYẾT ĐỊNH ĐƠN GIẢN: sử dụng 32 hàng, hàng 1 chỉ có 7 ghế (bỏ H, I của hàng First Class đầu)
--   → Quá tùy tiện. QUYẾT ĐỊNH CUỐI: dùng đúng 280 ghế với 8 cột ở một số hàng
--
--   THIẾT KẾ THỰC TẾ B787-9 Vietnam Airlines (280 ghế):
--   First Class (mahangve=5): rows 1-2, layout 2-2-2 (6 ghế/hàng) → 2×6=12 ghế (cột A,B,D,E,G,H — bỏ C,F,I)
--   Business   (mahangve=4): rows 3-6, layout 2-3-2 (7 ghế/hàng) → 4×7=28 ghế (cột A,B,C,D,E,G,H)
--   Deluxe     (mahangve=3): rows 7-16, 9 ghế/hàng (3-3-3) → 10×9=90 ghế
--   Economy Saver(mahangve=2): rows 17-22, 9 ghế/hàng → 6×9=54 ghế
--   Economy    (mahangve=1): rows 23-32, 9 ghế*9 hàng + 7 ghế hàng 32 = 81+7=88 quá nhiều
--
--   ĐƠN GIẢN NHẤT: 280 = 4×9×hàng chia đều + phần dư nhỏ
--   Dùng: FC=12(rows1-2,6col), Bus=36(rows3-6,9col), Deluxe=90(rows7-16,9col),
--         EcoSaver=54(rows17-22,9col), Economy=88(rows23-32,9col nhưng hàng32=7col A-G bỏ H,I)
--   12+36+90+54+88=280 ✓
-- =============================================================================
INSERT IGNORE INTO `chitietghe` (`mamaybay`, `mahangve`, `soghe`, `vitrighe`, `hang`, `cot`) VALUES
-- First Class rows 1-2 (6 ghế/hàng: A B C D E F — bỏ G H I)
(4,5,'1A','WINDOW',1,'A'),(4,5,'1B','AISLE',1,'B'),(4,5,'1C','AISLE',1,'C'),
(4,5,'1D','AISLE',1,'D'),(4,5,'1E','AISLE',1,'E'),(4,5,'1F','WINDOW',1,'F'),
(4,5,'2A','WINDOW',2,'A'),(4,5,'2B','AISLE',2,'B'),(4,5,'2C','AISLE',2,'C'),
(4,5,'2D','AISLE',2,'D'),(4,5,'2E','AISLE',2,'E'),(4,5,'2F','WINDOW',2,'F'),
-- Business rows 3-6 (9 ghế/hàng: A B C | D E F | G H I)
(4,4,'3A','WINDOW',3,'A'),(4,4,'3B','MIDDLE',3,'B'),(4,4,'3C','AISLE',3,'C'),
(4,4,'3D','AISLE',3,'D'),(4,4,'3E','MIDDLE',3,'E'),(4,4,'3F','AISLE',3,'F'),
(4,4,'3G','AISLE',3,'G'),(4,4,'3H','MIDDLE',3,'H'),(4,4,'3I','WINDOW',3,'I'),
(4,4,'4A','WINDOW',4,'A'),(4,4,'4B','MIDDLE',4,'B'),(4,4,'4C','AISLE',4,'C'),
(4,4,'4D','AISLE',4,'D'),(4,4,'4E','MIDDLE',4,'E'),(4,4,'4F','AISLE',4,'F'),
(4,4,'4G','AISLE',4,'G'),(4,4,'4H','MIDDLE',4,'H'),(4,4,'4I','WINDOW',4,'I'),
(4,4,'5A','WINDOW',5,'A'),(4,4,'5B','MIDDLE',5,'B'),(4,4,'5C','AISLE',5,'C'),
(4,4,'5D','AISLE',5,'D'),(4,4,'5E','MIDDLE',5,'E'),(4,4,'5F','AISLE',5,'F'),
(4,4,'5G','AISLE',5,'G'),(4,4,'5H','MIDDLE',5,'H'),(4,4,'5I','WINDOW',5,'I'),
(4,4,'6A','WINDOW',6,'A'),(4,4,'6B','MIDDLE',6,'B'),(4,4,'6C','AISLE',6,'C'),
(4,4,'6D','AISLE',6,'D'),(4,4,'6E','MIDDLE',6,'E'),(4,4,'6F','AISLE',6,'F'),
(4,4,'6G','AISLE',6,'G'),(4,4,'6H','MIDDLE',6,'H'),(4,4,'6I','WINDOW',6,'I'),
-- Deluxe rows 7-16 (9 ghế/hàng)
(4,3,'7A','WINDOW',7,'A'),(4,3,'7B','MIDDLE',7,'B'),(4,3,'7C','AISLE',7,'C'),
(4,3,'7D','AISLE',7,'D'),(4,3,'7E','MIDDLE',7,'E'),(4,3,'7F','AISLE',7,'F'),
(4,3,'7G','AISLE',7,'G'),(4,3,'7H','MIDDLE',7,'H'),(4,3,'7I','WINDOW',7,'I'),
(4,3,'8A','WINDOW',8,'A'),(4,3,'8B','MIDDLE',8,'B'),(4,3,'8C','AISLE',8,'C'),
(4,3,'8D','AISLE',8,'D'),(4,3,'8E','MIDDLE',8,'E'),(4,3,'8F','AISLE',8,'F'),
(4,3,'8G','AISLE',8,'G'),(4,3,'8H','MIDDLE',8,'H'),(4,3,'8I','WINDOW',8,'I'),
(4,3,'9A','WINDOW',9,'A'),(4,3,'9B','MIDDLE',9,'B'),(4,3,'9C','AISLE',9,'C'),
(4,3,'9D','AISLE',9,'D'),(4,3,'9E','MIDDLE',9,'E'),(4,3,'9F','AISLE',9,'F'),
(4,3,'9G','AISLE',9,'G'),(4,3,'9H','MIDDLE',9,'H'),(4,3,'9I','WINDOW',9,'I'),
(4,3,'10A','WINDOW',10,'A'),(4,3,'10B','MIDDLE',10,'B'),(4,3,'10C','AISLE',10,'C'),
(4,3,'10D','AISLE',10,'D'),(4,3,'10E','MIDDLE',10,'E'),(4,3,'10F','AISLE',10,'F'),
(4,3,'10G','AISLE',10,'G'),(4,3,'10H','MIDDLE',10,'H'),(4,3,'10I','WINDOW',10,'I'),
(4,3,'11A','WINDOW',11,'A'),(4,3,'11B','MIDDLE',11,'B'),(4,3,'11C','AISLE',11,'C'),
(4,3,'11D','AISLE',11,'D'),(4,3,'11E','MIDDLE',11,'E'),(4,3,'11F','AISLE',11,'F'),
(4,3,'11G','AISLE',11,'G'),(4,3,'11H','MIDDLE',11,'H'),(4,3,'11I','WINDOW',11,'I'),
(4,3,'12A','WINDOW',12,'A'),(4,3,'12B','MIDDLE',12,'B'),(4,3,'12C','AISLE',12,'C'),
(4,3,'12D','AISLE',12,'D'),(4,3,'12E','MIDDLE',12,'E'),(4,3,'12F','AISLE',12,'F'),
(4,3,'12G','AISLE',12,'G'),(4,3,'12H','MIDDLE',12,'H'),(4,3,'12I','WINDOW',12,'I'),
(4,3,'13A','WINDOW',13,'A'),(4,3,'13B','MIDDLE',13,'B'),(4,3,'13C','AISLE',13,'C'),
(4,3,'13D','AISLE',13,'D'),(4,3,'13E','MIDDLE',13,'E'),(4,3,'13F','AISLE',13,'F'),
(4,3,'13G','AISLE',13,'G'),(4,3,'13H','MIDDLE',13,'H'),(4,3,'13I','WINDOW',13,'I'),
(4,3,'14A','WINDOW',14,'A'),(4,3,'14B','MIDDLE',14,'B'),(4,3,'14C','AISLE',14,'C'),
(4,3,'14D','AISLE',14,'D'),(4,3,'14E','MIDDLE',14,'E'),(4,3,'14F','AISLE',14,'F'),
(4,3,'14G','AISLE',14,'G'),(4,3,'14H','MIDDLE',14,'H'),(4,3,'14I','WINDOW',14,'I'),
(4,3,'15A','WINDOW',15,'A'),(4,3,'15B','MIDDLE',15,'B'),(4,3,'15C','AISLE',15,'C'),
(4,3,'15D','AISLE',15,'D'),(4,3,'15E','MIDDLE',15,'E'),(4,3,'15F','AISLE',15,'F'),
(4,3,'15G','AISLE',15,'G'),(4,3,'15H','MIDDLE',15,'H'),(4,3,'15I','WINDOW',15,'I'),
(4,3,'16A','WINDOW',16,'A'),(4,3,'16B','MIDDLE',16,'B'),(4,3,'16C','AISLE',16,'C'),
(4,3,'16D','AISLE',16,'D'),(4,3,'16E','MIDDLE',16,'E'),(4,3,'16F','AISLE',16,'F'),
(4,3,'16G','AISLE',16,'G'),(4,3,'16H','MIDDLE',16,'H'),(4,3,'16I','WINDOW',16,'I'),
-- Economy Saver rows 17-22 (9 ghế/hàng)
(4,2,'17A','WINDOW',17,'A'),(4,2,'17B','MIDDLE',17,'B'),(4,2,'17C','AISLE',17,'C'),
(4,2,'17D','AISLE',17,'D'),(4,2,'17E','MIDDLE',17,'E'),(4,2,'17F','AISLE',17,'F'),
(4,2,'17G','AISLE',17,'G'),(4,2,'17H','MIDDLE',17,'H'),(4,2,'17I','WINDOW',17,'I'),
(4,2,'18A','WINDOW',18,'A'),(4,2,'18B','MIDDLE',18,'B'),(4,2,'18C','AISLE',18,'C'),
(4,2,'18D','AISLE',18,'D'),(4,2,'18E','MIDDLE',18,'E'),(4,2,'18F','AISLE',18,'F'),
(4,2,'18G','AISLE',18,'G'),(4,2,'18H','MIDDLE',18,'H'),(4,2,'18I','WINDOW',18,'I'),
(4,2,'19A','WINDOW',19,'A'),(4,2,'19B','MIDDLE',19,'B'),(4,2,'19C','AISLE',19,'C'),
(4,2,'19D','AISLE',19,'D'),(4,2,'19E','MIDDLE',19,'E'),(4,2,'19F','AISLE',19,'F'),
(4,2,'19G','AISLE',19,'G'),(4,2,'19H','MIDDLE',19,'H'),(4,2,'19I','WINDOW',19,'I'),
(4,2,'20A','WINDOW',20,'A'),(4,2,'20B','MIDDLE',20,'B'),(4,2,'20C','AISLE',20,'C'),
(4,2,'20D','AISLE',20,'D'),(4,2,'20E','MIDDLE',20,'E'),(4,2,'20F','AISLE',20,'F'),
(4,2,'20G','AISLE',20,'G'),(4,2,'20H','MIDDLE',20,'H'),(4,2,'20I','WINDOW',20,'I'),
(4,2,'21A','WINDOW',21,'A'),(4,2,'21B','MIDDLE',21,'B'),(4,2,'21C','AISLE',21,'C'),
(4,2,'21D','AISLE',21,'D'),(4,2,'21E','MIDDLE',21,'E'),(4,2,'21F','AISLE',21,'F'),
(4,2,'21G','AISLE',21,'G'),(4,2,'21H','MIDDLE',21,'H'),(4,2,'21I','WINDOW',21,'I'),
(4,2,'22A','WINDOW',22,'A'),(4,2,'22B','MIDDLE',22,'B'),(4,2,'22C','AISLE',22,'C'),
(4,2,'22D','AISLE',22,'D'),(4,2,'22E','MIDDLE',22,'E'),(4,2,'22F','AISLE',22,'F'),
(4,2,'22G','AISLE',22,'G'),(4,2,'22H','MIDDLE',22,'H'),(4,2,'22I','WINDOW',22,'I'),
-- Economy rows 23-32: rows 23-31 đủ 9 col (81 ghế), row 32 chỉ 7 col A-G (7 ghế) → 88 ✓
(4,1,'23A','WINDOW',23,'A'),(4,1,'23B','MIDDLE',23,'B'),(4,1,'23C','AISLE',23,'C'),
(4,1,'23D','AISLE',23,'D'),(4,1,'23E','MIDDLE',23,'E'),(4,1,'23F','AISLE',23,'F'),
(4,1,'23G','AISLE',23,'G'),(4,1,'23H','MIDDLE',23,'H'),(4,1,'23I','WINDOW',23,'I'),
(4,1,'24A','WINDOW',24,'A'),(4,1,'24B','MIDDLE',24,'B'),(4,1,'24C','AISLE',24,'C'),
(4,1,'24D','AISLE',24,'D'),(4,1,'24E','MIDDLE',24,'E'),(4,1,'24F','AISLE',24,'F'),
(4,1,'24G','AISLE',24,'G'),(4,1,'24H','MIDDLE',24,'H'),(4,1,'24I','WINDOW',24,'I'),
(4,1,'25A','WINDOW',25,'A'),(4,1,'25B','MIDDLE',25,'B'),(4,1,'25C','AISLE',25,'C'),
(4,1,'25D','AISLE',25,'D'),(4,1,'25E','MIDDLE',25,'E'),(4,1,'25F','AISLE',25,'F'),
(4,1,'25G','AISLE',25,'G'),(4,1,'25H','MIDDLE',25,'H'),(4,1,'25I','WINDOW',25,'I'),
(4,1,'26A','WINDOW',26,'A'),(4,1,'26B','MIDDLE',26,'B'),(4,1,'26C','AISLE',26,'C'),
(4,1,'26D','AISLE',26,'D'),(4,1,'26E','MIDDLE',26,'E'),(4,1,'26F','AISLE',26,'F'),
(4,1,'26G','AISLE',26,'G'),(4,1,'26H','MIDDLE',26,'H'),(4,1,'26I','WINDOW',26,'I'),
(4,1,'27A','WINDOW',27,'A'),(4,1,'27B','MIDDLE',27,'B'),(4,1,'27C','AISLE',27,'C'),
(4,1,'27D','AISLE',27,'D'),(4,1,'27E','MIDDLE',27,'E'),(4,1,'27F','AISLE',27,'F'),
(4,1,'27G','AISLE',27,'G'),(4,1,'27H','MIDDLE',27,'H'),(4,1,'27I','WINDOW',27,'I'),
(4,1,'28A','WINDOW',28,'A'),(4,1,'28B','MIDDLE',28,'B'),(4,1,'28C','AISLE',28,'C'),
(4,1,'28D','AISLE',28,'D'),(4,1,'28E','MIDDLE',28,'E'),(4,1,'28F','AISLE',28,'F'),
(4,1,'28G','AISLE',28,'G'),(4,1,'28H','MIDDLE',28,'H'),(4,1,'28I','WINDOW',28,'I'),
(4,1,'29A','WINDOW',29,'A'),(4,1,'29B','MIDDLE',29,'B'),(4,1,'29C','AISLE',29,'C'),
(4,1,'29D','AISLE',29,'D'),(4,1,'29E','MIDDLE',29,'E'),(4,1,'29F','AISLE',29,'F'),
(4,1,'29G','AISLE',29,'G'),(4,1,'29H','MIDDLE',29,'H'),(4,1,'29I','WINDOW',29,'I'),
(4,1,'30A','WINDOW',30,'A'),(4,1,'30B','MIDDLE',30,'B'),(4,1,'30C','AISLE',30,'C'),
(4,1,'30D','AISLE',30,'D'),(4,1,'30E','MIDDLE',30,'E'),(4,1,'30F','AISLE',30,'F'),
(4,1,'30G','AISLE',30,'G'),(4,1,'30H','MIDDLE',30,'H'),(4,1,'30I','WINDOW',30,'I'),
(4,1,'31A','WINDOW',31,'A'),(4,1,'31B','MIDDLE',31,'B'),(4,1,'31C','AISLE',31,'C'),
(4,1,'31D','AISLE',31,'D'),(4,1,'31E','MIDDLE',31,'E'),(4,1,'31F','AISLE',31,'F'),
(4,1,'31G','AISLE',31,'G'),(4,1,'31H','MIDDLE',31,'H'),(4,1,'31I','WINDOW',31,'I'),
-- Hàng 32: chỉ 7 ghế (A-G) để đạt tổng 280
(4,1,'32A','WINDOW',32,'A'),(4,1,'32B','MIDDLE',32,'B'),(4,1,'32C','AISLE',32,'C'),
(4,1,'32D','AISLE',32,'D'),(4,1,'32E','MIDDLE',32,'E'),(4,1,'32F','AISLE',32,'F'),
(4,1,'32G','WINDOW',32,'G');

-- =============================================================================
-- Máy bay 5: Airbus A350-900 (VN-A350) — 300 ghế, bố cục 3-3-3, 34 hàng đủ
--   First Class (mahangve=5): rows 1-2, 6 col (A-F bỏ G H I) → 2×6=12 ghế
--   Business    (mahangve=4): rows 3-7, 9 col → 5×9=45 ghế
--   Deluxe      (mahangve=3): rows 8-18, 9 col → 11×9=99 ghế
--   Economy Saver(mahangve=2): rows 19-24, 9 col → 6×9=54 ghế
--   Economy     (mahangve=1): rows 25-34, 9 col → 10×9=90 ghế
--   Tổng: 12+45+99+54+90 = 300 ✓
-- =============================================================================
INSERT IGNORE INTO `chitietghe` (`mamaybay`, `mahangve`, `soghe`, `vitrighe`, `hang`, `cot`) VALUES
-- First Class rows 1-2 (6 ghế/hàng: A B C D E F)
(5,5,'1A','WINDOW',1,'A'),(5,5,'1B','AISLE',1,'B'),(5,5,'1C','AISLE',1,'C'),
(5,5,'1D','AISLE',1,'D'),(5,5,'1E','AISLE',1,'E'),(5,5,'1F','WINDOW',1,'F'),
(5,5,'2A','WINDOW',2,'A'),(5,5,'2B','AISLE',2,'B'),(5,5,'2C','AISLE',2,'C'),
(5,5,'2D','AISLE',2,'D'),(5,5,'2E','AISLE',2,'E'),(5,5,'2F','WINDOW',2,'F'),
-- Business rows 3-7 (9 ghế/hàng: A B C | D E F | G H I)
(5,4,'3A','WINDOW',3,'A'),(5,4,'3B','MIDDLE',3,'B'),(5,4,'3C','AISLE',3,'C'),
(5,4,'3D','AISLE',3,'D'),(5,4,'3E','MIDDLE',3,'E'),(5,4,'3F','AISLE',3,'F'),
(5,4,'3G','AISLE',3,'G'),(5,4,'3H','MIDDLE',3,'H'),(5,4,'3I','WINDOW',3,'I'),
(5,4,'4A','WINDOW',4,'A'),(5,4,'4B','MIDDLE',4,'B'),(5,4,'4C','AISLE',4,'C'),
(5,4,'4D','AISLE',4,'D'),(5,4,'4E','MIDDLE',4,'E'),(5,4,'4F','AISLE',4,'F'),
(5,4,'4G','AISLE',4,'G'),(5,4,'4H','MIDDLE',4,'H'),(5,4,'4I','WINDOW',4,'I'),
(5,4,'5A','WINDOW',5,'A'),(5,4,'5B','MIDDLE',5,'B'),(5,4,'5C','AISLE',5,'C'),
(5,4,'5D','AISLE',5,'D'),(5,4,'5E','MIDDLE',5,'E'),(5,4,'5F','AISLE',5,'F'),
(5,4,'5G','AISLE',5,'G'),(5,4,'5H','MIDDLE',5,'H'),(5,4,'5I','WINDOW',5,'I'),
(5,4,'6A','WINDOW',6,'A'),(5,4,'6B','MIDDLE',6,'B'),(5,4,'6C','AISLE',6,'C'),
(5,4,'6D','AISLE',6,'D'),(5,4,'6E','MIDDLE',6,'E'),(5,4,'6F','AISLE',6,'F'),
(5,4,'6G','AISLE',6,'G'),(5,4,'6H','MIDDLE',6,'H'),(5,4,'6I','WINDOW',6,'I'),
(5,4,'7A','WINDOW',7,'A'),(5,4,'7B','MIDDLE',7,'B'),(5,4,'7C','AISLE',7,'C'),
(5,4,'7D','AISLE',7,'D'),(5,4,'7E','MIDDLE',7,'E'),(5,4,'7F','AISLE',7,'F'),
(5,4,'7G','AISLE',7,'G'),(5,4,'7H','MIDDLE',7,'H'),(5,4,'7I','WINDOW',7,'I'),
-- Deluxe rows 8-18 (9 ghế/hàng)
(5,3,'8A','WINDOW',8,'A'),(5,3,'8B','MIDDLE',8,'B'),(5,3,'8C','AISLE',8,'C'),
(5,3,'8D','AISLE',8,'D'),(5,3,'8E','MIDDLE',8,'E'),(5,3,'8F','AISLE',8,'F'),
(5,3,'8G','AISLE',8,'G'),(5,3,'8H','MIDDLE',8,'H'),(5,3,'8I','WINDOW',8,'I'),
(5,3,'9A','WINDOW',9,'A'),(5,3,'9B','MIDDLE',9,'B'),(5,3,'9C','AISLE',9,'C'),
(5,3,'9D','AISLE',9,'D'),(5,3,'9E','MIDDLE',9,'E'),(5,3,'9F','AISLE',9,'F'),
(5,3,'9G','AISLE',9,'G'),(5,3,'9H','MIDDLE',9,'H'),(5,3,'9I','WINDOW',9,'I'),
(5,3,'10A','WINDOW',10,'A'),(5,3,'10B','MIDDLE',10,'B'),(5,3,'10C','AISLE',10,'C'),
(5,3,'10D','AISLE',10,'D'),(5,3,'10E','MIDDLE',10,'E'),(5,3,'10F','AISLE',10,'F'),
(5,3,'10G','AISLE',10,'G'),(5,3,'10H','MIDDLE',10,'H'),(5,3,'10I','WINDOW',10,'I'),
(5,3,'11A','WINDOW',11,'A'),(5,3,'11B','MIDDLE',11,'B'),(5,3,'11C','AISLE',11,'C'),
(5,3,'11D','AISLE',11,'D'),(5,3,'11E','MIDDLE',11,'E'),(5,3,'11F','AISLE',11,'F'),
(5,3,'11G','AISLE',11,'G'),(5,3,'11H','MIDDLE',11,'H'),(5,3,'11I','WINDOW',11,'I'),
(5,3,'12A','WINDOW',12,'A'),(5,3,'12B','MIDDLE',12,'B'),(5,3,'12C','AISLE',12,'C'),
(5,3,'12D','AISLE',12,'D'),(5,3,'12E','MIDDLE',12,'E'),(5,3,'12F','AISLE',12,'F'),
(5,3,'12G','AISLE',12,'G'),(5,3,'12H','MIDDLE',12,'H'),(5,3,'12I','WINDOW',12,'I'),
(5,3,'13A','WINDOW',13,'A'),(5,3,'13B','MIDDLE',13,'B'),(5,3,'13C','AISLE',13,'C'),
(5,3,'13D','AISLE',13,'D'),(5,3,'13E','MIDDLE',13,'E'),(5,3,'13F','AISLE',13,'F'),
(5,3,'13G','AISLE',13,'G'),(5,3,'13H','MIDDLE',13,'H'),(5,3,'13I','WINDOW',13,'I'),
(5,3,'14A','WINDOW',14,'A'),(5,3,'14B','MIDDLE',14,'B'),(5,3,'14C','AISLE',14,'C'),
(5,3,'14D','AISLE',14,'D'),(5,3,'14E','MIDDLE',14,'E'),(5,3,'14F','AISLE',14,'F'),
(5,3,'14G','AISLE',14,'G'),(5,3,'14H','MIDDLE',14,'H'),(5,3,'14I','WINDOW',14,'I'),
(5,3,'15A','WINDOW',15,'A'),(5,3,'15B','MIDDLE',15,'B'),(5,3,'15C','AISLE',15,'C'),
(5,3,'15D','AISLE',15,'D'),(5,3,'15E','MIDDLE',15,'E'),(5,3,'15F','AISLE',15,'F'),
(5,3,'15G','AISLE',15,'G'),(5,3,'15H','MIDDLE',15,'H'),(5,3,'15I','WINDOW',15,'I'),
(5,3,'16A','WINDOW',16,'A'),(5,3,'16B','MIDDLE',16,'B'),(5,3,'16C','AISLE',16,'C'),
(5,3,'16D','AISLE',16,'D'),(5,3,'16E','MIDDLE',16,'E'),(5,3,'16F','AISLE',16,'F'),
(5,3,'16G','AISLE',16,'G'),(5,3,'16H','MIDDLE',16,'H'),(5,3,'16I','WINDOW',16,'I'),
(5,3,'17A','WINDOW',17,'A'),(5,3,'17B','MIDDLE',17,'B'),(5,3,'17C','AISLE',17,'C'),
(5,3,'17D','AISLE',17,'D'),(5,3,'17E','MIDDLE',17,'E'),(5,3,'17F','AISLE',17,'F'),
(5,3,'17G','AISLE',17,'G'),(5,3,'17H','MIDDLE',17,'H'),(5,3,'17I','WINDOW',17,'I'),
(5,3,'18A','WINDOW',18,'A'),(5,3,'18B','MIDDLE',18,'B'),(5,3,'18C','AISLE',18,'C'),
(5,3,'18D','AISLE',18,'D'),(5,3,'18E','MIDDLE',18,'E'),(5,3,'18F','AISLE',18,'F'),
(5,3,'18G','AISLE',18,'G'),(5,3,'18H','MIDDLE',18,'H'),(5,3,'18I','WINDOW',18,'I'),
-- Economy Saver rows 19-24 (9 ghế/hàng)
(5,2,'19A','WINDOW',19,'A'),(5,2,'19B','MIDDLE',19,'B'),(5,2,'19C','AISLE',19,'C'),
(5,2,'19D','AISLE',19,'D'),(5,2,'19E','MIDDLE',19,'E'),(5,2,'19F','AISLE',19,'F'),
(5,2,'19G','AISLE',19,'G'),(5,2,'19H','MIDDLE',19,'H'),(5,2,'19I','WINDOW',19,'I'),
(5,2,'20A','WINDOW',20,'A'),(5,2,'20B','MIDDLE',20,'B'),(5,2,'20C','AISLE',20,'C'),
(5,2,'20D','AISLE',20,'D'),(5,2,'20E','MIDDLE',20,'E'),(5,2,'20F','AISLE',20,'F'),
(5,2,'20G','AISLE',20,'G'),(5,2,'20H','MIDDLE',20,'H'),(5,2,'20I','WINDOW',20,'I'),
(5,2,'21A','WINDOW',21,'A'),(5,2,'21B','MIDDLE',21,'B'),(5,2,'21C','AISLE',21,'C'),
(5,2,'21D','AISLE',21,'D'),(5,2,'21E','MIDDLE',21,'E'),(5,2,'21F','AISLE',21,'F'),
(5,2,'21G','AISLE',21,'G'),(5,2,'21H','MIDDLE',21,'H'),(5,2,'21I','WINDOW',21,'I'),
(5,2,'22A','WINDOW',22,'A'),(5,2,'22B','MIDDLE',22,'B'),(5,2,'22C','AISLE',22,'C'),
(5,2,'22D','AISLE',22,'D'),(5,2,'22E','MIDDLE',22,'E'),(5,2,'22F','AISLE',22,'F'),
(5,2,'22G','AISLE',22,'G'),(5,2,'22H','MIDDLE',22,'H'),(5,2,'22I','WINDOW',22,'I'),
(5,2,'23A','WINDOW',23,'A'),(5,2,'23B','MIDDLE',23,'B'),(5,2,'23C','AISLE',23,'C'),
(5,2,'23D','AISLE',23,'D'),(5,2,'23E','MIDDLE',23,'E'),(5,2,'23F','AISLE',23,'F'),
(5,2,'23G','AISLE',23,'G'),(5,2,'23H','MIDDLE',23,'H'),(5,2,'23I','WINDOW',23,'I'),
(5,2,'24A','WINDOW',24,'A'),(5,2,'24B','MIDDLE',24,'B'),(5,2,'24C','AISLE',24,'C'),
(5,2,'24D','AISLE',24,'D'),(5,2,'24E','MIDDLE',24,'E'),(5,2,'24F','AISLE',24,'F'),
(5,2,'24G','AISLE',24,'G'),(5,2,'24H','MIDDLE',24,'H'),(5,2,'24I','WINDOW',24,'I'),
-- Economy rows 25-34 (9 ghế/hàng)
(5,1,'25A','WINDOW',25,'A'),(5,1,'25B','MIDDLE',25,'B'),(5,1,'25C','AISLE',25,'C'),
(5,1,'25D','AISLE',25,'D'),(5,1,'25E','MIDDLE',25,'E'),(5,1,'25F','AISLE',25,'F'),
(5,1,'25G','AISLE',25,'G'),(5,1,'25H','MIDDLE',25,'H'),(5,1,'25I','WINDOW',25,'I'),
(5,1,'26A','WINDOW',26,'A'),(5,1,'26B','MIDDLE',26,'B'),(5,1,'26C','AISLE',26,'C'),
(5,1,'26D','AISLE',26,'D'),(5,1,'26E','MIDDLE',26,'E'),(5,1,'26F','AISLE',26,'F'),
(5,1,'26G','AISLE',26,'G'),(5,1,'26H','MIDDLE',26,'H'),(5,1,'26I','WINDOW',26,'I'),
(5,1,'27A','WINDOW',27,'A'),(5,1,'27B','MIDDLE',27,'B'),(5,1,'27C','AISLE',27,'C'),
(5,1,'27D','AISLE',27,'D'),(5,1,'27E','MIDDLE',27,'E'),(5,1,'27F','AISLE',27,'F'),
(5,1,'27G','AISLE',27,'G'),(5,1,'27H','MIDDLE',27,'H'),(5,1,'27I','WINDOW',27,'I'),
(5,1,'28A','WINDOW',28,'A'),(5,1,'28B','MIDDLE',28,'B'),(5,1,'28C','AISLE',28,'C'),
(5,1,'28D','AISLE',28,'D'),(5,1,'28E','MIDDLE',28,'E'),(5,1,'28F','AISLE',28,'F'),
(5,1,'28G','AISLE',28,'G'),(5,1,'28H','MIDDLE',28,'H'),(5,1,'28I','WINDOW',28,'I'),
(5,1,'29A','WINDOW',29,'A'),(5,1,'29B','MIDDLE',29,'B'),(5,1,'29C','AISLE',29,'C'),
(5,1,'29D','AISLE',29,'D'),(5,1,'29E','MIDDLE',29,'E'),(5,1,'29F','AISLE',29,'F'),
(5,1,'29G','AISLE',29,'G'),(5,1,'29H','MIDDLE',29,'H'),(5,1,'29I','WINDOW',29,'I'),
(5,1,'30A','WINDOW',30,'A'),(5,1,'30B','MIDDLE',30,'B'),(5,1,'30C','AISLE',30,'C'),
(5,1,'30D','AISLE',30,'D'),(5,1,'30E','MIDDLE',30,'E'),(5,1,'30F','AISLE',30,'F'),
(5,1,'30G','AISLE',30,'G'),(5,1,'30H','MIDDLE',30,'H'),(5,1,'30I','WINDOW',30,'I'),
(5,1,'31A','WINDOW',31,'A'),(5,1,'31B','MIDDLE',31,'B'),(5,1,'31C','AISLE',31,'C'),
(5,1,'31D','AISLE',31,'D'),(5,1,'31E','MIDDLE',31,'E'),(5,1,'31F','AISLE',31,'F'),
(5,1,'31G','AISLE',31,'G'),(5,1,'31H','MIDDLE',31,'H'),(5,1,'31I','WINDOW',31,'I'),
(5,1,'32A','WINDOW',32,'A'),(5,1,'32B','MIDDLE',32,'B'),(5,1,'32C','AISLE',32,'C'),
(5,1,'32D','AISLE',32,'D'),(5,1,'32E','MIDDLE',32,'E'),(5,1,'32F','AISLE',32,'F'),
(5,1,'32G','AISLE',32,'G'),(5,1,'32H','MIDDLE',32,'H'),(5,1,'32I','WINDOW',32,'I'),
(5,1,'33A','WINDOW',33,'A'),(5,1,'33B','MIDDLE',33,'B'),(5,1,'33C','AISLE',33,'C'),
(5,1,'33D','AISLE',33,'D'),(5,1,'33E','MIDDLE',33,'E'),(5,1,'33F','AISLE',33,'F'),
(5,1,'33G','AISLE',33,'G'),(5,1,'33H','MIDDLE',33,'H'),(5,1,'33I','WINDOW',33,'I'),
(5,1,'34A','WINDOW',34,'A'),(5,1,'34B','MIDDLE',34,'B'),(5,1,'34C','AISLE',34,'C'),
(5,1,'34D','AISLE',34,'D'),(5,1,'34E','MIDDLE',34,'E'),(5,1,'34F','AISLE',34,'F'),
(5,1,'34G','AISLE',34,'G'),(5,1,'34H','MIDDLE',34,'H'),(5,1,'34I','WINDOW',34,'I');

-- =============================================================================
-- Máy bay 6: Boeing 777-300ER (VN-B777) — 350 ghế, bố cục 3-4-3 (10 cột A B C | D E F G | H J K)
--   First Class (mahangve=5): rows 1-3, 6 col (A B C H J K) → 3×6=18 ghế
--   Business    (mahangve=4): rows 4-8, 10 col              → 5×10=50 ghế
--   Deluxe      (mahangve=3): rows 9-20, 10 col             → 12×10=120 ghế
--   Economy Saver(mahangve=2): rows 21-26, 10 col           → 6×10=60 ghế
--   Economy     (mahangve=1): rows 27-36, 10 col            → 10×10=100 ghế
--   Ajout 2 ghế: hàng 37 col A B để đạt đúng 350... không cần vì 18+50+120+60+100=348; thêm 2 ghế Economy hàng 37
--   Hoặc: First Class 3 hàng=18, Business 5×10=50, Deluxe 12×10=120, EcoSaver 6×10=60, Eco 10×10=100 = 348
--   Thêm 2 ghế: rows 37 A, B → total 350
--   Cột: A B C (WINDOW/MIDDLE/AISLE) | D E F G (AISLE/MIDDLE/MIDDLE/AISLE) | H J K (AISLE/MIDDLE/WINDOW)
-- =============================================================================
INSERT IGNORE INTO `chitietghe` (`mamaybay`, `mahangve`, `soghe`, `vitrighe`, `hang`, `cot`) VALUES
-- First Class rows 1-3 (6 ghế/hàng: A B C H J K)
(6,5,'1A','WINDOW',1,'A'),(6,5,'1B','MIDDLE',1,'B'),(6,5,'1C','AISLE',1,'C'),
(6,5,'1H','AISLE',1,'H'),(6,5,'1J','MIDDLE',1,'J'),(6,5,'1K','WINDOW',1,'K'),
(6,5,'2A','WINDOW',2,'A'),(6,5,'2B','MIDDLE',2,'B'),(6,5,'2C','AISLE',2,'C'),
(6,5,'2H','AISLE',2,'H'),(6,5,'2J','MIDDLE',2,'J'),(6,5,'2K','WINDOW',2,'K'),
(6,5,'3A','WINDOW',3,'A'),(6,5,'3B','MIDDLE',3,'B'),(6,5,'3C','AISLE',3,'C'),
(6,5,'3H','AISLE',3,'H'),(6,5,'3J','MIDDLE',3,'J'),(6,5,'3K','WINDOW',3,'K'),
-- Business rows 4-8 (10 ghế/hàng: A B C | D E F G | H J K)
(6,4,'4A','WINDOW',4,'A'),(6,4,'4B','MIDDLE',4,'B'),(6,4,'4C','AISLE',4,'C'),
(6,4,'4D','AISLE',4,'D'),(6,4,'4E','MIDDLE',4,'E'),(6,4,'4F','MIDDLE',4,'F'),(6,4,'4G','AISLE',4,'G'),
(6,4,'4H','AISLE',4,'H'),(6,4,'4J','MIDDLE',4,'J'),(6,4,'4K','WINDOW',4,'K'),
(6,4,'5A','WINDOW',5,'A'),(6,4,'5B','MIDDLE',5,'B'),(6,4,'5C','AISLE',5,'C'),
(6,4,'5D','AISLE',5,'D'),(6,4,'5E','MIDDLE',5,'E'),(6,4,'5F','MIDDLE',5,'F'),(6,4,'5G','AISLE',5,'G'),
(6,4,'5H','AISLE',5,'H'),(6,4,'5J','MIDDLE',5,'J'),(6,4,'5K','WINDOW',5,'K'),
(6,4,'6A','WINDOW',6,'A'),(6,4,'6B','MIDDLE',6,'B'),(6,4,'6C','AISLE',6,'C'),
(6,4,'6D','AISLE',6,'D'),(6,4,'6E','MIDDLE',6,'E'),(6,4,'6F','MIDDLE',6,'F'),(6,4,'6G','AISLE',6,'G'),
(6,4,'6H','AISLE',6,'H'),(6,4,'6J','MIDDLE',6,'J'),(6,4,'6K','WINDOW',6,'K'),
(6,4,'7A','WINDOW',7,'A'),(6,4,'7B','MIDDLE',7,'B'),(6,4,'7C','AISLE',7,'C'),
(6,4,'7D','AISLE',7,'D'),(6,4,'7E','MIDDLE',7,'E'),(6,4,'7F','MIDDLE',7,'F'),(6,4,'7G','AISLE',7,'G'),
(6,4,'7H','AISLE',7,'H'),(6,4,'7J','MIDDLE',7,'J'),(6,4,'7K','WINDOW',7,'K'),
(6,4,'8A','WINDOW',8,'A'),(6,4,'8B','MIDDLE',8,'B'),(6,4,'8C','AISLE',8,'C'),
(6,4,'8D','AISLE',8,'D'),(6,4,'8E','MIDDLE',8,'E'),(6,4,'8F','MIDDLE',8,'F'),(6,4,'8G','AISLE',8,'G'),
(6,4,'8H','AISLE',8,'H'),(6,4,'8J','MIDDLE',8,'J'),(6,4,'8K','WINDOW',8,'K'),
-- Deluxe rows 9-20 (10 ghế/hàng)
(6,3,'9A','WINDOW',9,'A'),(6,3,'9B','MIDDLE',9,'B'),(6,3,'9C','AISLE',9,'C'),
(6,3,'9D','AISLE',9,'D'),(6,3,'9E','MIDDLE',9,'E'),(6,3,'9F','MIDDLE',9,'F'),(6,3,'9G','AISLE',9,'G'),
(6,3,'9H','AISLE',9,'H'),(6,3,'9J','MIDDLE',9,'J'),(6,3,'9K','WINDOW',9,'K'),
(6,3,'10A','WINDOW',10,'A'),(6,3,'10B','MIDDLE',10,'B'),(6,3,'10C','AISLE',10,'C'),
(6,3,'10D','AISLE',10,'D'),(6,3,'10E','MIDDLE',10,'E'),(6,3,'10F','MIDDLE',10,'F'),(6,3,'10G','AISLE',10,'G'),
(6,3,'10H','AISLE',10,'H'),(6,3,'10J','MIDDLE',10,'J'),(6,3,'10K','WINDOW',10,'K'),
(6,3,'11A','WINDOW',11,'A'),(6,3,'11B','MIDDLE',11,'B'),(6,3,'11C','AISLE',11,'C'),
(6,3,'11D','AISLE',11,'D'),(6,3,'11E','MIDDLE',11,'E'),(6,3,'11F','MIDDLE',11,'F'),(6,3,'11G','AISLE',11,'G'),
(6,3,'11H','AISLE',11,'H'),(6,3,'11J','MIDDLE',11,'J'),(6,3,'11K','WINDOW',11,'K'),
(6,3,'12A','WINDOW',12,'A'),(6,3,'12B','MIDDLE',12,'B'),(6,3,'12C','AISLE',12,'C'),
(6,3,'12D','AISLE',12,'D'),(6,3,'12E','MIDDLE',12,'E'),(6,3,'12F','MIDDLE',12,'F'),(6,3,'12G','AISLE',12,'G'),
(6,3,'12H','AISLE',12,'H'),(6,3,'12J','MIDDLE',12,'J'),(6,3,'12K','WINDOW',12,'K'),
(6,3,'13A','WINDOW',13,'A'),(6,3,'13B','MIDDLE',13,'B'),(6,3,'13C','AISLE',13,'C'),
(6,3,'13D','AISLE',13,'D'),(6,3,'13E','MIDDLE',13,'E'),(6,3,'13F','MIDDLE',13,'F'),(6,3,'13G','AISLE',13,'G'),
(6,3,'13H','AISLE',13,'H'),(6,3,'13J','MIDDLE',13,'J'),(6,3,'13K','WINDOW',13,'K'),
(6,3,'14A','WINDOW',14,'A'),(6,3,'14B','MIDDLE',14,'B'),(6,3,'14C','AISLE',14,'C'),
(6,3,'14D','AISLE',14,'D'),(6,3,'14E','MIDDLE',14,'E'),(6,3,'14F','MIDDLE',14,'F'),(6,3,'14G','AISLE',14,'G'),
(6,3,'14H','AISLE',14,'H'),(6,3,'14J','MIDDLE',14,'J'),(6,3,'14K','WINDOW',14,'K'),
(6,3,'15A','WINDOW',15,'A'),(6,3,'15B','MIDDLE',15,'B'),(6,3,'15C','AISLE',15,'C'),
(6,3,'15D','AISLE',15,'D'),(6,3,'15E','MIDDLE',15,'E'),(6,3,'15F','MIDDLE',15,'F'),(6,3,'15G','AISLE',15,'G'),
(6,3,'15H','AISLE',15,'H'),(6,3,'15J','MIDDLE',15,'J'),(6,3,'15K','WINDOW',15,'K'),
(6,3,'16A','WINDOW',16,'A'),(6,3,'16B','MIDDLE',16,'B'),(6,3,'16C','AISLE',16,'C'),
(6,3,'16D','AISLE',16,'D'),(6,3,'16E','MIDDLE',16,'E'),(6,3,'16F','MIDDLE',16,'F'),(6,3,'16G','AISLE',16,'G'),
(6,3,'16H','AISLE',16,'H'),(6,3,'16J','MIDDLE',16,'J'),(6,3,'16K','WINDOW',16,'K'),
(6,3,'17A','WINDOW',17,'A'),(6,3,'17B','MIDDLE',17,'B'),(6,3,'17C','AISLE',17,'C'),
(6,3,'17D','AISLE',17,'D'),(6,3,'17E','MIDDLE',17,'E'),(6,3,'17F','MIDDLE',17,'F'),(6,3,'17G','AISLE',17,'G'),
(6,3,'17H','AISLE',17,'H'),(6,3,'17J','MIDDLE',17,'J'),(6,3,'17K','WINDOW',17,'K'),
(6,3,'18A','WINDOW',18,'A'),(6,3,'18B','MIDDLE',18,'B'),(6,3,'18C','AISLE',18,'C'),
(6,3,'18D','AISLE',18,'D'),(6,3,'18E','MIDDLE',18,'E'),(6,3,'18F','MIDDLE',18,'F'),(6,3,'18G','AISLE',18,'G'),
(6,3,'18H','AISLE',18,'H'),(6,3,'18J','MIDDLE',18,'J'),(6,3,'18K','WINDOW',18,'K'),
(6,3,'19A','WINDOW',19,'A'),(6,3,'19B','MIDDLE',19,'B'),(6,3,'19C','AISLE',19,'C'),
(6,3,'19D','AISLE',19,'D'),(6,3,'19E','MIDDLE',19,'E'),(6,3,'19F','MIDDLE',19,'F'),(6,3,'19G','AISLE',19,'G'),
(6,3,'19H','AISLE',19,'H'),(6,3,'19J','MIDDLE',19,'J'),(6,3,'19K','WINDOW',19,'K'),
(6,3,'20A','WINDOW',20,'A'),(6,3,'20B','MIDDLE',20,'B'),(6,3,'20C','AISLE',20,'C'),
(6,3,'20D','AISLE',20,'D'),(6,3,'20E','MIDDLE',20,'E'),(6,3,'20F','MIDDLE',20,'F'),(6,3,'20G','AISLE',20,'G'),
(6,3,'20H','AISLE',20,'H'),(6,3,'20J','MIDDLE',20,'J'),(6,3,'20K','WINDOW',20,'K'),
-- Economy Saver rows 21-26 (10 ghế/hàng)
(6,2,'21A','WINDOW',21,'A'),(6,2,'21B','MIDDLE',21,'B'),(6,2,'21C','AISLE',21,'C'),
(6,2,'21D','AISLE',21,'D'),(6,2,'21E','MIDDLE',21,'E'),(6,2,'21F','MIDDLE',21,'F'),(6,2,'21G','AISLE',21,'G'),
(6,2,'21H','AISLE',21,'H'),(6,2,'21J','MIDDLE',21,'J'),(6,2,'21K','WINDOW',21,'K'),
(6,2,'22A','WINDOW',22,'A'),(6,2,'22B','MIDDLE',22,'B'),(6,2,'22C','AISLE',22,'C'),
(6,2,'22D','AISLE',22,'D'),(6,2,'22E','MIDDLE',22,'E'),(6,2,'22F','MIDDLE',22,'F'),(6,2,'22G','AISLE',22,'G'),
(6,2,'22H','AISLE',22,'H'),(6,2,'22J','MIDDLE',22,'J'),(6,2,'22K','WINDOW',22,'K'),
(6,2,'23A','WINDOW',23,'A'),(6,2,'23B','MIDDLE',23,'B'),(6,2,'23C','AISLE',23,'C'),
(6,2,'23D','AISLE',23,'D'),(6,2,'23E','MIDDLE',23,'E'),(6,2,'23F','MIDDLE',23,'F'),(6,2,'23G','AISLE',23,'G'),
(6,2,'23H','AISLE',23,'H'),(6,2,'23J','MIDDLE',23,'J'),(6,2,'23K','WINDOW',23,'K'),
(6,2,'24A','WINDOW',24,'A'),(6,2,'24B','MIDDLE',24,'B'),(6,2,'24C','AISLE',24,'C'),
(6,2,'24D','AISLE',24,'D'),(6,2,'24E','MIDDLE',24,'E'),(6,2,'24F','MIDDLE',24,'F'),(6,2,'24G','AISLE',24,'G'),
(6,2,'24H','AISLE',24,'H'),(6,2,'24J','MIDDLE',24,'J'),(6,2,'24K','WINDOW',24,'K'),
(6,2,'25A','WINDOW',25,'A'),(6,2,'25B','MIDDLE',25,'B'),(6,2,'25C','AISLE',25,'C'),
(6,2,'25D','AISLE',25,'D'),(6,2,'25E','MIDDLE',25,'E'),(6,2,'25F','MIDDLE',25,'F'),(6,2,'25G','AISLE',25,'G'),
(6,2,'25H','AISLE',25,'H'),(6,2,'25J','MIDDLE',25,'J'),(6,2,'25K','WINDOW',25,'K'),
(6,2,'26A','WINDOW',26,'A'),(6,2,'26B','MIDDLE',26,'B'),(6,2,'26C','AISLE',26,'C'),
(6,2,'26D','AISLE',26,'D'),(6,2,'26E','MIDDLE',26,'E'),(6,2,'26F','MIDDLE',26,'F'),(6,2,'26G','AISLE',26,'G'),
(6,2,'26H','AISLE',26,'H'),(6,2,'26J','MIDDLE',26,'J'),(6,2,'26K','WINDOW',26,'K'),
-- Economy rows 27-36 (10 ghế/hàng = 100 ghế) + hàng 37 (2 ghế) = 102 → tổng 18+50+120+60+102=350
(6,1,'27A','WINDOW',27,'A'),(6,1,'27B','MIDDLE',27,'B'),(6,1,'27C','AISLE',27,'C'),
(6,1,'27D','AISLE',27,'D'),(6,1,'27E','MIDDLE',27,'E'),(6,1,'27F','MIDDLE',27,'F'),(6,1,'27G','AISLE',27,'G'),
(6,1,'27H','AISLE',27,'H'),(6,1,'27J','MIDDLE',27,'J'),(6,1,'27K','WINDOW',27,'K'),
(6,1,'28A','WINDOW',28,'A'),(6,1,'28B','MIDDLE',28,'B'),(6,1,'28C','AISLE',28,'C'),
(6,1,'28D','AISLE',28,'D'),(6,1,'28E','MIDDLE',28,'E'),(6,1,'28F','MIDDLE',28,'F'),(6,1,'28G','AISLE',28,'G'),
(6,1,'28H','AISLE',28,'H'),(6,1,'28J','MIDDLE',28,'J'),(6,1,'28K','WINDOW',28,'K'),
(6,1,'29A','WINDOW',29,'A'),(6,1,'29B','MIDDLE',29,'B'),(6,1,'29C','AISLE',29,'C'),
(6,1,'29D','AISLE',29,'D'),(6,1,'29E','MIDDLE',29,'E'),(6,1,'29F','MIDDLE',29,'F'),(6,1,'29G','AISLE',29,'G'),
(6,1,'29H','AISLE',29,'H'),(6,1,'29J','MIDDLE',29,'J'),(6,1,'29K','WINDOW',29,'K'),
(6,1,'30A','WINDOW',30,'A'),(6,1,'30B','MIDDLE',30,'B'),(6,1,'30C','AISLE',30,'C'),
(6,1,'30D','AISLE',30,'D'),(6,1,'30E','MIDDLE',30,'E'),(6,1,'30F','MIDDLE',30,'F'),(6,1,'30G','AISLE',30,'G'),
(6,1,'30H','AISLE',30,'H'),(6,1,'30J','MIDDLE',30,'J'),(6,1,'30K','WINDOW',30,'K'),
(6,1,'31A','WINDOW',31,'A'),(6,1,'31B','MIDDLE',31,'B'),(6,1,'31C','AISLE',31,'C'),
(6,1,'31D','AISLE',31,'D'),(6,1,'31E','MIDDLE',31,'E'),(6,1,'31F','MIDDLE',31,'F'),(6,1,'31G','AISLE',31,'G'),
(6,1,'31H','AISLE',31,'H'),(6,1,'31J','MIDDLE',31,'J'),(6,1,'31K','WINDOW',31,'K'),
(6,1,'32A','WINDOW',32,'A'),(6,1,'32B','MIDDLE',32,'B'),(6,1,'32C','AISLE',32,'C'),
(6,1,'32D','AISLE',32,'D'),(6,1,'32E','MIDDLE',32,'E'),(6,1,'32F','MIDDLE',32,'F'),(6,1,'32G','AISLE',32,'G'),
(6,1,'32H','AISLE',32,'H'),(6,1,'32J','MIDDLE',32,'J'),(6,1,'32K','WINDOW',32,'K'),
(6,1,'33A','WINDOW',33,'A'),(6,1,'33B','MIDDLE',33,'B'),(6,1,'33C','AISLE',33,'C'),
(6,1,'33D','AISLE',33,'D'),(6,1,'33E','MIDDLE',33,'E'),(6,1,'33F','MIDDLE',33,'F'),(6,1,'33G','AISLE',33,'G'),
(6,1,'33H','AISLE',33,'H'),(6,1,'33J','MIDDLE',33,'J'),(6,1,'33K','WINDOW',33,'K'),
(6,1,'34A','WINDOW',34,'A'),(6,1,'34B','MIDDLE',34,'B'),(6,1,'34C','AISLE',34,'C'),
(6,1,'34D','AISLE',34,'D'),(6,1,'34E','MIDDLE',34,'E'),(6,1,'34F','MIDDLE',34,'F'),(6,1,'34G','AISLE',34,'G'),
(6,1,'34H','AISLE',34,'H'),(6,1,'34J','MIDDLE',34,'J'),(6,1,'34K','WINDOW',34,'K'),
(6,1,'35A','WINDOW',35,'A'),(6,1,'35B','MIDDLE',35,'B'),(6,1,'35C','AISLE',35,'C'),
(6,1,'35D','AISLE',35,'D'),(6,1,'35E','MIDDLE',35,'E'),(6,1,'35F','MIDDLE',35,'F'),(6,1,'35G','AISLE',35,'G'),
(6,1,'35H','AISLE',35,'H'),(6,1,'35J','MIDDLE',35,'J'),(6,1,'35K','WINDOW',35,'K'),
(6,1,'36A','WINDOW',36,'A'),(6,1,'36B','MIDDLE',36,'B'),(6,1,'36C','AISLE',36,'C'),
(6,1,'36D','AISLE',36,'D'),(6,1,'36E','MIDDLE',36,'E'),(6,1,'36F','MIDDLE',36,'F'),(6,1,'36G','AISLE',36,'G'),
(6,1,'36H','AISLE',36,'H'),(6,1,'36J','MIDDLE',36,'J'),(6,1,'36K','WINDOW',36,'K'),
-- Hàng 37: 2 ghế để đạt đúng 350
(6,1,'37A','WINDOW',37,'A'),(6,1,'37B','MIDDLE',37,'B');

-- =============================================================================
-- Máy bay 7: Airbus A330-200 (VN-A330) — 250 ghế, bố cục 2-4-2 (8 cột A B | C D E F | G H)
--   First Class (mahangve=5): rows 1-3, 4 col (A B G H) → 3×4=12 ghế
--   Business    (mahangve=4): rows 4-8, 8 col → 5×8=40 ghế
--   Deluxe      (mahangve=3): rows 9-18, 8 col → 10×8=80 ghế
--   Economy Saver(mahangve=2): rows 19-24, 8 col → 6×8=48 ghế
--   Economy     (mahangve=1): rows 25-32, 8 col → 8×8=64 ghế
--   Tổng dự kiến: 12+40+80+48+64=244; thêm 6 ghế: rows 33 col A-F → 6 ghế → 250 ✓
-- =============================================================================
INSERT IGNORE INTO `chitietghe` (`mamaybay`, `mahangve`, `soghe`, `vitrighe`, `hang`, `cot`) VALUES
-- First Class rows 1-3 (4 ghế/hàng: A B G H)
(7,5,'1A','WINDOW',1,'A'),(7,5,'1B','AISLE',1,'B'),(7,5,'1G','AISLE',1,'G'),(7,5,'1H','WINDOW',1,'H'),
(7,5,'2A','WINDOW',2,'A'),(7,5,'2B','AISLE',2,'B'),(7,5,'2G','AISLE',2,'G'),(7,5,'2H','WINDOW',2,'H'),
(7,5,'3A','WINDOW',3,'A'),(7,5,'3B','AISLE',3,'B'),(7,5,'3G','AISLE',3,'G'),(7,5,'3H','WINDOW',3,'H'),
-- Business rows 4-8 (8 ghế/hàng: A B | C D E F | G H)
(7,4,'4A','WINDOW',4,'A'),(7,4,'4B','AISLE',4,'B'),
(7,4,'4C','AISLE',4,'C'),(7,4,'4D','MIDDLE',4,'D'),(7,4,'4E','MIDDLE',4,'E'),(7,4,'4F','AISLE',4,'F'),
(7,4,'4G','AISLE',4,'G'),(7,4,'4H','WINDOW',4,'H'),
(7,4,'5A','WINDOW',5,'A'),(7,4,'5B','AISLE',5,'B'),
(7,4,'5C','AISLE',5,'C'),(7,4,'5D','MIDDLE',5,'D'),(7,4,'5E','MIDDLE',5,'E'),(7,4,'5F','AISLE',5,'F'),
(7,4,'5G','AISLE',5,'G'),(7,4,'5H','WINDOW',5,'H'),
(7,4,'6A','WINDOW',6,'A'),(7,4,'6B','AISLE',6,'B'),
(7,4,'6C','AISLE',6,'C'),(7,4,'6D','MIDDLE',6,'D'),(7,4,'6E','MIDDLE',6,'E'),(7,4,'6F','AISLE',6,'F'),
(7,4,'6G','AISLE',6,'G'),(7,4,'6H','WINDOW',6,'H'),
(7,4,'7A','WINDOW',7,'A'),(7,4,'7B','AISLE',7,'B'),
(7,4,'7C','AISLE',7,'C'),(7,4,'7D','MIDDLE',7,'D'),(7,4,'7E','MIDDLE',7,'E'),(7,4,'7F','AISLE',7,'F'),
(7,4,'7G','AISLE',7,'G'),(7,4,'7H','WINDOW',7,'H'),
(7,4,'8A','WINDOW',8,'A'),(7,4,'8B','AISLE',8,'B'),
(7,4,'8C','AISLE',8,'C'),(7,4,'8D','MIDDLE',8,'D'),(7,4,'8E','MIDDLE',8,'E'),(7,4,'8F','AISLE',8,'F'),
(7,4,'8G','AISLE',8,'G'),(7,4,'8H','WINDOW',8,'H'),
-- Deluxe rows 9-18 (8 ghế/hàng)
(7,3,'9A','WINDOW',9,'A'),(7,3,'9B','AISLE',9,'B'),
(7,3,'9C','AISLE',9,'C'),(7,3,'9D','MIDDLE',9,'D'),(7,3,'9E','MIDDLE',9,'E'),(7,3,'9F','AISLE',9,'F'),
(7,3,'9G','AISLE',9,'G'),(7,3,'9H','WINDOW',9,'H'),
(7,3,'10A','WINDOW',10,'A'),(7,3,'10B','AISLE',10,'B'),
(7,3,'10C','AISLE',10,'C'),(7,3,'10D','MIDDLE',10,'D'),(7,3,'10E','MIDDLE',10,'E'),(7,3,'10F','AISLE',10,'F'),
(7,3,'10G','AISLE',10,'G'),(7,3,'10H','WINDOW',10,'H'),
(7,3,'11A','WINDOW',11,'A'),(7,3,'11B','AISLE',11,'B'),
(7,3,'11C','AISLE',11,'C'),(7,3,'11D','MIDDLE',11,'D'),(7,3,'11E','MIDDLE',11,'E'),(7,3,'11F','AISLE',11,'F'),
(7,3,'11G','AISLE',11,'G'),(7,3,'11H','WINDOW',11,'H'),
(7,3,'12A','WINDOW',12,'A'),(7,3,'12B','AISLE',12,'B'),
(7,3,'12C','AISLE',12,'C'),(7,3,'12D','MIDDLE',12,'D'),(7,3,'12E','MIDDLE',12,'E'),(7,3,'12F','AISLE',12,'F'),
(7,3,'12G','AISLE',12,'G'),(7,3,'12H','WINDOW',12,'H'),
(7,3,'13A','WINDOW',13,'A'),(7,3,'13B','AISLE',13,'B'),
(7,3,'13C','AISLE',13,'C'),(7,3,'13D','MIDDLE',13,'D'),(7,3,'13E','MIDDLE',13,'E'),(7,3,'13F','AISLE',13,'F'),
(7,3,'13G','AISLE',13,'G'),(7,3,'13H','WINDOW',13,'H'),
(7,3,'14A','WINDOW',14,'A'),(7,3,'14B','AISLE',14,'B'),
(7,3,'14C','AISLE',14,'C'),(7,3,'14D','MIDDLE',14,'D'),(7,3,'14E','MIDDLE',14,'E'),(7,3,'14F','AISLE',14,'F'),
(7,3,'14G','AISLE',14,'G'),(7,3,'14H','WINDOW',14,'H'),
(7,3,'15A','WINDOW',15,'A'),(7,3,'15B','AISLE',15,'B'),
(7,3,'15C','AISLE',15,'C'),(7,3,'15D','MIDDLE',15,'D'),(7,3,'15E','MIDDLE',15,'E'),(7,3,'15F','AISLE',15,'F'),
(7,3,'15G','AISLE',15,'G'),(7,3,'15H','WINDOW',15,'H'),
(7,3,'16A','WINDOW',16,'A'),(7,3,'16B','AISLE',16,'B'),
(7,3,'16C','AISLE',16,'C'),(7,3,'16D','MIDDLE',16,'D'),(7,3,'16E','MIDDLE',16,'E'),(7,3,'16F','AISLE',16,'F'),
(7,3,'16G','AISLE',16,'G'),(7,3,'16H','WINDOW',16,'H'),
(7,3,'17A','WINDOW',17,'A'),(7,3,'17B','AISLE',17,'B'),
(7,3,'17C','AISLE',17,'C'),(7,3,'17D','MIDDLE',17,'D'),(7,3,'17E','MIDDLE',17,'E'),(7,3,'17F','AISLE',17,'F'),
(7,3,'17G','AISLE',17,'G'),(7,3,'17H','WINDOW',17,'H'),
(7,3,'18A','WINDOW',18,'A'),(7,3,'18B','AISLE',18,'B'),
(7,3,'18C','AISLE',18,'C'),(7,3,'18D','MIDDLE',18,'D'),(7,3,'18E','MIDDLE',18,'E'),(7,3,'18F','AISLE',18,'F'),
(7,3,'18G','AISLE',18,'G'),(7,3,'18H','WINDOW',18,'H'),
-- Economy Saver rows 19-24 (8 ghế/hàng)
(7,2,'19A','WINDOW',19,'A'),(7,2,'19B','AISLE',19,'B'),
(7,2,'19C','AISLE',19,'C'),(7,2,'19D','MIDDLE',19,'D'),(7,2,'19E','MIDDLE',19,'E'),(7,2,'19F','AISLE',19,'F'),
(7,2,'19G','AISLE',19,'G'),(7,2,'19H','WINDOW',19,'H'),
(7,2,'20A','WINDOW',20,'A'),(7,2,'20B','AISLE',20,'B'),
(7,2,'20C','AISLE',20,'C'),(7,2,'20D','MIDDLE',20,'D'),(7,2,'20E','MIDDLE',20,'E'),(7,2,'20F','AISLE',20,'F'),
(7,2,'20G','AISLE',20,'G'),(7,2,'20H','WINDOW',20,'H'),
(7,2,'21A','WINDOW',21,'A'),(7,2,'21B','AISLE',21,'B'),
(7,2,'21C','AISLE',21,'C'),(7,2,'21D','MIDDLE',21,'D'),(7,2,'21E','MIDDLE',21,'E'),(7,2,'21F','AISLE',21,'F'),
(7,2,'21G','AISLE',21,'G'),(7,2,'21H','WINDOW',21,'H'),
(7,2,'22A','WINDOW',22,'A'),(7,2,'22B','AISLE',22,'B'),
(7,2,'22C','AISLE',22,'C'),(7,2,'22D','MIDDLE',22,'D'),(7,2,'22E','MIDDLE',22,'E'),(7,2,'22F','AISLE',22,'F'),
(7,2,'22G','AISLE',22,'G'),(7,2,'22H','WINDOW',22,'H'),
(7,2,'23A','WINDOW',23,'A'),(7,2,'23B','AISLE',23,'B'),
(7,2,'23C','AISLE',23,'C'),(7,2,'23D','MIDDLE',23,'D'),(7,2,'23E','MIDDLE',23,'E'),(7,2,'23F','AISLE',23,'F'),
(7,2,'23G','AISLE',23,'G'),(7,2,'23H','WINDOW',23,'H'),
(7,2,'24A','WINDOW',24,'A'),(7,2,'24B','AISLE',24,'B'),
(7,2,'24C','AISLE',24,'C'),(7,2,'24D','MIDDLE',24,'D'),(7,2,'24E','MIDDLE',24,'E'),(7,2,'24F','AISLE',24,'F'),
(7,2,'24G','AISLE',24,'G'),(7,2,'24H','WINDOW',24,'H'),
-- Economy rows 25-32 (8 ghế/hàng = 64 ghế) + row 33 (6 ghế A-F) = 70 → total 12+40+80+48+70=250 ✓
(7,1,'25A','WINDOW',25,'A'),(7,1,'25B','AISLE',25,'B'),
(7,1,'25C','AISLE',25,'C'),(7,1,'25D','MIDDLE',25,'D'),(7,1,'25E','MIDDLE',25,'E'),(7,1,'25F','AISLE',25,'F'),
(7,1,'25G','AISLE',25,'G'),(7,1,'25H','WINDOW',25,'H'),
(7,1,'26A','WINDOW',26,'A'),(7,1,'26B','AISLE',26,'B'),
(7,1,'26C','AISLE',26,'C'),(7,1,'26D','MIDDLE',26,'D'),(7,1,'26E','MIDDLE',26,'E'),(7,1,'26F','AISLE',26,'F'),
(7,1,'26G','AISLE',26,'G'),(7,1,'26H','WINDOW',26,'H'),
(7,1,'27A','WINDOW',27,'A'),(7,1,'27B','AISLE',27,'B'),
(7,1,'27C','AISLE',27,'C'),(7,1,'27D','MIDDLE',27,'D'),(7,1,'27E','MIDDLE',27,'E'),(7,1,'27F','AISLE',27,'F'),
(7,1,'27G','AISLE',27,'G'),(7,1,'27H','WINDOW',27,'H'),
(7,1,'28A','WINDOW',28,'A'),(7,1,'28B','AISLE',28,'B'),
(7,1,'28C','AISLE',28,'C'),(7,1,'28D','MIDDLE',28,'D'),(7,1,'28E','MIDDLE',28,'E'),(7,1,'28F','AISLE',28,'F'),
(7,1,'28G','AISLE',28,'G'),(7,1,'28H','WINDOW',28,'H'),
(7,1,'29A','WINDOW',29,'A'),(7,1,'29B','AISLE',29,'B'),
(7,1,'29C','AISLE',29,'C'),(7,1,'29D','MIDDLE',29,'D'),(7,1,'29E','MIDDLE',29,'E'),(7,1,'29F','AISLE',29,'F'),
(7,1,'29G','AISLE',29,'G'),(7,1,'29H','WINDOW',29,'H'),
(7,1,'30A','WINDOW',30,'A'),(7,1,'30B','AISLE',30,'B'),
(7,1,'30C','AISLE',30,'C'),(7,1,'30D','MIDDLE',30,'D'),(7,1,'30E','MIDDLE',30,'E'),(7,1,'30F','AISLE',30,'F'),
(7,1,'30G','AISLE',30,'G'),(7,1,'30H','WINDOW',30,'H'),
(7,1,'31A','WINDOW',31,'A'),(7,1,'31B','AISLE',31,'B'),
(7,1,'31C','AISLE',31,'C'),(7,1,'31D','MIDDLE',31,'D'),(7,1,'31E','MIDDLE',31,'E'),(7,1,'31F','AISLE',31,'F'),
(7,1,'31G','AISLE',31,'G'),(7,1,'31H','WINDOW',31,'H'),
(7,1,'32A','WINDOW',32,'A'),(7,1,'32B','AISLE',32,'B'),
(7,1,'32C','AISLE',32,'C'),(7,1,'32D','MIDDLE',32,'D'),(7,1,'32E','MIDDLE',32,'E'),(7,1,'32F','AISLE',32,'F'),
(7,1,'32G','AISLE',32,'G'),(7,1,'32H','WINDOW',32,'H'),
-- Thêm 6 ghế hàng 33 để đạt đúng 250
(7,1,'33A','WINDOW',33,'A'),(7,1,'33B','AISLE',33,'B'),
(7,1,'33C','AISLE',33,'C'),(7,1,'33D','MIDDLE',33,'D'),(7,1,'33E','MIDDLE',33,'E'),(7,1,'33F','AISLE',33,'F');
