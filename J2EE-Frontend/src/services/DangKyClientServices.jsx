import apiClient from "./apiClient";

export const DangKyClientServices = async (userData) => {
  try {
    const response = await apiClient.post('/dangky', userData);
    return response.data; // ví dụ: { message: "Đăng ký thành công" }
  } catch (error) {
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "Đăng ký thất bại!";
    throw new Error(msg);
  }
};
