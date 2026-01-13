-- =================================================================
-- FLYWAY MIGRATION V2: Initial Data
-- Description: Insert initial data for Airline Booking System
-- =================================================================

-- =================================================================
-- 1. BẢNG DỮ LIỆU CƠ SỞ (CORE TABLES)
-- =================================================================

-- Bảng sân bay
INSERT INTO `sanbay` (`masanbay`, `ma_iata`, `ma_icao`, `tensanbay`, `thanhphosanbay`, `quocgiasanbay`, `trangthaihoatdong`, `da_xoa`, `deleted_at`) VALUES
(1, 'SGN', 'VVTS', 'Sân bay Quốc tế Tân Sơn Nhất', 'Thành phố Hồ Chí Minh', 'Việt Nam', 'ACTIVE', 0, NULL),
(2, 'HAN', 'VVNB', 'Sân bay Quốc tế Nội Bài', 'Hà Nội', 'Việt Nam', 'ACTIVE', 0, NULL),
(3, 'DAD', 'VVDN', 'Sân bay Quốc tế Đà Nẵng', 'Đà Nẵng', 'Việt Nam', 'ACTIVE', 0, NULL);

-- Bảng hạng vé
INSERT INTO `hangve` (`mahangve`, `tenhangve`, `da_xoa`, `deleted_at`) VALUES
(1, 'Economy', 0, NULL),
(2, 'Economy Saver', 0, NULL),
(3, 'Deluxe', 0, NULL),
(4, 'Business', 0, NULL),
(5, 'First Class', 0, NULL);

-- Bảng tuyến bay
INSERT INTO `tuyenbay` (`matuyenbay`, `masanbaydi`, `masanbayden`, `da_xoa`, `deleted_at`) VALUES
(1, 1, 2, 0, NULL),
(2, 2, 1, 0, NULL),
(3, 1, 3, 0, NULL),
(4, 3, 1, 0, NULL);

-- Bảng máy bay
INSERT INTO `maybay` (`mamaybay`, `tenmaybay`, `hangmaybay`, `loaimaybay`, `sohieu`, `tongsoghe`, `trangthai`, `namkhaithac`, `da_xoa`, `deleted_at`) VALUES
(1, 'Airbus A320', 'Vietnam Airlines', 'Airbus A320', 'VN-A320', 180, 'Active', 2015, 0, NULL),
(2, 'Boeing 737', 'Vietnam Airlines', 'Boeing 737-800', 'VN-B737', 180, 'Active', 2016, 0, NULL),
(3, 'Airbus A321', 'Vietjet Air', 'Airbus A321', 'VJ-A321', 180, 'Active', 2017, 0, NULL),
(4, 'Boeing 787', 'Vietnam Airlines', 'Boeing 787-9', 'VN-B789', 280, 'Active', 2018, 0, NULL);

