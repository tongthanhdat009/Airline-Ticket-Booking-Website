import apiClient from "./apiClient";

export const DangNhapClientServices = async (userData) => {
  try {
    const response = await apiClient.post('/dangnhap', userData);
    return response.data; // ví dụ: { message: "Đăng ký thành công" }
  } catch (error) {
    const msg =
      error?.response?.data?.message ||
      "Đăng nhập thất bại!";
    throw new Error(msg);
  }
};
