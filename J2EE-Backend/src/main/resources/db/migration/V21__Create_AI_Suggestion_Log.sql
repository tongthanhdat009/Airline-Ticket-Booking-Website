CREATE TABLE IF NOT EXISTS ai_suggestion_log (
    ma_log BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(36) NOT NULL,
    ma_admin INT NOT NULL,
    so_tin_nhan INT NOT NULL,
    thoi_gian_ms INT NOT NULL,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ai_suggestion_session (session_id),
    INDEX idx_ai_suggestion_ngay (ngay_tao)
);
