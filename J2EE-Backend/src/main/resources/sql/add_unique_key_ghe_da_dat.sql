-- Script thêm UNIQUE KEY cho bảng ghe_da_dat
-- Đây là chốt chặn cuối cùng để chống race condition khi đặt ghế
-- UNIQUE KEY (machuyenbay, maghe) sẽ đảm bảo không 2 người đặt cùng 1 ghế

-- Thêm UNIQUE KEY nếu chưa tồn tại
-- Lưu ý: Nếu UNIQUE KEY đã tồn tại, script sẽ báo lỗi (đây là điều mong muốn)

-- Cách 1: Thêm UNIQUE KEY trực tiếp (nếu chưa có)
ALTER TABLE ghe_da_dat
ADD CONSTRAINT uk_ghe_chuyen UNIQUE (machuyenbay, maghe);

-- Nếu đã có UNIQUE KEY, hãy dùng câu lệnh sau để kiểm tra:
-- SHOW INDEX FROM ghe_da_dat;

-- Hoặc để xem các constraint hiện tại:
-- SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE 
-- FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
-- WHERE TABLE_NAME = 'ghe_da_dat';
