/**
 * Tailwind Color Utilities
 * Chuyển đổi giữa hex, RGB, và Tailwind arbitrary value syntax
 *
 * Cú pháp lưu trữ trong DB:
 *   Đơn sắc:  bg-[rgb(r,g,b)]  /  text-[rgb(r,g,b)]  /  border-[rgb(r,g,b)]  /  ring-[rgb(r,g,b)]
 *   Gradient:  bg-gradient-to-r from-[rgb(r,g,b)] to-[rgb(r,g,b)]
 */

// ─── Hex ↔ RGB ────────────────────────────────────────────

/** Hex (#rrggbb) → { r, g, b } */
export const hexToRgb = (hex) => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
};

/** (r, g, b) → "#rrggbb" */
export const rgbToHex = (r, g, b) =>
    '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');

// ─── Tailwind arbitrary ↔ Hex ─────────────────────────────

/**
 * Tailwind arbitrary → hex
 * "bg-[rgb(240,249,255)]" → "#f0f9ff"
 */
export const twToHex = (twClass, fallback = '#888888') => {
    const m = twClass?.match(/\[rgb\((\d+),(\d+),(\d+)\)\]/);
    return m ? rgbToHex(+m[1], +m[2], +m[3]) : fallback;
};

/**
 * Hex → Tailwind arbitrary
 * ("#f0f9ff", "bg") → "bg-[rgb(240,249,255)]"
 */
export const hexToTw = (hex, prefix) => {
    const rgb = hexToRgb(hex);
    return rgb ? `${prefix}-[rgb(${rgb.r},${rgb.g},${rgb.b})]` : '';
};

// ─── Gradient ─────────────────────────────────────────────

/**
 * Tailwind gradient → hex pair
 * "bg-gradient-to-r from-[rgb(14,165,233)] to-[rgb(59,130,246)]"
 *   → { from: "#0ea5e9", to: "#3b82f6" }
 */
export const twGradientToHex = (twClass) => {
    const fm = twClass?.match(/from-\[rgb\((\d+),(\d+),(\d+)\)\]/);
    const tm = twClass?.match(/to-\[rgb\((\d+),(\d+),(\d+)\)\]/);
    return {
        from: fm ? rgbToHex(+fm[1], +fm[2], +fm[3]) : '#888888',
        to: tm ? rgbToHex(+tm[1], +tm[2], +tm[3]) : '#888888',
    };
};

/**
 * Hex pair → Tailwind gradient
 * ("#0ea5e9", "#3b82f6") → "bg-gradient-to-r from-[rgb(14,165,233)] to-[rgb(59,130,246)]"
 */
export const hexToTwGradient = (fromHex, toHex) => {
    const f = hexToRgb(fromHex), t = hexToRgb(toHex);
    return (f && t)
        ? `bg-gradient-to-r from-[rgb(${f.r},${f.g},${f.b})] to-[rgb(${t.r},${t.g},${t.b})]`
        : '';
};

// ─── Tailwind arbitrary → CSS color (cho inline style) ────

/**
 * Tailwind arbitrary → CSS color string
 * "bg-[rgb(240,249,255)]" → "rgb(240,249,255)"
 */
export const twToCss = (twClass) => {
    const m = twClass?.match(/\[rgb\((\d+),(\d+),(\d+)\)\]/);
    return m ? `rgb(${m[1]},${m[2]},${m[3]})` : undefined;
};

/**
 * Tailwind gradient → CSS color pair
 * "bg-gradient-to-r from-[rgb(14,165,233)] to-[rgb(59,130,246)]"
 *   → { from: "rgb(14,165,233)", to: "rgb(59,130,246)" }
 */
export const twGradientToCss = (twClass) => {
    const fm = twClass?.match(/from-\[rgb\((\d+),(\d+),(\d+)\)\]/);
    const tm = twClass?.match(/to-\[rgb\((\d+),(\d+),(\d+)\)\]/);
    return {
        from: fm ? `rgb(${fm[1]},${fm[2]},${fm[3]})` : undefined,
        to: tm ? `rgb(${tm[1]},${tm[2]},${tm[3]})` : undefined,
    };
};