-- Bảng chi tiết ghế (sơ đồ ghế cho mỗi máy bay)
-- Máy bay 1 (VN-A320) - 180 ghế
INSERT INTO `chitietghe` (`maghe`, `mamaybay`, `mahangve`, `soghe`, `vitrighe`, `hang`, `cot`) VALUES
-- Economy Class (24 ghế)
(1, 1, 1, '1A', 'WINDOW', 1, 'A'), (2, 1, 1, '1B', 'MIDDLE', 1, 'B'), (3, 1, 1, '1C', 'AISLE', 1, 'C'),
(4, 1, 1, '1D', 'AISLE', 1, 'D'), (5, 1, 1, '1E', 'MIDDLE', 1, 'E'), (6, 1, 1, '1F', 'WINDOW', 1, 'F'),
(7, 1, 1, '2A', 'WINDOW', 2, 'A'), (8, 1, 1, '2B', 'MIDDLE', 2, 'B'), (9, 1, 1, '2C', 'AISLE', 2, 'C'),
(10, 1, 1, '2D', 'AISLE', 2, 'D'), (11, 1, 1, '2E', 'MIDDLE', 2, 'E'), (12, 1, 1, '2F', 'WINDOW', 2, 'F'),
(13, 1, 1, '3A', 'WINDOW', 3, 'A'), (14, 1, 1, '3B', 'MIDDLE', 3, 'B'), (15, 1, 1, '3C', 'AISLE', 3, 'C'),
(16, 1, 1, '3D', 'AISLE', 3, 'D'), (17, 1, 1, '3E', 'MIDDLE', 3, 'E'), (18, 1, 1, '3F', 'WINDOW', 3, 'F'),
(19, 1, 1, '4A', 'WINDOW', 4, 'A'), (20, 1, 1, '4B', 'MIDDLE', 4, 'B'), (21, 1, 1, '4C', 'AISLE', 4, 'C'),
(22, 1, 1, '4D', 'AISLE', 4, 'D'), (23, 1, 1, '4E', 'MIDDLE', 4, 'E'), (24, 1, 1, '4F', 'WINDOW', 4, 'F'),
-- Economy Saver (20 ghế)
(25, 1, 2, '5A', 'WINDOW', 5, 'A'), (26, 1, 2, '5B', 'MIDDLE', 5, 'B'), (27, 1, 2, '5C', 'AISLE', 5, 'C'),
(28, 1, 2, '5D', 'AISLE', 5, 'D'), (29, 1, 2, '5E', 'MIDDLE', 5, 'E'), (30, 1, 2, '5F', 'WINDOW', 5, 'F'),
(31, 1, 2, '6A', 'WINDOW', 6, 'A'), (32, 1, 2, '6B', 'MIDDLE', 6, 'B'), (33, 1, 2, '6C', 'AISLE', 6, 'C'),
(34, 1, 2, '6D', 'AISLE', 6, 'D'), (35, 1, 2, '6E', 'MIDDLE', 6, 'E'), (36, 1, 2, '6F', 'WINDOW', 6, 'F'),
(37, 1, 2, '7A', 'WINDOW', 7, 'A'), (38, 1, 2, '7B', 'MIDDLE', 7, 'B'), (39, 1, 2, '7C', 'AISLE', 7, 'C'),
(40, 1, 2, '7D', 'AISLE', 7, 'D'), (41, 1, 2, '7E', 'MIDDLE', 7, 'E'), (42, 1, 2, '7F', 'WINDOW', 7, 'F'),
(43, 1, 2, '8A', 'WINDOW', 8, 'A'), (44, 1, 2, '8B', 'MIDDLE', 8, 'B'),
-- Deluxe (50 ghế)
(45, 1, 3, '8C', 'AISLE', 8, 'C'), (46, 1, 3, '8D', 'AISLE', 8, 'D'), (47, 1, 3, '8E', 'MIDDLE', 8, 'E'), (48, 1, 3, '8F', 'WINDOW', 8, 'F'),
(49, 1, 3, '9A', 'WINDOW', 9, 'A'), (50, 1, 3, '9B', 'MIDDLE', 9, 'B'), (51, 1, 3, '9C', 'AISLE', 9, 'C'),
(52, 1, 3, '9D', 'AISLE', 9, 'D'), (53, 1, 3, '9E', 'MIDDLE', 9, 'E'), (54, 1, 3, '9F', 'WINDOW', 9, 'F'),
(55, 1, 3, '10A', 'WINDOW', 10, 'A'), (56, 1, 3, '10B', 'MIDDLE', 10, 'B'), (57, 1, 3, '10C', 'AISLE', 10, 'C'),
(58, 1, 3, '10D', 'AISLE', 10, 'D'), (59, 1, 3, '10E', 'MIDDLE', 10, 'E'), (60, 1, 3, '10F', 'WINDOW', 10, 'F'),
(61, 1, 3, '11A', 'WINDOW', 11, 'A'), (62, 1, 3, '11B', 'MIDDLE', 11, 'B'), (63, 1, 3, '11C', 'AISLE', 11, 'C'),
(64, 1, 3, '11D', 'AISLE', 11, 'D'), (65, 1, 3, '11E', 'MIDDLE', 11, 'E'), (66, 1, 3, '11F', 'WINDOW', 11, 'F'),
(67, 1, 3, '12A', 'WINDOW', 12, 'A'), (68, 1, 3, '12B', 'MIDDLE', 12, 'B'), (69, 1, 3, '12C', 'AISLE', 12, 'C'),
(70, 1, 3, '12D', 'AISLE', 12, 'D'), (71, 1, 3, '12E', 'MIDDLE', 12, 'E'), (72, 1, 3, '12F', 'WINDOW', 12, 'F'),
(73, 1, 3, '13A', 'WINDOW', 13, 'A'), (74, 1, 3, '13B', 'MIDDLE', 13, 'B'), (75, 1, 3, '13C', 'AISLE', 13, 'C'),
(76, 1, 3, '13D', 'AISLE', 13, 'D'), (77, 1, 3, '13E', 'MIDDLE', 13, 'E'), (78, 1, 3, '13F', 'WINDOW', 13, 'F'),
(79, 1, 3, '14A', 'WINDOW', 14, 'A'), (80, 1, 3, '14B', 'MIDDLE', 14, 'B'), (81, 1, 3, '14C', 'AISLE', 14, 'C'),
(82, 1, 3, '14D', 'AISLE', 14, 'D'), (83, 1, 3, '14E', 'MIDDLE', 14, 'E'), (84, 1, 3, '14F', 'WINDOW', 14, 'F'),
(85, 1, 3, '15A', 'WINDOW', 15, 'A'), (86, 1, 3, '15B', 'MIDDLE', 15, 'B'), (87, 1, 3, '15C', 'AISLE', 15, 'C'),
(88, 1, 3, '15D', 'AISLE', 15, 'D'), (89, 1, 3, '15E', 'MIDDLE', 15, 'E'), (90, 1, 3, '15F', 'WINDOW', 15, 'F'),
(91, 1, 3, '16A', 'WINDOW', 16, 'A'), (92, 1, 3, '16B', 'MIDDLE', 16, 'B'),
-- Business (80 ghế)
(93, 1, 4, '16C', 'AISLE', 16, 'C'), (94, 1, 4, '16D', 'AISLE', 16, 'D'), (95, 1, 4, '16E', 'MIDDLE', 16, 'E'), (96, 1, 4, '16F', 'WINDOW', 16, 'F'),
(97, 1, 4, '17A', 'WINDOW', 17, 'A'), (98, 1, 4, '17B', 'MIDDLE', 17, 'B'), (99, 1, 4, '17C', 'AISLE', 17, 'C'),
(100, 1, 4, '17D', 'AISLE', 17, 'D'), (101, 1, 4, '17E', 'MIDDLE', 17, 'E'), (102, 1, 4, '17F', 'WINDOW', 17, 'F'),
(103, 1, 4, '18A', 'WINDOW', 18, 'A'), (104, 1, 4, '18B', 'MIDDLE', 18, 'B'), (105, 1, 4, '18C', 'AISLE', 18, 'C'),
(106, 1, 4, '18D', 'AISLE', 18, 'D'), (107, 1, 4, '18E', 'MIDDLE', 18, 'E'), (108, 1, 4, '18F', 'WINDOW', 18, 'F'),
(109, 1, 4, '19A', 'WINDOW', 19, 'A'), (110, 1, 4, '19B', 'MIDDLE', 19, 'B'), (111, 1, 4, '19C', 'AISLE', 19, 'C'),
(112, 1, 4, '19D', 'AISLE', 19, 'D'), (113, 1, 4, '19E', 'MIDDLE', 19, 'E'), (114, 1, 4, '19F', 'WINDOW', 19, 'F'),
(115, 1, 4, '20A', 'WINDOW', 20, 'A'), (116, 1, 4, '20B', 'MIDDLE', 20, 'B'), (117, 1, 4, '20C', 'AISLE', 20, 'C'),
(118, 1, 4, '20D', 'AISLE', 20, 'D'), (119, 1, 4, '20E', 'MIDDLE', 20, 'E'), (120, 1, 4, '20F', 'WINDOW', 20, 'F'),
(121, 1, 4, '21A', 'WINDOW', 21, 'A'), (122, 1, 4, '21B', 'MIDDLE', 21, 'B'), (123, 1, 4, '21C', 'AISLE', 21, 'C'),
(124, 1, 4, '21D', 'AISLE', 21, 'D'), (125, 1, 4, '21E', 'MIDDLE', 21, 'E'), (126, 1, 4, '21F', 'WINDOW', 21, 'F'),
(127, 1, 4, '22A', 'WINDOW', 22, 'A'), (128, 1, 4, '22B', 'MIDDLE', 22, 'B'), (129, 1, 4, '22C', 'AISLE', 22, 'C'),
(130, 1, 4, '22D', 'AISLE', 22, 'D'), (131, 1, 4, '22E', 'MIDDLE', 22, 'E'), (132, 1, 4, '22F', 'WINDOW', 22, 'F'),
(133, 1, 4, '23A', 'WINDOW', 23, 'A'), (134, 1, 4, '23B', 'MIDDLE', 23, 'B'), (135, 1, 4, '23C', 'AISLE', 23, 'C'),
(136, 1, 4, '23D', 'AISLE', 23, 'D'), (137, 1, 4, '23E', 'MIDDLE', 23, 'E'), (138, 1, 4, '23F', 'WINDOW', 23, 'F'),
(139, 1, 4, '24A', 'WINDOW', 24, 'A'), (140, 1, 4, '24B', 'MIDDLE', 24, 'B'), (141, 1, 4, '24C', 'AISLE', 24, 'C'),
(142, 1, 4, '24D', 'AISLE', 24, 'D'), (143, 1, 4, '24E', 'MIDDLE', 24, 'E'), (144, 1, 4, '24F', 'WINDOW', 24, 'F'),
(145, 1, 4, '25A', 'WINDOW', 25, 'A'), (146, 1, 4, '25B', 'MIDDLE', 25, 'B'), (147, 1, 4, '25C', 'AISLE', 25, 'C'),
(148, 1, 4, '25D', 'AISLE', 25, 'D'), (149, 1, 4, '25E', 'MIDDLE', 25, 'E'), (150, 1, 4, '25F', 'WINDOW', 25, 'F'),
(151, 1, 4, '26A', 'WINDOW', 26, 'A'), (152, 1, 4, '26B', 'MIDDLE', 26, 'B'), (153, 1, 4, '26C', 'AISLE', 26, 'C'),
(154, 1, 4, '26D', 'AISLE', 26, 'D'), (155, 1, 4, '26E', 'MIDDLE', 26, 'E'), (156, 1, 4, '26F', 'WINDOW', 26, 'F'),
(157, 1, 4, '27A', 'WINDOW', 27, 'A'), (158, 1, 4, '27B', 'MIDDLE', 27, 'B'), (159, 1, 4, '27C', 'AISLE', 27, 'C'),
(160, 1, 4, '27D', 'AISLE', 27, 'D'), (161, 1, 4, '27E', 'MIDDLE', 27, 'E'), (162, 1, 4, '27F', 'WINDOW', 27, 'F'),
(163, 1, 4, '28A', 'WINDOW', 28, 'A'), (164, 1, 4, '28B', 'MIDDLE', 28, 'B'),
-- First Class (52 ghế)
(165, 1, 5, '28C', 'AISLE', 28, 'C'), (166, 1, 5, '28D', 'AISLE', 28, 'D'), (167, 1, 5, '28E', 'MIDDLE', 28, 'E'), (168, 1, 5, '28F', 'WINDOW', 28, 'F'),
(169, 1, 5, '29A', 'WINDOW', 29, 'A'), (170, 1, 5, '29B', 'MIDDLE', 29, 'B'), (171, 1, 5, '29C', 'AISLE', 29, 'C'),
(172, 1, 5, '29D', 'AISLE', 29, 'D'), (173, 1, 5, '29E', 'MIDDLE', 29, 'E'), (174, 1, 5, '29F', 'WINDOW', 29, 'F'),
(175, 1, 5, '30A', 'WINDOW', 30, 'A'), (176, 1, 5, '30B', 'MIDDLE', 30, 'B'), (177, 1, 5, '30C', 'AISLE', 30, 'C'),
(178, 1, 5, '30D', 'AISLE', 30, 'D'), (179, 1, 5, '30E', 'MIDDLE', 30, 'E'), (180, 1, 5, '30F', 'WINDOW', 30, 'F');

