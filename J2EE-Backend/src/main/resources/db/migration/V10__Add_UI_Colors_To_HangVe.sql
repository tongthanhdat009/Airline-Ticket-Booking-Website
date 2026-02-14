-- V10: Thêm các cột màu sắc/giao diện cho bảng hạng vé
-- Sử dụng Tailwind arbitrary value syntax:
--   Đơn sắc: bg-[rgb(r,g,b)] / text-[rgb(r,g,b)] / border-[rgb(r,g,b)] / ring-[rgb(r,g,b)]
--   Gradient: bg-gradient-to-r from-[rgb(r,g,b)] to-[rgb(r,g,b)]

ALTER TABLE hangve
    ADD COLUMN mau_nen VARCHAR(100) DEFAULT 'bg-[rgb(240,249,255)]' COMMENT 'Tailwind bg: bg-[rgb(r,g,b)]',
    ADD COLUMN mau_vien VARCHAR(100) DEFAULT 'border-[rgb(186,230,253)]' COMMENT 'Tailwind border: border-[rgb(r,g,b)]',
    ADD COLUMN mau_chu VARCHAR(100) DEFAULT 'text-[rgb(3,105,161)]' COMMENT 'Tailwind text: text-[rgb(r,g,b)]',
    ADD COLUMN mau_header VARCHAR(200) DEFAULT 'bg-gradient-to-r from-[rgb(14,165,233)] to-[rgb(59,130,246)]' COMMENT 'Tailwind gradient: bg-gradient-to-r from-[rgb()] to-[rgb()]',
    ADD COLUMN mau_icon VARCHAR(100) DEFAULT 'text-[rgb(14,165,233)]' COMMENT 'Tailwind icon: text-[rgb(r,g,b)]',
    ADD COLUMN mau_ring VARCHAR(100) DEFAULT 'ring-[rgb(56,189,248)]' COMMENT 'Tailwind ring: ring-[rgb(r,g,b)]',
    ADD COLUMN mau_badge VARCHAR(100) DEFAULT 'bg-[rgb(224,242,254)]' COMMENT 'Tailwind badge: bg-[rgb(r,g,b)]',
    ADD COLUMN hang_bac VARCHAR(20) DEFAULT 'basic' COMMENT 'Tier level: basic, mid, premium';

-- Economy (ID=1): Sky blue
UPDATE hangve SET
    mau_nen = 'bg-[rgb(240,249,255)]',
    mau_vien = 'border-[rgb(186,230,253)]',
    mau_chu = 'text-[rgb(3,105,161)]',
    mau_header = 'bg-gradient-to-r from-[rgb(14,165,233)] to-[rgb(59,130,246)]',
    mau_icon = 'text-[rgb(14,165,233)]',
    mau_ring = 'ring-[rgb(56,189,248)]',
    mau_badge = 'bg-[rgb(224,242,254)]',
    hang_bac = 'basic'
WHERE mahangve = 1 AND da_xoa = 0;

-- Economy Saver (ID=2): Emerald
UPDATE hangve SET
    mau_nen = 'bg-[rgb(236,253,245)]',
    mau_vien = 'border-[rgb(167,243,208)]',
    mau_chu = 'text-[rgb(4,120,87)]',
    mau_header = 'bg-gradient-to-r from-[rgb(16,185,129)] to-[rgb(20,184,166)]',
    mau_icon = 'text-[rgb(16,185,129)]',
    mau_ring = 'ring-[rgb(52,211,153)]',
    mau_badge = 'bg-[rgb(209,250,229)]',
    hang_bac = 'basic'
WHERE mahangve = 2 AND da_xoa = 0;

-- Deluxe (ID=3): Orange
UPDATE hangve SET
    mau_nen = 'bg-[rgb(255,247,237)]',
    mau_vien = 'border-[rgb(254,215,170)]',
    mau_chu = 'text-[rgb(194,65,12)]',
    mau_header = 'bg-gradient-to-r from-[rgb(249,115,22)] to-[rgb(245,158,11)]',
    mau_icon = 'text-[rgb(249,115,22)]',
    mau_ring = 'ring-[rgb(251,146,60)]',
    mau_badge = 'bg-[rgb(255,237,213)]',
    hang_bac = 'mid'
WHERE mahangve = 3 AND da_xoa = 0;

-- Business (ID=4): Purple
UPDATE hangve SET
    mau_nen = 'bg-[rgb(250,245,255)]',
    mau_vien = 'border-[rgb(216,180,254)]',
    mau_chu = 'text-[rgb(126,34,206)]',
    mau_header = 'bg-gradient-to-r from-[rgb(147,51,234)] to-[rgb(79,70,229)]',
    mau_icon = 'text-[rgb(168,85,247)]',
    mau_ring = 'ring-[rgb(192,132,252)]',
    mau_badge = 'bg-[rgb(243,232,255)]',
    hang_bac = 'premium'
WHERE mahangve = 4 AND da_xoa = 0;

-- First Class (ID=5): Amber/Gold
UPDATE hangve SET
    mau_nen = 'bg-[rgb(255,251,235)]',
    mau_vien = 'border-[rgb(252,211,77)]',
    mau_chu = 'text-[rgb(180,83,9)]',
    mau_header = 'bg-gradient-to-r from-[rgb(245,158,11)] to-[rgb(234,179,8)]',
    mau_icon = 'text-[rgb(245,158,11)]',
    mau_ring = 'ring-[rgb(251,191,36)]',
    mau_badge = 'bg-[rgb(254,243,199)]',
    hang_bac = 'premium'
WHERE mahangve = 5 AND da_xoa = 0;
