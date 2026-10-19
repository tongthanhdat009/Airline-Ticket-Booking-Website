-- Migration V26: Remove SUPPORT admin feature
-- Trang khách hàng chuyển sang khung chat tư vấn AI (AdvisorChatWidget gọi
-- POST /api/advisor/chat, backend proxy tới gateway 9router). Chức năng chat
-- hỗ trợ trực tiếp trong admin không còn dùng: dọn menu + phân quyền mồ côi
-- của chức năng SUPPORT (seed ở V14). Bảng live chat giữ lại cho lịch sử.

-- 1. Xóa phân quyền của chức năng hỗ trợ trực tuyến
DELETE FROM `phan_quyen`
WHERE `ma_chuc_nang` IN (SELECT `ma_chuc_nang` FROM `chuc_nang` WHERE `ma_code` = 'SUPPORT');

-- 2. Xóa chức năng hỗ trợ trực tuyến khỏi menu admin
DELETE FROM `chuc_nang` WHERE `ma_code` = 'SUPPORT';
