-- Migration V18: Add reconciliation fields to hoadon table
-- Author: Claude Code
-- Date: 2026-02-23
-- Description: Add fields for tracking transaction reconciliation status and processing notes

-- Use stored procedure to safely add columns (MySQL doesn't support IF NOT EXISTS for ADD COLUMN)
DELIMITER $$

DROP PROCEDURE IF EXISTS AddReconciliationColumns$$

CREATE PROCEDURE AddReconciliationColumns()
BEGIN
    -- Add ghichu_doisoat column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'hoadon' 
        AND COLUMN_NAME = 'ghichu_doisoat'
    ) THEN
        ALTER TABLE hoadon ADD COLUMN ghichu_doisoat VARCHAR(500) NULL COMMENT 'Ghi chú xử lý đối soát';
    END IF;

    -- Add nguoi_xuly_doisoat column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'hoadon' 
        AND COLUMN_NAME = 'nguoi_xuly_doisoat'
    ) THEN
        ALTER TABLE hoadon ADD COLUMN nguoi_xuly_doisoat VARCHAR(100) NULL COMMENT 'Ngưởi xử lý đối soát';
    END IF;

    -- Add ngay_xuly_doisoat column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'hoadon' 
        AND COLUMN_NAME = 'ngay_xuly_doisoat'
    ) THEN
        ALTER TABLE hoadon ADD COLUMN ngay_xuly_doisoat DATETIME NULL COMMENT 'Ngày xử lý đối soát';
    END IF;

    -- Add trangthai_doisoat column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'hoadon' 
        AND COLUMN_NAME = 'trangthai_doisoat'
    ) THEN
        ALTER TABLE hoadon ADD COLUMN trangthai_doisoat VARCHAR(20) NULL DEFAULT 'PENDING' COMMENT 'Trạng thái đối soát: PENDING, RESOLVED, IGNORED';
    END IF;
END$$

DELIMITER ;

-- Execute the procedure
CALL AddReconciliationColumns();

-- Clean up
DROP PROCEDURE IF EXISTS AddReconciliationColumns;

-- Create indexes using stored procedure
DELIMITER $$

DROP PROCEDURE IF EXISTS AddReconciliationIndexes$$

CREATE PROCEDURE AddReconciliationIndexes()
BEGIN
    -- Create index for reconciliation status if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'hoadon' 
        AND INDEX_NAME = 'idx_hoadon_doisoat'
    ) THEN
        CREATE INDEX idx_hoadon_doisoat ON hoadon(trangthai_doisoat);
    END IF;

    -- Create index for processing date if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'hoadon' 
        AND INDEX_NAME = 'idx_hoadon_ngay_xuly_doisoat'
    ) THEN
        CREATE INDEX idx_hoadon_ngay_xuly_doisoat ON hoadon(ngay_xuly_doisoat);
    END IF;
END$$

DELIMITER ;

-- Execute the procedure
CALL AddReconciliationIndexes();

-- Clean up
DROP PROCEDURE IF EXISTS AddReconciliationIndexes;

-- =================================================================
-- DỮ LIỆU MẪU CHO CHỨC NĂNG ĐỐI SOÁT GIAO DỊCH
-- =================================================================
-- Lưu ý: Dữ liệu này chỉ dùng cho development/testing

-- Thêm dữ liệu mẫu cho VNPay Transaction Log (nếu chưa có)
INSERT IGNORE INTO vnpay_transaction_log (
    vnp_txn_ref, vnp_transaction_no, vnp_amount, vnp_response_code, 
    vnp_transaction_status, vnp_bank_code, vnp_bank_tran_no, vnp_pay_date,
    vnp_order_info, ipn_received_at, processing_result, processing_message, raw_data
) VALUES
-- Giao dịch thành công
('MAT123_1704067200000', 'VNP13895247', 150000000, '00', '00', 'NCB', 'BANK123456', '20240101123045', 
 'Thanh toan ve may bay - Ma thanh toan: 123', NOW(), 'SUCCESS', 'Giao dịch thành công', 
 '{"vnp_Amount":"150000000","vnp_ResponseCode":"00"}'),

('MAT124_1704153600000', 'VNP13895248', 230000000, '00', '00', 'VCB', 'BANK123457', '20240102144530',
 'Thanh toan ve may bay - Ma thanh toan: 124', NOW(), 'SUCCESS', 'Giao dịch thành công',
 '{"vnp_Amount":"230000000","vnp_ResponseCode":"00"}'),

-- Giao dịch lỗi
('MAT125_1704240000000', NULL, 180000000, '99', '99', 'TCB', NULL, '20240103101520',
 'Thanh toan ve may bay - Ma thanh toan: 125', NOW(), 'FAILED', 'Giao dịch bị từ chối bởi ngân hàng',
 '{"vnp_Amount":"180000000","vnp_ResponseCode":"99"}'),

