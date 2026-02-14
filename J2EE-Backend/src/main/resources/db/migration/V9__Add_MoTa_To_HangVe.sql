-- V9: Thêm cột mô tả (mo_ta) vào bảng hạng vé
-- Cột này lưu mô tả lợi ích của từng hạng vé (dạng TEXT để lưu nội dung dài, hỗ trợ HTML/Markdown)

ALTER TABLE `hangve` ADD COLUMN `mo_ta` TEXT DEFAULT NULL COMMENT 'Mô tả lợi ích của hạng vé' AFTER `tenhangve`;

-- Cập nhật mô tả cho các hạng vé mặc định
UPDATE `hangve` SET `mo_ta` = '• Hành lý xách tay: 7kg\n• Không bao gồm hành lý ký gửi\n• Không bao gồm suất ăn\n• Không bao gồm chọn chỗ ngồi\n• Không bao gồm thay đổi chuyến bay' WHERE `mahangve` = 1 AND `da_xoa` = 0;

UPDATE `hangve` SET `mo_ta` = '• Hành lý xách tay: 7kg\n• Hành lý ký gửi: 15kg\n• Không bao gồm suất ăn\n• Chọn trước chỗ ngồi\n• Thay đổi chuyến bay (có phí)' WHERE `mahangve` = 2 AND `da_xoa` = 0;

UPDATE `hangve` SET `mo_ta` = '• Hành lý xách tay: 10kg\n• Hành lý ký gửi: 20kg\n• Suất ăn & nước uống miễn phí\n• Chọn trước chỗ ngồi\n• Miễn phí thay đổi chuyến bay\n• Bộ tiện ích 3 trong 1' WHERE `mahangve` = 3 AND `da_xoa` = 0;

UPDATE `hangve` SET `mo_ta` = '• Hành lý xách tay: 18kg\n• Hành lý ký gửi: 40kg\n• Phòng chờ thương gia\n• Ưu tiên làm thủ tục\n• Ưu tiên phục vụ hành lý\n• Ưu tiên qua cửa an ninh\n• Ưu tiên chọn chỗ ngồi\n• Bộ tiện ích cao cấp (4+ tiếng)' WHERE `mahangve` = 4 AND `da_xoa` = 0;

UPDATE `hangve` SET `mo_ta` = '• Hành lý xách tay: 10kg\n• Hành lý ký gửi: 30kg\n• Phòng chờ VIP sang trọng\n• Ưu tiên làm thủ tục\n• Ưu tiên phục vụ hành lý\n• Ưu tiên qua cửa an ninh\n• Phục vụ đưa đón riêng\n• Ưu tiên chọn chỗ ngồi\n• Bộ tiện ích cao cấp (4+ tiếng)' WHERE `mahangve` = 5 AND `da_xoa` = 0;
