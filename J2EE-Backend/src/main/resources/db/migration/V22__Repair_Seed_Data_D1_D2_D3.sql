-- ========================================
-- V22: Sửa dữ liệu seed (defects D-1, D-2, D-3 từ báo cáo E2E 17/10/2026)
-- ========================================
-- Tất cả UPDATE đều idempotent: WHERE khớp đúng dòng lỗi nên chạy lại
-- nhiều lần hoặc trên DB mới (đã đúng) đều an toàn.
-- Lưu ý: file migration cũ KHÔNG sửa (tránh Flyway checksum mismatch);
-- chữ đúng trong file V2/V13 vốn đã đúng UTF-8, lỗi do connection lúc apply.

-- ============ D-2: mã hóa kép (double-encoded UTF-8) ============
-- donhang.trangthai: 30/47 dòng không khớp literal 'ĐÃ THANH TOÁN'/...
-- Khớp bằng HEX chính xác (không dùng LIKE substring theo cảnh báo E2E).

UPDATE donhang SET trangthai = 'ĐÃ THANH TOÁN'
WHERE da_xoa = 0
  AND HEX(trangthai) = 'C384C290C383C692205448414E4820544FC383C2814E';

UPDATE donhang SET trangthai = 'CHỜ THANH TOÁN'
WHERE da_xoa = 0
  AND HEX(trangthai) = '4348C3A1C2BBC593205448414E4820544FC383C2814E';

UPDATE donhang SET trangthai = 'ĐÃ HỦY'
WHERE da_xoa = 0
  AND HEX(trangthai) = 'C384C290C383C6922048C3A1C2BBC2A659';

-- sanbay: 5/8 sân bay mojibake (chữ đúng lấy từ V13_Test_data_thongke.sql).
UPDATE sanbay SET tensanbay = 'Sân bay Cam Ranh', thanhphosanbay = 'Nha Trang',
    quocgiasanbay = 'Việt Nam'
WHERE ma_iata = 'CXR' AND da_xoa = 0;

UPDATE sanbay SET tensanbay = 'Sân bay Phú Quốc', thanhphosanbay = 'Phú Quốc',
    quocgiasanbay = 'Việt Nam'
WHERE ma_iata = 'PQC' AND da_xoa = 0;

UPDATE sanbay SET tensanbay = 'Sân bay Phú Bài', thanhphosanbay = 'Huế',
    quocgiasanbay = 'Việt Nam'
WHERE ma_iata = 'HUI' AND da_xoa = 0;

UPDATE sanbay SET tensanbay = 'Sân bay Côn Đảo', thanhphosanbay = 'Côn Đảo',
    quocgiasanbay = 'Việt Nam'
WHERE ma_iata = 'VII' AND da_xoa = 0;

UPDATE sanbay SET tensanbay = 'Sân bay Điện Biên', thanhphosanbay = 'Điện Biên Phủ',
    quocgiasanbay = 'Việt Nam'
WHERE ma_iata = 'UIH' AND da_xoa = 0;

-- ============ D-1: seed customer không đăng nhập được ============
-- 6 account seed chung 1 hash bcrypt không khớp mật khẩu nào.
-- Reset về mật khẩu dev '123456' (bcrypt cost 10, đã verify bằng python-bcrypt).
UPDATE taikhoan SET matkhaubam = '$2b$10$k5zkvf/Fj7sC1hUiYUQeJOze6DBeMfGE25n.5fF2WdL6nPu.AB9yO'
WHERE da_xoa = 0 AND email IN (
    'nguyenvana@example.com',
    'levanc@example.com',
    'phamthid@example.com',
    'hoangmine@example.com',
    'nguyenthif@example.com',
    'tranvang@example.com'
);

-- ============ D-3: khuyến mãi ACTIVE nhưng hết hạn ============
-- Gia hạn các KM còn ACTIVE mà đã hết hạn tới cuối 2027.
UPDATE khuyenmai SET ngayketthuc = '2027-12-31 23:59:59'
WHERE da_xoa = 0 AND trangthai = 'ACTIVE' AND ngayketthuc < NOW();
