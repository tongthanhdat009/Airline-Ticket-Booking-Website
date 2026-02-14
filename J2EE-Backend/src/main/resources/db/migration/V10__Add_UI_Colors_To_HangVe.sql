-- V10: Thêm các cột màu sắc/giao diện cho bảng hạng vé
-- Tham khảo pattern từ V5 (ui_color cho chuc_nang)
-- Cho phép admin tùy chỉnh giao diện FlightCard cho từng hạng vé

ALTER TABLE hangve
    ADD COLUMN mau_nen VARCHAR(100) DEFAULT 'bg-sky-50' COMMENT 'Tailwind background color class (bgColor)',
    ADD COLUMN mau_vien VARCHAR(100) DEFAULT 'border-sky-200' COMMENT 'Tailwind border color class (borderColor)',
    ADD COLUMN mau_chu VARCHAR(100) DEFAULT 'text-sky-700' COMMENT 'Tailwind text color class (textColor)',
    ADD COLUMN mau_header VARCHAR(200) DEFAULT 'bg-gradient-to-r from-sky-500 to-blue-500' COMMENT 'Tailwind header gradient class (headerBg)',
    ADD COLUMN mau_icon VARCHAR(100) DEFAULT 'text-sky-500' COMMENT 'Tailwind icon color class (iconColor)',
    ADD COLUMN mau_ring VARCHAR(100) DEFAULT 'ring-sky-400' COMMENT 'Tailwind ring color for selected state (ringColor)',
    ADD COLUMN mau_badge VARCHAR(100) DEFAULT 'bg-sky-100' COMMENT 'Tailwind badge background class (badgeBg)',
    ADD COLUMN hang_bac VARCHAR(20) DEFAULT 'basic' COMMENT 'Tier level: basic, mid, premium';

-- Cập nhật dữ liệu màu sắc cho các hạng vé hiện tại

-- Economy (ID=1): Sky blue theme
UPDATE hangve SET
    mau_nen = 'bg-sky-50',
    mau_vien = 'border-sky-200',
    mau_chu = 'text-sky-700',
    mau_header = 'bg-gradient-to-r from-sky-500 to-blue-500',
    mau_icon = 'text-sky-500',
    mau_ring = 'ring-sky-400',
    mau_badge = 'bg-sky-100',
    hang_bac = 'basic'
WHERE mahangve = 1 AND da_xoa = 0;

-- Economy Saver (ID=2): Emerald green theme
UPDATE hangve SET
    mau_nen = 'bg-emerald-50',
    mau_vien = 'border-emerald-200',
    mau_chu = 'text-emerald-700',
    mau_header = 'bg-gradient-to-r from-emerald-500 to-teal-500',
    mau_icon = 'text-emerald-500',
    mau_ring = 'ring-emerald-400',
    mau_badge = 'bg-emerald-100',
    hang_bac = 'basic'
WHERE mahangve = 2 AND da_xoa = 0;

-- Deluxe (ID=3): Orange theme
UPDATE hangve SET
    mau_nen = 'bg-orange-50',
    mau_vien = 'border-orange-200',
    mau_chu = 'text-orange-700',
    mau_header = 'bg-gradient-to-r from-orange-500 to-amber-500',
    mau_icon = 'text-orange-500',
    mau_ring = 'ring-orange-400',
    mau_badge = 'bg-orange-100',
    hang_bac = 'mid'
WHERE mahangve = 3 AND da_xoa = 0;

-- Business (ID=4): Purple theme
UPDATE hangve SET
    mau_nen = 'bg-purple-50',
    mau_vien = 'border-purple-300',
    mau_chu = 'text-purple-700',
    mau_header = 'bg-gradient-to-r from-purple-600 to-indigo-600',
    mau_icon = 'text-purple-500',
    mau_ring = 'ring-purple-400',
    mau_badge = 'bg-purple-100',
    hang_bac = 'premium'
WHERE mahangve = 4 AND da_xoa = 0;

-- First Class (ID=5): Amber/Gold theme
UPDATE hangve SET
    mau_nen = 'bg-amber-50',
    mau_vien = 'border-amber-300',
    mau_chu = 'text-amber-700',
    mau_header = 'bg-gradient-to-r from-amber-500 to-yellow-500',
    mau_icon = 'text-amber-500',
    mau_ring = 'ring-amber-400',
    mau_badge = 'bg-amber-100',
    hang_bac = 'premium'
WHERE mahangve = 5 AND da_xoa = 0;
