-- Migration V24: Drop VNPay transaction log table
-- Thanh toán chuyển sang phương thức thường nội bộ, không còn dùng cổng VNPay.
-- Bảng vnpay_transaction_log không còn được ghi/đọc bởi code mới.

DROP TABLE IF EXISTS `vnpay_transaction_log`;
