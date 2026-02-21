import TaiKhoanService from "../services/TaiKhoanService";
import { getClientUserEmail, getClientAccessToken } from "./cookieUtils";

/**
 * Kiểm tra xem user đã hoàn thiện thông tin chưa
 * @returns {Promise<{isComplete: boolean, needsPhone: boolean, needsDob: boolean, accountInfo: object|null}>}
 */
export const checkProfileComplete = async () => {
  try {
    const email = getClientUserEmail();
    const token = getClientAccessToken();

    // Nếu chưa đăng nhập, trả về ngay - KHÔNG gọi API để tránh 401 redirect
    if (!email || !token) {
      return {
        isComplete: false,
        needsPhone: false,
        needsDob: false,
        accountInfo: null,
        isLoggedIn: false,
      };
    }

    // Gọi API với skipRedirect để tránh redirect khi 401
    const response = await TaiKhoanService.getTaiKhoanByEmail(email, true);

    const hasPhone =
      response.data.hanhKhach?.soDienThoai &&
      response.data.hanhKhach.soDienThoai.trim() !== "";
    const hasDob = response.data.hanhKhach?.ngaySinh;

    return {
      isComplete: hasPhone && hasDob,
      needsPhone: !hasPhone,
      needsDob: !hasDob,
      accountInfo: response,
      isLoggedIn: true,
    };
  } catch (error) {
    console.error("Lỗi khi kiểm tra profile:", error);
    // Khi có lỗi (401, 500, v.v.), trả về không đăng nhập
    return {
      isComplete: false,
      needsPhone: false,
      needsDob: false,
      accountInfo: null,
      isLoggedIn: false,
      error: error.message,
    };
  }
};

/**
 * Hook để hiển thị banner nhắc nhở hoàn thiện thông tin
 */
export const useProfileCompleteBanner = () => {
  return {
    shouldShow: async () => {
      const result = await checkProfileComplete();
      return result.isLoggedIn && !result.isComplete;
    },
  };
};
