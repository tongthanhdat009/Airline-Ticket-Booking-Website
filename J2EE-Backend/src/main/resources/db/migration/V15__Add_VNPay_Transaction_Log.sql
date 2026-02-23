-- =================================================================
-- V15: Add VNPay Transaction Log Table
-- Description: Tạo bảng vnpay_transaction_log để lưu log giao dịch VNPay IPN
-- =================================================================

CREATE TABLE `vnpay_transaction_log` (
  `id` BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `vnp_txn_ref` VARCHAR(100) NOT NULL COMMENT 'Mã giao dịch (订单号)',
  `vnp_transaction_no` VARCHAR(50) COMMENT 'Mã giao dịch tại VNPay',
  `vnp_amount` BIGINT NOT NULL COMMENT 'Số tiền (x100)',
  `vnp_response_code` VARCHAR(10) COMMENT 'Mã phản hồi (00: thành công)',
  `vnp_transaction_status` VARCHAR(10) COMMENT 'Trạng thái giao dịch',
  `vnp_bank_code` VARCHAR(20) COMMENT 'Mã ngân hàng',
  `vnp_bank_tran_no` VARCHAR(50) COMMENT 'Mã giao dịch ngân hàng',
  `vnp_pay_date` VARCHAR(20) COMMENT 'Ngày thanh toán (yyyyMMddHHmmss)',
  `vnp_order_info` TEXT COMMENT 'Thông tin đơn hàng',
  `vnp_secure_hash` VARCHAR(255) COMMENT 'Chữ ký bảo mật',
  `ipn_url` VARCHAR(255) COMMENT 'URL nhận IPN',
  `ipn_received_at` DATETIME NOT NULL COMMENT 'Thời gian nhận IPN',
  `http_method` VARCHAR(10) COMMENT 'Phương thức HTTP (GET/POST)',
  `source_ip` VARCHAR(50) COMMENT 'IP nguồn gửi IPN',
  `processing_result` VARCHAR(20) NOT NULL COMMENT 'SUCCESS, FAILED, CANCELLED, DUPLICATE',
  `processing_message` TEXT COMMENT 'Thông báo xử lý',
  `raw_data` JSON COMMENT 'Dữ liệu gốc từ VNPay',
  `created_at` DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  INDEX `idx_vnp_txn_ref` (`vnp_txn_ref`),
  INDEX `idx_ipn_received_at` (`ipn_received_at`),
  INDEX `idx_processing_result` (`processing_result`),
  INDEX `idx_transaction_no` (`vnp_transaction_no`),
  INDEX `idx_bank_code` (`vnp_bank_code`)
) COMMENT='Lịch sử giao dịch VNPay IPN/Callback';