-- Bảng dịch vụ cung cấp
INSERT INTO `dichvucungcap` (`madichvu`, `tendichvu`, `mota`, `anh`, `da_xoa`, `deleted_at`) VALUES
(1, 'Hành lý ký gửi', 'Hãy lựa chọn gói hành lý phù hợp', '1.svg', 0, NULL),
(2, 'Suất ăn trên máy bay', 'Chọn suất ăn cho chuyến bay', '2.svg', 0, NULL),
(3, 'Bảo hiểm du lịch', 'Dịch vụ gồm: đón tiếp, tiễn khách tại sân bay; Hỗ trợ quá trình làm thủ tục, hướng dẫn chỉ đường đi tại sân bay, tiếp nhận và chuyển trả hành lý cho hành khách tại ga đi, ga đến.', '3.svg', 0, NULL),
(4, 'Trẻ em bay một mình (12- dưới 14 tuổi)', 'Dịch vụ đồng hành cùng trẻ từ 12 tuổi đến dưới 14 tuổi, bay một mình với cấp sự giám sát và hỗ trợ đặc biệt cho trẻ trong suốt hành trình, từ lúc làm thủ tục tại sân bay xuất phát cho đến khi được người giám hộ đón tại điểm đến.', '4.svg', 0, NULL),
(5, 'Mang theo thú cưng', 'Cho phép mang thú cưng lên máy bay', '5.svg', 0, NULL);

