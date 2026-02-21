import apiClient from "./apiClient";

// Kiểm tra email đã tồn tại chưa
export const checkEmailExists = async (email) => {
  try {
    const response = await apiClient.post('/check-email', { email });
    return response.data.exists; // { exists: true/false }
  } catch (error) {
    console.error('Error checking email:', error);
    return false; // Mặc định false nếu có lỗi
  }
};

// Kiểm tra số điện thoại đã tồn tại chưa
export const checkPhoneExists = async (soDienThoai) => {
  try {
    const response = await apiClient.post('/check-phone', { soDienThoai });
    return response.data.exists; // { exists: true/false }
  } catch (error) {
    console.error('Error checking phone:', error);
    return false; // Mặc định false nếu có lỗi
  }
};

// Validate mật khẩu mạnh
export const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    errors.push('Mật khẩu không được để trống');
    return { valid: false, errors };
  }

  // Ít nhất 8 ký tự
  if (password.length < 8) {
    errors.push('Mật khẩu phải có ít nhất 8 ký tự');
  }

  // Ký tự đầu tiên viết hoa
  if (!/^[A-Z]/.test(password)) {
    errors.push('Ký tự đầu tiên phải viết hoa');
  }

  // Ít nhất 1 ký tự đặc biệt
  if (!/[@#$%^&+=!]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt (@#$%^&+=!)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Tính tuổi từ ngày sinh
export const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

// Validate ngày sinh (>= 18 tuổi)
export const validateBirthDate = (ngaySinh) => {
  if (!ngaySinh) {
    return { valid: false, error: 'Ngày sinh không được để trống' };
  }

  const age = calculateAge(ngaySinh);

  if (age < 18) {
    return { valid: false, error: `Bạn phải từ 18 tuổi trở lên. Hiện tại bạn ${age} tuổi.` };
  }

  if (age > 120) {
    return { valid: false, error: 'Ngày sinh không hợp lệ' };
  }

  return { valid: true, age };
};
