// Chuẩn SĐT duy nhất toàn hệ thống (đồng bộ backend HanhKhachService.PHONE_PATTERN):
// 0/+84 + đầu số 3/5/7/8/9 + 8 số. VD: 0987654321, +84987654321.
export const VN_PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

export const VN_PHONE_MESSAGE =
  'Số điện thoại không hợp lệ (0/+84 + đầu số 3/5/7/8/9 + 8 số, VD: 0987654321)';

export const VN_PHONE_MAX_LENGTH = 20; // khớp DB hanhkhach.sodienthoai varchar(20)

export function isValidVnPhone(phone) {
  if (phone == null) return false;
  return VN_PHONE_REGEX.test(String(phone).trim());
}