-- Bảng lựa chọn dịch vụ (chi tiết của dịch vụ cung cấp)
INSERT INTO `luachondichvu` (`maluachon`, `madichvu`, `tenluachon`, `mota`, `gia`, `anh`, `da_xoa`, `deleted_at`) VALUES
(1, 1, 'Gói 20kg', 'Hành lý ký gửi tiêu chuẩn', 250000.00, '1.jpg', 0, NULL),
(2, 1, 'Gói 30kg', 'Hành lý ký gửi thêm', 400000.00, '2.jpg', 0, NULL),
(3, 2, 'Combo Cơm chiên Thái + Hạt điều + Nước suối', 'Cơm chay và rau củ', 150000.00, '3.jpg', 0, NULL),
(4, 2, 'Red Bull', 'Nước uống giải khát', 40000.00, '4.jpg', 0, NULL),
(5, 2, 'Rượu vang đỏ', 'Rượu', 40000.00, '5.jpg', 0, NULL),
(6, 3, 'Bảo hiểm du lịch', 'Áp dụng toàn bộ chuyến đi', 200000.00, '6.jpg', 0, NULL),
(7, 4, 'Trẻ em bay một mình', 'Dịch vụ đồng hành cho trẻ em', 300000.00, '7.jpg', 0, NULL),
(8, 5, 'Thú cưng dưới 7kg', 'Mang theo thú cưng dưới 7kg', 4000000.00, '8.jpg', 0, NULL);

-- =================================================================
-- 2. BẢNG KHUYẾN MÃI
-- =================================================================

