-- =================================================================
-- FLYWAY MIGRATION V11: Update Old Flights Status
-- Description: Cập nhật các chuyến bay cũ sang trạng thái Đã bay
-- Author: System
-- Date: 2026-02-21
-- =================================================================

-- Cập nhật các chuyến bay cũ sang trạng thái phù hợp
UPDATE chitietchuyenbay SET
    trangthai = 'Đã bay',
    thoigiandi_thucte = CONCAT(ngaydi, ' ', giodi),
    thoigianden_thucte = CONCAT(ngayden, ' ', gioden)
WHERE ngaydi < '2026-02-21' AND trangthai = 'Đang mở bán';
