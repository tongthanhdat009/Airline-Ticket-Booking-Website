import apiClient from "./apiClient";

export const DangNhapClientServices = async (userData) => {
  try {
    const response = await apiClient.post('/dangnhap', userData);
    // Backend trả về ApiResponse<LoginResponse> với structure:
    // { success: true, data: { message: "...", accessToken: "...", refreshToken: "..." } }
    const apiResponse = response.data;
    return apiResponse.data || apiResponse;
  } catch (error) {
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "Đăng nhập thất bại!";
    throw new Error(msg);
  }
};