-- Giao dịch hủy
('MAT126_1704326400000', NULL, 120000000, '24', '24', 'ACB', NULL, '20240104092010',
 'Thanh toan ve may bay - Ma thanh toan: 126', NOW(), 'CANCELLED', 'Khách hàng hủy giao dịch',
 '{"vnp_Amount":"120000000","vnp_ResponseCode":"24"}'),

-- Giao dịch duplicate
('MAT127_1704412800000', 'VNP13895252', 200000000, '00', '00', 'MB', 'BANK123461', '20240105113000',
 'Thanh toan ve may bay - Ma thanh toan: 127', NOW(), 'DUPLICATE', 'Phát hiện giao dịch trùng lặp',
 '{"vnp_Amount":"200000000","vnp_ResponseCode":"00"}');

-- Cập nhật trạng thái đối soát cho một số hóa đơn hiện có
-- Lưu ý: Cần có dữ liệu hoadon và trangthaithanhtoan từ các migration trước

-- Cập nhật hóa đơn đã xử lý đối soát (RESOLVED)
UPDATE hoadon 
SET 
    trangthai_doisoat = 'RESOLVED',
    ghichu_doisoat = 'Đã đối soát với VNPay, số tiền khớp',
    nguoi_xuly_doisoat = 'ke.toan@jadt.com',
    ngay_xuly_doisoat = DATE_SUB(NOW(), INTERVAL 1 DAY)
WHERE mahoadon IN (
    SELECT mahoadon FROM (
        SELECT h.mahoadon 
        FROM hoadon h
        INNER JOIN donhang dh ON h.madonhang = dh.madonhang
        INNER JOIN trangthaithanhtoan tt ON dh.madonhang = tt.madonhang
        WHERE h.trangthai = 'DA_PHAT_HANH'
        AND tt.dathanhtoan = 'Y'
        LIMIT 2
    ) AS temp
);

-- Cập nhật hóa đơn bỏ qua đối soát (IGNORED)
-- Sửa: Không có cột ghichu, dùng điều kiện khác (ví dụ: mã đơn hàng chứa 'TEST')
UPDATE hoadon 
SET 
    trangthai_doisoat = 'IGNORED',
    ghichu_doisoat = 'Giao dịch test, không cần đối soát',
    nguoi_xuly_doisoat = 'admin@jadt.com',
    ngay_xuly_doisoat = DATE_SUB(NOW(), INTERVAL 2 DAY)
WHERE mahoadon IN (
    SELECT mahoadon FROM (
        SELECT h.mahoadon 
        FROM hoadon h
        INNER JOIN donhang dh ON h.madonhang = dh.madonhang
        WHERE h.trangthai = 'DA_PHAT_HANH'
        AND dh.madonhang LIKE '%TEST%'
        LIMIT 1
    ) AS temp
);

-- Đảm bảo các hóa đơn còn lại có trạng thái PENDING
UPDATE hoadon 
SET trangthai_doisoat = 'PENDING'
WHERE trangthai_doisoat IS NULL;

-- Thêm dữ liệu VNPay Transaction Log liên kết với transaction_code từ trangthaithanhtoan
-- Chỉ chạy nếu có dữ liệu trong trangthaithanhtoan
INSERT IGNORE INTO vnpay_transaction_log (
    vnp_txn_ref, vnp_transaction_no, vnp_amount, vnp_response_code,
    vnp_transaction_status, vnp_bank_code, vnp_pay_date,
    vnp_order_info, ipn_received_at, processing_result
)
SELECT 
    tt.transaction_code,
    CONCAT('VNP', FLOOR(RAND() * 100000000)),
    tt.sotien * 100, -- VNPay lưu số tiền * 100
    '00',
    '00',
    CASE FLOOR(RAND() * 5)
        WHEN 0 THEN 'NCB'
        WHEN 1 THEN 'VCB'
        WHEN 2 THEN 'TCB'
        WHEN 3 THEN 'ACB'
        ELSE 'MB'
    END,
    DATE_FORMAT(tt.thoigian_thanhtoan, '%Y%m%d%H%i%s'),
    CONCAT('Thanh toan ve may bay - Ma thanh toan: ', tt.mathanhtoan),
    COALESCE(tt.thoigian_thanhtoan, NOW()),
    CASE 
        WHEN tt.dathanhtoan = 'Y' THEN 'SUCCESS'
        WHEN tt.dathanhtoan = 'H' THEN 'CANCELLED'
        ELSE 'PENDING'
    END
FROM trangthaithanhtoan tt
WHERE tt.transaction_code IS NOT NULL
AND tt.transaction_code NOT IN (
    SELECT vnp_txn_ref FROM vnpay_transaction_log WHERE vnp_txn_ref IS NOT NULL
)
LIMIT 10;
