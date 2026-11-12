-- V27: Cap quyen RESTORE banner/tin tuc cho QUAN_LY
-- Frontend/backend da co API restore (POST /banners/{id}/restore,
-- POST /tintuc/{id}/restore) nhung role QUAN_LY chua co hanh dong RESTORE
-- tren chuc nang BANNER_NEWS (ma_chuc_nang = 20) -> goi API bi 403.

INSERT INTO `phan_quyen` (`ma_vai_tro`, `ma_chuc_nang`, `ma_hanh_dong`)
SELECT 2, 20, 'RESTORE'
WHERE NOT EXISTS (
  SELECT 1 FROM `phan_quyen`
  WHERE `ma_vai_tro` = 2 AND `ma_chuc_nang` = 20 AND `ma_hanh_dong` = 'RESTORE'
);