INSERT INTO `khuyenmai` (`makhuyenmai`, `makm`, `tenkhuyenmai`, `mota`, `loaikhuyenmai`, `giatrigiam`, `giatritoithieu`, `giatritoida`, `soluong`, `soluongdaduocdung`, `ngaybatdau`, `ngayketthuc`, `trangthai`, `ngaytao`, `da_xoa`, `deleted_at`) VALUES
(1, 'SALE20', 'Giảm 20% giá vé', 'Giảm 20% tổng giá đơn hàng', 'PERCENT', 20.00, 500000.00, NULL, 100, 0, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'ACTIVE', '2025-01-01 00:00:00', 0, NULL),
(2, 'WEEKEND15', 'Giảm 15% cuối tuần', 'Áp dụng cho đặt vé ngày thứ 7, CN', 'PERCENT', 15.00, 1000000.00, NULL, 200, 0, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'ACTIVE', '2025-01-01 00:00:00', 0, NULL),
(3, 'ECONOMY10', 'Giảm 10% vé Economy', 'Áp dụng cho vé hạng Economy', 'PERCENT', 10.00, 300000.00, NULL, 150, 0, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'ACTIVE', '2025-01-01 00:00:00', 0, NULL),
(4, 'GIA100K', 'Giảm 100.000 VNĐ', 'Giảm trực tiếp 100.000 VNĐ', 'FIXED', 100000.00, 1500000.00, NULL, 500, 0, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'ACTIVE', '2025-01-01 00:00:00', 0, NULL),
(5, 'GIA200K', 'Giảm 200.000 VNĐ', 'Giảm trực tiếp 200.000 VNĐ', 'FIXED', 200000.00, 3000000.00, NULL, 300, 0, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'ACTIVE', '2025-01-01 00:00:00', 0, NULL),
(6, 'VIP50', 'Giảm 50% cho VIP', 'Giảm 50%, giới hạn 50 lượt', 'PERCENT', 50.00, 2000000.00, 3000000.00, 50, 0, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 'ACTIVE', '2025-01-01 00:00:00', 0, NULL),
(7, 'CHRISTMAS25', 'Giảm 25% Giáng sinh', 'Áp dụng cho chuyến bay trong tháng 12', 'PERCENT', 25.00, 2000000.00, 4000000.00, 100, 0, '2025-12-01 00:00:00', '2025-12-31 23:59:59', 'ACTIVE', '2025-12-01 00:00:00', 0, NULL),
(8, 'NEWYEAR30', 'Giảm 30% Năm mới', 'Áp dụng cho chuyến bay tháng 1', 'PERCENT', 30.00, 2000000.00, 4000000.00, 80, 0, '2026-01-01 00:00:00', '2026-01-31 23:59:59', 'ACTIVE', '2026-01-01 00:00:00', 0, NULL);

-- =================================================================
-- 3. BẢNG HÀNH KHÁCH VÀ TÀI KHOẢN
-- =================================================================

INSERT INTO `hanhkhach` (`mahanhkhach`, `hovaten`, `ngaysinh`, `gioitinh`, `sodienthoai`, `email`, `madinhdanh`, `diachi`, `quocgia`, `da_xoa`, `deleted_at`) VALUES
(1, 'Nguyễn Văn A', '1990-05-15', 'Nam', '0909123456', 'nguyenvana@example.com', '001090001234', '123 Nguyễn Huệ, Q1', 'Việt Nam', 0, NULL),
(2, 'Trần Thị B', '1995-11-20', 'Nu', '0987654321', 'tranthib@example.com', '001195005678', '456 Lê Lợi, Q3', 'Việt Nam', 0, NULL),
(3, 'Lê Văn C', '1988-03-10', 'Nam', '0912345678', 'levanc@example.com', '001088003456', '789 Trần Hưng Đạo, Q5', 'Việt Nam', 0, NULL),
(4, 'Phạm Thị D', '1992-07-25', 'Nu', '0987654322', 'phamthid@example.com', '001192007890', '321 Lý Tự Trọng, Q1', 'Việt Nam', 0, NULL),
(5, 'Hoàng Minh E', '1985-12-05', 'Nam', '0909876543', 'hoangmine@example.com', '001085012345', '654 Nguyễn Thị Minh Khai, Q3', 'Việt Nam', 0, NULL),
(6, 'Nguyễn Thị F', '1998-09-15', 'Nu', '0976543210', 'nguyenthif@example.com', '001198009876', '987 Đề Thám, Q1', 'Việt Nam', 0, NULL),
(7, 'Trần Văn G', '1990-11-30', 'Nam', '0965432109', 'tranvang@example.com', '001090011234', '147 Pasteur, Q3', 'Việt Nam', 0, NULL);

-- Bảng tài khoản khách hàng
INSERT INTO `taikhoan` (`mataikhoan`, `mahanhkhach`, `email`, `matkhaubam`, `trangthai`, `email_verified`, `ngaytao`, `oauth2_provider`, `da_xoa`, `deleted_at`) VALUES
(1, 1, 'nguyenvana@example.com', '$2a$10$I5SiBaX8ndre0SwNPpZ0guVNr7vpOMCnq45zaZH.t3CtefC7UvwIK', 'ACTIVE', 1, '2025-09-12 10:00:00', NULL, 0, NULL),
(2, 3, 'levanc@example.com', '$2a$10$I5SiBaX8ndre0SwNPpZ0guVNr7vpOMCnq45zaZH.t3CtefC7UvwIK', 'ACTIVE', 0, '2025-10-30 08:00:00', NULL, 0, NULL),
(3, 4, 'phamthid@example.com', '$2a$10$I5SiBaX8ndre0SwNPpZ0guVNr7vpOMCnq45zaZH.t3CtefC7UvwIK', 'ACTIVE', 0, '2025-11-01 14:30:00', NULL, 0, NULL),
(4, 5, 'hoangmine@example.com', '$2a$10$I5SiBaX8ndre0SwNPpZ0guVNr7vpOMCnq45zaZH.t3CtefC7UvwIK', 'ACTIVE', 0, '2025-11-02 10:15:00', NULL, 0, NULL),
(5, 6, 'nguyenthif@example.com', '$2a$10$I5SiBaX8ndre0SwNPpZ0guVNr7vpOMCnq45zaZH.t3CtefC7UvwIK', 'ACTIVE', 0, '2025-11-03 16:45:00', NULL, 0, NULL),
(6, 7, 'tranvang@example.com', '$2a$10$I5SiBaX8ndre0SwNPpZ0guVNr7vpOMCnq45zaZH.t3CtefC7UvwIK', 'ACTIVE', 0, '2025-11-04 12:20:00', NULL, 0, NULL);

