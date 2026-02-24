-- =====================================================
-- V20: Tạo bảng hệ thống Live Chat
-- =====================================================

-- 1. Bảng chat_session (phiên chat)
CREATE TABLE IF NOT EXISTS `chat_session` (
  `session_id` varchar(36) PRIMARY KEY COMMENT 'UUID',
  `ho_ten` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `so_dien_thoai` varchar(20) NOT NULL,
  `trang_thai` varchar(30) NOT NULL DEFAULT 'WAITING_FOR_ADMIN' COMMENT 'WAITING_FOR_ADMIN, IN_PROGRESS, WAITING_FOR_USER, IDLE, RESOLVED, CLOSED',
  `ma_admin_xu_ly` int DEFAULT NULL COMMENT 'Admin đang xử lý',
  `last_message_at` datetime DEFAULT NULL COMMENT 'Thời gian tin nhắn cuối',
  `idle_reminder_sent` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Đã gửi nhắc nhở idle chưa',
  `reopen_count` int NOT NULL DEFAULT 0 COMMENT 'Số lần mở lại session',
  `ngay_tao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ngay_dong` datetime DEFAULT NULL,
  FOREIGN KEY (`ma_admin_xu_ly`) REFERENCES `taikhoanadmin`(`mataikhoan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng chat_message (tin nhắn)
CREATE TABLE IF NOT EXISTS `chat_message` (
  `ma_message` bigint PRIMARY KEY AUTO_INCREMENT,
  `session_id` varchar(36) NOT NULL,
  `noi_dung` text NOT NULL,
  `nguoi_gui` varchar(20) NOT NULL COMMENT 'customer, admin, system',
  `ma_admin` int DEFAULT NULL COMMENT 'Nếu admin gửi',
  `message_type` varchar(20) NOT NULL DEFAULT 'TEXT' COMMENT 'TEXT, SYSTEM',
  `ngay_gui` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`session_id`) REFERENCES `chat_session`(`session_id`),
  FOREIGN KEY (`ma_admin`) REFERENCES `taikhoanadmin`(`mataikhoan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Indexes
DROP PROCEDURE IF EXISTS create_chat_indexes;

DELIMITER //
CREATE PROCEDURE create_chat_indexes()
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'chat_session' AND index_name = 'idx_chat_session_trang_thai') THEN
        CREATE INDEX idx_chat_session_trang_thai ON chat_session(trang_thai);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'chat_session' AND index_name = 'idx_chat_session_email') THEN
        CREATE INDEX idx_chat_session_email ON chat_session(email);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'chat_session' AND index_name = 'idx_chat_session_admin') THEN
        CREATE INDEX idx_chat_session_admin ON chat_session(ma_admin_xu_ly);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'chat_session' AND index_name = 'idx_chat_session_last_message') THEN
        CREATE INDEX idx_chat_session_last_message ON chat_session(last_message_at);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'chat_message' AND index_name = 'idx_chat_message_session') THEN
        CREATE INDEX idx_chat_message_session ON chat_message(session_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'chat_message' AND index_name = 'idx_chat_message_ngay_gui') THEN
        CREATE INDEX idx_chat_message_ngay_gui ON chat_message(ngay_gui);
    END IF;
END //
DELIMITER ;

CALL create_chat_indexes();
DROP PROCEDURE IF EXISTS create_chat_indexes;

-- 4. Drop old support_ticket tables if exist
DROP TABLE IF EXISTS `ticket_status_history`;
DROP TABLE IF EXISTS `ticket_reply`;
DROP TABLE IF EXISTS `support_ticket`;
