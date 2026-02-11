-- V5__Add_Menu_UI_Metadata.sql
-- Thêm metadata UI vào bảng chuc_nang để hỗ trợ menu động

-- Thêm các cột metadata UI vào bảng chuc_nang
ALTER TABLE `chuc_nang`
ADD COLUMN `route_path` VARCHAR(100) NULL COMMENT 'Route path cho menu (VD: ChuyenBay, KhachHang)',
ADD COLUMN `ui_icon` VARCHAR(50) NULL COMMENT 'Tên icon (VD: FaPlaneDeparture, FaUsers)',
ADD COLUMN `ui_color` VARCHAR(100) NULL COMMENT 'Gradient color CSS (VD: from-orange-500 to-red-500)',
ADD COLUMN `ui_description` TEXT NULL COMMENT 'Mô tả chức năng',
ADD COLUMN `display_order` INT DEFAULT 0 COMMENT 'Thứ tự hiển thị trong menu';

-- Update dữ liệu từ adminMenuData.js hiện tại
-- Mapping từ featureCode sang route_path

-- 1. FLIGHT - Quản lý chuyến bay
UPDATE `chuc_nang`
SET route_path = 'ChuyenBay',
    ui_icon = 'FaPlaneDeparture',
    ui_color = 'from-orange-500 to-red-500',
    ui_description = 'Quản lý chuyến bay',
    display_order = 6
WHERE ma_code = 'FLIGHT';

-- 2. ROUTE - Quản lý tuyến bay
UPDATE `chuc_nang`
SET route_path = 'TuyenBay',
    ui_icon = 'FaRoute',
    ui_color = 'from-green-500 to-emerald-500',
    ui_description = 'Quản lý tuyến đường bay',
    display_order = 5
WHERE ma_code = 'ROUTE';

-- 3. AIRPORT - Quản lý sân bay
UPDATE `chuc_nang`
SET route_path = 'SanBay',
    ui_icon = 'MdLocalAirport',
    ui_color = 'from-indigo-500 to-blue-500',
    ui_description = 'Quản lý thông tin sân bay',
    display_order = 7
WHERE ma_code = 'AIRPORT';

-- 4. AIRCRAFT - Quản lý máy bay
UPDATE `chuc_nang`
SET route_path = 'MayBay',
    ui_icon = 'FaFighterJet',
    ui_color = 'from-sky-500 to-blue-600',
    ui_description = 'Quản lý đội bay',
    display_order = 8
WHERE ma_code = 'AIRCRAFT';

-- 5. BOOKING - Quản lý đặt chỗ
UPDATE `chuc_nang`
SET route_path = 'DatCho',
    ui_icon = 'FaCalendarCheck',
    ui_color = 'from-cyan-500 to-blue-500',
    ui_description = 'Quản lý đặt chỗ vé',
    display_order = 3
WHERE ma_code = 'BOOKING';

-- 6. ORDER - Quản lý đơn hàng
UPDATE `chuc_nang`
SET route_path = 'DonHang',
    ui_icon = 'FaShoppingCart',
    ui_color = 'from-orange-500 to-amber-500',
    ui_description = 'Quản lý đơn hàng',
    display_order = 4
WHERE ma_code = 'ORDER';

-- 7. CUSTOMER - Quản lý khách hàng
UPDATE `chuc_nang`
SET route_path = 'KhachHang',
    ui_icon = 'FaUsers',
    ui_color = 'from-purple-500 to-pink-500',
    ui_description = 'Quản lý thông tin khách hàng',
    display_order = 2
WHERE ma_code = 'CUSTOMER';

-- 8. PAYMENT - Quản lý thanh toán
UPDATE `chuc_nang`
SET route_path = 'HoaDon',
    ui_icon = 'FaFileInvoice',
    ui_color = 'from-teal-500 to-cyan-600',
    ui_description = 'Quản lý hóa đơn và thanh toán',
    display_order = 11
WHERE ma_code = 'PAYMENT';

-- 9. REFUND - Quản lý hoàn tiền
UPDATE `chuc_nang`
SET route_path = 'HoanTien',
    ui_icon = 'FaUndo',
    ui_color = 'from-lime-500 to-green-600',
    ui_description = 'Xử lý yêu cầu hoàn tiền',
    display_order = 12
WHERE ma_code = 'REFUND';

-- 10. PROMOTION - Quản lý khuyến mãi
UPDATE `chuc_nang`
SET route_path = 'KhuyenMai',
    ui_icon = 'FaTags',
    ui_color = 'from-pink-500 to-rose-500',
    ui_description = 'Quản lý chương trình khuyến mãi',
    display_order = 13
WHERE ma_code = 'PROMOTION';

-- 11. SERVICE - Quản lý dịch vụ
UPDATE `chuc_nang`
SET route_path = 'DichVu',
    ui_icon = 'FaConciergeBell',
    ui_color = 'from-yellow-500 to-orange-500',
    ui_description = 'Quản lý dịch vụ phụ trợ',
    display_order = 9
WHERE ma_code = 'SERVICE';

-- 12. PRICE - Quản lý giá vé
UPDATE `chuc_nang`
SET route_path = 'GiaBay',
    ui_icon = 'FaDollarSign',
    ui_color = 'from-teal-500 to-cyan-500',
    ui_description = 'Quản lý giá vé các hạng vé',
    display_order = 10
WHERE ma_code = 'PRICE';

-- 13. REPORT - Báo cáo thống kê
UPDATE `chuc_nang`
SET route_path = 'ThongKe',
    ui_icon = 'FaChartBar',
    ui_color = 'from-blue-500 to-cyan-500',
    ui_description = 'Xem báo cáo doanh thu và thống kê',
    display_order = 1
WHERE ma_code = 'REPORT';

-- 14. USER - Quản lý người dùng (Admin)
UPDATE `chuc_nang`
SET route_path = 'QuanLyTKAdmin',
    ui_icon = 'FaUsers',
    ui_color = 'from-purple-500 to-pink-500',
    ui_description = 'Quản lý tài khoản admin',
    display_order = 15
WHERE ma_code = 'USER';

-- 15. ROLE - Quản lý vai trò
UPDATE `chuc_nang`
SET route_path = 'VaiTro',
    ui_icon = 'FaUserShield',
    ui_color = 'from-violet-500 to-purple-600',
    ui_description = 'Quản lý vai trò hệ thống',
    display_order = 16
WHERE ma_code = 'ROLE';

-- 16. PERMISSION - Quản lý phân quyền
UPDATE `chuc_nang`
SET route_path = 'PhanQuyen',
    ui_icon = 'FaKey',
    ui_color = 'from-amber-500 to-orange-600',
    ui_description = 'Cấu hình phân quyền hệ thống',
    display_order = 17
WHERE ma_code = 'PERMISSION';

-- 17. AUDITLOG - Lịch sử thao tác (đã có từ V4)
UPDATE `chuc_nang`
SET route_path = 'LichSuThaoTac',
    ui_icon = 'FaHistory',
    ui_color = 'from-green-500 to-emerald-600',
    ui_description = 'Xem log lịch sử thao tác (Audit Log)',
    display_order = 14
WHERE ma_code = 'AUDITLOG';