-- =================================================================
-- 4. BẢNG CHUYẾN BAY VÀ GIÁ VÉ
-- =================================================================

-- Bảng giá chuyến bay
INSERT INTO `giachuyenbay` (`magia`, `matuyenbay`, `mahangve`, `giave`, `soluong_phanbo`, `soluong_daban`, `ngayapdungtu`, `ngayapdungden`, `da_xoa`, `deleted_at`) VALUES
(1, 1, 1, 1200000.00, 25, 0, '2025-01-01', NULL, 0, NULL),
(2, 1, 2, 1000000.00, 20, 0, '2025-01-01', NULL, 0, NULL),
(3, 1, 3, 2000000.00, 50, 0, '2025-01-01', NULL, 0, NULL),
(4, 1, 4, 4000000.00, 75, 0, '2025-01-01', NULL, 0, NULL),
(5, 1, 5, 6000000.00, 100, 0, '2025-01-01', NULL, 0, NULL),
(6, 2, 1, 1200000.00, 25, 0, '2025-01-01', NULL, 0, NULL),
(7, 2, 2, 1000000.00, 20, 0, '2025-01-01', NULL, 0, NULL),
(8, 2, 3, 2000000.00, 50, 0, '2025-01-01', NULL, 0, NULL),
(9, 2, 4, 4000000.00, 75, 0, '2025-01-01', NULL, 0, NULL),
(10, 2, 5, 6000000.00, 100, 0, '2025-01-01', NULL, 0, NULL),
(11, 3, 1, 900000.00, 25, 0, '2025-01-01', NULL, 0, NULL),
(12, 3, 2, 750000.00, 20, 0, '2025-01-01', NULL, 0, NULL),
(13, 3, 3, 1500000.00, 50, 0, '2025-01-01', NULL, 0, NULL),
(14, 3, 4, 3000000.00, 75, 0, '2025-01-01', NULL, 0, NULL),
(15, 3, 5, 4500000.00, 100, 0, '2025-01-01', NULL, 0, NULL),
(16, 4, 1, 900000.00, 25, 0, '2025-01-01', NULL, 0, NULL),
(17, 4, 2, 750000.00, 20, 0, '2025-01-01', NULL, 0, NULL),
(18, 4, 3, 1500000.00, 50, 0, '2025-01-01', NULL, 0, NULL),
(19, 4, 4, 3000000.00, 75, 0, '2025-01-01', NULL, 0, NULL),
(20, 4, 5, 4500000.00, 100, 0, '2025-01-01', NULL, 0, NULL);

-- Bảng chi tiết chuyến bay
INSERT INTO `chitietchuyenbay` (`machuyenbay`, `matuyenbay`, `mamaybay`, `sohieuchuyenbay`, `ngaydi`, `giodi`, `ngayden`, `gioden`, `trangthai`, `thoigianden_thucte`, `thoigiandi_thucte`, `lydoDelay`, `da_xoa`, `deleted_at`) VALUES
(1, 1, 1, 'VN240', '2026-01-15', '08:00:00', '2026-01-15', '10:05:00', 'OPEN', NULL, NULL, NULL, 0, NULL),
(2, 1, 2, 'VJ130', '2026-01-15', '10:30:00', '2026-01-15', '12:35:00', 'OPEN', NULL, NULL, NULL, 0, NULL),
(3, 3, 3, 'VN712', '2026-01-16', '15:00:00', '2026-01-16', '16:15:00', 'OPEN', NULL, NULL, NULL, 0, NULL),
(4, 2, 1, 'VN241', '2026-01-17', '11:00:00', '2026-01-17', '13:05:00', 'OPEN', NULL, NULL, NULL, 0, NULL),
(5, 1, 2, 'VN300', '2026-01-18', '09:00:00', '2026-01-18', '11:00:00', 'OPEN', NULL, NULL, NULL, 0, NULL),
(6, 3, 3, 'VN800', '2026-01-19', '14:00:00', '2026-01-19', '15:15:00', 'OPEN', NULL, NULL, NULL, 0, NULL),
(7, 2, 1, 'VN250', '2026-01-20', '06:30:00', '2026-01-20', '08:35:00', 'OPEN', NULL, NULL, NULL, 0, NULL),
(8, 1, 2, 'VN251', '2026-01-20', '09:15:00', '2026-01-20', '11:20:00', 'OPEN', NULL, NULL, NULL, 0, NULL),
(9, 1, 3, 'VN252', '2026-01-21', '14:45:00', '2026-01-21', '16:50:00', 'OPEN', NULL, NULL, NULL, 0, NULL),
(10, 1, 1, 'VN253', '2026-01-22', '07:00:00', '2026-01-22', '09:05:00', 'OPEN', NULL, NULL, NULL, 0, NULL),
(11, 1, 2, 'VN254', '2026-01-23', '11:30:00', '2026-01-23', '13:35:00', 'OPEN', NULL, NULL, NULL, 0, NULL),
(12, 1, 3, 'VN255', '2026-01-24', '16:15:00', '2026-01-24', '18:20:00', 'OPEN', NULL, NULL, NULL, 0, NULL),
(13, 1, 1, 'VN256', '2026-01-25', '08:45:00', '2026-01-25', '10:50:00', 'OPEN', NULL, NULL, NULL, 0, NULL),
(14, 1, 2, 'VN257', '2026-01-26', '13:20:00', '2026-01-26', '15:25:00', 'OPEN', NULL, NULL, NULL, 0, NULL),
(15, 1, 3, 'VN258', '2026-01-27', '06:00:00', '2026-01-27', '08:05:00', 'OPEN', NULL, NULL, NULL, 0, NULL),
(16, 1, 1, 'VN259', '2026-01-28', '09:30:00', '2026-01-28', '11:35:00', 'OPEN', NULL, NULL, NULL, 0, NULL),
(17, 3, 2, 'VN713', '2026-01-29', '14:00:00', '2026-01-29', '15:15:00', 'OPEN', NULL, NULL, NULL, 0, NULL),
(18, 2, 3, 'VN242', '2026-01-30', '10:00:00', '2026-01-30', '12:05:00', 'OPEN', NULL, NULL, NULL, 0, NULL),
(19, 1, 1, 'VN260', '2026-02-01', '07:15:00', '2026-02-01', '09:20:00', 'OPEN', NULL, NULL, NULL, 0, NULL),
(20, 3, 2, 'VN714', '2026-02-02', '15:30:00', '2026-02-02', '16:45:00', 'OPEN', NULL, NULL, NULL, 0, NULL);

