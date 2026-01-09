export const formatCurrency = (v, dropThreeZeros = true) => {
  if (v == null) return "";
  if (!dropThreeZeros) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
  }
  const thousands = Math.floor(v / 1000);
  return `${new Intl.NumberFormat('vi-VN').format(thousands)}`;
};

export const formatCurrencyWithCommas = (v) => {
  if (v == null || v === "") return "";
  const n = Number(v);
  if (Number.isNaN(n)) return "";
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n));
};

export const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDateType = (date) => {
  if (!date) return "";
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}/.test(date)) {
    const [year, month, day] = date.split('-');
    return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
  }
  return "";
};

export const formatTime = (time) => {
  if (!time) return "";
  if (typeof time !== "string") return String(time);
  const parts = time.split(":");
  return parts.length >= 2
    ? `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`
    : time;
};

export const calcFlightDuration = (gioDi, ngayDi, gioDen, ngayDen) => {
  if (!gioDi || !gioDen) return "";
  const toDate = (dateStr, timeStr) => {
    const [hh, mm] = (timeStr || "00:00").split(":").map(n => Number(n || 0));
    if (typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const [y, m, d] = dateStr.split("-").map(Number);
      return new Date(y, m - 1, d, hh, mm, 0);
    }
    return new Date(1970,0,1, hh, mm, 0);
  };

  const start = toDate(ngayDi, gioDi);
  const end = toDate(ngayDen || ngayDi, gioDen);

  let diffMs = end - start;
  if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;

  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) return `${hours} tiếng ${minutes} phút`;
  if (hours > 0) return `${hours} tiếng`;
  if (minutes > 0) return `${minutes} phút`;
  return "0 phút";
};