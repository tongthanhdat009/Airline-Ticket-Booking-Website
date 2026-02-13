-- =================================================================
-- V7: FIX PAYMENT DESIGN (GẮN VỚI DONHANG)
-- Description: Thay đổi trangthaithanhtoan từ gắn với datcho sang gắn với donhang
--   Cũ: 1 trangthaithanhtoan per datcho (1-N với donhang)
--   Mới: 1 trangthaithanhtoan per donhang (1-1)
-- =================================================================

-- Step 1: Thêm cột madonhang (nullable trước để migrate dữ liệu)
ALTER TABLE trangthaithanhtoan ADD COLUMN madonhang INT NULL;

-- Step 2: Gán madonhang từ datcho.madonhang
UPDATE trangthaithanhtoan t
INNER JOIN datcho dc ON t.madatcho = dc.madatcho
SET t.madonhang = dc.madonhang;

-- Step 3: Tạo bảng tạm lưu các bản ghi cần giữ (1 per donhang, lấy mathanhtoan nhỏ nhất)
CREATE TEMPORARY TABLE _keep_payments AS
SELECT MIN(mathanhtoan) AS mathanhtoan, madonhang
FROM trangthaithanhtoan
WHERE madonhang IS NOT NULL
GROUP BY madonhang;

-- Step 4: Cập nhật hoantien.mathanhtoan trỏ về bản ghi được giữ
UPDATE hoantien ht
INNER JOIN trangthaithanhtoan old_t ON ht.mathanhtoan = old_t.mathanhtoan
INNER JOIN _keep_payments kp ON old_t.madonhang = kp.madonhang
SET ht.mathanhtoan = kp.mathanhtoan
WHERE ht.mathanhtoan != kp.mathanhtoan;

-- Step 5: Xóa các bản ghi trùng
DELETE t FROM trangthaithanhtoan t
LEFT JOIN _keep_payments kp ON t.mathanhtoan = kp.mathanhtoan
WHERE kp.mathanhtoan IS NULL;

DROP TEMPORARY TABLE _keep_payments;

-- Step 6: Cập nhật số tiền theo tổng giá đơn hàng
UPDATE trangthaithanhtoan t
INNER JOIN donhang dh ON t.madonhang = dh.madonhang
SET t.sotien = dh.tonggia;

-- Step 7: Xóa constraint cũ và cột madatcho
ALTER TABLE trangthaithanhtoan DROP FOREIGN KEY FK_thanhtoan_datcho;
DROP INDEX UK_madatcho ON trangthaithanhtoan;
ALTER TABLE trangthaithanhtoan DROP COLUMN madatcho;

-- Step 8: Đặt madonhang là NOT NULL
ALTER TABLE trangthaithanhtoan MODIFY COLUMN madonhang INT NOT NULL;

-- Step 9: Thêm constraint mới
ALTER TABLE trangthaithanhtoan
ADD CONSTRAINT FK_thanhtoan_donhang FOREIGN KEY (madonhang) REFERENCES donhang(madonhang);
CREATE INDEX idx_thanhtoan_donhang ON trangthaithanhtoan(madonhang);
CREATE UNIQUE INDEX UK_thanhtoan_donhang ON trangthaithanhtoan(madonhang);

-- Step 10: Bổ sung thông tin giao dịch chuẩn production
ALTER TABLE trangthaithanhtoan
ADD transaction_code VARCHAR(100) COMMENT 'Mã giao dịch từ cổng thanh toán (VNPAY, etc.)',
ADD trangthai VARCHAR(20) DEFAULT 'PENDING' COMMENT 'PENDING, COMPLETED, FAILED, CANCELLED',
ADD thoigian_thanhtoan DATETIME COMMENT 'Thời gian thanh toán thực tế';
