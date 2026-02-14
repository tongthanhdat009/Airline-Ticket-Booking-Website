-- =================================================================
-- V8: Remove Unique Constraints for Guest Customers
-- Description: Xóa unique constraints từ sodienthoai và email trong bảng hanhkhach
--              để cho phép khách vãng lai có thể trùng lặp thông tin
--              Thêm unique constraint cho madinhdanh để làm identifier chính
-- Date: 2026-02-13
-- =================================================================

-- Xóa unique index cho số điện thoại
DROP INDEX `UK_sodienthoai` ON `hanhkhach`;

-- Xóa unique index cho email
DROP INDEX `UK_email_hanhkhach` ON `hanhkhach`;

-- Thêm unique index cho mã định danh (CCCD/CMND/Passport) - chỉ áp dụng cho giá trị NOT NULL
-- Index này cho phép NULL nhưng không cho phép các giá trị NOT NULL trùng lặp
CREATE UNIQUE INDEX `UK_madinhdanh` ON `hanhkhach` (`madinhdanh`);

-- Lưu ý: Sau khi migration này, logic trong backend sẽ:
-- 1. Cho phép nhiều hành khách với cùng email/phone (khách vãng lai)
-- 2. Mã định danh (CCCD/CMND/Passport) là identifier chính
-- 3. Nếu tìm thấy mã định danh trùng → Ghi đè (update) thông tin hành khách
-- 4. Nếu không có mã định danh → Tìm theo (email + tên + ngày sinh)
