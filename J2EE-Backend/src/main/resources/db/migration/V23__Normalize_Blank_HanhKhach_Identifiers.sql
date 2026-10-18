-- =================================================================
-- V23: Normalize blank HanhKhach identifiers (Fix D-30)
-- Description: MySQL UNIQUE index coi "" là giá trị nên nhiều booking
--              thiếu CCCD gây "Duplicate entry '' for key UK_madinhdanh" (500 + lộ SQL).
--              Chuẩn hoá "" / chuỗi chỉ 공백 thành NULL (NULL được phép lặp).
-- Date: 2026-10-18
-- =================================================================

UPDATE `hanhkhach` SET `madinhdanh` = NULL WHERE TRIM(COALESCE(`madinhdanh`, '')) = '';
UPDATE `hanhkhach` SET `email` = NULL WHERE TRIM(COALESCE(`email`, '')) = '';
UPDATE `hanhkhach` SET `sodienthoai` = NULL WHERE TRIM(COALESCE(`sodienthoai`, '')) = '';
UPDATE `hanhkhach` SET `diachi` = NULL WHERE TRIM(COALESCE(`diachi`, '')) = '';
UPDATE `hanhkhach` SET `quocgia` = NULL WHERE TRIM(COALESCE(`quocgia`, '')) = '';
