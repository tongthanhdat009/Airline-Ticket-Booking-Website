-- V4__Add_AuditLog_Feature.sql
-- Thêm chức năng AUDITLOG và phân quyền cho SUPER_ADMIN

-- Thêm chức năng AUDITLOG vào bảng chuc_nang
INSERT INTO chuc_nang (ma_chuc_nang, ma_code, ten_chuc_nang, nhom) 
VALUES (17, 'AUDITLOG', 'Lịch sử thao tác', 'Hệ thống');

-- Phân quyền MANAGE cho SUPER_ADMIN (ma_vai_tro = 1)
INSERT INTO phan_quyen (ma_vai_tro, ma_chuc_nang, ma_hanh_dong) 
VALUES (1, 17, 'MANAGE');
