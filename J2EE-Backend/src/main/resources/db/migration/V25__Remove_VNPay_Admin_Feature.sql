-- Migration V25: Remove VNPay transaction-log admin feature
-- Thanh toán chuyển sang phương thức thường nội bộ, controller log VNPay đã xóa.
-- Dọn menu + phân quyền mồ côi của chức năng TRANSACTION_LOG (seed ở V14).

-- 1. Xóa phân quyền của chức năng log VNPay
DELETE FROM `phan_quyen`
WHERE `ma_chuc_nang` IN (SELECT `ma_chuc_nang` FROM `chuc_nang` WHERE `ma_code` = 'TRANSACTION_LOG');

-- 2. Xóa chức năng log VNPay khỏi menu admin
DELETE FROM `chuc_nang` WHERE `ma_code` = 'TRANSACTION_LOG';

-- 3. Cập nhật mô tả đối soát (không còn đối soát với cổng VNPay)
UPDATE `chuc_nang`
SET `ui_description` = 'Đối soát giao dịch thanh toán nội bộ'
WHERE `ma_code` = 'RECONCILIATION';