-- =================================================================
-- 5. BẢNG DỊCH VỤ CHUYẾN BAY
-- =================================================================

INSERT INTO `dichvuchuyenbay` (`machuyenbay`, `madichvu`) VALUES
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 2), (2, 3),
(3, 1), (3, 3),
(4, 1), (4, 2), (4, 3), (4, 4),
(5, 1), (5, 2), (5, 3),
(6, 1), (6, 3),
(7, 1), (7, 2), (7, 3),
(8, 1), (8, 3),
(9, 1), (9, 2), (9, 3),
(10, 1), (10, 2), (10, 3),
(11, 1), (11, 2), (11, 3),
(12, 1), (12, 2), (12, 3),
(13, 1), (13, 2), (13, 3),
(14, 1), (14, 2), (14, 3),
(15, 1), (15, 2), (15, 3),
(16, 1), (16, 2), (16, 3),
(17, 1), (17, 3),
(18, 1), (18, 2), (18, 3),
(19, 1), (19, 2), (19, 3),
(20, 1), (20, 3);

-- =================================================================
-- 6. BẢNG PHÂN QUYỀN (RBAC - Role-Based Access Control)
-- =================================================================

-- 6.1. Bảng Hành động (Actions Dictionary)
INSERT INTO `hanh_dong` (`ma_hanh_dong`, `mo_ta`) VALUES
('VIEW', 'Xem/Đọc dữ liệu'),
('CREATE', 'Tạo mới'),
('UPDATE', 'Cập nhật/Sửa'),
('DELETE', 'Xóa'),
('IMPORT', 'Import dữ liệu'),
('EXPORT', 'Export/Tải xuống'),
('APPROVE', 'Phê duyệt'),
('CANCEL', 'Hủy bỏ'),
('RESTORE', 'Khôi phục'),
('MANAGE', 'Quản lý toàn bộ');

-- 6.2. Bảng Vai trò (Roles)
INSERT INTO `vai_tro` (`ma_vai_tro`, `ten_vai_tro`, `mo_ta`, `trang_thai`, `da_xoa`, `deleted_at`) VALUES
(1, 'SUPER_ADMIN', 'Quản trị viên cao nhất - Toàn quyền', 1, 0, NULL),
(2, 'QUAN_LY', 'Quản lý - Quyền quản lý hệ thống', 1, 0, NULL),
(3, 'NHAN_VIEN_VE', 'Nhân viên bán vé - Quản lý đặt chỗ và vé', 1, 0, NULL),
(4, 'KE_TOAN', 'Kế toán - Quản lý thanh toán và doanh thu', 1, 0, NULL),
(5, 'VAN_HANH', 'Vận hành - Quản lý chuyến bay và máy bay', 1, 0, NULL);

-- 6.3. Bảng Chức năng (Features/Resources)
INSERT INTO `chuc_nang` (`ma_chuc_nang`, `ma_code`, `ten_chuc_nang`, `nhom`) VALUES
(1, 'FLIGHT', 'Quản lý chuyến bay', 'Vận hành'),
(2, 'ROUTE', 'Quản lý tuyến bay', 'Vận hành'),
(3, 'AIRPORT', 'Quản lý sân bay', 'Vận hành'),
(4, 'AIRCRAFT', 'Quản lý máy bay', 'Vận hành'),
(5, 'BOOKING', 'Quản lý đặt chỗ', 'Bán vé'),
(6, 'ORDER', 'Quản lý đơn hàng', 'Bán vé'),
(7, 'CUSTOMER', 'Quản lý khách hàng', 'Bán vé'),
(8, 'PAYMENT', 'Quản lý thanh toán', 'Tài chính'),
(9, 'REFUND', 'Quản lý hoàn tiền', 'Tài chính'),
(10, 'PROMOTION', 'Quản lý khuyến mãi', 'Marketing'),
(11, 'SERVICE', 'Quản lý dịch vụ', 'Dịch vụ'),
(12, 'PRICE', 'Quản lý giá vé', 'Tài chính'),
(13, 'REPORT', 'Báo cáo thống kê', 'Báo cáo'),
(14, 'USER', 'Quản lý người dùng', 'Hệ thống'),
(15, 'ROLE', 'Quản lý vai trò', 'Hệ thống'),
(16, 'PERMISSION', 'Quản lý phân quyền', 'Hệ thống');

-- 6.4. Bảng Phân quyền (Permissions)
INSERT INTO `phan_quyen` (`ma_vai_tro`, `ma_chuc_nang`, `ma_hanh_dong`) VALUES
-- Super Admin có toàn quyền
(1, 1, 'MANAGE'), (1, 2, 'MANAGE'), (1, 3, 'MANAGE'), (1, 4, 'MANAGE'),
(1, 5, 'MANAGE'), (1, 6, 'MANAGE'), (1, 7, 'MANAGE'), (1, 8, 'MANAGE'),
(1, 9, 'MANAGE'), (1, 10, 'MANAGE'), (1, 11, 'MANAGE'), (1, 12, 'MANAGE'),
(1, 13, 'MANAGE'), (1, 14, 'MANAGE'), (1, 15, 'MANAGE'), (1, 16, 'MANAGE'),
-- QUAN_LY: Quyền quản lý chính
(2, 1, 'VIEW'), (2, 1, 'CREATE'), (2, 1, 'UPDATE'), (2, 1, 'DELETE'),
(2, 2, 'VIEW'), (2, 2, 'CREATE'), (2, 2, 'UPDATE'),
(2, 5, 'VIEW'), (2, 5, 'UPDATE'), (2, 5, 'CANCEL'),
(2, 6, 'VIEW'), (2, 6, 'UPDATE'),
(2, 7, 'VIEW'), (2, 7, 'CREATE'), (2, 7, 'UPDATE'),
(2, 9, 'VIEW'), (2, 9, 'APPROVE'),
(2, 13, 'VIEW'), (2, 13, 'EXPORT'),
-- NHAN_VIEN_VE: Bán vé và quản lý booking
(3, 5, 'VIEW'), (3, 5, 'CREATE'), (3, 5, 'UPDATE'), (3, 5, 'CANCEL'),
(3, 6, 'VIEW'), (3, 6, 'CREATE'), (3, 6, 'UPDATE'),
(3, 7, 'VIEW'), (3, 7, 'CREATE'), (3, 7, 'UPDATE'),
(3, 1, 'VIEW'),
(3, 11, 'VIEW'),
-- KE_TOAN: Quản lý tài chính
(4, 8, 'VIEW'), (4, 8, 'UPDATE'), (4, 8, 'APPROVE'),
(4, 9, 'VIEW'), (4, 9, 'UPDATE'), (4, 9, 'APPROVE'),
(4, 12, 'VIEW'), (4, 12, 'UPDATE'),
(4, 13, 'VIEW'), (4, 13, 'EXPORT'),
(4, 6, 'VIEW'),
-- VAN_HANH: Quản lý chuyến bay
(5, 1, 'VIEW'), (5, 1, 'CREATE'), (5, 1, 'UPDATE'), (5, 1, 'DELETE'),
(5, 2, 'VIEW'), (5, 2, 'CREATE'), (5, 2, 'UPDATE'),
(5, 3, 'VIEW'),
(5, 4, 'VIEW'), (5, 4, 'UPDATE'),
(5, 5, 'VIEW');

-- 6.5. Tạo tài khoản Admin mẫu (mật khẩu: 123456)
INSERT INTO `taikhoanadmin` (`mataikhoan`, `tendangnhap`, `matkhaubam`, `email`, `hovaten`, `ngaytao`, `da_xoa`, `deleted_at`) VALUES
(1, 'admin', '$2a$10$G.BPF34LbTOmAwJnK6C/G.ZGSTSlK7Cdg6/IbBm6miGgcE75EYVT.', 'admin@airline.com', 'Administrator', NOW(), 0, NULL),
(2, 'superadmin', '$2a$10$G.BPF34LbTOmAwJnK6C/G.ZGSTSlK7Cdg6/IbBm6miGgcE75EYVT.', 'superadmin@airline.com', 'Super Administrator', NOW(), 0, NULL),
(3, 'quanly', '$2a$10$G.BPF34LbTOmAwJnK6C/G.ZGSTSlK7Cdg6/IbBm6miGgcE75EYVT.', 'quanly@airline.com', 'Quản lý hệ thống', NOW(), 0, NULL),
(4, 'nhanvien', '$2a$10$G.BPF34LbTOmAwJnK6C/G.ZGSTSlK7Cdg6/IbBm6miGgcE75EYVT.', 'nhanvien@airline.com', 'Nhân viên bán vé', NOW(), 0, NULL);

-- 6.6. Gán vai trò cho Admin
INSERT INTO `admin_vai_tro` (`mataikhoan`, `ma_vai_tro`) VALUES
(1, 1),
(2, 1),
(3, 2),
(4, 3);
